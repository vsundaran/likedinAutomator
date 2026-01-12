const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  contentHash: {
    type: String,
    required: true,
    unique: true
  },
  imageUrl: {
    type: String
  },
  videoUrl: {
    type: String
  },
  imageAlt: {
    type: String
  },
  linkedInPostId: {
    type: String
  },
  linkedInUrl: {
    type: String
  },
  heygenVideoId: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  platform: {
    type: String,
    enum: ['linkedin', 'fb', 'yt', 'all'],
    default: 'linkedin'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'success', 'failed'],
    default: 'pending'
  },
  retries: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  errorMessage: {
    type: String
  },
  scheduledFor: {
    type: Date,
    default: Date.now
  },
  postedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient querying
postSchema.index({ status: 1, scheduledFor: 1 });
postSchema.index({ contentHash: 1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);