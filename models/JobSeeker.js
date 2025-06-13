const mongoose = require('mongoose');

const jobSeekerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  experience: [{
    company: {
      type: String,
      required: true,
      trim: true
    },
    position: {
      type: String,
      required: true,
      trim: true
    },
    duration: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    }
  }],
  education: [{
    institution: {
      type: String,
      required: true,
      trim: true
    },
    degree: {
      type: String,
      required: true,
      trim: true
    },
    field: {
      type: String,
      required: true,
      trim: true
    },
    graduationYear: {
      type: Number,
      required: true
    }
  }],
  resume: {
    resumeUrl: {
      type: String,
      trim: true
    },
    downloadUrl: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
});

// Create index for faster queries
jobSeekerSchema.index({ user: 1 });

module.exports = mongoose.model('JobSeeker', jobSeekerSchema); 