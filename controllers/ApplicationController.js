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
    res.status(400).json({ error: error.message });
  }
};

exports.listApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const applications = await Application.find({ jobId });
    res.json(applications);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}; 