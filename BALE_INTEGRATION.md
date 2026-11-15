# Bale Bot Integration Guide

Send screenshots and messages to Bale Messenger directly from your browser automation tasks.

## Overview

The system now supports sending screenshots and messages to Bale Bot using the Bale Bot API (based on Telegram Bot API).

### Features

✅ **Send Screenshots** - Automatically send screenshots to Bale chat  
✅ **Send Messages** - Send text notifications to Bale  
✅ **Auto Upload** - Screenshots are uploaded directly from disk  
✅ **Captions** - Add captions to screenshots  
✅ **Multiple Chats** - Send to different chat IDs  
✅ **Credential Management** - Store bot token securely in config  

---

## Setup

### 1. Create a Bale Bot

1. Open Bale Messenger
2. Search for `@BotFather` (بات‌فادر)
3. Send `/start`
4. Send `/newbot`
5. Follow instructions to create your bot
6. Save the bot token (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Get Your Chat ID

**Method 1: Using the Bot**

1. Start a chat with your bot
2. Send any message
3. Visit: `https://tapi.bale.ai/bot<YOUR_TOKEN>/getUpdates`
4. Look for `"chat":{"id":YOUR_CHAT_ID}`

**Method 2: Using IDBot**

1. Search for `@myidbot` in Bale
2. Start a chat
3. It will send you your chat ID

### 3. Install Dependencies

```bash
npm install
```

This installs `form-data` package needed for file uploads.

---

## Agent Configuration

### Basic Structure

Add a `bale` section to your agent config:

```json
{
  "id": "my-agent",
  "name": "My Agent",
  
  "bale": {
    "token": "123456789:ABCdefGHIjklMNOpqrsTUVwxyz",
    "chatId": "123456789"
  },
  
  "tasks": [
    // Your tasks here
  ]
}
```

### Configuration Fields

- **`token`** (required) - Your Bale bot token from @BotFather
- **`chatId`** (optional but recommended) - Default chat ID to send messages to

---

## Task Actions

### 1. `sendToBale` - Send Photo/Screenshot

Send a photo or screenshot to Bale chat.

```json
{
  "id": "send-screenshot",
  "action": "sendToBale",
  "chatId": "123456789",
  "caption": "Screenshot from automation"
}
```

**Fields:**

- **`chatId`** (optional) - Chat ID to send to (overrides config)
- **`chatIdFrom`** (optional) - Path to chat ID in config (e.g., `"bale.chatId"`)
- **`file`** (optional) - Specific file path to send
- **`fileFrom`** (optional) - Path to file in config
- **`caption`** (optional) - Caption text for the photo
- **`parseMode`** (optional) - Parse mode: `Markdown` or `HTML`

**Behavior:**
- If no `file` specified, sends the last screenshot taken
- Auto-uploads from disk
- Supports PNG, JPG, JPEG formats

---

### 2. `sendMessageToBale` - Send Text Message

Send a text message to Bale chat.

```json
{
  "id": "send-notification",
  "action": "sendMessageToBale",
  "chatId": "123456789",
  "text": "Task completed successfully! ✅"
}
```

**Fields:**

- **`chatId`** (optional) - Chat ID to send to
- **`chatIdFrom`** (optional) - Path to chat ID in config
- **`text`** (required) - Message text
- **`textFrom`** (optional) - Path to text in config
- **`parseMode`** (optional) - `Markdown` or `HTML`
- **`replyMarkup`** (optional) - Inline keyboard markup

---

## Complete Examples

### Example 1: Basic Screenshot Sending

```json
{
  "id": "screenshot-agent",
  "name": "Screenshot to Bale",
  "enabled": true,

  "browser": {
    "headless": true
  },

  "bale": {
    "token": "123456789:ABCdefGHIjklMNOpqrsTUVwxyz",
    "chatId": "123456789"
  },

  "tasks": [
    {
      "id": "open-page",
      "action": "goto",
      "url": "https://example.com"
    },
    {
      "id": "take-screenshot",
      "action": "screenshot",
      "path": "screenshots/example.png"
    },
    {
      "id": "send-to-bale",
      "action": "sendToBale",
      "chatIdFrom": "bale.chatId",
      "caption": "📸 Example.com screenshot"
    }
  ]
}
```

### Example 2: Multiple Screenshots with Messages

```json
{
  "id": "monitoring-agent",
  "name": "Website Monitor",
  "enabled": true,

  "bale": {
    "token": "YOUR_BOT_TOKEN",
    "chatId": "YOUR_CHAT_ID"
  },

  "tasks": [
    {
      "id": "notify-start",
      "action": "sendMessageToBale",
      "chatIdFrom": "bale.chatId",
      "text": "🤖 Starting website monitoring..."
    },
    {
      "id": "open-homepage",
      "action": "goto",
      "url": "https://mywebsite.com"
    },
    {
      "id": "screenshot-homepage",
      "action": "screenshot",
      "path": "screenshots/homepage.png"
    },
    {
      "id": "send-homepage",
      "action": "sendToBale",
      "chatIdFrom": "bale.chatId",
      "caption": "🏠 Homepage"
    },
    {
      "id": "open-dashboard",
      "action": "goto",
      "url": "https://mywebsite.com/dashboard"
    },
    {
      "id": "screenshot-dashboard",
      "action": "screenshot",
      "path": "screenshots/dashboard.png"
    },
    {
      "id": "send-dashboard",
      "action": "sendToBale",
      "chatIdFrom": "bale.chatId",
      "caption": "📊 Dashboard"
    },
    {
      "id": "notify-complete",
      "action": "sendMessageToBale",
      "chatIdFrom": "bale.chatId",
      "text": "✅ Monitoring complete!"
    }
  ]
}
```

### Example 3: Login Flow with Notification

```json
{
  "id": "login-monitor",
  "name": "Login Monitor with Bale",
  "enabled": true,

  "credentials": {
    "username": "user@example.com",
    "password": "secretpass"
  },

  "bale": {
    "token": "YOUR_TOKEN",
    "chatId": "YOUR_CHAT_ID"
  },

  "tasks": [
    {
      "id": "start-message",
      "action": "sendMessageToBale",
      "chatIdFrom": "bale.chatId",
      "text": "🔐 Starting login process..."
    },
    {
      "id": "open-login",
      "action": "goto",
      "url": "https://example.com/login"
    },
    {
      "id": "fill-username",
      "action": "fill",
      "selector": "#username",
      "valueFrom": "credentials.username"
    },
    {
      "id": "fill-password",
      "action": "fill",
      "selector": "#password",
      "valueFrom": "credentials.password"
    },
    {
      "id": "submit",
      "action": "press",
      "selector": "#password",
      "key": "Enter"
    },
    {
      "id": "wait-dashboard",
      "action": "waitForSelector",
      "selector": ".dashboard",
      "timeout": 10000
    },
    {
      "id": "screenshot-result",
      "action": "screenshot",
      "path": "screenshots/logged-in.png"
    },
    {
      "id": "send-result",
      "action": "sendToBale",
      "chatIdFrom": "bale.chatId",
      "caption": "✅ Successfully logged in!"
    }
  ]
}
```

### Example 4: Error Notification

```json
{
  "tasks": [
    {
      "id": "try-action",
      "action": "click",
      "selector": ".button",
      "continueOnError": true
    },
    {
      "id": "screenshot-on-error",
      "action": "screenshot",
      "path": "screenshots/error.png"
    },
    {
      "id": "notify-error",
      "action": "sendToBale",
      "chatIdFrom": "bale.chatId",
      "caption": "⚠️ Error occurred during automation"
    }
  ]
}
```

---

## Using with Tehran Tabligh Agent

Your Tehran Tabligh agent now includes Bale integration:

```json
{
  "bale": {
    "token": "YOUR_BALE_BOT_TOKEN_HERE",
    "chatId": "YOUR_CHAT_ID_HERE"
  },
  
  "tasks": [
    // ... existing tasks ...
    {
      "id": "take-screenshot",
      "action": "screenshot",
      "path": "screenshots/tehrantabligh.png",
      "fullPage": true
    },
    {
      "id": "send-to-bale",
      "action": "sendToBale",
      "chatIdFrom": "bale.chatId",
      "caption": "📸 Tehran Tabligh Dashboard Screenshot"
    }
  ]
}
```

**To use:**

1. Replace `YOUR_BALE_BOT_TOKEN_HERE` with your bot token
2. Replace `YOUR_CHAT_ID_HERE` with your chat ID
3. Run: `node cli.js run tehrantabligh`

---

## Advanced Usage

### Send to Multiple Chats

```json
{
  "bale": {
    "token": "YOUR_TOKEN",
    "adminChat": "123456789",
    "teamChat": "987654321"
  },

  "tasks": [
    {
      "id": "notify-admin",
      "action": "sendMessageToBale",
      "chatIdFrom": "bale.adminChat",
      "text": "Admin notification"
    },
    {
      "id": "notify-team",
      "action": "sendMessageToBale",
      "chatIdFrom": "bale.teamChat",
      "text": "Team notification"
    }
  ]
}
```

### Custom File Path

```json
{
  "id": "send-custom-file",
  "action": "sendToBale",
  "chatIdFrom": "bale.chatId",
  "file": "screenshots/custom-image.png",
  "caption": "Custom screenshot"
}
```

### Markdown Formatting

```json
{
  "id": "formatted-message",
  "action": "sendMessageToBale",
  "chatIdFrom": "bale.chatId",
  "text": "*Bold* _Italic_ `Code` [Link](https://example.com)",
  "parseMode": "Markdown"
}
```

### HTML Formatting

```json
{
  "id": "html-message",
  "action": "sendMessageToBale",
  "chatIdFrom": "bale.chatId",
  "text": "<b>Bold</b> <i>Italic</i> <code>Code</code>",
  "parseMode": "HTML"
}
```

---

## Programmatic Usage

You can also use BaleBot directly in your Node.js code:

```javascript
import { BaleBot } from './src/index.js';

const bot = new BaleBot('YOUR_BOT_TOKEN');

// Send message
await bot.sendMessage('123456789', 'Hello from bot!');

// Send photo
await bot.sendPhoto('123456789', 'screenshot.png', {
  caption: 'Screenshot'
});

// Get bot info
const botInfo = await bot.getMe();
console.log('Bot name:', botInfo.first_name);
```

---

## Troubleshooting

### Error: Bot token is required

**Solution:** Add `bale.token` to your agent config

### Error: chatId is required

**Solution:** Add `chatId` field or use `chatIdFrom` to reference config

### Error: No file specified

**Solution:** Either:
1. Take a screenshot before `sendToBale`, or
2. Specify `file` parameter with path

### Error: API request failed

**Possible causes:**
1. Invalid bot token
2. Invalid chat ID
3. Bot not started by user (send `/start` to bot first)
4. File not found or invalid format

### Photo not uploading

**Check:**
1. File exists at specified path
2. File is a valid image format (PNG, JPG, JPEG)
3. File size is under 10MB
4. Bot has been started by the user

---

## API Limits

Bale Bot API has some limitations:

- **Photo size**: Maximum 10MB
- **File size**: Maximum 50MB
- **Message length**: Maximum 4096 characters
- **Caption length**: Maximum 1024 characters

---

## Best Practices

1. ✅ **Always use headless mode** on servers
2. ✅ **Take screenshot before sending** - or specify file path
3. ✅ **Add descriptive captions** - helps identify screenshots
4. ✅ **Handle errors** - use `continueOnError` for optional sends
5. ✅ **Store tokens securely** - use environment variables in production
6. ✅ **Test bot first** - send `/start` to your bot before automation
7. ✅ **Use chatIdFrom** - reference config instead of hardcoding

---

## Security Notes

⚠️ **Important:**

- Never commit bot tokens to version control
- Use `.env` files for sensitive data
- Restrict bot access in production
- Validate chat IDs before sending
- Keep screenshots directory secure

---

## Resources

- [Bale Bot API Documentation](https://docs.bale.ai/)
- [Telegram Bot API](https://core.telegram.org/bots/api) (Bale is based on this)
- [@BotFather](https://ble.ir/botfather) - Create bots

---

## Summary

Bale integration allows you to:

- 📸 Send screenshots automatically
- 📨 Send text notifications
- 🤖 Monitor automation progress
- ⚠️ Get error alerts
- 📊 Receive reports

**Quick setup:**
1. Create bot with @BotFather
2. Get bot token
3. Get your chat ID
4. Add to agent config
5. Use `sendToBale` task action

**Start using now!** 🚀
