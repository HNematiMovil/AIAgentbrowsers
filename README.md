# Chromium Controller

A powerful and easy-to-use Node.js framework for controlling Chromium browser using Playwright. Features include a simple API wrapper, JSON-based agent task system, and comprehensive automation capabilities. Perfect for web scraping, automated testing, screenshots, and browser automation tasks.

Playwright provides modern browser automation with support for Chromium, Firefox, and WebKit, along with better reliability, auto-waiting, and powerful debugging features.

## Features

- 🚀 Simple and intuitive API
- 🤖 **JSON-based Agent Task System** - Define browser automation workflows in JSON
- 🌐 Browser automation and control
- 📸 Screenshot capabilities
- 🔍 Web scraping functionality
- 🍪 Cookie management
- ⌨️ Form interaction and input handling
- 📱 Viewport management
- 🎯 Element selection and manipulation
- 🔄 Sequential or parallel agent execution
- 📊 Comprehensive result tracking and logging

## Installation

1. Install dependencies:

```bash
npm install
```

This will install Playwright, which automatically downloads Chromium, Firefox, and WebKit browsers.

2. (Optional) Install only Chromium browser:

```bash
npx playwright install chromium
```

## Quick Start

### Using the Agent Task System (Recommended)

The easiest way to automate browser tasks is using JSON agent configurations:

1. Create an agent configuration in `agents/my-agent.json`:

```json
{
  "id": "my-agent",
  "name": "My Browser Agent",
  "enabled": true,
  
  "browser": {
    "headless": false,
    "viewport": { "width": 1920, "height": 1080 }
  },

  "credentials": {
    "username": "user@example.com",
    "password": "mypassword"
  },

  "tasks": [
    {
      "id": "open-website",
      "action": "goto",
      "url": "https://example.com"
    },
    {
      "id": "take-screenshot",
      "action": "screenshot",
      "path": "screenshots/example.png"
    }
  ]
}
```

2. Run your agent:

```bash
node cli.js run my-agent
```

See [AGENT_GUIDE.md](AGENT_GUIDE.md) for complete documentation on the agent system.

### Using the API Directly

```javascript
import ChromiumController from './src/index.js';

const controller = new ChromiumController({
  headless: false // Set to true for headless mode
});

// Launch browser
await controller.launch();
await controller.newPage();

// Navigate to a website
await controller.goto('https://example.com');

// Get page title
const title = await controller.getTitle();
console.log('Title:', title);

// Take a screenshot
await controller.screenshot({ path: 'screenshot.png' });

// Close browser
await controller.close();
```

## API Reference

### Constructor

```javascript
const controller = new ChromiumController(options);
```

**Options:**
- `headless` (boolean): Run browser in headless mode (default: false)
- `viewport` (object): Default viewport size (default: { width: 1920, height: 1080 })
- `args` (array): Additional Chromium arguments

### Methods

#### Browser Control

- **`launch()`** - Launch the browser
- **`close()`** - Close the browser
- **`newPage()`** - Create a new page
- **`closePage()`** - Close the current page
- **`getPage()`** - Get the current page instance
- **`getBrowser()`** - Get the browser instance

#### Navigation

- **`goto(url, options)`** - Navigate to a URL
- **`waitForNavigation(options)`** - Wait for navigation to complete
- **`getUrl()`** - Get current page URL
- **`getTitle()`** - Get page title

#### Element Interaction

- **`click(selector, options)`** - Click an element
- **`type(selector, text, options)`** - Type text into an input field
- **`waitForSelector(selector, options)`** - Wait for element to appear
- **`getText(selector)`** - Get text content from an element
- **`getTextAll(selector)`** - Get text from multiple elements
- **`getAttribute(selector, attribute)`** - Get element attribute value

#### Screenshots

- **`screenshot(options)`** - Take a screenshot
  - `path`: File path (default: `screenshot-{timestamp}.png`)
  - `fullPage`: Capture full page (default: true)

#### Evaluation

- **`evaluate(fn, ...args)`** - Execute JavaScript in page context

#### Utilities

- **`wait(milliseconds)`** - Wait for specified time
- **`setViewport(viewport)`** - Set viewport size

#### Cookie Management

- **`getCookies()`** - Get all cookies
- **`setCookies(cookies)`** - Set cookies
- **`clearCookies()`** - Clear all cookies

## Examples

### Basic Usage

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

### Form Interaction

```bash
node examples/form-interaction.js
```

## Example: Web Scraping

```javascript
import ChromiumController from './src/index.js';

const controller = new ChromiumController({ headless: true });

await controller.launch();
await controller.newPage();
await controller.goto('https://example.com');

// Get all article titles
const titles = await controller.getTextAll('h2.article-title');
console.log('Article titles:', titles);

// Custom evaluation
const data = await controller.evaluate(() => {
  return document.querySelectorAll('.item').length;
});

await controller.close();
```

## Example: Form Automation

```javascript
import ChromiumController from './src/index.js';

const controller = new ChromiumController();

await controller.launch();
await controller.newPage();
await controller.goto('https://example.com/login');

// Fill in login form
await controller.type('#username', 'myusername');
await controller.type('#password', 'mypassword');
await controller.click('#login-button');

await controller.waitForNavigation();
console.log('Logged in successfully!');

await controller.close();
```

## Advanced Usage

### Using the Puppeteer Page Directly

```javascript
const controller = new ChromiumController();
await controller.launch();
await controller.newPage();

// Get the Puppeteer page instance
const page = controller.getPage();

// Use any Puppeteer API directly
await page.emulate({
  viewport: { width: 375, height: 667 },
  userAgent: 'Mobile User Agent'
});
```

### Custom Evaluation

```javascript
const result = await controller.evaluate(() => {
  // This runs in the browser context
  const links = Array.from(document.querySelectorAll('a'));
  return links.map(link => ({
    text: link.textContent,
    href: link.href
  }));
});
```

## Configuration

### Headless Mode

```javascript
const controller = new ChromiumController({ headless: true });
```

### Custom Viewport

```javascript
const controller = new ChromiumController({
  viewport: { width: 1280, height: 720 }
});
```

### Additional Chromium Arguments

```javascript
const controller = new ChromiumController({
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-web-security'
  ]
});
```

## Error Handling

Always wrap your automation code in try-catch blocks and ensure the browser is closed:

```javascript
const controller = new ChromiumController();

try {
  await controller.launch();
  await controller.newPage();
  // Your automation code here
} catch (error) {
  console.error('Error:', error);
} finally {
  await controller.close();
}
```

## Requirements

- Node.js 14 or higher
- Windows, macOS, or Linux

## Project Structure

```
├── agents/              # Agent JSON configuration files
├── src/
│   ├── ChromiumController.js   # Core browser controller
│   ├── TaskExecutor.js         # Task execution engine
│   ├── AgentManager.js         # Multi-agent management
│   └── index.js
├── examples/            # Example scripts
├── screenshots/         # Screenshot output directory
├── results/            # Task execution results
├── cli.js              # Command-line interface
└── AGENT_GUIDE.md      # Complete agent system documentation
```

## Documentation

- **[README.md](README.md)** - Main documentation (this file)
- **[AGENT_GUIDE.md](AGENT_GUIDE.md)** - Complete guide for the agent task system

## CLI Commands

```bash
# List all agents
node cli.js list

# Run a specific agent
node cli.js run <agent-id>

# Run all enabled agents sequentially
node cli.js run-all

# Run all enabled agents in parallel
node cli.js parallel

# Validate agent configurations
node cli.js validate

# Show help
node cli.js help
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
