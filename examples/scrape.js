import ChromiumController from '../src/index.js';

async function main() {
  const controller = new ChromiumController({
    headless: true,
  });

  try {
    await controller.launch();
    await controller.newPage();

    // Navigate to a website
    await controller.goto('https://news.ycombinator.com');

    // Scrape news titles
    const titles = await controller.getTextAll('.titleline > a');
    
    console.log('\n=== Top Stories from Hacker News ===\n');
    titles.slice(0, 10).forEach((title, index) => {
      console.log(`${index + 1}. ${title.trim()}`);
    });

    // Example: Get links
    const links = await controller.evaluate(() => {
      const linkElements = document.querySelectorAll('.titleline > a');
      return Array.from(linkElements).slice(0, 10).map(a => ({
        title: a.textContent.trim(),
        url: a.href
      }));
    });

    console.log('\n=== Links ===\n');
    links.forEach((link, index) => {
      console.log(`${index + 1}. ${link.title}`);
      console.log(`   ${link.url}\n`);
    });

    console.log('✓ Scraping completed successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await controller.close();
  }
}

main();
