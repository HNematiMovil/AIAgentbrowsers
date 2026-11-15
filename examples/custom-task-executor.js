import { TaskExecutor } from '../src/index.js';

// Example: Create and execute tasks programmatically without JSON files

async function main() {
  // Define an agent configuration programmatically
  const agentConfig = {
    id: 'custom-agent',
    name: 'Custom Programmatic Agent',
    enabled: true,

    browser: {
      headless: false,
      viewport: {
        width: 1280,
        height: 720
      }
    },

    credentials: {
      searchQuery: 'Node.js automation'
    },

    tasks: [
      {
        id: 'open-search-engine',
        action: 'goto',
        url: 'https://duckduckgo.com'
      },
      {
        id: 'wait-for-search-box',
        action: 'waitForSelector',
        selector: 'input[name="q"]'
      },
      {
        id: 'type-search-query',
        action: 'type',
        selector: 'input[name="q"]',
        valueFrom: 'credentials.searchQuery'
      },
      {
        id: 'click-search-button',
        action: 'click',
        selector: 'button[type="submit"]',
        waitForNavigation: true
      },
      {
        id: 'wait-for-results',
        action: 'waitForSelector',
        selector: '[data-testid="result"]',
        timeout: 10000
      },
      {
        id: 'get-result-titles',
        action: 'getTextAll',
        selector: '[data-testid="result-title-a"]'
      },
      {
        id: 'extract-results',
        action: 'evaluate',
        function: `() => {
          const results = [];
          document.querySelectorAll('[data-testid="result"]').forEach((el, idx) => {
            if (idx < 5) { // Get top 5 results
              const titleEl = el.querySelector('[data-testid="result-title-a"]');
              const snippetEl = el.querySelector('[data-result="snippet"]');
              results.push({
                title: titleEl ? titleEl.textContent : '',
                snippet: snippetEl ? snippetEl.textContent : '',
                url: titleEl ? titleEl.href : ''
              });
            }
          });
          return results;
        }`
      },
      {
        id: 'take-screenshot',
        action: 'screenshot',
        path: 'screenshots/search-results.png',
        fullPage: false
      }
    ]
  };

  // Create executor with the config
  const executor = new TaskExecutor(agentConfig);

  try {
    console.log('Starting custom task execution...\n');
    
    // Execute all tasks
    const result = await executor.executeTasks();

    // Display results
    console.log('\n' + '='.repeat(70));
    console.log('EXECUTION RESULTS');
    console.log('='.repeat(70));
    
    result.results.forEach(taskResult => {
      console.log(`\nTask: ${taskResult.taskId}`);
      console.log(`  Action: ${taskResult.action}`);
      console.log(`  Status: ${taskResult.status}`);
      console.log(`  Duration: ${taskResult.duration}ms`);
      
      if (taskResult.result) {
        if (taskResult.result.texts) {
          console.log(`  Results: ${taskResult.result.texts.length} items`);
          taskResult.result.texts.slice(0, 3).forEach((text, idx) => {
            console.log(`    ${idx + 1}. ${text}`);
          });
        } else if (taskResult.result.result && Array.isArray(taskResult.result.result)) {
          console.log(`  Extracted data:`);
          taskResult.result.result.forEach((item, idx) => {
            console.log(`    ${idx + 1}. ${item.title}`);
            console.log(`       ${item.url}`);
          });
        } else if (taskResult.result.path) {
          console.log(`  Screenshot: ${taskResult.result.path}`);
        }
      }
      
      if (taskResult.error) {
        console.log(`  Error: ${taskResult.error}`);
      }
    });

    console.log('\n' + '='.repeat(70));
    console.log(`\n✓ Custom execution completed successfully!`);
    console.log(`Total tasks: ${result.results.length}`);
    console.log(`Success: ${result.successCount}, Failed: ${result.failedCount}`);
    console.log(`Total duration: ${result.totalDuration}ms\n`);

  } catch (error) {
    console.error('Error during execution:', error);
    process.exit(1);
  }
}

main();
