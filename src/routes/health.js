const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Health check endpoint
router.get('/', (req, res) => {
  const healthcheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  };

  try {
    // If database is disconnected, return error status
    if (mongoose.connection.readyState !== 1) {
      healthcheck.status = 'ERROR';
      healthcheck.database = 'Disconnected';
      return res.status(503).json(healthcheck);
    }

    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.status = 'ERROR';
    healthcheck.error = error.message;
    res.status(503).json(healthcheck);
  }
});

// Detailed health check with dependencies
router.get('/detailed', async (req, res) => {
  const healthcheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {}
  };

  try {
    // Database health check
    healthcheck.services.database = {
      status: mongoose.connection.readyState === 1 ? 'OK' : 'ERROR',
      details: mongoose.connection.readyState === 1 ? 
        'MongoDB connection active' : 'MongoDB connection failed'
    };

    // LinkedIn API health check (basic)
    healthcheck.services.linkedin = {
      status: 'UNKNOWN',
      details: 'Not actively checked'
    };

    // Image API health check
    healthcheck.services.images = {
      status: 'UNKNOWN', 
      details: 'Not actively checked'
    };

    // Check if any service is down
    const failedServices = Object.values(healthcheck.services).filter(
      service => service.status === 'ERROR'
    );

    if (failedServices.length > 0) {
      healthcheck.status = 'DEGRADED';
    }

    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.status = 'ERROR';
    healthcheck.error = error.message;
    res.status(503).json(healthcheck);
  }
});

module.exports = router;