const express = require('express');
const router = express.Router();
const JobSeekerController = require('../controllers/JobSeekerController');
const { protect, authorize } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

// Profile routes
router.get('/profile', 
  protect, 
  authorize('jobseeker'), 
  JobSeekerController.getProfile
);

router.put('/profile', 
  protect, 
  authorize('jobseeker'), 
  JobSeekerController.updateProfile
);

// Resume upload
router.post('/resume', 
  protect, 
  authorize('jobseeker'), 
  upload.single('resume'),
  handleMulterError,
  JobSeekerController.uploadResume
);

// Get all applications for the logged-in job seeker
router.get('/applications', 
  protect, 
  authorize('jobseeker'), 
  jobseekerController.getApplications
);

module.exports = router; 