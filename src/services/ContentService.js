const axios = require("axios");
const crypto = require("crypto");
const { InferenceClient } = require("@huggingface/inference");

class ContentService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.topics = [
      "React Hooks Deep Dive",
      "React Performance Optimization",
      "React Error Handling Strategies",
      "React Component Lifecycles",
      "React State Management",
      "React Best Practices",
      "React Testing Strategies",
      "React with TypeScript",
    ];
  }

  generateContentHash(content) {
    return crypto.createHash("md5").update(content).digest("hex");
  }

  async generateAIContent(topic) {
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
            content:
              "You are an expert React developer. Create engaging, technical content for LinkedIn posts. Include code snippets when relevant and add appropriate hashtags.",
          },
          {
            role: "user",
            content: `Create a LinkedIn post about ${topic}. Include:\n1. Engaging title\n2. Technical insights\n3. Code example (if applicable)\n4. Best practices\n5. 3-5 relevant hashtags\n\nKeep it under 1300 characters. Don't include the charector count`,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      let content = chatCompletion.choices[0].message.content;

      // Remove <think> sections
      content = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

      // Remove "Character count" notes
      content = content.replace(/Character count.*$/gim, "");

      // Remove *(123 characters)* or similar counts
      content = content.replace(/\*\(\d+,\d+\scharacters\)\*/gi, "");
      content = content.replace(/\*\(\d+\scharacters\)\*/gi, "");

      // Remove Markdown bold (**text** → text)
      content = content.replace(/\*\*(.*?)\*\*/g, "$1");

      return content;
    } catch (error) {
      console.error("AI content generation failed:", error.message);
      return this.generateFallbackContent(topic);
    }
  }

  generateFallbackContent(topic) {
    const templates = {
      "React Hooks Deep Dive": `🚀 React Hooks Deep Dive: useState & useEffect

Mastering hooks is crucial for modern React development! Here's a quick guide:

✨ useState: Manages component state
const [count, setCount] = useState(0);

✨ useEffect: Handles side effects
useEffect(() => {
  document.title = \`Count: \${count}\`;
}, [count]);

💡 Pro tip: Always specify dependencies in useEffect to avoid bugs!

#React #Hooks #JavaScript #WebDevelopment #Frontend`,

      "React Performance Optimization": `⚡ React Performance Optimization Tips

Is your React app feeling slow? Try these optimizations:

1. Use React.memo() for component memoization
2. Implement useCallback for functions
3. Use useMemo for expensive calculations
4. Code splitting with React.lazy()
5. Virtualize long lists

Example:
const expensiveValue = useMemo(() => {
  return heavyCalculation(props.data);
}, [props.data]);

#React #Performance #JavaScript #WebDev #Optimization`,
    };

    return templates[topic] || this.generateBasicContent(topic);
  }

  generateBasicContent(topic) {
    const hashtags = [
      "#React",
      "#JavaScript",
      "#WebDevelopment",
      "#Programming",
    ];
    return `📚 ${topic}\n\nExploring new concepts in React development. Stay tuned for more insights!\n\n${hashtags.join(
      " "
    )}`;
  }

  async getRandomTopic() {
    const randomIndex = Math.floor(Math.random() * this.topics.length);
    return this.topics[randomIndex];
  }
}

module.exports = new ContentService();
