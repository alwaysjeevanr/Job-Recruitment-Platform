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

router.put('/profile', 
  protect, 
  authorize('jobseeker'), 
  jobseekerController.updateProfile
);

// Resume upload
router.post('/resume', 
  protect, 
  authorize('jobseeker'), 
  upload.single('resume'),
  handleMulterError,
  jobseekerController.uploadResume
);

// Profile resume upload
router.post('/upload-resume', 
  protect, 
  authorize('jobseeker'), 
  upload.single('resume'),
  handleMulterError,
  jobseekerController.uploadProfileResume
);

// Get all applications for the logged-in job seeker
router.get('/applications', 
  protect, 
  authorize('jobseeker'), 
  jobseekerController.getApplications
);

module.exports = router; 