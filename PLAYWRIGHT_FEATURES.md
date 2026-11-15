# Playwright Features Guide

This project now uses **Playwright** instead of Puppeteer for browser automation. Playwright offers significant advantages for modern web automation.

## Why Playwright?

### Advantages over Puppeteer

✅ **Modern and Actively Developed** - Built by Microsoft, frequently updated  
✅ **Multi-Browser Support** - Chromium, Firefox, and WebKit  
✅ **Better Auto-Waiting** - Smart waits for elements automatically  
✅ **Faster Execution** - Optimized for performance  
✅ **Better Debugging** - Improved developer tools and traces  
✅ **Network Interception** - Advanced request/response handling  
✅ **Multiple Contexts** - Better isolation between tests  
✅ **Mobile Emulation** - Built-in device emulation  
✅ **Screenshots & Videos** - Enhanced capture capabilities  
✅ **API Testing** - Built-in API request functionality  

---

## New Task Actions (Playwright-Specific)

In addition to all previous actions, the following are now available:

### 1. `fill` - Fast Input Filling

Faster alternative to `type` - clears and fills input instantly.

```json
{
  "id": "quick-fill",
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

### 2. `select` - Dropdown Selection

Select option from a dropdown/select element.

```json
{
  "id": "select-country",
  "action": "select",
  "selector": "#country",
  "value": "USA"
}
```

### 3. `check` - Check Checkbox/Radio

Check a checkbox or radio button.

```json
{
  "id": "accept-terms",
  "action": "check",
  "selector": "#terms-checkbox"
}
```

### 4. `uncheck` - Uncheck Checkbox

Uncheck a checkbox.

```json
{
  "id": "unsubscribe",
  "action": "uncheck",
  "selector": "#newsletter-checkbox"
}
```

### 5. `press` - Keyboard Key Press

Press a keyboard key on an element.

```json
{
  "id": "submit-with-enter",
  "action": "press",
  "selector": "#search-input",
  "key": "Enter"
}
```

Supported keys: `Enter`, `Escape`, `Tab`, `Backspace`, `Delete`, `ArrowUp`, `ArrowDown`, `Control+A`, etc.

### 6. `hover` - Mouse Hover

Hover over an element to trigger hover effects.

```json
{
  "id": "hover-menu",
  "action": "hover",
  "selector": ".dropdown-trigger"
}
```

### 7. `count` - Count Elements

Count how many elements match a selector.

```json
{
  "id": "count-items",
  "action": "count",
  "selector": ".product-item"
}
```

Returns: `{ selector: ".product-item", count: 42 }`

### 8. `isVisible` - Check Visibility

Check if an element is visible.

```json
{
  "id": "check-modal",
  "action": "isVisible",
  "selector": "#modal"
}
```

Returns: `{ selector: "#modal", visible: true/false }`

### 9. `isEnabled` - Check If Enabled

Check if an element is enabled (not disabled).

```json
{
  "id": "check-button",
  "action": "isEnabled",
  "selector": "#submit-btn"
}
```

Returns: `{ selector: "#submit-btn", enabled: true/false }`

---

## Updated Actions

### `type` - Enhanced Typing

Now uses `fill` by default for better performance. Use `delay` option for character-by-character typing:

```json
{
  "id": "slow-type",
  "action": "type",
  "selector": "#input",
  "value": "text",
  "options": {
    "delay": 100
  }
}
```

### `waitForSelector` - Better Waiting

Now supports `state` parameter:

```json
{
  "id": "wait-visible",
  "action": "waitForSelector",
  "selector": ".element",
  "state": "visible"
}
```

States:
- `visible` - Wait until visible (default)
- `attached` - Wait until attached to DOM
- `detached` - Wait until removed from DOM
- `hidden` - Wait until hidden

### `goto` - Enhanced Navigation

Uses Playwright's smarter navigation waiting:

```json
{
  "id": "navigate",
  "action": "goto",
  "url": "https://example.com",
  "waitUntil": "networkidle"
}
```

Wait options:
- `load` - Wait for load event
- `domcontentloaded` - Wait for DOMContentLoaded
- `networkidle` - Wait until no network activity
- `commit` - Wait for navigation commit

---

## Example: Complete Form Automation

```json
{
  "id": "form-automation",
  "name": "Advanced Form with Playwright",
  "enabled": true,

  "tasks": [
    {
      "id": "open-form",
      "action": "goto",
      "url": "https://example.com/form"
    },
    {
      "id": "fill-name",
      "action": "fill",
      "selector": "#name",
      "value": "John Doe"
    },
    {
      "id": "fill-email",
      "action": "fill",
      "selector": "#email",
      "value": "john@example.com"
    },
    {
      "id": "select-country",
      "action": "select",
      "selector": "#country",
      "value": "USA"
    },
    {
      "id": "check-terms",
      "action": "check",
      "selector": "#terms"
    },
    {
      "id": "hover-submit",
      "action": "hover",
      "selector": "#submit-btn"
    },
    {
      "id": "check-button-enabled",
      "action": "isEnabled",
      "selector": "#submit-btn"
    },
    {
      "id": "press-enter",
      "action": "press",
      "selector": "#email",
      "key": "Enter"
    }
  ]
}
```

---

## Example: Element Validation

```json
{
  "tasks": [
    {
      "id": "check-modal-visible",
      "action": "isVisible",
      "selector": "#success-modal"
    },
    {
      "id": "count-errors",
      "action": "count",
      "selector": ".error-message"
    },
    {
      "id": "verify-button-enabled",
      "action": "isEnabled",
      "selector": "button[type='submit']"
    }
  ]
}
```

---

## Playwright vs Puppeteer Differences

### Navigation Waiting

**Puppeteer**:
```json
"waitUntil": "networkidle2"
```

**Playwright**:
```json
"waitUntil": "networkidle"
```

### Element Waiting

**Puppeteer**:
```json
{
  "action": "waitForSelector",
  "selector": ".element",
  "visible": true
}
```

**Playwright**:
```json
{
  "action": "waitForSelector",
  "selector": ".element",
  "state": "visible"
}
```

### Fast Input

**Puppeteer**: Only `type` action (slow)

**Playwright**: `fill` (fast) and `type` (with delay)

---

## Browser Configuration

### Basic Configuration

```json
{
  "browser": {
    "headless": false,
    "viewport": {
      "width": 1920,
      "height": 1080
    },
    "defaultTimeout": 30000,
    "navigationTimeout": 30000
  }
}
```

### Advanced Configuration

```json
{
  "browser": {
    "headless": false,
    "viewport": {
      "width": 1920,
      "height": 1080
    },
    "defaultTimeout": 30000,
    "navigationTimeout": 60000,
    "args": [
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process"
    ],
    "launchOptions": {
      "slowMo": 100,
      "devtools": false
    }
  }
}
```

---

## Mobile Emulation

```json
{
  "tasks": [
    {
      "id": "mobile-view",
      "action": "setViewport",
      "viewport": {
        "width": 375,
        "height": 667
      }
    }
  ]
}
```

Common mobile viewports:
- iPhone SE: 375x667
- iPhone 12 Pro: 390x844
- iPad: 768x1024
- Samsung Galaxy S21: 360x800

---

## API Methods

### New Methods

```javascript
// Fill input (fast)
await controller.fill(selector, text);

// Select dropdown
await controller.select(selector, value);

// Check/uncheck checkbox
await controller.check(selector);
await controller.uncheck(selector);

// Press key
await controller.press(selector, key);

// Hover
await controller.hover(selector);

// Count elements
const count = await controller.count(selector);

// Check visibility
const isVisible = await controller.isVisible(selector);

// Check if enabled
const isEnabled = await controller.isEnabled(selector);
```

### Browser Context

Playwright introduces browser contexts for better isolation:

```javascript
// Get context
const context = controller.getContext();

// Get browser
const browser = controller.getBrowser();

// Get page
const page = controller.getPage();
```

---

## Performance Tips

1. **Use `fill` instead of `type`** for better performance
2. **Use `networkidle` for SPAs** that load content dynamically
3. **Use `state: 'attached'`** if you don't need visibility check
4. **Reuse browser contexts** for multiple pages
5. **Use `isVisible` and `count`** to validate state before actions

---

## Migration from Puppeteer

If you have existing Puppeteer agents, most will work with minimal changes:

### Changes Required

1. **Navigation waiting**:
   - Change `networkidle2` → `networkidle`
   - Change `networkidle0` → `commit`

2. **Selector waiting**:
   - Change `visible: true` → `state: 'visible'`
   - Change `hidden: true` → `state: 'hidden'`

3. **Faster input**:
   - Replace `type` with `fill` for better performance (optional)

### No Changes Required

- `goto`, `click`, `screenshot`, `getText`, `getTextAll`
- `getAttribute`, `evaluate`, `getCookies`, `setCookies`
- `setViewport`, `wait`, `getUrl`, `getTitle`

---

## Debugging

### Visual Debugging

Run with `headless: false`:

```json
{
  "browser": {
    "headless": false
  }
}
```

### Slow Motion

Add delay between actions:

```json
{
  "browser": {
    "launchOptions": {
      "slowMo": 100
    }
  }
}
```

### Screenshots

Take screenshots at key points:

```json
{
  "id": "debug-screenshot",
  "action": "screenshot",
  "path": "screenshots/debug.png"
}
```

---

## Best Practices

1. ✅ Use `fill` for fast form filling
2. ✅ Use `press` with Enter instead of clicking submit
3. ✅ Check `isVisible` before interacting with elements
4. ✅ Use `count` to verify lists loaded
5. ✅ Use `isEnabled` before clicking buttons
6. ✅ Use `hover` for dropdown menus
7. ✅ Use `check`/`uncheck` for checkboxes
8. ✅ Use `state: 'attached'` for better performance
9. ✅ Use `networkidle` for SPA applications
10. ✅ Take screenshots for debugging

---

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Playwright Selectors](https://playwright.dev/docs/selectors)
- [Playwright Examples](https://github.com/microsoft/playwright/tree/main/examples)

---

## Summary

Playwright brings modern browser automation capabilities:

- ⚡ **Faster**: Optimized performance
- 🎯 **Smarter**: Auto-waiting for elements
- 🛠️ **Better Tools**: Enhanced debugging
- 🌐 **Multi-Browser**: Chromium, Firefox, WebKit
- 📱 **Mobile**: Built-in device emulation
- 🔒 **Reliable**: More stable automation

Your existing agents will work with minimal changes, and you now have access to powerful new features!
