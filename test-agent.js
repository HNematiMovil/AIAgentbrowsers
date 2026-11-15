#!/usr/bin/env node

/**
 * Quick test script for validating agent configurations without running them
 */

import { promises as fs } from 'fs';
import path from 'path';

async function testAgent(filePath) {
  console.log(`\nTesting agent configuration: ${filePath}`);
  console.log('='.repeat(70));

  try {
    // Read and parse JSON
    const content = await fs.readFile(filePath, 'utf-8');
    const config = JSON.parse(content);

    // Validation checks
    const errors = [];
    const warnings = [];

    // Required fields
    if (!config.id) {
      errors.push('Missing required field: id');
    }

    if (!config.tasks || !Array.isArray(config.tasks)) {
      errors.push('Missing or invalid tasks array');
    }

    // Browser config validation
    if (config.browser) {
      if (config.browser.viewport) {
        if (!config.browser.viewport.width || !config.browser.viewport.height) {
          warnings.push('Viewport missing width or height');
        }
      }
    }

    // Task validation
    if (config.tasks && Array.isArray(config.tasks)) {
      config.tasks.forEach((task, index) => {
        if (!task.id) {
          errors.push(`Task at index ${index} missing id`);
        }
        if (!task.action) {
          errors.push(`Task ${task.id || index} missing action`);
        }

        // Action-specific validation
        switch (task.action) {
          case 'goto':
            if (!task.url) {
              errors.push(`Task ${task.id}: goto action requires url`);
            }
            break;
          case 'click':
          case 'type':
          case 'getText':
          case 'getTextAll':
          case 'waitForSelector':
            if (!task.selector) {
              errors.push(`Task ${task.id}: ${task.action} action requires selector`);
            }
            break;
          case 'type':
            if (!task.value && !task.valueFrom) {
              warnings.push(`Task ${task.id}: type action should have value or valueFrom`);
            }
            break;
          case 'getAttribute':
            if (!task.selector || !task.attribute) {
              errors.push(`Task ${task.id}: getAttribute requires selector and attribute`);
            }
            break;
          case 'wait':
            if (!task.duration) {
              warnings.push(`Task ${task.id}: wait action should specify duration`);
            }
            break;
        }

        // Check valueFrom references
        if (task.valueFrom) {
          const parts = task.valueFrom.split('.');
          let ref = config;
          let valid = true;

          for (const part of parts) {
            if (ref && typeof ref === 'object' && part in ref) {
              ref = ref[part];
            } else {
              warnings.push(`Task ${task.id}: valueFrom '${task.valueFrom}' may not be resolvable`);
              valid = false;
              break;
            }
          }

          if (valid && ref === undefined) {
            warnings.push(`Task ${task.id}: valueFrom '${task.valueFrom}' resolves to undefined`);
          }
        }
      });
    }

    // Display results
    console.log(`\nAgent ID: ${config.id || 'N/A'}`);
    console.log(`Name: ${config.name || 'N/A'}`);
    console.log(`Enabled: ${config.enabled !== false ? 'Yes' : 'No'}`);
    console.log(`Tasks: ${config.tasks?.length || 0}`);

    if (config.browser) {
      console.log(`\nBrowser Config:`);
      console.log(`  Headless: ${config.browser.headless !== false ? 'Yes' : 'No'}`);
      if (config.browser.viewport) {
        console.log(`  Viewport: ${config.browser.viewport.width}x${config.browser.viewport.height}`);
      }
    }

    if (config.credentials) {
      console.log(`\nCredentials:`);
      Object.keys(config.credentials).forEach(key => {
        console.log(`  ${key}: ${key.toLowerCase().includes('password') ? '***' : config.credentials[key]}`);
      });
    }

    if (config.tasks && config.tasks.length > 0) {
      console.log(`\nTasks:`);
      config.tasks.forEach((task, i) => {
        console.log(`  ${i + 1}. [${task.action}] ${task.id}`);
      });
    }

    // Show errors and warnings
    if (errors.length > 0) {
      console.log(`\n❌ ERRORS (${errors.length}):`);
      errors.forEach(error => console.log(`  - ${error}`));
    }

    if (warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
      warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    if (errors.length === 0 && warnings.length === 0) {
      console.log(`\n✅ Configuration is valid!`);
    } else if (errors.length === 0) {
      console.log(`\n✅ Configuration is valid (with warnings)`);
    } else {
      console.log(`\n❌ Configuration has errors`);
    }

    console.log('='.repeat(70));

    return errors.length === 0;

  } catch (error) {
    console.error(`\n❌ Error reading or parsing file: ${error.message}`);
    console.log('='.repeat(70));
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node test-agent.js <agent-file.json>');
    console.log('   or: node test-agent.js <agent-id>');
    console.log('\nExamples:');
    console.log('  node test-agent.js agents/tehrantabligh.json');
    console.log('  node test-agent.js tehrantabligh');
    process.exit(1);
  }

  let filePath = args[0];

  // If not a full path, assume it's an agent ID
  if (!filePath.endsWith('.json')) {
    filePath = path.join('agents', `${filePath}.json`);
  }

  const isValid = await testAgent(filePath);
  process.exit(isValid ? 0 : 1);
}

main();
