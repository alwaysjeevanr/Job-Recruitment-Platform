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
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship'],
    default: 'Full-time'
  },
  experience: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Allow formats like "Fresher", "0", "1", "5-10", "15+"
        return /^(Fresher|[0-9]+|[0-9]+-[0-9]+|[0-9]+\+)$/.test(v);
      },
      message: props => `${props.value} is not a valid experience level format. Use formats like "Fresher", "0", "1", "5-10", or "15+"`
    }
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