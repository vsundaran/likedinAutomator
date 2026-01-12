const Post = require('../models/Post');
const User = require('../models/User');
const ContentService = require('./ContentService');
const HeyGenService = require('./HeyGenService');
const logger = require('../utils/logger');

class AutoPostService {
    async createPostForUser(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                logger.error(`User ${userId} not found for auto-post`);
                return null;
            }

            if (!user.heygenTalkingPhotoId || !user.heygenVoiceId) {
                logger.warn(`User ${userId} has not completed HeyGen setup (avatar/voice)`);
                return null;
            }

            const nicheName = user.nicheDescription || 'General';
            // Get a topic based on niche description or default
            const topic = await ContentService.getRandomTopic();
            // Generate content using niche description
            const content = await ContentService.generateAIContent(topic, nicheName);
            const contentHash = ContentService.generateContentHash(content);

            // Check for duplicates
            const existingPost = await Post.findOne({ contentHash });
            if (existingPost) {
                logger.info(`Duplicate content for user ${userId}, skipping...`);
                return null;
            }

            // Initiate HeyGen Video Generation
            logger.info(`Initiating HeyGen video for user ${userId} with topic: ${topic}`);
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
                userId: userId,
                status: 'pending',
                scheduledFor: new Date(),
            });

            await post.save();
            logger.info(`Auto post ${post._id} created for user ${userId}`);
            return post;
        } catch (error) {
            logger.error(`Error in createPostForUser for ${userId}:`, error);
            throw error;
        }
    }

    async pollVideoStatuses() {
        try {
            const pendingPosts = await Post.find({
                status: { $in: ['pending', 'processing'] },
                heygenVideoId: { $exists: true }
            });

            for (const post of pendingPosts) {
                try {
                    const statusData = await HeyGenService.getVideoStatus(post.heygenVideoId);
                    // statusData usually has { status, progress, video_url }

                    if (statusData.status === 'completed' || statusData.status === 'success') {
                        post.status = 'success';
                        post.videoUrl = statusData.video_url;
                        await post.save();
                        logger.info(`Post ${post._id} video generation completed`);

                        // Trigger actual posting to social media if it was meant to be immediate
                        // In our current flow, it posts once video is ready if it's past scheduled time
                        const SchedulerService = require('./SchedulerService');
                        await SchedulerService.postWithRetry(post);
                    } else if (statusData.status === 'failed') {
                        post.status = 'failed';
                        post.errorMessage = 'HeyGen video generation failed';
                        await post.save();
                        logger.error(`Post ${post._id} video generation failed`);
                    } else if (statusData.status === 'processing' || statusData.status === 'pending') {
                        post.status = 'processing';
                        // Optionally store progress if we add a progress field to Post model
                        await post.save();
                    }
                } catch (err) {
                    logger.error(`Error polling status for post ${post._id}:`, err);
                }
            }
        } catch (error) {
            logger.error('Error in pollVideoStatuses:', error);
        }
    }
}

module.exports = new AutoPostService();
