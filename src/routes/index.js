const express = require("express");
const router = express.Router();

// Import route modules
const authRoutes = require("./auth");
const postRoutes = require("./posts");
const healthRoutes = require("./health");
const linkedinRoutes = require("./linkedin");
const youtubeRoutes = require("./youtube");

// Use routes
router.use("/auth", authRoutes);
router.use("/posts", postRoutes);

// currently no special health routes, using app.js health check
router.use("/health", healthRoutes);

router.use("/linkedin", linkedinRoutes);
router.use("/youtube", youtubeRoutes);

module.exports = router;
