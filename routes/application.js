const express = require('express');
const router = express.Router();
const ApplicationController = require('../controllers/ApplicationController');
const { upload, handleMulterError } = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');

// Job Seeker routes
router.get('/jobseeker/applications', 
  protect, 
  authorize('jobseeker'), 
  ApplicationController.getJobSeekerApplications
);

router.delete('/applications/:id', 
  protect, 
  authorize('jobseeker'), 
  ApplicationController.deleteApplication
);

// Employer routes
router.put('/applications/:id/status', 
  protect, 
  authorize('employer'), 
  ApplicationController.updateApplicationStatus
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

// Application submission route
router.post('/apply', 
  protect, 
  authorize('jobseeker'), 
  upload.single('resume'),
  handleMulterError,
  ApplicationController.apply
);

module.exports = router; 