import ChromiumController from '../src/index.js';

/**
 * Example demonstrating Playwright-specific features
 */
async function main() {
  const controller = new ChromiumController({
    headless: false,
  });

  try {
    await controller.launch();
    await controller.newPage();

    console.log('\n=== Playwright Features Demo ===\n');

    // Navigate to a demo form page
    await controller.goto('https://www.w3schools.com/html/html_forms.asp');

    // 1. Fill inputs (faster than typing)
    console.log('1. Using fill() for fast input...');
    await controller.fill('input[name="fname"]', 'John', { timeout: 5000 });
    await controller.fill('input[name="lname"]', 'Doe', { timeout: 5000 });
    await controller.wait(1000);

    // 2. Check if elements are visible
    console.log('2. Checking element visibility...');
    const isFormVisible = await controller.isVisible('form');
    console.log(`   Form is visible: ${isFormVisible}`);

    // 3. Check if elements are enabled
    console.log('3. Checking if input is enabled...');
    const isInputEnabled = await controller.isEnabled('input[name="fname"]');
    console.log(`   Input is enabled: ${isInputEnabled}`);

    // 4. Count elements
    console.log('4. Counting input elements...');
    const inputCount = await controller.count('input');
    console.log(`   Found ${inputCount} input elements`);

    // 5. Hover over element
    console.log('5. Hovering over an element...');
    await controller.hover('input[name="fname"]');
    await controller.wait(500);

    // 6. Press keyboard keys
    console.log('6. Using keyboard press...');
    await controller.press('input[name="fname"]', 'Control+A');
    await controller.press('input[name="fname"]', 'Backspace');
    await controller.wait(500);

    // Navigate to a page with checkboxes and selects
    await controller.goto('https://www.w3schools.com/tags/tryit.asp?filename=tryhtml_select');
    
    // Wait for iframe to load
    await controller.wait(2000);

    // 7. Working with iframes
    console.log('7. Working with iframe content...');
    const page = controller.getPage();
    const frame = page.frameLocator('iframe[name="iframeResult"]');
    
    // Take screenshot
    await controller.screenshot({ 
      path: 'screenshots/playwright-features.png',
      fullPage: false 
    });

    // 8. Multiple viewport sizes (responsive testing)
    console.log('8. Testing different viewport sizes...');
    
    // Desktop
    await controller.setViewport({ width: 1920, height: 1080 });
    console.log('   Desktop view: 1920x1080');
    await controller.wait(500);

    // Tablet
    await controller.setViewport({ width: 768, height: 1024 });
    console.log('   Tablet view: 768x1024');
    await controller.wait(500);

    // Mobile
    await controller.setViewport({ width: 375, height: 667 });
    console.log('   Mobile view: 375x667');
    await controller.wait(500);

    // 9. Get all text from multiple elements
    console.log('9. Extracting text from multiple elements...');
    await controller.goto('https://example.com');
    const allParagraphs = await controller.getTextAll('p');
    console.log(`   Found ${allParagraphs.length} paragraph(s)`);

    // 10. Get attributes
    console.log('10. Getting element attributes...');
    const linkHref = await controller.getAttribute('a', 'href');
    console.log(`   Link href: ${linkHref}`);

    console.log('\n✓ Playwright features demo completed!\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await controller.close();
  }
}

main();
