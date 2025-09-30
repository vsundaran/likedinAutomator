const axios = require("axios");
const crypto = require("crypto");
const { InferenceClient } = require("@huggingface/inference");

class ContentService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.topics = [
      // 🌱 React Basics
      "Introduction to React and Why It’s Popular",
      "Understanding JSX in React",
      "React Components: Functional vs Class",
      "Props in React: Passing Data Between Components",
      "React State: The Basics",
      "Event Handling in React",
      "Conditional Rendering in React",
      "Lists and Keys in React",
      "Controlled vs Uncontrolled Components",
      "React Forms Basics",

      // ⚡ React Core Concepts
      "React Hooks Deep Dive",
      "useState and useEffect Explained",
      "useRef and useMemo in Real Projects",
      "useReducer vs useState: When to Use What",
      "Custom Hooks in React",
      "React Context API Explained",
      "React Component Lifecycles",
      "React Error Handling Strategies",
      "React Portals and When to Use Them",
      "Fragments in React",

      // 🎯 React Intermediate Topics
      "React State Management",
      "Prop Drilling and How to Avoid It",
      "React Performance Optimization",
      "Code Splitting and Lazy Loading in React",
      "React Suspense and Concurrent Features",
      "Memoization in React (React.memo, useMemo, useCallback)",
      "Forms in React (Formik, React Hook Form, Zod)",
      "Accessibility in React (a11y Best Practices)",
      "React Routing with React Router",
      "Authentication in React Apps",

      // 🚀 Advanced React
      "Advanced React Patterns (HOCs, Render Props, Compound Components)",
      "Context API vs Redux vs Zustand vs Recoil",
      "Server-Side Rendering (SSR) with Next.js",
      "Static Site Generation (SSG) and ISR",
      "Microfrontends with React",
      "React with GraphQL (Apollo, Relay)",
      "React with TypeScript",
      "Building Design Systems with React & Storybook",
      "React and Browser APIs (IntersectionObserver, WebRTC, etc.)",
      "Debugging and Profiling React Apps",

      // 🧪 Testing & Quality
      "React Testing Strategies",
      "Unit Testing React Components (Jest)",
      "Integration Testing with React Testing Library",
      "End-to-End Testing with Cypress and Playwright",
      "Snapshot Testing in React",
      "CI/CD for React Projects",

      // 🎨 Styling
      "Styling React Apps (CSS Modules, Styled Components, Tailwind)",
      "CSS-in-JS vs Utility-First CSS",
      "Responsive Design in React",
      "Dark Mode in React Apps",

      // 🔐 Security & Performance
      "Security Best Practices in React Apps",
      "Authentication & Authorization in React",
      "Web Security in Frontend (XSS, CSRF, CORS)",
      "Performance Optimization in React Apps",
      "Bundle Analysis and Tree Shaking",
      "Caching Strategies in React Apps",

      // 🌍 Ecosystem & Real-World Apps
      "Progressive Web Apps (PWAs) with React",
      "Internationalization (i18n) in React",
      "React Native for Mobile Development",
      "Integrating APIs in React (REST & GraphQL)",
      "State Machines in React (XState Basics)",
      "Building Offline-First React Apps",
      "React with WebSockets (Real-Time Apps)",

      // 🏗️ Engineering & Mastery
      "Clean Code Practices in React",
      "System Design for Frontend Engineers",
      "Scalable Folder Structures in React Projects",
      "Monorepos for React Apps (Nx, Turborepo)",
      "TypeScript Deep Dive for React Developers",
      "Debugging Complex React Issues",
      "Handling Large-Scale React Applications",
      "Collaboration with Designers (Figma → React workflows)",
      "Best Practices for Code Reviews in Frontend",
      "Interview Preparation for React Developers",
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
            content: `Create a LinkedIn post about ${topic}. The post should include:  
1. An engaging and attention-grabbing title  
2. Clear technical insights explained in a professional yet approachable tone  
3. Practical examples or use cases (if applicable)  
4. Actionable best practices or tips  
5. 3–5 relevant and trending hashtags  
Keep the post concise, impactful, and under 1300 characters. Do not mention or include the character count in the response.`,
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
