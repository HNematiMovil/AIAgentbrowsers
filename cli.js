#!/usr/bin/env node

import { AgentManager } from './src/index.js';
import { promises as fs } from 'fs';

const commands = {
  list: 'List all available agents',
  run: 'Run a specific agent (usage: node cli.js run <agent-id>)',
  'run-all': 'Run all enabled agents sequentially',
  parallel: 'Run all enabled agents in parallel',
  validate: 'Validate agent configurations',
  help: 'Show this help message'
};

function showHelp() {
  console.log('\nChromium Controller CLI\n');
  console.log('Usage: node cli.js <command> [options]\n');
  console.log('Commands:');
  Object.entries(commands).forEach(([cmd, desc]) => {
    console.log(`  ${cmd.padEnd(15)} ${desc}`);
  });
  console.log('\nExamples:');
  console.log('  node cli.js list');
  console.log('  node cli.js run tehrantabligh');
  console.log('  node cli.js run-all');
  console.log('  node cli.js parallel');
  console.log('  node cli.js validate\n');
}

async function listAgents(manager) {
  await manager.loadAllAgents();
  const agents = manager.getAllAgents();

  if (agents.length === 0) {
    console.log('No agents found in the agents directory');
    return;
  }

  console.log('\nAvailable Agents:\n');
  agents.forEach(agent => {
    const status = agent.enabled !== false ? '✓ enabled' : '✗ disabled';
    const taskCount = agent.tasks?.length || 0;
    console.log(`  ${agent.id}`);
    console.log(`    Name: ${agent.name || 'N/A'}`);
    console.log(`    Status: ${status}`);
    console.log(`    Tasks: ${taskCount}`);
    console.log('');
  });
}

async function runAgent(manager, agentId) {
  if (!agentId) {
    console.error('Error: Agent ID required');
    console.log('Usage: node cli.js run <agent-id>');
    process.exit(1);
  }

  await manager.loadAllAgents();
  
  const agent = manager.getAgent(agentId);
  if (!agent) {
    console.error(`Error: Agent '${agentId}' not found`);
    process.exit(1);
  }

  console.log(`\nRunning agent: ${agent.name || agentId}\n`);
  
  const result = await manager.executeAgent(agentId);

  // Display summary
  console.log('\n' + '='.repeat(70));
  console.log('EXECUTION SUMMARY');
  console.log('='.repeat(70));
  console.log(`Agent: ${result.agentName}`);
  console.log(`Status: ${result.status}`);
  if (result.totalDuration) {
    console.log(`Duration: ${result.totalDuration}ms`);
  }
  if (result.successCount !== undefined) {
    console.log(`Success: ${result.successCount}, Failed: ${result.failedCount}`);
  }
  if (result.error) {
    console.log(`Error: ${result.error}`);
  }
  console.log('='.repeat(70));

  // Save results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await manager.saveResults(result, `results/result-${agentId}-${timestamp}.json`);
}

async function runAllAgents(manager) {
  await manager.loadAllAgents();
  
  const enabledAgents = manager.getEnabledAgents();
  if (enabledAgents.length === 0) {
    console.log('No enabled agents found');
    return;
  }

  console.log(`\nRunning ${enabledAgents.length} enabled agent(s) sequentially...\n`);
  
  const results = await manager.executeAllAgents();

  // Display summary
  console.log('\n' + '='.repeat(70));
  console.log('BATCH EXECUTION SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total agents: ${results.totalAgents}`);
  console.log(`Success: ${results.successCount}`);
  console.log(`Failed: ${results.failedCount}`);
  console.log('='.repeat(70));

  // Save results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await manager.saveResults(results, `results/batch-results-${timestamp}.json`);
}

async function runParallel(manager) {
  await manager.loadAllAgents();
  
  const enabledAgents = manager.getEnabledAgents();
  if (enabledAgents.length === 0) {
    console.log('No enabled agents found');
    return;
  }

  console.log(`\nRunning ${enabledAgents.length} enabled agent(s) in parallel...\n`);
  
  const agentIds = enabledAgents.map(a => a.id);
  const results = await manager.executeAgentsParallel(agentIds);

  // Display summary
  console.log('\n' + '='.repeat(70));
  console.log('PARALLEL EXECUTION SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total agents: ${results.totalAgents}`);
  console.log(`Success: ${results.successCount}`);
  console.log(`Failed: ${results.failedCount}`);
  console.log('='.repeat(70));

  // Save results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await manager.saveResults(results, `results/parallel-results-${timestamp}.json`);
}

async function validateAgents(manager) {
  await manager.loadAllAgents();
  const agents = manager.getAllAgents();

  if (agents.length === 0) {
    console.log('No agents found');
    return;
  }

  console.log('\nValidating agent configurations...\n');

  let allValid = true;
  agents.forEach(agent => {
    const validation = manager.validateAgentConfig(agent);
    
    if (validation.valid) {
      console.log(`✓ ${agent.id}: Valid`);
    } else {
      console.log(`✗ ${agent.id}: Invalid`);
      validation.errors.forEach(error => {
        console.log(`    - ${error}`);
      });
      allValid = false;
    }
  });

  console.log('');
  if (allValid) {
    console.log('✓ All agent configurations are valid');
  } else {
    console.log('✗ Some agent configurations have errors');
    process.exit(1);
  }
}

async function main() {
  const [,, command, ...args] = process.argv;

  if (!command || command === 'help') {
    showHelp();
    return;
  }

  const manager = new AgentManager('agents');

  try {
    switch (command) {
      case 'list':
        await listAgents(manager);
        break;

      case 'run':
        await runAgent(manager, args[0]);
        break;

      case 'run-all':
        await runAllAgents(manager);
        break;

      case 'parallel':
        await runParallel(manager);
        break;

      case 'validate':
        await validateAgents(manager);
        break;

      default:
        console.error(`Unknown command: ${command}`);
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

main();
