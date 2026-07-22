const express = require('express');
const router = express.Router();
const { analyzeResume } = require('../controllers/analysisController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:resumeId', protect, analyzeResume);

module.exports = router;
