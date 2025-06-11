const express = require('express');
const router = express.Router();
const jobseekerController = require('../controllers/jobseekerController');
const { protect, authorize } = require('../middleware/auth');

// Get all applications for the logged-in job seeker
router.get('/applications', 
  protect, 
  authorize('jobseeker'), 
  jobseekerController.getApplications
);

module.exports = router; 