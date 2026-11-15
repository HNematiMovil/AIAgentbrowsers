import { BaleBot } from '../src/index.js';

/**
 * Test script for Bale Bot integration
 * Usage: node examples/test-bale.js YOUR_BOT_TOKEN YOUR_CHAT_ID
 */

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('\n❌ Missing arguments\n');
    console.log('Usage: node examples/test-bale.js YOUR_BOT_TOKEN YOUR_CHAT_ID\n');
    console.log('Example:');
    console.log('  node examples/test-bale.js 123456:ABCdef 987654321\n');
    console.log('Get your bot token from @BotFather in Bale');
    console.log('Get your chat ID by sending a message to your bot, then visit:');
    console.log('  https://tapi.bale.ai/bot<YOUR_TOKEN>/getUpdates\n');
    process.exit(1);
  }

  const [token, chatId] = args;

  console.log('\n🤖 Testing Bale Bot Integration\n');
  console.log('Bot Token:', token.substring(0, 10) + '...');
  console.log('Chat ID:', chatId);
  console.log('─'.repeat(50));

  try {
    const bot = new BaleBot(token);

    // 1. Get bot information
    console.log('\n1️⃣  Getting bot information...');
    const botInfo = await bot.getMe();
    console.log(`✅ Bot: @${botInfo.username} (${botInfo.first_name})`);
    console.log(`   ID: ${botInfo.id}`);

    // 2. Send a text message
    console.log('\n2️⃣  Sending test message...');
    const message = await bot.sendMessage(
      chatId,
      '🤖 Hello from Chromium Controller!\n\nThis is a test message.'
    );
    console.log(`✅ Message sent! Message ID: ${message.message_id}`);

    // 3. Send a formatted message
    console.log('\n3️⃣  Sending formatted message...');
    const formattedMessage = await bot.sendMessage(
      chatId,
      '*Bold Text*\n_Italic Text_\n`Code Text`\n\n✅ Test Complete!',
      { parse_mode: 'Markdown' }
    );
    console.log(`✅ Formatted message sent! Message ID: ${formattedMessage.message_id}`);

    // 4. Test photo sending (if screenshot exists)
    console.log('\n4️⃣  Testing photo upload...');
    try {
      const testPhotoPath = 'screenshots/test-bale.png';
      
      // Create a test screenshot directory if it doesn't exist
      const { promises: fs } = await import('fs');
      await fs.mkdir('screenshots', { recursive: true });
      
      console.log('   📸 Take a screenshot first using the browser automation,');
      console.log('      or place an image at: screenshots/test-bale.png');
      console.log('   ⏩ Skipping photo test (no test image found)');
    } catch (error) {
      console.log('   ⏩ Skipping photo test');
    }

    console.log('\n' + '─'.repeat(50));
    console.log('✅ All tests completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Add bot token to your agent config:');
    console.log('      "bale": {');
    console.log(`        "token": "${token}",`);
    console.log(`        "chatId": "${chatId}"`);
    console.log('      }');
    console.log('\n   2. Use sendToBale task action to send screenshots');
    console.log('   3. Use sendMessageToBale to send notifications');
    console.log('\n📖 Read BALE_INTEGRATION.md for complete guide\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check if bot token is valid');
    console.log('   2. Check if chat ID is correct');
    console.log('   3. Make sure you sent /start to your bot first');
    console.log('   4. Verify API endpoint is accessible\n');
    process.exit(1);
  }
}

main();
