const express = require('express');
const router = express.Router();
const ApplicationController = require('../controllers/ApplicationController');
const { upload, handleMulterError } = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');

// Job Seeker routes
router.get('/jobseeker', 
  protect, 
  authorize('jobseeker'), 
  ApplicationController.getJobSeekerApplications
);

router.delete('/:id', 
  protect, 
  authorize('jobseeker'), 
  ApplicationController.deleteApplication
);

// Employer routes
router.put('/:id/status', 
  protect, 
  authorize('employer'), 
  ApplicationController.updateApplicationStatus
);

router.get('/employer', 
  protect, 
  authorize('employer'), 
  ApplicationController.getEmployerApplications
);

// Application submission route
router.post('/', 
  protect, 
  authorize('jobseeker'), 
  upload.single('resume'),
  handleMulterError,
  ApplicationController.apply
);

module.exports = router; 