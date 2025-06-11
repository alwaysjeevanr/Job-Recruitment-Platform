const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const logger = require('./config/logger');
const { errorHandler } = require('./middleware/errorHandler');
const responseFormatter = require('./middleware/responseFormatter');
const swaggerDocs = require('./config/swagger');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Trust proxy - Important for Render deployment
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000', // Local development
  'http://localhost:5173', // Vite default port
  'https://job-recruitment-platform-jeevan.vercel.app' // Vercel frontend
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  }
});
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Response formatter middleware
app.use(responseFormatter);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Job Recruitment API',
    documentation: '/api-docs',
    health: '/api/health'
  });
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/job'));
app.use('/api/applications', require('./routes/application'));
app.use('/api/jobseeker', require('./routes/jobseeker'));

// Error handling middleware
app.use(errorHandler);

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route not found: ${req.originalUrl}`,
      code: 'NOT_FOUND'
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
}); 