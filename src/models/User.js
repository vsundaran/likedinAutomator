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
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
