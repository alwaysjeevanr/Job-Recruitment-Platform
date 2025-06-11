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
      experience,
      experienceLevel // Handle both field names
    } = req.body;
    
    // Use experienceLevel if provided, otherwise use experience
    const experienceValue = experienceLevel || experience;
    
    // Validate experience format
    const validFormats = [
      'Fresher',
      /^[0-9]+$/,  // Single number
      /^[0-9]+-[0-9]+$/,  // Range
      /^[0-9]+\+$/  // Number with plus
    ];
    
    const isValidFormat = validFormats.some(format => {
      if (format instanceof RegExp) {
        return format.test(experienceValue);
      }
      return format === experienceValue;
    });

    if (!isValidFormat) {
      return res.status(400).json({ 
        error: 'Invalid experience format. Use formats like "Fresher", "0", "1", "5-10", or "15+"' 
      });
    }
    
    const job = new Job({ 
      title, 
      description, 
      location, 
      requirements, 
      skills, 
      employerId,
      salary,
      type,
      experience: experienceValue // Use the validated value
    });
    
    await job.save();
    res.status(201).json({ message: 'Job created successfully', job });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error creating job posting' });
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
      search,
      location, 
      experience,
      type,
      page = 1, 
      limit = 10 
    } = req.query;
    
    // Build query
    const query = { status: 'active' };

    // Search across multiple fields
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    // Location filter
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Experience filter
    if (experience) {
      // Handle different experience level formats
      switch (experience.toLowerCase()) {
        case 'entry-level':
        case 'fresher':
          query.experience = { $in: ['Fresher', '0', '0-1', '1'] };
          break;
        case 'mid-level':
          query.experience = { $in: ['2-5', '3-5', '5'] };
          break;
        case 'senior-level':
          query.experience = { $in: ['5-10', '10+', '15+'] };
          break;
        default:
          // If it's a specific number or range, use it directly
          query.experience = experience;
      }
    }

    // Job type filter
    if (type) {
      query.type = type;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get total count for pagination metadata
    const total = await Job.countDocuments(query);
    
    // Get paginated results with employer information
    const jobs = await Job.find(query)
      .populate('employerId', 'name email company')
      .select('-__v')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }); // Sort by newest first

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages,
          hasNextPage,
          hasPrevPage
        }
      }
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: {
        message: error.message || 'Error fetching jobs',
        code: 'JOBS_FETCH_ERROR'
      }
    });
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

exports.getEmployerJobs = async (req, res) => {
  try {
    const employerId = req.user._id; // From auth middleware

    const jobs = await Job.find({ employerId })
      .select('-__v')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching employer jobs' });
  }
};

exports.updateJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status } = req.body;
    const employerId = req.user._id; // From auth middleware

    // Validate status
    if (!['active', 'closed', 'filled'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Status must be one of: active, closed, filled' 
      });
    }

    // Find job and verify ownership
    const job = await Job.findOne({ _id: jobId, employerId });
    
    if (!job) {
      return res.status(404).json({ 
        error: 'Job not found or you do not have permission to update this job' 
      });
    }

    // Update status
    job.status = status;
    await job.save();

    res.json({ 
      message: 'Job status updated successfully',
      job 
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error updating job status' });
  }
}; 