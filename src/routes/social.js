const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");


const Token = require("../models/Token");

// Get connected accounts
router.get("/accounts", authenticateToken, async (req, res) => {
    try {
        const tokenDoc = await Token.findOne({ userId: req.user.id });
        if (!tokenDoc) {
            return res.json([]);
        }

        const accounts = [];
        const platforms = ["facebook", "instagram", "linkedin", "youtube"];

        platforms.forEach(platform => {
            if (tokenDoc[platform] && tokenDoc[platform].accessToken) {
                accounts.push({
                    platform,
                    connected: true,
                    platformUserName: tokenDoc[platform].platformUserName || null, // Token model doesn't have this yet, maybe add later?
                    updatedAt: tokenDoc.updatedAt
                });
            }
        });

        res.json(accounts);
    } catch (error) {
        console.error("Fetch social accounts error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Disconnect an account
router.delete("/:platform", authenticateToken, async (req, res) => {
    try {
        const { platform } = req.params;
        const platforms = ["facebook", "instagram", "linkedin", "youtube"];

        if (!platforms.includes(platform)) {
            return res.status(400).json({ message: "Invalid platform" });
        }

        const tokenDoc = await Token.findOne({ userId: req.user.id });
        if (tokenDoc && tokenDoc[platform]) {
            tokenDoc[platform] = undefined;
            await tokenDoc.save();
        }

        res.json({ message: `${platform} account disconnected successfully` });
    } catch (error) {
        console.error("Social disconnect error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
