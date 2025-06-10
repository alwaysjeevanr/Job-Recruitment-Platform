const Job = require('../models/Job');

exports.createJob = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      location, 
      requirements, 
      skills, 
      employerId,
      salary,
      type,
      experience 
    } = req.body;
    
    const job = new Job({ 
      title, 
      description, 
      location, 
      requirements, 
      skills, 
      employerId,
      salary,
      type,
      experience
    });
    
    await job.save();
    res.status(201).json({ message: 'Job created successfully', job });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getRecentJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('employerId', 'name email')
      .select('-__v');

    res.json({
      jobs,
      total: jobs.length
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.listJobs = async (req, res) => {
  try {
    const { 
      title, 
      location, 
      skills, 
      type,
      page = 1, 
      limit = 10 
    } = req.query;
    
    // Build query
    const query = { status: 'active' };
    if (title) query.title = { $regex: title, $options: 'i' };
    if (location) query.location = { $regex: location, $options: 'i' };
    if (skills) query.skills = { $in: skills.split(',') };
    if (type) query.type = type;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get total count for pagination metadata
    const total = await Job.countDocuments(query);
    
    // Get paginated results with employer information
    const jobs = await Job.find(query)
      .populate('employerId', 'name email')
      .select('-__v')
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

exports.getJobDetails = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = await Job.findById(jobId)
      .populate('employerId', 'name email company')
      .select('-__v');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}; 