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

    const filter = {};
    
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
    const [
      totalPosts,
      successfulPosts,
      failedPosts,
      pendingPosts,
      lastSuccess
    ] = await Promise.all([
      Post.countDocuments(),
      Post.countDocuments({ status: 'success' }),
      Post.countDocuments({ status: 'failed' }),
      Post.countDocuments({ status: 'pending' }),
      Post.findOne({ status: 'success' }).sort({ postedAt: -1 })
    ]);

    const nextScheduledPost = lastSuccess ? 
      new Date(lastSuccess.postedAt.getTime() + 2 * 60 * 60 * 1000) : 
      new Date(Date.now() + 2 * 60 * 60 * 1000);

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
    const topic = await ContentService.getRandomTopic();
    const content = await ContentService.generateAIContent(topic);
    const contentHash = ContentService.generateContentHash(content);
    
    // Check for duplicates
    const existingPost = await Post.findOne({ contentHash });
    if (existingPost) {
      return res.status(400).json({ message: 'Duplicate content detected' });
    }

    const image = await ImageService.fetchImage(topic);
    
    const post = new Post({
      title: topic,
      content: content,
      contentHash: contentHash,
      imageUrl: image.url,
      imageAlt: image.alt,
      status: 'pending',
      scheduledFor: new Date()
    });

    await post.save();

    logger.info(`Manual post created: ${post._id}`);

    // Start background posting process
    require('../services/SchedulerService').postWithRetry(post);

    res.status(201).json({ 
      message: 'Post created successfully',
      post 
    });
  } catch (error) {
    logger.error('Error creating manual post:', error);
    res.status(500).json({ message: 'Failed to create post' });
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

module.exports = {
  getPosts,
  getPostStats,
  createManualPost,
  retryPost
};