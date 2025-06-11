const express = require('express');
const router = express.Router();
const JobController = require('../controllers/JobController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/recent', JobController.getRecentJobs);
router.get('/', JobController.listJobs);
router.get('/:jobId', JobController.getJobDetails);

// Protected routes - employer only
router.post('/', protect, authorize('employer'), JobController.createJob);
router.get('/employer/list', protect, authorize('employer'), JobController.getEmployerJobs);
router.put('/:jobId/status', protect, authorize('employer'), JobController.updateJobStatus);

module.exports = router; 