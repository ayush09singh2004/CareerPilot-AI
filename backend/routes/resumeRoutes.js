const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createResume, getResumes, getResumeById, updateResume, deleteResume, getTemplates, uploadResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');

// Setup multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.route('/')
  .post(protect, createResume)
  .get(protect, getResumes);

router.get('/templates', getTemplates);

router.post('/upload', protect, upload.single('resume'), uploadResume);

router.route('/:id')
  .get(protect, getResumeById)
  .put(protect, updateResume)
  .delete(protect, deleteResume);

module.exports = router;
