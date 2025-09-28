const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const postRoutes = require('./posts');
const healthRoutes = require('./health');

// Use routes
router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/health', healthRoutes);

module.exports = router;