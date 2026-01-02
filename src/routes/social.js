const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const SocialAccount = require("../models/SocialAccount");

// Connect a social media account
router.post("/connect", authenticateToken, async (req, res) => {
    try {
        const { platform, accessToken, refreshToken, platformUserId, platformUserName, expiresAt } = req.body;

        if (!platform || !accessToken) {
            return res.status(400).json({ message: "Platform and access token required" });
        }

        const socialAccount = await SocialAccount.findOneAndUpdate(
            { userId: req.user.id, platform },
            {
                accessToken,
                refreshToken,
                platformUserId,
                platformUserName,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
            },
            { upsert: true, new: true }
        );

        res.json({ message: `${platform} account connected successfully`, socialAccount });
    } catch (error) {
        console.error("Social connect error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get connected accounts
router.get("/accounts", authenticateToken, async (req, res) => {
    try {
        console.log(req.user)
        const accounts = await SocialAccount.find({ userId: req.user.id }).select("-accessToken -refreshToken");
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
        await SocialAccount.findOneAndDelete({ userId: req.user.id, platform });
        res.json({ message: `${platform} account disconnected successfully` });
    } catch (error) {
        console.error("Social disconnect error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
