const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'Untitled Resume'
  },
  template: {
    type: String,
    default: 'classic',
    enum: ['classic', 'modern', 'minimal']
  },
  originalFile: {
    type: String, // Path or name of the uploaded file
    default: null
  },
  extractedText: {
    type: String,
    default: null
  },
  personalInfo: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    linkedIn: { type: String, default: '' },
    github: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    summary: { type: String, default: '' }
  },
  education: [{
    college: { type: String, default: '' },
    degree: { type: String, default: '' },
    branch: { type: String, default: '' },
    startYear: { type: String, default: '' },
    endYear: { type: String, default: '' },
    cgpa: { type: String, default: '' }
  }],
  experience: [{
    company: { type: String, default: '' },
    role: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    description: { type: String, default: '' }
  }],
  projects: [{
    projectName: { type: String, default: '' },
    technologies: { type: String, default: '' },
    description: { type: String, default: '' },
    githubLink: { type: String, default: '' },
    liveLink: { type: String, default: '' }
  }],
  skills: [{ type: String }],
  certificates: [{
    name: { type: String, default: '' },
    issuer: { type: String, default: '' },
    date: { type: String, default: '' },
    link: { type: String, default: '' }
  }],
  achievements: [{ type: String }],
  analysisCache: {
    type: Object, // Store the JSON directly
    default: null
  },
  lastAnalyzedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Resume', ResumeSchema);
