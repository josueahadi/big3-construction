const express = require('express');
const passport = require('passport');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import middleware
const { notFound, errorHandler, handleDatabaseError } = require('./middleware/error.middleware');

// Import routes
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const workerRoutes = require('./routes/worker.routes');
const clientRoutes = require('./routes/client.routes');
const materialRoutes = require('./routes/material.routes');

// Import configurations
require('./config/passport')(passport);

/**
 * Express Application Setup
 */

const app = express();

// =========================================================
// Security Middleware
// =========================================================

// Helmet - secure HTTP headers
app.use(helmet());

// CORS - Cross-Origin Resource Sharing
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: process.env.CORS_CREDENTIALS === 'true' || true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting - prevent brute force attacks
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// =========================================================
// Body Parsing Middleware
// =========================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================================================
// Passport Initialization
// =========================================================

app.use(passport.initialize());

// =========================================================
// Routes
// =========================================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Big3 Construction API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/materials', materialRoutes);

// =========================================================
// Error Handling
// =========================================================

// Database error handler (must be before generic error handler)
app.use(handleDatabaseError);

// 404 handler
app.use(notFound);

// Generic error handler (must be last)
app.use(errorHandler);

module.exports = app;
