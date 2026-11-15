import { AgentManager } from '../src/index.js';

async function main() {
  const manager = new AgentManager('agents');

  try {
    // Load all agents
    await manager.loadAllAgents();

    const enabledAgents = manager.getEnabledAgents();
    
    if (enabledAgents.length === 0) {
      console.log('No enabled agents found');
      return;
    }

    console.log('\nEnabled agents:');
    enabledAgents.forEach(agent => {
      console.log(`  - ${agent.id}: ${agent.name}`);
    });

    // Execute all enabled agents in parallel
    console.log('\nStarting parallel execution of all enabled agents...\n');
    
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

    // Display individual results
    console.log('\nIndividual Results:');
    results.results.forEach(result => {
      console.log(`\n  ${result.agentName || result.agentId}:`);
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
    await manager.saveResults(results, `results/parallel-results-${timestamp}.json`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
