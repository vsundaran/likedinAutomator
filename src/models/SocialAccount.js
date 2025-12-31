const mongoose = require("mongoose");

const SocialAccountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    platform: {
        type: String,
        enum: ["youtube", "linkedin", "instagram", "facebook"],
        required: true,
    },
    accessToken: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
    },
    platformUserId: {
        type: String,
    },
    platformUserName: {
        type: String,
    },
    expiresAt: {
        type: Date,
    },
}, { timestamps: true });

// Ensure a user only has one account per platform
SocialAccountSchema.index({ userId: 1, platform: 1 }, { unique: true });

module.exports = mongoose.model("SocialAccount", SocialAccountSchema);
