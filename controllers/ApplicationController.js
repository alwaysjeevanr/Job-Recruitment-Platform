const Application = require('../models/Application');
const Job = require('../models/Job');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');
const mongoose = require('mongoose');

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'resumes',
        resource_type: 'raw',
        format: 'pdf'
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    const stream = Readable.from(buffer);
    stream.pipe(uploadStream);
  });
};

exports.apply = async (req, res) => {
  try {
    // Validate file
    if (!req.file) {
      return res.status(400).json({ error: 'Resume file is required' });
    }

    // Validate jobId
    const { jobId } = req.body;
    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    // Validate jobId format
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if job is active
    if (job.status !== 'active') {
      return res.status(400).json({ error: 'This job is no longer accepting applications' });
    }

    // Check if user has already applied
    const existingApplication = await Application.findOne({
      jobId,
      seekerId: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }

    // Upload file to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer);
    
    // Create application
    const application = new Application({
      jobId,
      seekerId: req.user._id,
      resumeUrl: result.secure_url
    });
    
    await application.save();

    // Populate job and seeker details for response
    await application.populate([
      { path: 'jobId', select: 'title employerId' },
      { path: 'seekerId', select: 'name' }
    ]);

    res.status(201).json({ 
      message: 'Application submitted successfully',
      application: {
        _id: application._id,
        job: {
          _id: application.jobId._id,
          title: application.jobId.title
        },
        applicant: {
          _id: application.seekerId._id,
          name: application.seekerId.name
        },
        appliedAt: application.appliedAt,
        status: application.status,
        resumeUrl: application.resumeUrl
      }
    });
  } catch (error) {
    console.error('Application error:', error);
    
    // Handle specific error cases
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }

    // Handle Cloudinary errors
    if (error.http_code) {
      return res.status(400).json({ error: 'Error uploading resume. Please try again.' });
    }

    res.status(500).json({ error: 'Error submitting application. Please try again.' });
  }
};

exports.getEmployerApplications = async (req, res) => {
  try {
    const employerId = req.user._id; // From auth middleware

    // Find all applications for jobs posted by this employer
    const applications = await Application.find()
      .populate({
        path: 'jobId',
        match: { employerId: employerId },
        select: '_id title'
      })
      .populate({
        path: 'seekerId',
        select: '_id name'
      })
      .select('_id status appliedAt resumeUrl')
      .sort({ appliedAt: -1 });

    // Filter out applications where jobId is null (job was deleted)
    const validApplications = applications.filter(app => app.jobId);

    // Transform the response to match the required format
    const formattedApplications = validApplications.map(app => ({
      _id: app._id,
      status: app.status,
      appliedAt: app.appliedAt,
      applicant: {
        _id: app.seekerId._id,
        name: app.seekerId.name
      },
      job: {
        _id: app.jobId._id,
        title: app.jobId.title
      },
      resumeLink: app.resumeUrl
    }));

    res.json(formattedApplications);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching applications' });
  }
};

exports.listApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const applications = await Application.find({ jobId })
      .populate('seekerId', 'name email')
      .select('-__v');
    res.json(applications);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all applications for the logged-in job seeker
exports.getJobSeekerApplications = async (req, res) => {
  try {
    const applications = await Application.find({ seekerId: req.user._id })
      .populate({
        path: 'jobId',
        select: '_id title location salary type employerId',
        populate: {
          path: 'employerId',
          select: 'name',
          model: 'User'
        }
      })
      .populate('seekerId', '_id name email')
      .sort({ appliedAt: -1 });

    const formattedApplications = applications.map(app => ({
      _id: app._id,
      job: {
        _id: app.jobId._id,
        title: app.jobId.title,
        company: app.jobId.employerId.name,
        location: app.jobId.location,
        salary: app.jobId.salary,
        type: app.jobId.type
      },
      applicant: {
        _id: app.seekerId._id,
        name: app.seekerId.name,
        email: app.seekerId.email
      },
      appliedAt: app.appliedAt,
      status: app.status,
      resumeLink: app.resumeUrl,
      __v: app.__v
    }));

    res.json(formattedApplications);
  } catch (error) {
    console.error('Error fetching job seeker applications:', error);
    res.status(500).json({ error: 'Error fetching applications' });
  }
};

// Delete an application
exports.deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate application ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid application ID' });
    }

    // Find the application
    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Check if the authenticated user is the owner of the application
    if (application.seekerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this application' });
    }

    // Delete the application
    await application.deleteOne();

    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Error deleting application' });
  }
};

// Update application status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate application ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid application ID' });
    }

    // Validate status
    if (!status || !['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be pending, accepted, or rejected' });
    }

    // Find the application and populate job details
    const application = await Application.findById(id)
      .populate({
        path: 'jobId',
        select: '_id title employerId',
        populate: {
          path: 'employerId',
          select: 'name',
          model: 'User'
        }
      })
      .populate('seekerId', '_id name');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Check if the authenticated user is the employer who posted the job
    if (application.jobId.employerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this application' });
    }

    // Update the status
    application.status = status;
    await application.save();

    // Format the response
    const formattedApplication = {
      _id: application._id,
      job: {
        _id: application.jobId._id,
        title: application.jobId.title
      },
      applicant: {
        _id: application.seekerId._id,
        name: application.seekerId.name
      },
      appliedAt: application.appliedAt,
      status: application.status,
      resumeLink: application.resumeUrl
    };

    res.json({
      message: 'Application status updated successfully',
      application: formattedApplication
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Error updating application status' });
  }
}; 