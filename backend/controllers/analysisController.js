const { GoogleGenerativeAI } = require('@google/generative-ai');
const Resume = require('../models/Resume');

// @desc    Analyze resume with Gemini AI
// @route   POST /api/analysis/:resumeId
// @access  Private
const analyzeResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.resumeId);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    if (resume.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // --- Caching Logic ---
    // If the resume has a cached analysis, and it hasn't been modified since it was last analyzed
    if (resume.analysisCache && resume.lastAnalyzedAt) {
      // Allow a tiny 1-second margin of error
      if (resume.updatedAt.getTime() - resume.lastAnalyzedAt.getTime() <= 1000) {
        console.log("Serving analysis from cache.");
        return res.status(200).json(resume.analysisCache);
      }
    }

    // --- Build structured resume text from all fields ---
    const pi = resume.personalInfo || {};

    // Structured sections (from Resume Builder)
    const structuredParts = [];
    if (pi.fullName)   structuredParts.push('Name: '    + pi.fullName);
    if (resume.title)  structuredParts.push('Title: '   + resume.title);
    if (pi.summary)    structuredParts.push('Summary: '  + pi.summary);

    if (resume.education && resume.education.length > 0) {
      const ed = resume.education
        .map(e => [e.degree, e.branch, 'from', e.college, e.startYear && e.endYear ? '(' + e.startYear + '-' + e.endYear + ')' : '', e.cgpa ? 'CGPA: ' + e.cgpa : ''].filter(Boolean).join(' '))
        .join('; ');
      structuredParts.push('Education: ' + ed);
    }

    if (resume.experience && resume.experience.length > 0) {
      const ex = resume.experience
        .map(e => [e.role, 'at', e.company, e.startDate && e.endDate ? '(' + e.startDate + ' to ' + e.endDate + ')' : '', e.description ? '- ' + e.description : ''].filter(Boolean).join(' '))
        .join(' | ');
      structuredParts.push('Experience: ' + ex);
    }

    if (resume.projects && resume.projects.length > 0) {
      const pr = resume.projects
        .map(p => [p.projectName, p.technologies ? '(' + p.technologies + ')' : '', p.description ? ':' + p.description : ''].filter(Boolean).join(' '))
        .join(' | ');
      structuredParts.push('Projects: ' + pr);
    }

    if (resume.skills && resume.skills.length > 0) {
      structuredParts.push('Skills: ' + resume.skills.join(', '));
    }

    if (resume.certificates && resume.certificates.length > 0) {
      const ce = resume.certificates.map(c => c.name + (c.issuer ? ' by ' + c.issuer : '')).join(', ');
      structuredParts.push('Certificates: ' + ce);
    }

    if (resume.achievements && resume.achievements.length > 0) {
      structuredParts.push('Achievements: ' + resume.achievements.join('; '));
    }

    const structuredText = structuredParts.join('\n      ');
    const hasRichStructuredData = resume.skills?.length > 0 || resume.experience?.length > 0 || resume.education?.length > 0;

    // When resume was uploaded (not built manually), structured fields are empty.
    // Use extractedText as the primary source, with any available structured data appended.
    let resumeText;
    if (!hasRichStructuredData && resume.extractedText && resume.extractedText.trim().length > 50) {
      // Primary: raw extracted text from uploaded PDF/DOCX
      resumeText = 'FULL RESUME TEXT (extracted from uploaded document):\n' + resume.extractedText.trim();
      // Append any structured fields we do have (name, email, title)
      if (structuredText.trim()) {
        resumeText += '\n\nADDITIONAL CONTEXT:\n' + structuredText;
      }
      console.log('[Analysis] Using extractedText (' + resume.extractedText.length + ' chars) as primary source for resume:', resume.title);
    } else if (hasRichStructuredData) {
      // Primary: structured data from Resume Builder
      resumeText = structuredText;
      // Append extractedText if available for extra context
      if (resume.extractedText && resume.extractedText.trim().length > 50) {
        resumeText += '\n\nADDITIONAL CONTEXT FROM ORIGINAL DOCUMENT:\n' + resume.extractedText.trim().substring(0, 1000);
      }
      console.log('[Analysis] Using structured fields as primary source for resume:', resume.title);
    } else {
      return res.status(400).json({ message: 'Resume has no content to analyze. Please fill in your resume details in the Resume Builder or re-upload your resume.' });
    }

    const prompt = `
      You are a Senior Technical Recruiter and AI Career Coach.
      Analyze the following resume and return EXACTLY valid JSON, without any markdown blocks or external text. 
      Do NOT return \`\`\`json. Return JUST the raw JSON object.

      Structure the JSON exactly like this:
      {
        "resumeScore": Number (0-100),
        "atsScore": Number (0-100),
        "summary": "Professional Summary (String)",
        "strengths": ["Array of strengths"],
        "weaknesses": ["Array of weaknesses"],
        "missingKeywords": ["Array of keywords"],
        "missingSkills": ["Array of missing skills"],
        "improvementSuggestions": ["Array of suggestions"],
        "recommendedJobs": [
          { "role": "Job Role Name", "matchPercentage": Number (0-100) }
        ],
        "skillGap": "Short paragraph explaining the primary skill gaps.",
        "learningRoadmap": [
          { "week": "Week 1", "topic": "Topic Name", "priority": "High/Medium/Low", "duration": "e.g. 5 hours" }
        ]
      }

      Resume Data:
      ${resumeText}
    `;

    // --- Gemini Call ---
    // Live-probed order (2026-07-17): gemini-flash-lite-latest ✅ → gemma-4-31b-it ✅ → gemma-4-26b-a4b-it ✅
    const genAI     = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelName = process.env.GEMINI_MODEL || 'gemini-flash-lite-latest';
    const FALLBACKS = ['gemma-4-31b-it', 'gemma-4-26b-a4b-it', 'gemini-flash-latest'];

    let result;
    let usedModel = modelName;
    try {
      result = await genAI.getGenerativeModel({ model: modelName }).generateContent(prompt);
    } catch (primaryErr) {
      console.warn(`Primary model (${modelName}) failed: ${primaryErr.message.substring(0, 80)}`);
      let lastErr = primaryErr;
      for (const fb of FALLBACKS) {
        try {
          console.log(`Trying fallback: ${fb}`);
          result = await genAI.getGenerativeModel({ model: fb }).generateContent(prompt);
          usedModel = fb;
          break;
        } catch (fbErr) {
          console.warn(`Fallback (${fb}) failed: ${fbErr.message.substring(0, 60)}`);
          lastErr = fbErr;
        }
      }
      if (!result) throw lastErr;
    }
    console.log(`[Analysis] Completed using model: ${usedModel}`);
    const response = await result.response;
    let text = response.text();

    // Clean up potential markdown formatting (```json ... ```)
    if (text.startsWith('```json')) {
      text = text.replace(/^```json/, '').replace(/```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```/, '').replace(/```$/, '');
    }

    const analysisData = JSON.parse(text);

    // --- Save Cache ---
    resume.analysisCache = analysisData;
    // We update lastAnalyzedAt to precisely match updatedAt so the cache stays valid until a new edit occurs.
    // However, saving it will actually bump updatedAt again.
    // To prevent infinite invalidation loops, we'll use findOneAndUpdate to bypass timestamps update if we want,
    // or just rely on the fact that saving here bumps both, and they will be identical.
    
    resume.lastAnalyzedAt = new Date();
    await resume.save();

    res.status(200).json(analysisData);

  } catch (error) {
    console.error('Analysis Error:', error);
    res.status(500).json({ message: 'Failed to analyze resume', error: error.message });
  }
};

module.exports = {
  analyzeResume
};
