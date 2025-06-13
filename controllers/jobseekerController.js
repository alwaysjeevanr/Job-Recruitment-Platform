const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const JobSeeker = require('../models/JobSeeker');
const cloudinary = require('../config/cloudinary');

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

exports.getProfile = async (req, res) => {
  try {
    const jobseeker = await JobSeeker.findOne({ user: req.user.id })
      .populate('user', 'name email')
      .select('-__v');

    if (!jobseeker) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Job seeker profile not found',
          code: 'PROFILE_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: jobseeker
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        message: error.message || 'Error fetching profile',
        code: 'PROFILE_FETCH_ERROR'
      }
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const {
      phone,
      location,
      skills,
      experience,
      education
    } = req.body;

    let jobseeker = await JobSeeker.findOne({ user: req.user.id });

    if (!jobseeker) {
      // Create new profile if it doesn't exist
      jobseeker = new JobSeeker({
        user: req.user.id,
        phone,
        location,
        skills,
        experience,
        education
      });
    } else {
      // Update existing profile
      if (phone) jobseeker.phone = phone;
      if (location) jobseeker.location = location;
      if (skills) jobseeker.skills = skills;
      if (experience) jobseeker.experience = experience;
      if (education) jobseeker.education = education;
    }

    await jobseeker.save();

    res.json({
      success: true,
      data: jobseeker,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        message: error.message || 'Error updating profile',
        code: 'PROFILE_UPDATE_ERROR'
      }
    });
  }
};

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please upload a resume file',
          code: 'NO_FILE_UPLOADED'
        }
      });
    }

    // Validate file type
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Only PDF files are allowed',
          code: 'INVALID_FILE_TYPE'
        }
      });
    }

    // Upload to Cloudinary with correct configuration
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'raw',
      folder: 'resumes',
      use_filename: true,
      unique_filename: true,
      access_mode: 'public',
      format: 'pdf'
    });

    // Update jobseeker profile with resume URL
    const jobseeker = await JobSeeker.findOne({ user: req.user.id });
    if (!jobseeker) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Job seeker profile not found',
          code: 'PROFILE_NOT_FOUND'
        }
      });
    }

    // Store both secure URL and public ID
    jobseeker.resume = {
      url: result.secure_url,
      public_id: result.public_id
    };
    await jobseeker.save();

    res.json({
      success: true,
      data: {
        resumeUrl: result.secure_url,
        publicId: result.public_id
      },
      message: 'Resume uploaded successfully'
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(400).json({
      success: false,
      error: {
        message: error.message || 'Error uploading resume',
        code: 'RESUME_UPLOAD_ERROR'
      }
    });
  }
};

exports.uploadProfileResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please upload a resume file',
          code: 'NO_FILE_UPLOADED'
        }
      });
    }

    // Validate file type
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Only PDF files are allowed',
          code: 'INVALID_FILE_TYPE'
        }
      });
    }

    // Upload to Cloudinary with correct configuration
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'auto',
      folder: 'resumes',
      use_filename: true,
      unique_filename: true
    });

    // Generate download URL with fl_attachment parameter
    const downloadUrl = result.secure_url.replace('/upload/', '/upload/fl_attachment:Jeevan_R_Senior_Resume/');

    // Update jobseeker profile with resume URLs
    const jobseeker = await JobSeeker.findOne({ user: req.user.id });
    if (!jobseeker) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Job seeker profile not found',
          code: 'PROFILE_NOT_FOUND'
        }
      });
    }

    // Store both URLs
    jobseeker.resume = {
      resumeUrl: result.secure_url,
      downloadUrl: downloadUrl
    };
    await jobseeker.save();

    res.json({
      success: true,
      data: {
        resumeUrl: result.secure_url,
        downloadUrl: downloadUrl
      },
      message: 'Resume uploaded successfully'
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(400).json({
      success: false,
      error: {
        message: error.message || 'Error uploading resume',
        code: 'RESUME_UPLOAD_ERROR'
      }
    });
  }
}; 