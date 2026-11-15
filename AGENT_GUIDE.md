# Agent Task System Guide

Complete guide for creating and managing browser automation agents with task configurations.

## Table of Contents

1. [Overview](#overview)
2. [Agent Configuration](#agent-configuration)
3. [Task Actions](#task-actions)
4. [Usage Examples](#usage-examples)
5. [CLI Commands](#cli-commands)

---

## Overview

The Agent Task System allows you to define browser automation workflows in JSON configuration files. Each agent represents a browser instance with a specific set of tasks to execute.

### Key Features

- ✅ **JSON-based configuration** - Define agents and tasks in simple JSON files
- ✅ **Multiple agents** - Run multiple browser agents sequentially or in parallel
- ✅ **Rich task actions** - Support for navigation, clicks, typing, scraping, screenshots, and more
- ✅ **Credential management** - Store and reference credentials securely in agent config
- ✅ **Task results tracking** - Comprehensive logging and result saving
- ✅ **Error handling** - Continue on error or stop execution
- ✅ **Dynamic values** - Reference values from agent configuration

---

## Agent Configuration

### Basic Structure

```json
{
  "id": "my-agent",
  "name": "My Browser Agent",
  "enabled": true,
  
  "browser": {
    "headless": false,
    "viewport": {
      "width": 1920,
      "height": 1080
    },
    "navigationTimeout": 60000
  },

  "credentials": {
    "username": "user@example.com",
    "password": "secretpassword"
  },

  "tasks": [
    // Tasks array (see Task Actions section)
  ]
}
```

### Configuration Fields

#### Root Level

- **`id`** (required, string) - Unique identifier for the agent
- **`name`** (optional, string) - Human-readable name
- **`enabled`** (optional, boolean) - Whether agent is enabled (default: true)
- **`browser`** (optional, object) - Browser configuration
- **`credentials`** (optional, object) - Credentials storage
- **`tasks`** (required, array) - Array of task objects

#### Browser Configuration

- **`headless`** (boolean) - Run in headless mode (default: false)
- **`viewport`** (object) - Browser viewport size
  - `width` (number) - Width in pixels
  - `height` (number) - Height in pixels
- **`navigationTimeout`** (number) - Default navigation timeout in milliseconds
- Any other Puppeteer launch options

#### Credentials

Store any credentials needed by your tasks. These can be referenced in tasks using `valueFrom`.

---

## Task Actions

Each task must have:
- **`id`** (required) - Unique task identifier
- **`action`** (required) - Action type (see below)
- Additional fields depending on the action

### Available Actions (26 total)

The system now uses **Playwright** for enhanced browser automation with additional actions beyond the original set, plus **Bale Messenger** integration for notifications.

#### 1. `goto` - Navigate to URL

Navigate to a specific URL.

```json
{
  "id": "navigate-login",
  "action": "goto",
  "url": "https://example.com/login",
  "waitUntil": "networkidle2",
  "timeout": 30000
}
```

**Fields:**
- `url` (required) - Target URL
- `waitUntil` (optional) - Wait until condition: `load`, `domcontentloaded`, `networkidle0`, `networkidle2`
- `timeout` (optional) - Navigation timeout in ms

---

#### 2. `click` - Click Element

Click on an element matching the selector.

```json
{
  "id": "click-login-button",
  "action": "click",
  "selector": "button[type='submit']",
  "waitForNavigation": true
}
```

**Fields:**
- `selector` (required) - CSS selector
- `waitForNavigation` (optional) - Wait for navigation after click
- `options` (optional) - Click options (button, clickCount, delay)

---

#### 3. `type` - Type Text

Type text into an input field.

```json
{
  "id": "enter-username",
  "action": "type",
  "selector": "input[name='username']",
  "value": "myusername"
}
```

Or reference from credentials:

```json
{
  "id": "enter-password",
  "action": "type",
  "selector": "input[name='password']",
  "valueFrom": "credentials.password"
}
```

**Fields:**
- `selector` (required) - CSS selector for input field
- `value` (optional) - Text to type
- `valueFrom` (optional) - Path to value in agent config (e.g., `credentials.username`)
- `options` (optional) - Typing options
  - `delay` (number) - Delay between keystrokes in ms (if not specified, uses fast `fill`)

**Note**: Without `delay` option, uses Playwright's fast `fill` method. With `delay`, types character-by-character.

---

#### 3b. `fill` - Fill Input (Fast)

Fill an input field instantly (Playwright-specific, faster than type).

```json
{
  "id": "fill-username",
  "action": "fill",
  "selector": "#username",
  "value": "myusername"
}
```

Or with credentials:

```json
{
  "id": "fill-password",
  "action": "fill",
  "selector": "#password",
  "valueFrom": "credentials.password"
}
```

**Fields:**
- `selector` (required) - CSS selector for input field
- `value` (optional) - Text to fill
- `valueFrom` (optional) - Path to value in agent config
- `options` (optional) - Fill options

---

#### 4. `wait` - Wait Duration

Wait for a specific amount of time.

```json
{
  "id": "wait-for-page-load",
  "action": "wait",
  "duration": 3000
}
```

**Fields:**
- `duration` (required) - Wait time in milliseconds

---

#### 5. `waitForSelector` - Wait for Element

Wait for an element to appear.

```json
{
  "id": "wait-for-results",
  "action": "waitForSelector",
  "selector": ".search-results",
  "timeout": 10000,
  "visible": true
}
```

**Fields:**
- `selector` (required) - CSS selector
- `timeout` (optional) - Maximum wait time in ms
- `state` (optional) - Element state: `visible`, `attached`, `hidden`, `detached` (default: `visible`)
- `options` (optional) - Additional wait options

---

#### 15. `select` - Select Dropdown Option

Select an option from a dropdown/select element.

```json
{
  "id": "select-country",
  "action": "select",
  "selector": "#country",
  "value": "USA"
}
```

**Fields:**
- `selector` (required) - CSS selector for select element
- `value` (required) - Option value to select

---

#### 16. `check` - Check Checkbox/Radio

Check a checkbox or radio button.

```json
{
  "id": "accept-terms",
  "action": "check",
  "selector": "#terms-checkbox"
}
```

**Fields:**
- `selector` (required) - CSS selector

---

#### 17. `uncheck` - Uncheck Checkbox

Uncheck a checkbox.

```json
{
  "id": "unsubscribe",
  "action": "uncheck",
  "selector": "#newsletter-checkbox"
}
```

**Fields:**
- `selector` (required) - CSS selector

---

#### 18. `press` - Press Keyboard Key

Press a keyboard key on an element.

```json
{
  "id": "submit-with-enter",
  "action": "press",
  "selector": "#search-input",
  "key": "Enter"
}
```

**Supported Keys:**
- `Enter`, `Escape`, `Tab`, `Backspace`, `Delete`
- `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`
- `Home`, `End`, `PageUp`, `PageDown`
- Modifiers: `Control+A`, `Shift+Tab`, `Alt+F4`, etc.

**Fields:**
- `selector` (required) - CSS selector
- `key` (required) - Key to press

---

#### 19. `hover` - Mouse Hover

Hover over an element to trigger hover effects.

```json
{
  "id": "hover-menu",
  "action": "hover",
  "selector": ".dropdown-trigger"
}
```

**Fields:**
- `selector` (required) - CSS selector

---

#### 20. `count` - Count Elements

Count how many elements match a selector.

```json
{
  "id": "count-products",
  "action": "count",
  "selector": ".product-item"
}
```

**Fields:**
- `selector` (required) - CSS selector

**Returns:**
```json
{
  "selector": ".product-item",
  "count": 42
}
```

---

#### 21. `isVisible` - Check Visibility

Check if an element is visible on the page.

```json
{
  "id": "check-modal",
  "action": "isVisible",
  "selector": "#success-modal"
}
```

**Fields:**
- `selector` (required) - CSS selector

**Returns:**
```json
{
  "selector": "#success-modal",
  "visible": true
}
```

---

#### 22. `isEnabled` - Check If Enabled

Check if an element is enabled (not disabled).

```json
{
  "id": "check-submit",
  "action": "isEnabled",
  "selector": "#submit-btn"
}
```

**Fields:**
- `selector` (required) - CSS selector

**Returns:**
```json
{
  "selector": "#submit-btn",
  "enabled": true
}
```

---

#### 6. `screenshot` - Take Screenshot

Capture a screenshot of the page.

```json
{
  "id": "capture-page",
  "action": "screenshot",
  "path": "screenshots/result.png",
  "fullPage": true
}
```

**Fields:**
- `path` (optional) - Output file path (default: auto-generated)
- `fullPage` (optional) - Capture full page (default: true)
- `options` (optional) - Additional screenshot options

---

#### 7. `getText` - Extract Text

Get text content from an element.

```json
{
  "id": "get-heading",
  "action": "getText",
  "selector": "h1.title"
}
```

**Fields:**
- `selector` (required) - CSS selector

---

#### 8. `getTextAll` - Extract Multiple Texts

Get text content from all matching elements.

```json
{
  "id": "get-all-links",
  "action": "getTextAll",
  "selector": "a.nav-link"
}
```

**Fields:**
- `selector` (required) - CSS selector

---

#### 9. `getAttribute` - Get Attribute

Get an attribute value from an element.

```json
{
  "id": "get-link-href",
  "action": "getAttribute",
  "selector": "a.download",
  "attribute": "href"
}
```

**Fields:**
- `selector` (required) - CSS selector
- `attribute` (required) - Attribute name

---

#### 10. `evaluate` - Execute JavaScript

Execute custom JavaScript in the page context.

```json
{
  "id": "get-page-data",
  "action": "evaluate",
  "function": "() => { return { title: document.title, links: document.querySelectorAll('a').length }; }"
}
```

**Fields:**
- `function` (required) - JavaScript function as string

---

#### 11. `setCookies` - Set Cookies

Set browser cookies.

```json
{
  "id": "set-auth-cookie",
  "action": "setCookies",
  "cookies": [
    {
      "name": "session",
      "value": "abc123",
      "domain": ".example.com"
    }
  ]
}
```

**Fields:**
- `cookies` (required) - Array of cookie objects

---

#### 12. `getCookies` - Get Cookies

Retrieve current cookies.

```json
{
  "id": "retrieve-cookies",
  "action": "getCookies"
}
```

---

#### 13. `clearCookies` - Clear Cookies

Clear all cookies.

```json
{
  "id": "clear-cookies",
  "action": "clearCookies"
}
```

---

#### 14. `setViewport` - Set Viewport

Change the browser viewport size.

```json
{
  "id": "set-mobile-viewport",
  "action": "setViewport",
  "viewport": {
    "width": 375,
    "height": 667
  }
}
```

**Fields:**
- `viewport` (required) - Viewport object with width and height

---

#### 23. `sendToBale` - Send Screenshot to Bale

Send a photo/screenshot to Bale Messenger bot.

```json
{
  "id": "send-screenshot",
  "action": "sendToBale",
  "chatId": "123456789",
  "caption": "Screenshot from automation 📸"
}
```

Or reference from config:

```json
{
  "id": "send-to-bale",
  "action": "sendToBale",
  "chatIdFrom": "bale.chatId",
  "caption": "Dashboard Screenshot"
}
```

**Fields:**
- `chatId` (optional) - Chat ID to send to
- `chatIdFrom` (optional) - Path to chat ID in config (e.g., `"bale.chatId"`)
- `file` (optional) - Specific file path to send
- `fileFrom` (optional) - Path to file in config
- `caption` (optional) - Caption text for the photo
- `parseMode` (optional) - Parse mode: `Markdown` or `HTML`

**Requires:** `bale.token` in agent config

**Behavior:** If no `file` specified, sends the last screenshot taken

---

#### 24. `sendMessageToBale` - Send Text to Bale

Send a text message to Bale Messenger.

```json
{
  "id": "notify-complete",
  "action": "sendMessageToBale",
  "chatId": "123456789",
  "text": "✅ Task completed successfully!"
}
```

Or with formatting:

```json
{
  "id": "formatted-notification",
  "action": "sendMessageToBale",
  "chatIdFrom": "bale.chatId",
  "text": "*Bold* _Italic_ `Code`",
  "parseMode": "Markdown"
}
```

**Fields:**
- `chatId` (optional) - Chat ID to send to
- `chatIdFrom` (optional) - Path to chat ID in config
- `text` (required) - Message text
- `textFrom` (optional) - Path to text in config
- `parseMode` (optional) - `Markdown` or `HTML`
- `replyMarkup` (optional) - Inline keyboard markup

**Requires:** `bale.token` in agent config

---

### Task Options

#### Common Options

All tasks support these optional fields:

- **`continueOnError`** (boolean) - Continue execution even if this task fails
- **`delayAfter`** (number) - Wait time in ms after task completion

```json
{
  "id": "optional-task",
  "action": "click",
  "selector": ".optional-button",
  "continueOnError": true,
  "delayAfter": 2000
}
```

---

## Usage Examples

### Example 1: Login Automation

```json
{
  "id": "login-agent",
  "name": "Login Automation",
  "enabled": true,
  
  "browser": {
    "headless": true
  },

  "credentials": {
    "username": "user@example.com",
    "password": "mypassword"
  },

  "tasks": [
    {
      "id": "open-login-page",
      "action": "goto",
      "url": "https://example.com/login"
    },
    {
      "id": "enter-username",
      "action": "type",
      "selector": "#username",
      "valueFrom": "credentials.username"
    },
    {
      "id": "enter-password",
      "action": "type",
      "selector": "#password",
      "valueFrom": "credentials.password"
    },
    {
      "id": "click-login",
      "action": "click",
      "selector": "button[type='submit']",
      "waitForNavigation": true
    },
    {
      "id": "verify-login",
      "action": "waitForSelector",
      "selector": ".dashboard"
    },
    {
      "id": "screenshot-dashboard",
      "action": "screenshot",
      "path": "screenshots/dashboard.png"
    }
  ]
}
```

### Example 2: Web Scraping

```json
{
  "id": "scraper-agent",
  "name": "Article Scraper",
  "enabled": true,
  
  "browser": {
    "headless": true
  },

  "tasks": [
    {
      "id": "navigate",
      "action": "goto",
      "url": "https://news.example.com"
    },
    {
      "id": "wait-for-articles",
      "action": "waitForSelector",
      "selector": ".article"
    },
    {
      "id": "get-titles",
      "action": "getTextAll",
      "selector": ".article h2"
    },
    {
      "id": "get-page-data",
      "action": "evaluate",
      "function": "() => Array.from(document.querySelectorAll('.article')).map(a => ({ title: a.querySelector('h2').textContent, link: a.querySelector('a').href }))"
    },
    {
      "id": "screenshot",
      "action": "screenshot",
      "path": "screenshots/articles.png"
    }
  ]
}
```

### Example 3: Form Submission

```json
{
  "id": "form-agent",
  "name": "Contact Form",
  "enabled": true,

  "tasks": [
    {
      "id": "open-form",
      "action": "goto",
      "url": "https://example.com/contact"
    },
    {
      "id": "fill-name",
      "action": "type",
      "selector": "#name",
      "value": "John Doe"
    },
    {
      "id": "fill-email",
      "action": "type",
      "selector": "#email",
      "value": "john@example.com"
    },
    {
      "id": "fill-message",
      "action": "type",
      "selector": "#message",
      "value": "This is a test message"
    },
    {
      "id": "submit",
      "action": "click",
      "selector": "button[type='submit']",
      "waitForNavigation": true
    },
    {
      "id": "verify-success",
      "action": "getText",
      "selector": ".success-message"
    }
  ]
}
```

---

## CLI Commands

### List All Agents

```bash
node cli.js list
```

Shows all available agents with their status and task count.

### Run Specific Agent

```bash
node cli.js run <agent-id>
```

Example:
```bash
node cli.js run tehrantabligh
```

### Run All Enabled Agents (Sequential)

```bash
node cli.js run-all
```

Executes all enabled agents one after another.

### Run All Enabled Agents (Parallel)

```bash
node cli.js parallel
```

Executes all enabled agents simultaneously.

### Validate Agent Configurations

```bash
node cli.js validate
```

Validates all agent JSON files for errors.

### Show Help

```bash
node cli.js help
```

---

## NPM Scripts

```bash
# Run specific agent
npm run agent:run <agent-id>

# Run all agents sequentially
npm run agent:run-all

# Run all agents in parallel
npm run agent:parallel

# Use CLI
npm run cli list
npm run cli run <agent-id>
```

---

## Results Storage

All execution results are automatically saved to the `results/` directory with timestamps:

- Single agent: `results/result-{agent-id}-{timestamp}.json`
- Batch execution: `results/batch-results-{timestamp}.json`
- Parallel execution: `results/parallel-results-{timestamp}.json`

---

## Best Practices

1. **Use meaningful IDs** - Make task and agent IDs descriptive
2. **Add delays** - Use `wait` or `delayAfter` for stability
3. **Handle errors** - Use `continueOnError` for optional tasks
4. **Test incrementally** - Start with a few tasks, then expand
5. **Use screenshots** - Capture screenshots for debugging
6. **Reference credentials** - Use `valueFrom` for sensitive data
7. **Set timeouts** - Configure appropriate timeouts for slow pages
8. **Validate selectors** - Ensure CSS selectors are stable and unique

---

## Troubleshooting

### Task Fails Immediately

- Check if selector is correct
- Increase timeout values
- Add `waitForSelector` before interacting with elements

### Navigation Timeout

- Increase `navigationTimeout` in browser config
- Use different `waitUntil` conditions

### Element Not Found

- Use `waitForSelector` before interacting
- Verify selector in browser DevTools
- Check if page has loaded completely

### Credentials Not Working

- Verify `valueFrom` path is correct
- Check credentials object structure
- Ensure values are properly referenced

---

## Advanced Topics

### Custom JavaScript Evaluation

Execute complex logic in the page context:

```json
{
  "id": "complex-extraction",
  "action": "evaluate",
  "function": "() => { const items = []; document.querySelectorAll('.item').forEach(el => { items.push({ title: el.querySelector('.title').textContent, price: el.querySelector('.price').textContent }); }); return items; }"
}
```

### Dynamic Delays

Add delays after specific tasks:

```json
{
  "id": "click-button",
  "action": "click",
  "selector": ".submit-btn",
  "delayAfter": 5000
}
```

### Conditional Execution

Use `continueOnError` for optional steps:

```json
{
  "id": "close-popup",
  "action": "click",
  "selector": ".popup-close",
  "continueOnError": true
}
```

---

## Support

For issues or questions, please refer to the main README.md or create an issue in the repository.
