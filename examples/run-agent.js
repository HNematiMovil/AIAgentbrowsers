import { AgentManager } from '../src/index.js';

async function main() {
  const manager = new AgentManager('agents');

  try {
    // Load all agents from the agents directory
    await manager.loadAllAgents();

    // Get all loaded agents
    const agents = manager.getAllAgents();
    console.log('Loaded agents:', agents.map(a => `${a.id} (${a.enabled ? 'enabled' : 'disabled'})`));

    // Execute a specific agent by ID
    const agentId = process.argv[2] || 'tehrantabligh';
    
    console.log(`\nExecuting agent: ${agentId}\n`);
    
    const result = await manager.executeAgent(agentId);

    // Display results
    console.log('\n' + '='.repeat(70));
    console.log('EXECUTION SUMMARY');
    console.log('='.repeat(70));
    console.log(`Agent: ${result.agentName}`);
    console.log(`Status: ${result.status}`);
    console.log(`Duration: ${result.totalDuration}ms`);
    console.log(`Success: ${result.successCount}, Failed: ${result.failedCount}`);
    console.log('='.repeat(70));

    // Save results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await manager.saveResults(result, `results/result-${agentId}-${timestamp}.json`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
