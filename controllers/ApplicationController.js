const Application = require('../models/Application');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

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
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a resume' });
    }

    const { jobId, seekerId } = req.body;
    
    // Upload file to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer);
    
    // Create application with Cloudinary URL
    const application = new Application({
      jobId,
      seekerId,
      resumeUrl: result.secure_url
    });
    
    await application.save();
    res.status(201).json({ 
      message: 'Application submitted successfully', 
      application 
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }
    res.status(400).json({ error: error.message });
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