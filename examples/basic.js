import ChromiumController from '../src/index.js';

async function main() {
  const controller = new ChromiumController({
    headless: false, // Set to true to run in headless mode
    viewport: { width: 1920, height: 1080 }
  });

  try {
    // Launch browser and create a new page
    await controller.launch();
    await controller.newPage();

    // Navigate to a website
    await controller.goto('https://example.com');

    // Get page title
    const title = await controller.getTitle();
    console.log('Page title:', title);

    // Get page URL
    const url = await controller.getUrl();
    console.log('Current URL:', url);

    // Get some text from the page
    const heading = await controller.getText('h1');
    console.log('Main heading:', heading);

    // Check if element is visible
    const isVisible = await controller.isVisible('h1');
    console.log('Heading is visible:', isVisible);

    // Take a screenshot
    await controller.screenshot({ path: 'example-screenshot.png' });

    // Wait for a bit to see the page
    await controller.wait(2000);

    console.log('\n✓ Basic example completed successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Always close the browser
    await controller.close();
  }
}

main();
