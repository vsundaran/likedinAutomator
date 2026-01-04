const axios = require("axios");
const crypto = require("crypto");
const { InferenceClient } = require("@huggingface/inference");
const Post = require("../models/Post");

class ContentService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    // Default topics if no niche is provided
    this.defaultTopics = [
      "Introduction to React",
      "React Hooks",
      "React Performance",
    ];
  }
  async getRandomTopic(nicheId) {
    try {
      if (!nicheId) {
        return this.defaultTopics[Math.floor(Math.random() * this.defaultTopics.length)];
      }

      const Niche = require("../models/Niche");
      const niche = await Niche.findById(nicheId);

      if (!niche || !niche.topics || niche.topics.length === 0) {
        return this.defaultTopics[Math.floor(Math.random() * this.defaultTopics.length)];
      }

      return niche.topics[Math.floor(Math.random() * niche.topics.length)];
    } catch (error) {
      console.error("Error getting random topic:", error);
      return this.defaultTopics[Math.floor(Math.random() * this.defaultTopics.length)];
    }
  }


  generateContentHash(content) {
    return crypto.createHash("md5").update(content).digest("hex");
  }

  async isDuplicate(content) {
    const hash = this.generateContentHash(content);
    const existing = await Post.findOne({ contentHash: hash });
    return !!existing;
  }

  async generateAIContent(topic, nicheName = "General") {
    try {
      const hfToken = this.openaiApiKey;
      if (!hfToken) {
        return this.generateFallbackContent(topic);
      }
      const client = new InferenceClient(hfToken);

      const chatCompletion = await client.chatCompletion({
        provider: "novita",
        model: "deepseek-ai/DeepSeek-R1",
        messages: [
          {
            role: "system",
            content: `You are an expert content creator in the ${nicheName} niche. Create engaging, technical content for social media posts. Include code snippets where relevant and add appropriate hashtags.`,
          },
          {
            role: "user",
            content: `Create a short-form video script about "${topic}" for YouTube Shorts and Instagram Reels.
Requirements:
- Start with a strong 2–3 second hook to stop scrolling
- Deliver 1–2 clear, valuable insights in a simple, confident tone
- Include a quick real-world example or use case (if relevant)
- End with a clear CTA (follow, save, or comment)
- Add 3–5 trending, relevant hashtags
- Keep the total script under 60 seconds video
- Use short, punchy sentences suitable for voice-over`
          }

        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      let content = chatCompletion.choices[0].message.content;

      // Clean up content
      content = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
      content = content.replace(/\*\*(.*?)\*\*/g, "$1"); // Remove bold

      // Check for duplicates
      if (await this.isDuplicate(content)) {
        console.log("Duplicate content detected, regenerating...");
        return this.generateAIContent(topic, nicheName); // Recursive call for new content
      }

      return content;
    } catch (error) {
      console.error("AI content generation failed:", error.message);
      return this.generateFallbackContent(topic);
    }
  }

  async generateDynamicTitle(content) {
    // Generate a punchy title from the content if one isn't explicitly provided
    const lines = content.split('\n');
    return lines[0].substring(0, 100).replace(/[#*]/g, '').trim();
  }

  generateFallbackContent(topic) {
    return `📚 ${topic}\n\nMastering ${topic} is crucial for success! Here's a quick guide...\n\n#Learning #Growth #Professional`;
  }
}

module.exports = new ContentService();
