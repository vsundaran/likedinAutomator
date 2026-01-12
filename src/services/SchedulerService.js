const cron = require("node-cron");
const Post = require("../models/Post");
const User = require("../models/User");
const ContentService = require("./ContentService");
const LinkedInService = require("./LinkedInService");
const AutoPostService = require("./AutoPostService");
const logger = require("../utils/logger");

class SchedulerService {
  constructor() {
    this.isCycleRunning = false;
    this.isPollingRunning = false;
  }

  start() {
    // Run status polling every minute
    cron.schedule("* * * * *", () => {
      this.pollVideoStatuses();
    });

    // Run schedule check every hour
    cron.schedule("0 * * * *", () => {
      this.checkUserSchedules();
    });

    logger.info("Scheduler started - status polling (1m) and schedule check (1h)");
  }

  async pollVideoStatuses() {
    if (this.isPollingRunning) return;
    this.isPollingRunning = true;
    try {
      await AutoPostService.pollVideoStatuses();
    } catch (error) {
      logger.error("Video status polling failed:", error);
    } finally {
      this.isPollingRunning = false;
    }
  }

  async checkUserSchedules() {
    if (this.isCycleRunning) return;
    this.isCycleRunning = true;

    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentAMPM = currentHour >= 12 ? 'PM' : 'AM';
      const displayHour = (currentHour % 12 || 12).toString().padStart(2, '0');
      const timeString = `${displayHour}:00 ${currentAMPM}`;

      logger.info(`Checking users scheduled for ${timeString}`);

      // Find users scheduled for this hour
      const users = await User.find({ postingTime: timeString });

      for (const user of users) {
        try {
          // Check if user already had a post today
          const startOfDay = new Date();
          startOfDay.setHours(0, 0, 0, 0);

          const existingPost = await Post.findOne({
            userId: user._id,
            createdAt: { $gte: startOfDay }
          });

          if (!existingPost) {
            logger.info(`Creating scheduled post for user ${user._id}`);
            await AutoPostService.createPostForUser(user._id);
          }
        } catch (err) {
          logger.error(`Failed to handle schedule for user ${user._id}:`, err);
        }
      }
    } catch (error) {
      logger.error("Schedule check cycle failed:", error);
    } finally {
      this.isCycleRunning = false;
    }
  }

  async postWithRetry(post, attempt = 1) {
    try {
      // If videoUrl is not ready, we can't post yet
      if (post.heygenVideoId && !post.videoUrl) {
        logger.warn(`Post ${post._id} waiting for video URL before posting`);
        return;
      }

      const result = await LinkedInService.postToLinkedIn({
        content: post.content,
        imageUrl: post.imageUrl || post.videoUrl, // Use videoUrl as "media" if available
        imageAlt: post.title,
      });

      post.status = "success";
      post.linkedInPostId = result.postId;
      post.linkedInUrl = result.url;
      post.postedAt = new Date();
      await post.save();

      logger.info(`Post ${post._id} successfully published to LinkedIn`);
    } catch (error) {
      post.retries = attempt;
      post.errorMessage = error.message;

      if (attempt >= post.maxRetries) {
        post.status = "failed";
        logger.error(
          `Post ${post._id} failed after ${attempt} attempts:`,
          error
        );
      } else {
        const backoffTime = Math.pow(2, attempt) * 1000;
        logger.warn(
          `Post ${post._id} failed on attempt ${attempt}, retrying in ${backoffTime}ms`
        );

        setTimeout(() => {
          this.postWithRetry(post, attempt + 1);
        }, backoffTime);
        return;
      }

      await post.save();
    }
  }
}

module.exports = new SchedulerService();
