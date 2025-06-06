const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    index: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true,
    trim: true
  },
  location: { 
    type: String, 
    required: true, 
    index: true,
    trim: true
  },
  requirements: { 
    type: String, 
    required: true,
    trim: true
  },
  skills: { 
    type: [String], 
    required: true, 
    index: true 
  },
  employerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  salary: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    default: 'Full-time'
  },
  experience: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Create compound index for title and location
jobSchema.index({ title: 'text', location: 'text' });

module.exports = mongoose.model('Job', jobSchema); 