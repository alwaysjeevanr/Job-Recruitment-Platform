const express = require('express');
const router = express.Router();
const jobseekerController = require('../controllers/jobseekerController');
const { protect, authorize } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

// Profile routes
router.get('/profile', 
  protect, 
  authorize('jobseeker'), 
  jobseekerController.getProfile
);

// Update job seeker profile
router.put('/profile', 
  protect, 
  authorize('jobseeker'), 
  jobseekerController.updateProfile
);

// Get all applications for the logged-in job seeker
router.get('/applications', 
  protect, 
  authorize('jobseeker'), 
  jobseekerController.getApplications
);

module.exports = router; 