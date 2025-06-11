const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');

// Get all applications for the logged-in job seeker
exports.getApplications = async (req, res) => {
  try {
    // Get applications for the logged-in user
    const applications = await Application.find({ seekerId: req.user._id })
      .populate({
        path: 'jobId',
        select: '_id title employerId',
        populate: {
          path: 'employerId',
          select: 'name',
          model: 'User'
        }
      })
      .populate('seekerId', '_id name')
      .sort({ appliedAt: -1 });

    // Format the response
    const formattedApplications = applications.map(app => ({
      _id: app._id,
      job: {
        _id: app.jobId._id,
        title: app.jobId.title,
        company: app.jobId.employerId.name
      },
      applicant: {
        _id: app.seekerId._id,
        name: app.seekerId.name
      },
      appliedAt: app.appliedAt,
      status: app.status
    }));

    res.status(200).json(formattedApplications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Error fetching applications' });
  }
}; 