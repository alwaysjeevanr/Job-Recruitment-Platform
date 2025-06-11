const express = require('express');
const router = express.Router();
const jobseekerController = require('../controllers/jobseekerController');
const { authenticateToken, checkRole } = require('../middleware/auth');

// Get all applications for the logged-in job seeker
router.get('/applications', 
  authenticateToken, 
  checkRole('jobseeker'), 
  jobseekerController.getApplications
);

module.exports = router; 