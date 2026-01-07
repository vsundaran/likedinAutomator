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
      new Date(lastSuccess?.postedAt?.getTime() || Date.now() + 2 * 60 * 60 * 1000) :
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
    const User = require('../models/User');
    const user = await User.findById(req.user.id).populate('nicheId');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.heygenAvatarId) {
      return res.status(400).json({ message: 'HeyGen Avatar ID not found. Please upload an avatar first.' });
    }

    const nicheName = user.nicheId ? user.nicheId.name : 'General';
    const topic = await ContentService.getRandomTopic(user.nicheId?._id);
    const content = await ContentService.generateAIContent(topic, nicheName);
    const contentHash = ContentService.generateContentHash(content);

    // Check for duplicates
    const existingPost = await Post.findOne({ contentHash });
    if (existingPost) {
      return res.status(400).json({ message: 'Duplicate content detected' });
    }

    // Initiate HeyGen Video Generation
    const HeyGenService = require('../services/HeyGenService');
    console.log("Generating video with content:", content);

    // Call V2 Video Generation API (Step 7)
    const videoId = await HeyGenService.generateVideoV2({
      talking_photo_id: user.heygenTalkingPhotoId,
      voice_id: user.heygenVoiceId,
      text: content,
      title: topic
    });

    const post = new Post({
      title: topic,
      content: content,
      contentHash: contentHash,
      heygenVideoId: videoId,
      status: 'pending',
      scheduledFor: new Date(),
    });

    await post.save();

    logger.info(`Manual post created with video initiation: ${post._id}, Video ID: ${videoId}`);

    res.status(201).json({
      message: 'Video generation initiated',
      post,
      videoId
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