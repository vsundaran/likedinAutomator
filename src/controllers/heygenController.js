const HeyGenService = require("../services/HeyGenService");
const User = require("../models/User");

const addMotion = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.heygenAvatarId) {
            return res.status(400).json({ message: "HeyGen Avatar ID not found for this user." });
        }

        const { prompt, motion_type } = req.body;
        const result = await HeyGenService.addMotion(user.heygenAvatarId, prompt, motion_type);

        res.json({ message: "Motion generation initiated", data: result });
    } catch (error) {
        console.error("Add motion error:", error);
        res.status(500).json({ message: error.message });
    }
};

const getAvatarStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.heygenAvatarId) {
            return res.status(400).json({ message: "HeyGen Avatar ID not found for this user." });
        }

        const result = await HeyGenService.getAvatarDetails(user.heygenAvatarId);
        res.json({ data: result.data });
    } catch (error) {
        console.error("Get avatar status error:", error);
        res.status(500).json({ message: error.message });
    }
};

const getVideoStatus = async (req, res) => {
    try {
        const videoId = req.params.videoId || req.query.video_id;
        if (!videoId) {
            return res.status(400).json({ message: "Video ID is required." });
        }

        const result = await HeyGenService.getVideoStatus(videoId);
        res.json({ data: result });
    } catch (error) {
        console.error("Get video status error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addMotion,
    getAvatarStatus,
    getVideoStatus
};
