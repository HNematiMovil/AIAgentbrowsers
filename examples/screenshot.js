import ChromiumController from '../src/index.js';

async function main() {
  const controller = new ChromiumController({
    headless: true, // Running in headless mode for screenshots
  });

  try {
    await controller.launch();
    await controller.newPage();

    // Navigate to a website
    await controller.goto('https://github.com');

    // Take full page screenshot
    await controller.screenshot({ 
      path: 'github-full.png',
      fullPage: true 
    });

    // Take viewport screenshot
    await controller.screenshot({ 
      path: 'github-viewport.png',
      fullPage: false 
    });

    // Navigate to another page and take screenshot
    await controller.goto('https://www.wikipedia.org');
    await controller.screenshot({ 
      path: 'wikipedia.png',
      fullPage: true 
    });

    console.log('\n✓ Screenshots taken successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await controller.close();
  }
}

main();
