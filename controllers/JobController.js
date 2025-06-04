const Job = require('../models/Job');

exports.createJob = async (req, res) => {
  try {
    const { title, description, location, requirements, skills, employerId } = req.body;
    const job = new Job({ title, description, location, requirements, skills, employerId });
    await job.save();
    res.status(201).json({ message: 'Job created successfully', job });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.listJobs = async (req, res) => {
  try {
    const { title, location, skills, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = {};
    if (title) query.title = { $regex: title, $options: 'i' };
    if (location) query.location = { $regex: location, $options: 'i' };
    if (skills) query.skills = { $in: skills.split(',') };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get total count for pagination metadata
    const total = await Job.countDocuments(query);
    
    // Get paginated results
    const jobs = await Job.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }); // Sort by newest first

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      jobs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}; 