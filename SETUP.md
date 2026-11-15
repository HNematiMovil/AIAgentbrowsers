# Setup Guide

Complete setup instructions for the Chromium Controller with Playwright.

## Prerequisites

- Node.js 14 or higher
- npm or yarn package manager

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This will install Playwright and other required packages.

### 2. Install Playwright Browsers

Playwright requires browser binaries to be downloaded. Install them with:

```bash
npx playwright install chromium
```

Or install all browsers (Chromium, Firefox, WebKit):

```bash
npx playwright install
```

Or use the npm script:

```bash
npm run install:browsers
```

### 3. Install System Dependencies (Linux only)

On Linux servers, you may need additional system libraries:

```bash
npx playwright install-deps chromium
```

This installs required system libraries for Chromium on Linux.

### 4. Verify Installation

Test that everything works:

```bash
node test-import.js
```

You should see:
```
✓ Named imports work:
  - ChromiumController: function
  - TaskExecutor: function
  - AgentManager: function
✓ Default import works: function
✓ Default export matches ChromiumController
✅ All imports successful!
```

### 5. Test Your First Agent

```bash
node cli.js list
node cli.js run your-agent-id
```

## Linux Server Setup (Complete)

For a fresh Linux server setup:

```bash
# 1. Clone or upload your project
cd /var/www/AIAgentbrowsers

# 2. Install Node.js dependencies
npm install

# 3. Install Playwright browsers
npx playwright install chromium

# 4. Install system dependencies
npx playwright install-deps chromium

# 5. Test
node cli.js list
```

## Troubleshooting

### Error: Cannot find package 'playwright'

**Solution:** Run `npm install`

### Error: Executable doesn't exist at [path]/chromium

**Solution:** Run `npx playwright install chromium`

### Error: Host system is missing dependencies (Linux)

**Solution:** Run `npx playwright install-deps chromium`

### Permission Issues (Linux)

If you get permission errors:

```bash
# Option 1: Run with sudo
sudo npx playwright install-deps chromium

# Option 2: Change ownership
sudo chown -R $USER:$USER ~/.cache/ms-playwright
```

### Headless Mode Issues (Linux Server)

On Linux servers without display, always use headless mode:

```json
{
  "browser": {
    "headless": true
  }
}
```

## Docker Setup (Optional)

If using Docker, here's a Dockerfile:

```dockerfile
FROM node:18

# Install Playwright dependencies
RUN npx playwright install-deps chromium

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Install Playwright browsers
RUN npx playwright install chromium

# Copy application files
COPY . .

# Run
CMD ["node", "cli.js", "run-all"]
```

## Environment Variables

You can use environment variables for sensitive data:

```bash
# Create .env file
echo "USERNAME=myuser" >> .env
echo "PASSWORD=mypass" >> .env
```

Then modify your agent to use them (requires additional code).

## Production Checklist

- [ ] npm install completed
- [ ] Playwright browsers installed
- [ ] System dependencies installed (Linux)
- [ ] All agents use `"headless": true`
- [ ] Credentials are secure
- [ ] Screenshots directory exists
- [ ] Results directory exists
- [ ] Agents validated with `node cli.js validate`

## Quick Commands Reference

```bash
# Setup
npm install
npx playwright install chromium
npx playwright install-deps chromium  # Linux only

# List agents
node cli.js list

# Run specific agent
node cli.js run agent-id

# Run all agents
node cli.js run-all

# Validate configurations
node cli.js validate

# Test agent config
npm run test:agent agent-id
```

## Support

If you encounter issues:
1. Check this setup guide
2. Review error messages carefully
3. Ensure all installation steps completed
4. Check PLAYWRIGHT_FEATURES.md for Playwright-specific info

## Next Steps

After successful setup:
1. Read QUICK_START.md
2. Create your first agent
3. Test with `node cli.js run agent-id`
4. Review AGENT_GUIDE.md for all available actions
