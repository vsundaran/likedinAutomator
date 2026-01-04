const express = require("express");
const router = express.Router();

// Import route modules
const authRoutes = require("./auth");
const postRoutes = require("./posts");
const healthRoutes = require("./health");
const linkedinRoutes = require("./linkedin");
const youtubeRoutes = require("./youtube");
const nicheRoutes = require("./niche");
const socialRoutes = require("./social");
const heygenRoutes = require("./heygen");

// Use routes
router.use("/auth", authRoutes);
router.use("/posts", postRoutes);
router.use("/health", healthRoutes);
router.use("/linkedin", linkedinRoutes);
router.use("/youtube", youtubeRoutes);
router.use("/niche", nicheRoutes);
router.use("/social", socialRoutes);
router.use("/heygen", heygenRoutes);

module.exports = router;
