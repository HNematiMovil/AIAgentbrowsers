# Quick Start Guide

Get started with Chromium Controller in minutes!

## Installation

```bash
npm install
```

This will install Puppeteer and automatically download Chromium.

---

## 1. Using CLI (Fastest Way)

### View Available Agents

```bash
node cli.js list
```

### Run an Agent

```bash
node cli.js run tehrantabligh
```

### Run All Enabled Agents

```bash
node cli.js run-all
```

---

## 2. Create Your First Agent

Create `agents/my-first-agent.json`:

```json
{
  "id": "my-first-agent",
  "name": "My First Agent",
  "enabled": true,
  
  "browser": {
    "headless": false
  },

  "tasks": [
    {
      "id": "open-page",
      "action": "goto",
      "url": "https://example.com"
    },
    {
      "id": "get-title",
      "action": "getText",
      "selector": "h1"
    },
    {
      "id": "screenshot",
      "action": "screenshot",
      "path": "screenshots/my-first-screenshot.png"
    }
  ]
}
```

Run it:

```bash
node cli.js run my-first-agent
```

---

## 3. Common Task Actions

### Navigate to URL
```json
{ "id": "open", "action": "goto", "url": "https://example.com" }
```

### Click Element
```json
{ "id": "click-btn", "action": "click", "selector": "button.submit" }
```

### Type Text
```json
{ "id": "type-text", "action": "type", "selector": "#input", "value": "Hello" }
```

### Take Screenshot
```json
{ "id": "capture", "action": "screenshot", "path": "output.png" }
```

### Extract Text
```json
{ "id": "get-text", "action": "getText", "selector": "h1" }
```

### Wait
```json
{ "id": "wait", "action": "wait", "duration": 2000 }
```

---

## 4. Using Credentials

Store credentials in your agent config:

```json
{
  "id": "login-agent",
  "credentials": {
    "username": "user@example.com",
    "password": "secretpass"
  },
  "tasks": [
    {
      "id": "enter-user",
      "action": "type",
      "selector": "#username",
      "valueFrom": "credentials.username"
    },
    {
      "id": "enter-pass",
      "action": "type",
      "selector": "#password",
      "valueFrom": "credentials.password"
    }
  ]
}
```

---

## 5. Using the API Directly

```javascript
import { ChromiumController } from './src/index.js';

const controller = new ChromiumController({ headless: false });

await controller.launch();
await controller.newPage();
await controller.goto('https://example.com');
await controller.screenshot({ path: 'screenshot.png' });
await controller.close();
```

---

## 6. Run Examples

### Basic Browser Control
```bash
npm run example
```

### Take Screenshots
```bash
npm run example:screenshot
```

### Web Scraping
```bash
npm run example:scrape
```

### Run Specific Agent
```bash
npm run agent:run tehrantabligh
```

---

## Results & Outputs

- **Screenshots** → `screenshots/` directory
- **Execution Results** → `results/` directory (JSON format)
- **Console Output** → Real-time task progress

---

## Common Commands

```bash
# CLI
node cli.js list              # List all agents
node cli.js run <id>          # Run specific agent
node cli.js run-all           # Run all enabled agents
node cli.js parallel          # Run agents in parallel
node cli.js validate          # Validate configs

# NPM Scripts
npm run agent:run             # Run agent with examples
npm run agent:run-all         # Run all agents
npm run agent:parallel        # Parallel execution
```

---

## Next Steps

- 📖 Read [AGENT_GUIDE.md](AGENT_GUIDE.md) for complete task reference
- 📚 Check [README.md](README.md) for API documentation
- 🔍 Explore `examples/` directory for more examples
- 🤖 Create your own agents in `agents/` directory

---

## Troubleshooting

### "Agent not found"
Make sure your JSON file is in the `agents/` directory and has a valid `id` field.

### "Element not found"
Use `waitForSelector` before interacting with elements:
```json
{ "id": "wait", "action": "waitForSelector", "selector": "#my-element" }
```

### "Navigation timeout"
Increase timeout in browser config:
```json
"browser": {
  "navigationTimeout": 60000
}
```

---

## Support

Need help? Check:
- [AGENT_GUIDE.md](AGENT_GUIDE.md) - Complete task documentation
- [README.md](README.md) - API reference
- Issues page on repository

Happy automating! 🚀
