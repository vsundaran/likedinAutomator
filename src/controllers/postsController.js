const Post = require('../models/Post');
const ContentService = require('../services/ContentService');
const ImageService = require('../services/ImageService');
const LinkedInService = require('../services/LinkedInService');
const logger = require('../utils/logger');

const getPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { userId: req.user.id };

    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const posts = await Post.find(filter)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments(filter);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    logger.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

const getPostStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const [
      totalPosts,
      successfulPosts,
      failedPosts,
      pendingPosts,
      lastSuccess
    ] = await Promise.all([
      Post.countDocuments({ userId }),
      Post.countDocuments({ userId, status: 'success' }),
      Post.countDocuments({ userId, status: 'failed' }),
      Post.countDocuments({ userId, status: { $in: ['pending', 'processing'] } }),
      Post.findOne({ userId, status: 'success' }).sort({ postedAt: -1 })
    ]);

    // Calculate next scheduled time based on user preference or fixed interval
    const User = require('../models/User');
    const user = await User.findById(userId);
    const nextScheduledPost = user?.postingTime || 'Scheduled';

    res.json({
      totalPosts,
      successfulPosts,
      failedPosts,
      pendingPosts,
      nextScheduledPost,
      lastPost: lastSuccess ? {
        title: lastSuccess.title,
        postedAt: lastSuccess.postedAt
      } : null
    });
  } catch (error) {
    logger.error('Error fetching post stats:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
};

const createManualPost = async (req, res) => {
  try {
    const AutoPostService = require('../services/AutoPostService');
    const post = await AutoPostService.createPostForUser(req.user.id);

    if (!post) {
      return res.status(400).json({ message: 'Could not create post. Check your setup.' });
    }

    res.status(201).json({
      message: 'Video generation initiated',
      post
    });
  } catch (error) {
    logger.error('Error creating manual post:', error);
    res.status(500).json({ message: 'Failed to create post: ' + error.message });
  }
};

const retryPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.status = 'pending';
    post.retries = 0;
    post.errorMessage = '';
    await post.save();

    logger.info(`Retrying post: ${post._id}`);

    // Retry posting
    require('../services/SchedulerService').postWithRetry(post);

    res.json({ message: 'Post retry initiated' });
  } catch (error) {
    logger.error('Error retrying post:', error);
    res.status(500).json({ message: 'Failed to retry post' });
  }
};

const updatePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json({ message: 'Post updated successfully', post });
  } catch (error) {
    logger.error('Error updating post:', error);
    res.status(500).json({ message: 'Failed to update post' });
  }
};

module.exports = {
  getPosts,
  getPostStats,
  createManualPost,
  retryPost,
  updatePost
};