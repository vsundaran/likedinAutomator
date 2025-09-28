const cron = require("node-cron");
const Post = require("../models/Post");
const ContentService = require("./ContentService");
const ImageService = require("./ImageService");
const LinkedInService = require("./LinkedInService");
const logger = require("../utils/logger");

class SchedulerService {
  constructor() {
    this.isRunning = false;
  }

  start() {
    // this.executePostingCycle();
    // Run every 2 hours
    cron.schedule("* * * * *", () => {
      this.executePostingCycle();
    });

    logger.info("Scheduler started - will run every 2 hours");
  }

  async executePostingCycle() {
    if (this.isRunning) {
      logger.warn("Posting cycle already running, skipping...");
      return;
    }

    this.isRunning = true;

    try {
      logger.info("Starting posting cycle...");

      // Generate new content
      const topic = await ContentService.getRandomTopic();
      const content = await ContentService.generateAIContent(topic);
      const contentHash = ContentService.generateContentHash(content);

      // Check for duplicates
      const existingPost = await Post.findOne({ contentHash });
      if (existingPost) {
        logger.info("Duplicate content detected, skipping post creation");
        return;
      }

      // Fetch image
      const image = await ImageService.fetchImage(topic);

      // Create post record
      const post = new Post({
        title: topic,
        content: content,
        contentHash: contentHash,
        imageUrl: image.url,
        imageAlt: image.alt,
        status: "pending",
        scheduledFor: new Date(),
      });

      await post.save();

      // Post to LinkedIn with retry logic
      await this.postWithRetry(post);
    } catch (error) {
      logger.error("Posting cycle failed:", error);
    } finally {
      this.isRunning = false;
    }
  }

  async postWithRetry(post, attempt = 1) {
    try {
      const result = await LinkedInService.postToLinkedIn({
        content: post.content,
        // content: "Hello I am posting from API",
        imageUrl: post.imageUrl,
        imageAlt: post.imageAlt,
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
        // Exponential backoff
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
