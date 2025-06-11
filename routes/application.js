const express = require('express');
const router = express.Router();
const ApplicationController = require('../controllers/ApplicationController');
const { upload, handleMulterError } = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');

// Protected routes
router.post('/apply', 
  protect, 
  authorize('jobseeker'), 
  upload.single('resume'),
  handleMulterError,
  ApplicationController.apply
);

router.get('/applications/:jobId', 
  protect, 
  authorize('employer'), 
  ApplicationController.listApplications
);

router.get('/employer/applications', 
  protect, 
  authorize('employer'), 
  ApplicationController.getEmployerApplications
);

module.exports = router; 