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
            content: `Create a social media post about ${topic}. The post should include:  
1. An engaging and attention-grabbing title  
2. Clear insights explained in a professional yet approachable tone  
3. Practical examples or use cases (if applicable)  
4. Actionable best practices or tips  
5. 3–5 relevant and trending hashtags  
Keep the post concise, impactful, and under 1300 characters.`,
          },
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
