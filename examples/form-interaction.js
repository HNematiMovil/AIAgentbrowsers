import ChromiumController from '../src/index.js';

async function main() {
  const controller = new ChromiumController({
    headless: false,
  });

  try {
    await controller.launch();
    await controller.newPage();

    // Navigate to a page with a search form
    await controller.goto('https://duckduckgo.com');

    // Wait for the search input to be available
    await controller.waitForSelector('input[name="q"]');

    // Fill the search box (faster than typing)
    await controller.fill('input[name="q"]', 'Playwright browser automation');

    // Press Enter key
    await controller.press('input[name="q"]', 'Enter');

    // Wait for navigation to complete
    await controller.wait(2000);

    // Get the current URL after search
    const url = await controller.getUrl();
    console.log('Search results URL:', url);

    // Take a screenshot of results
    await controller.screenshot({ 
      path: 'search-results.png',
      fullPage: false 
    });

    console.log('\n✓ Form interaction completed successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await controller.close();
  }
}

main();
