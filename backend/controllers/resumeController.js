const Resume = require('../models/Resume');

// @desc    Create a new resume
// @route   POST /api/resume
// @access  Private
const createResume = async (req, res) => {
  try {
    const resumeData = { ...req.body, user: req.user._id };
    const resume = await Resume.create(resumeData);
    res.status(201).json(resume);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create resume', error: error.message });
  }
};

// @desc    Get all resumes for logged in user
// @route   GET /api/resume
// @access  Private
const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.status(200).json(resumes);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching resumes', error: error.message });
  }
};

// @desc    Get a single resume by ID
// @route   GET /api/resume/:id
// @access  Private
const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.status(200).json(resume);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching resume', error: error.message });
  }
};

// @desc    Update a resume
// @route   PUT /api/resume/:id
// @access  Private
const updateResume = async (req, res) => {
  try {
    let resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Ensure user owns the resume
    if (resume.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this resume' });
    }

    resume = await Resume.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json(resume);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update resume', error: error.message });
  }
};

// @desc    Delete a resume
// @route   DELETE /api/resume/:id
// @access  Private
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Ensure user owns the resume
    if (resume.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this resume' });
    }

    await resume.deleteOne();
    res.status(200).json({ message: 'Resume removed successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete resume', error: error.message });
  }
};

// @desc    Get templates list
// @route   GET /api/resume/templates
// @access  Public
const getTemplates = (req, res) => {
  res.status(200).json([
    { id: 'classic', name: 'Classic ATS Friendly' },
    { id: 'modern', name: 'Modern Professional' },
    { id: 'minimal', name: 'Minimal Elegant' }
  ]);
};

// @desc    Upload resume for extraction
// @route   POST /api/resume/upload
// @access  Private
const pdfParse = require('pdf-parse');
const mammoth  = require('mammoth');

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { mimetype, buffer, originalname } = req.file;
    let text = '';

    if (mimetype === 'application/pdf') {
      const pdfData = await pdfParse(buffer);
      text = pdfData.text;
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const docxData = await mammoth.extractRawText({ buffer });
      text = docxData.value;
    } else {
      return res.status(400).json({ message: 'Unsupported file type. Only PDF and DOCX are allowed.' });
    }

    // Very basic heuristic mapping (best-effort, non-AI)
    // We just extract email and phone if possible, otherwise leave it up to the user.
    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    const phoneMatch = text.match(/(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/);
    
    // We return the extracted fields for the frontend to prefill
    res.status(200).json({
      originalFile: originalname,
      extractedText: text,
      prefill: {
        email: emailMatch ? emailMatch[0] : '',
        phone: phoneMatch ? phoneMatch[0] : ''
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to process document', error: error.message });
  }
};

module.exports = {
  createResume,
  getResumes,
  getResumeById,
  updateResume,
  deleteResume,
  getTemplates,
  uploadResume
};
