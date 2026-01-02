const mongoose = require("mongoose");
const TokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    facebook: {
      refreshToken: { type: String },
      expiry: { type: Date },
      refresh_token_expiry_date: { type: Date },
      accessToken: { type: String },
      scope: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
    instagram: {
      refreshToken: { type: String },
      expiry: { type: Date },
      refresh_token_expiry_date: { type: Date },
      accessToken: { type: String },
      scope: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
    linkedin: {
      refreshToken: { type: String, default: null },
      expiry: { type: Date },
      refresh_token_expiry_date: { type: Date },
      accessToken: { type: String },
      scope: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
    youtube: {
      refreshToken: { type: String, default: null },
      expiry: { type: Date },
      refresh_token_expiry_date: { type: Date },
      accessToken: { type: String },
      scope: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
  },
  {
    timestamps: true,
  }
);

TokenSchema.index({ userId: 1 }, { unique: true });

const Token = mongoose.model("Token", TokenSchema);

module.exports = Token;
