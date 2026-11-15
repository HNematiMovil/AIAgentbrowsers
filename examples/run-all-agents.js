import { AgentManager } from '../src/index.js';

async function main() {
  const manager = new AgentManager('agents');

  try {
    // Load all agents
    await manager.loadAllAgents();

    // Show enabled agents
    const enabledAgents = manager.getEnabledAgents();
    console.log('\nEnabled agents:');
    enabledAgents.forEach(agent => {
      console.log(`  - ${agent.id}: ${agent.name} (${agent.tasks?.length || 0} tasks)`);
    });

    // Execute all enabled agents sequentially
    console.log('\nStarting sequential execution of all enabled agents...\n');
    
    const results = await manager.executeAllAgents();

    // Display summary
    console.log('\n' + '='.repeat(70));
    console.log('BATCH EXECUTION SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total agents: ${results.totalAgents}`);
    console.log(`Success: ${results.successCount}`);
    console.log(`Failed: ${results.failedCount}`);
    console.log('='.repeat(70));

    // Display individual results
    console.log('\nIndividual Results:');
    results.results.forEach(result => {
      console.log(`\n  ${result.agentName}:`);
      console.log(`    Status: ${result.status}`);
      if (result.totalDuration) {
        console.log(`    Duration: ${result.totalDuration}ms`);
      }
      if (result.successCount !== undefined) {
        console.log(`    Tasks: ${result.successCount} success, ${result.failedCount} failed`);
      }
      if (result.error) {
        console.log(`    Error: ${result.error}`);
      }
    });

    // Save results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await manager.saveResults(results, `results/batch-results-${timestamp}.json`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
