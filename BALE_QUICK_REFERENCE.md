# Bale Integration - Quick Reference

## 🚀 Quick Setup (2 Minutes)

### 1. Create Bot
- Open Bale → Search `@BotFather`
- Send `/newbot`
- Save token: `123456789:ABCdefGHI`

### 2. Get Chat ID
- Send message to your bot
- Visit: `https://tapi.bale.ai/bot<TOKEN>/getUpdates`
- Find: `"chat":{"id":123456789}`

### 3. Add to Agent Config
```json
{
  "bale": {
    "token": "123456789:ABCdefGHI",
    "chatId": "123456789"
  }
}
```

## 📸 Send Screenshot

```json
{
  "id": "send-screenshot",
  "action": "sendToBale",
  "chatIdFrom": "bale.chatId",
  "caption": "My screenshot 📸"
}
```

## 💬 Send Message

```json
{
  "id": "notify",
  "action": "sendMessageToBale",
  "chatIdFrom": "bale.chatId",
  "text": "Task complete! ✅"
}
```

## 🧪 Test

```bash
npm run test:bale YOUR_TOKEN YOUR_CHAT_ID
```

## 📖 Full Docs

See **BALE_INTEGRATION.md** for complete guide.
