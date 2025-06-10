const express = require('express');
const router = express.Router();
const JobController = require('../controllers/JobController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/jobs/recent', JobController.getRecentJobs);
router.get('/jobs', JobController.listJobs);
router.get('/jobs/:jobId', JobController.getJobDetails);

// Protected routes - employer only
router.post('/jobs', protect, authorize('employer'), JobController.createJob);
router.get('/employer/jobs', protect, authorize('employer'), JobController.getEmployerJobs);
router.put('/jobs/:jobId/status', protect, authorize('employer'), JobController.updateJobStatus);

module.exports = router; 