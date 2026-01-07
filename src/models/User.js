const mongoose = require("mongoose");

// User model
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  avatarUrl: {
    type: String,
    required: false, // Will be mandatory after registration in flow
  },
  nicheId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Niche",
  },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String,
    bankName: String,
  },
  heygenAvatarId: {
    type: String,
    required: false,
  },
  gender: {
    type: String,
    enum: ["male", "female"],
    required: false,
  },
  heygenTalkingPhotoId: {
    type: String,
    required: false,
  },
  heygenVoiceId: {
    type: String,
    required: false,
  },
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
