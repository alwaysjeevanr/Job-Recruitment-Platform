const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  description: { type: String, required: true },
  location: { type: String, required: true, index: true },
  requirements: { type: String, required: true },
  skills: { type: [String], required: true, index: true },
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

// Create compound index for title and location
jobSchema.index({ title: 'text', location: 'text' });

module.exports = mongoose.model('Job', jobSchema); 