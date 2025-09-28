const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();

// Create logs directory
const fs = require('fs');
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Routes
app.use('/api', require('./routes'));

// Health check (public endpoint)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'LinkedIn Automator API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      documentation: 'See README for API documentation'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Error handling middleware (must be last)
app.use(require('./middleware/errorHandler'));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
  
  // Start scheduler only if not in test environment
  if (process.env.NODE_ENV !== 'test') {
    require('./services/SchedulerService').start();
    // this.clientId = process.env.LINKEDIN_CLIENT_ID;
    // this.clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    // this.redirectUri = process.env.LINKEDIN_REDIRECT_URI;
    // this.accessToken = process.env.LINKEDIN_ACCESS_TOKEN;

    // console.log('LINKEDIN_CLIENT_ID:', this.clientId);
    // console.log('LINKEDIN_CLIENT_SECRET:', this.clientSecret);
    // console.log('LINKEDIN_REDIRECT_URI:', this.redirectUri);
    // console.log('LINKEDIN_ACCESS_TOKEN:', this.accessToken);
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;