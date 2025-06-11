// Set test environment
process.env.NODE_ENV = 'test';

// Set test database URI
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/job-recruitment-test';

// Set JWT secret for testing
process.env.JWT_SECRET = 'test-secret';

// Increase timeout for tests
jest.setTimeout(30000); 