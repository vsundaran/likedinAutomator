const puppeteer = require("puppeteer");

class CodeImageGenerator {
  constructor() {
    this.browser = null;
  }

  async init() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: "new",
      });
    }
  }

  async generateImage(badCode, goodCode, language = "javascript") {
    await this.init();
    const page = await this.browser.newPage();

    const html = `
  <html>
    <head>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-okaidia.min.css"/>
      <style>
        body {
          background: #1e3a5c;
          margin: 0;
          padding: 100px;
          font-family: 'Fira Code', 'Monaco', 'Cascadia Code', monospace;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .container {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }
        .code-section {
          background: #1a1a2e;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          border: 1px solid #2a2a4a;
          position: relative;
          width: 800px;
        }
        .header {
          background: #111827;
          color: #fff;
          font-weight: bold;
          padding: 8px 16px;
          font-size: 16px;
          border-bottom: 1px solid #2a2a4a;
        }
        .code-content {
          padding: 16px;
          overflow-x: auto;
        }
        pre {
          margin: 0;
          background: transparent !important;
          font-size: 14px;
          line-height: 1.5;
        }
        code {
          font-family: 'Fira Code', 'Monaco', 'Cascadia Code', monospace;
          background: transparent !important;
        }
        .token.keyword { color: #ff79c6; }
        .token.function { color: #50fa7b; }
        .token.string { color: #f1fa8c; }
        .token.comment { color: #6272a4; }
        .token.operator { color: #ff79c6; }
        .token.punctuation { color: #f8f8f2; }
        .token.number { color: #bd93f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="code-section">
          <div class="header">🚨 Bad Practice</div>
          <div class="code-content">
            <pre><code class="language-${language}">${badCode
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")}</code></pre>
          </div>
        </div>
        <div class="code-section">
          <div class="header">✅ Good Practice</div>
          <div class="code-content">
            <pre><code class="language-${language}">${goodCode
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")}</code></pre>
          </div>
        </div>
      </div>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-${language}.min.js"></script>
    </body>
  </html>
  `;

    await page.setContent(html, { waitUntil: "networkidle0" });

    // Set viewport dynamically to capture both blocks
    const element = await page.$(".container");
    const boundingBox = await element.boundingBox();
    await page.setViewport({
      width: Math.ceil(boundingBox.width),
      height: Math.ceil(boundingBox.height),
    });

    const buffer = await element.screenshot({ type: "png" });

    await page.close();

    return buffer;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = CodeImageGenerator;
