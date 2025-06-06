const express = require('express');
const router = express.Router();
const JobController = require('../controllers/JobController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/jobs/recent', JobController.getRecentJobs);
router.get('/jobs', JobController.listJobs);

// Protected routes - only employers can create jobs
router.post('/jobs', protect, authorize('employer'), JobController.createJob);

module.exports = router; 