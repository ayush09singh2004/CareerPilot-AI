require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8']);

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Resume = require('../models/Resume');
  const resumes = await Resume.find({}).sort({ updatedAt: -1 }).limit(5);
  
  console.log('Total resumes in DB:', resumes.length);
  console.log('');

  resumes.forEach((r, i) => {
    console.log('=== RESUME ' + (i+1) + ' ===');
    console.log('ID           :', r._id.toString());
    console.log('Title        :', r.title);
    console.log('fullName     :', r.personalInfo && r.personalInfo.fullName ? r.personalInfo.fullName : '(EMPTY)');
    console.log('email        :', r.personalInfo && r.personalInfo.email ? r.personalInfo.email : '(EMPTY)');
    console.log('summary len  :', r.personalInfo && r.personalInfo.summary ? r.personalInfo.summary.length + ' chars' : '(EMPTY)');
    console.log('skills count :', r.skills ? r.skills.length : 0, '->', r.skills ? r.skills.join(', ').substring(0,80) : '(NONE)');
    console.log('experience   :', r.experience ? r.experience.length : 0, 'items');
    if (r.experience) r.experience.forEach(function(e) { console.log('  -', e.role, '@', e.company, '| desc len:', e.description ? e.description.length : 0); });
    console.log('education    :', r.education ? r.education.length : 0, 'items');
    if (r.education) r.education.forEach(function(e) { console.log('  -', e.degree, 'from', e.college); });
    console.log('projects     :', r.projects ? r.projects.length : 0, 'items');
    if (r.projects) r.projects.forEach(function(p) { console.log('  -', p.projectName, '(' + p.technologies + ')'); });
    console.log('achievements :', r.achievements ? r.achievements.length : 0, 'items');
    console.log('certificates :', r.certificates ? r.certificates.length : 0, 'items');
    console.log('extractedText len:', r.extractedText ? r.extractedText.length + ' chars' : '(NONE)');
    console.log('');

    // Simulate exactly what analysisController builds for Gemini
    var ed = (r.education || []).map(function(e){ return e.degree + ' from ' + e.college; }).join(', ');
    var ex = (r.experience || []).map(function(e){ return e.role + ' at ' + e.company + ' - ' + e.description; }).join(' | ');
    var pr = (r.projects || []).map(function(p){ return p.projectName + ' (' + p.technologies + '): ' + p.description; }).join(' | ');
    var sk = (r.skills || []).join(', ');
    var ac = (r.achievements || []).join(', ');

    console.log('--- GEMINI PROMPT (exact what AI sees) ---');
    console.log('Name       : ' + (r.personalInfo && r.personalInfo.fullName ? r.personalInfo.fullName : 'MISSING'));
    console.log('Summary    : ' + (r.personalInfo && r.personalInfo.summary ? r.personalInfo.summary.substring(0,100) : 'MISSING'));
    console.log('Education  : ' + (ed || 'EMPTY'));
    console.log('Experience : ' + (ex.substring(0,120) || 'EMPTY'));
    console.log('Projects   : ' + (pr.substring(0,120) || 'EMPTY'));
    console.log('Skills     : ' + (sk.substring(0,120) || 'EMPTY'));
    console.log('Achievements:' + (ac.substring(0,80) || 'EMPTY'));
    console.log('');
  });

  await mongoose.disconnect();
  process.exit(0);
}).catch(function(err) {
  console.error('DB connect error:', err.message);
  process.exit(1);
});
