const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

// Mock JWT secret
process.env.JWT_SECRET = 'test-secret';

describe('Job Seeker Applications Endpoint', () => {
  let jobSeekerToken;
  let employerToken;
  let jobId;
  let applicationId;

  // Setup before all tests
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/job-recruitment-test');

    // Create test job seeker
    const jobSeeker = await User.create({
      name: 'Test Job Seeker',
      email: 'jobseeker@test.com',
      password: 'password123',
      role: 'jobseeker'
    });

    // Create test employer
    const employer = await User.create({
      name: 'Test Company',
      email: 'employer@test.com',
      password: 'password123',
      role: 'employer'
    });

    // Create test job
    const job = await Job.create({
      title: 'Test Job',
      description: 'Test Description',
      location: 'Test Location',
      requirements: 'Test Requirements',
      skills: ['JavaScript', 'Node.js'],
      employerId: employer._id,
      salary: '$50,000 - $70,000',
      type: 'Full-time',
      experience: '1-3'
    });

    jobId = job._id;

    // Create test application
    const application = await Application.create({
      jobId: job._id,
      seekerId: jobSeeker._id,
      status: 'pending',
      resumeUrl: 'https://example.com/resume.pdf'
    });

    applicationId = application._id;

    // Generate tokens
    jobSeekerToken = jwt.sign(
      { id: jobSeeker._id, role: 'jobseeker' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    employerToken = jwt.sign(
      { id: employer._id, role: 'employer' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  // Cleanup after all tests
  afterAll(async () => {
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /api/jobseeker/applications', () => {
    it('should return 401 if no token is provided', async () => {
      const response = await request(app)
        .get('/api/jobseeker/applications');

      expect(response.status).toBe(401);
      expect(response.body.error.message).toBe('Access denied. No token provided.');
    });

    it('should return 403 if user is not a job seeker', async () => {
      const response = await request(app)
        .get('/api/jobseeker/applications')
        .set('Authorization', `Bearer ${employerToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error.message).toBe('Access denied. Not authorized.');
    });

    it('should return applications for the authenticated job seeker', async () => {
      const response = await request(app)
        .get('/api/jobseeker/applications')
        .set('Authorization', `Bearer ${jobSeekerToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const application = response.body[0];
      expect(application).toHaveProperty('_id');
      expect(application).toHaveProperty('job');
      expect(application.job).toHaveProperty('_id');
      expect(application.job).toHaveProperty('title');
      expect(application.job).toHaveProperty('company');
      expect(application).toHaveProperty('applicant');
      expect(application.applicant).toHaveProperty('_id');
      expect(application.applicant).toHaveProperty('name');
      expect(application).toHaveProperty('appliedAt');
      expect(application).toHaveProperty('status');
    });

    it('should return empty array if job seeker has no applications', async () => {
      // Create a new job seeker with no applications
      const newJobSeeker = await User.create({
        name: 'New Job Seeker',
        email: 'newjobseeker@test.com',
        password: 'password123',
        role: 'jobseeker'
      });

      const newToken = jwt.sign(
        { id: newJobSeeker._id, role: 'jobseeker' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/jobseeker/applications')
        .set('Authorization', `Bearer ${newToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);

      // Cleanup
      await User.findByIdAndDelete(newJobSeeker._id);
    });
  });
}); 