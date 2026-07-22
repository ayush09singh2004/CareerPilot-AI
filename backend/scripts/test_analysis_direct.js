require('dotenv').config();
var mongoose = require('mongoose');
var dns = require('dns');
dns.setServers(['8.8.8.8']);

mongoose.connect(process.env.MONGODB_URI).then(async function() {
  var Resume = require('../models/Resume');
  var { GoogleGenerativeAI } = require('@google/generative-ai');

  var resume = await Resume.findById('6a59c60f5e20a7a55ab1af21');
  if (!resume) { console.log('Resume not found'); process.exit(1); }

  console.log('=== RESUME FROM MONGODB ===');
  console.log('Title        :', resume.title);
  console.log('fullName     :', resume.personalInfo && resume.personalInfo.fullName);
  console.log('summary      :', resume.personalInfo && resume.personalInfo.summary ? resume.personalInfo.summary.substring(0,80) : '(empty)');
  console.log('skills       :', resume.skills && resume.skills.length ? resume.skills.join(', ') : '(empty)');
  console.log('experience   :', resume.experience ? resume.experience.length : 0, 'items');
  console.log('education    :', resume.education ? resume.education.length : 0, 'items');
  console.log('extractedText:', resume.extractedText ? resume.extractedText.length + ' chars' : 'NONE');
  console.log('');

  // Replicate EXACT logic from the fixed analysisController
  var pi = resume.personalInfo || {};
  var structuredParts = [];
  if (pi.fullName)  structuredParts.push('Name: ' + pi.fullName);
  if (resume.title) structuredParts.push('Title: ' + resume.title);
  if (pi.summary)   structuredParts.push('Summary: ' + pi.summary);
  if (resume.education && resume.education.length > 0) {
    structuredParts.push('Education: ' + resume.education.map(function(e){ return [e.degree,e.branch,'from',e.college].filter(Boolean).join(' '); }).join('; '));
  }
  if (resume.experience && resume.experience.length > 0) {
    structuredParts.push('Experience: ' + resume.experience.map(function(e){ return e.role+' at '+e.company+' - '+e.description; }).join(' | '));
  }
  if (resume.projects && resume.projects.length > 0) {
    structuredParts.push('Projects: ' + resume.projects.map(function(p){ return p.projectName+'('+p.technologies+'): '+p.description; }).join(' | '));
  }
  if (resume.skills && resume.skills.length > 0) structuredParts.push('Skills: ' + resume.skills.join(', '));
  if (resume.achievements && resume.achievements.length > 0) structuredParts.push('Achievements: ' + resume.achievements.join('; '));

  var structuredText = structuredParts.join('\n');
  var hasRichData = (resume.skills && resume.skills.length > 0) || (resume.experience && resume.experience.length > 0) || (resume.education && resume.education.length > 0);

  var resumeText;
  if (!hasRichData && resume.extractedText && resume.extractedText.trim().length > 50) {
    resumeText = 'FULL RESUME TEXT (extracted from uploaded document):\n' + resume.extractedText.trim();
    if (structuredText.trim()) resumeText += '\n\nADDITIONAL CONTEXT:\n' + structuredText;
    console.log('[INFO] Using extractedText as primary (' + resume.extractedText.length + ' chars)');
  } else if (hasRichData) {
    resumeText = structuredText;
    console.log('[INFO] Using structured fields as primary');
  } else {
    console.log('[ERROR] No content to analyze');
    process.exit(1);
  }

  console.log('');
  console.log('=== GEMINI PROMPT DATA (first 400 chars) ===');
  console.log(resumeText.substring(0, 400));
  console.log('...');
  console.log('');

  // Call Gemini
  console.log('Calling Gemini (gemini-flash-latest)...');
  var genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  var model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
  var prompt = 'You are a Senior Technical Recruiter. Analyze this resume and return ONLY valid JSON (no markdown). Schema: {"resumeScore":0-100,"atsScore":0-100,"summary":"string","strengths":[],"weaknesses":[],"missingKeywords":[],"missingSkills":[],"improvementSuggestions":[],"recommendedJobs":[{"role":"","matchPercentage":0}],"skillGap":"string","learningRoadmap":[{"week":"Week 1","topic":"","priority":"High","duration":""}]}\n\nResume:\n' + resumeText;

  try {
    var result = await model.generateContent(prompt);
    var text = result.response.text().trim();
    if (text.startsWith('```')) text = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
    var a = JSON.parse(text);
    console.log('=== GEMINI RESPONSE ===');
    console.log('resumeScore  :', a.resumeScore);
    console.log('atsScore     :', a.atsScore);
    console.log('summary      :', a.summary ? a.summary.substring(0,100) : 'MISSING');
    console.log('strengths    :', a.strengths ? a.strengths.length + ' items → ' + a.strengths[0] : 'MISSING');
    console.log('jobs         :', a.recommendedJobs ? a.recommendedJobs.map(function(j){return j.role+'('+j.matchPercentage+'%)';}).join(', ') : 'MISSING');
    console.log('roadmap      :', a.learningRoadmap ? a.learningRoadmap.length + ' steps' : 'MISSING');
    console.log('\n--- FEATURE CHECKLIST ---');
    ['atsScore','resumeScore','strengths','weaknesses','skillGap','recommendedJobs','learningRoadmap','improvementSuggestions'].forEach(function(k){
      var v = a[k]; var ok = Array.isArray(v) ? v.length > 0 : v != null && v !== '';
      console.log(k.padEnd(22) + ':', ok ? 'PASS' : 'FAIL');
    });
  } catch(err) {
    console.log('Gemini error:', err.message);
  }

  await mongoose.disconnect();
  process.exit(0);
});
