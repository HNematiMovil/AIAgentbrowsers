import { promises as fs } from 'fs';
import path from 'path';
import { TaskExecutor } from './TaskExecutor.js';

/**
 * AgentManager - Manages multiple browser agents and their task execution
 */
export class AgentManager {
  constructor(agentsDirectory = 'agents') {
    this.agentsDirectory = agentsDirectory;
    this.agents = new Map();
    this.executors = new Map();
    this.executionHistory = [];
  }

  /**
   * Load a single agent configuration from a file
   */
  async loadAgent(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const config = JSON.parse(content);

      if (!config.id) {
        throw new Error('Agent configuration must have an "id" field');
      }

      this.agents.set(config.id, config);
      console.log(`✓ Loaded agent: ${config.name || config.id}`);

      return config;
    } catch (error) {
      console.error(`✗ Failed to load agent from ${filePath}:`, error.message);
      throw error;
    }
  }

  /**
   * Load all agent configurations from the agents directory
   */
  async loadAllAgents() {
    try {
      const files = await fs.readdir(this.agentsDirectory);
      const jsonFiles = files.filter(file => file.endsWith('.json'));

      console.log(`\nLoading agents from ${this.agentsDirectory}...`);
      console.log(`Found ${jsonFiles.length} agent configuration(s)\n`);

      const loadPromises = jsonFiles.map(file => 
        this.loadAgent(path.join(this.agentsDirectory, file))
          .catch(error => {
            console.error(`Failed to load ${file}:`, error.message);
            return null;
          })
      );

      await Promise.all(loadPromises);

      console.log(`\n✓ Loaded ${this.agents.size} agent(s) successfully\n`);

      return Array.from(this.agents.values());
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.warn(`⚠ Agents directory not found: ${this.agentsDirectory}`);
        return [];
      }
      throw error;
    }
  }

  /**
   * Get an agent configuration by ID
   */
  getAgent(agentId) {
    return this.agents.get(agentId);
  }

  /**
   * Get all loaded agents
   */
  getAllAgents() {
    return Array.from(this.agents.values());
  }

  /**
   * Get enabled agents only
   */
  getEnabledAgents() {
    return this.getAllAgents().filter(agent => agent.enabled !== false);
  }

  /**
   * Execute tasks for a specific agent
   */
  async executeAgent(agentId) {
    const config = this.agents.get(agentId);

    if (!config) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    if (this.executors.has(agentId)) {
      const executor = this.executors.get(agentId);
      if (executor.isExecuting()) {
        throw new Error(`Agent ${agentId} is already executing`);
      }
    }

    const executor = new TaskExecutor(config);
    this.executors.set(agentId, executor);

    try {
      const result = await executor.executeTasks();
      this.executionHistory.push(result);
      return result;
    } finally {
      this.executors.delete(agentId);
    }
  }

  /**
   * Execute tasks for all enabled agents sequentially
   */
  async executeAllAgents() {
    const enabledAgents = this.getEnabledAgents();

    if (enabledAgents.length === 0) {
      console.log('⊘ No enabled agents to execute');
      return {
        status: 'no_agents',
        results: []
      };
    }

    console.log(`\n${'='.repeat(70)}`);
    console.log(`Executing ${enabledAgents.length} enabled agent(s)`);
    console.log(`${'='.repeat(70)}\n`);

    const results = [];

    for (const agent of enabledAgents) {
      try {
        const result = await this.executeAgent(agent.id);
        results.push(result);
      } catch (error) {
        console.error(`Failed to execute agent ${agent.id}:`, error.message);
        results.push({
          agentId: agent.id,
          agentName: agent.name,
          status: 'error',
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.status === 'completed').length;
    const failedCount = results.filter(r => r.status === 'failed' || r.status === 'error').length;

    console.log(`\n${'='.repeat(70)}`);
    console.log(`✓ Batch execution completed`);
    console.log(`Success: ${successCount}, Failed: ${failedCount}`);
    console.log(`${'='.repeat(70)}\n`);

    return {
      status: 'completed',
      totalAgents: enabledAgents.length,
      successCount,
      failedCount,
      results,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Execute tasks for multiple agents in parallel
   */
  async executeAgentsParallel(agentIds) {
    if (!agentIds || agentIds.length === 0) {
      agentIds = this.getEnabledAgents().map(a => a.id);
    }

    console.log(`\n${'='.repeat(70)}`);
    console.log(`Executing ${agentIds.length} agent(s) in parallel`);
    console.log(`${'='.repeat(70)}\n`);

    const executionPromises = agentIds.map(agentId =>
      this.executeAgent(agentId).catch(error => ({
        agentId,
        status: 'error',
        error: error.message
      }))
    );

    const results = await Promise.all(executionPromises);

    const successCount = results.filter(r => r.status === 'completed').length;
    const failedCount = results.filter(r => r.status === 'failed' || r.status === 'error').length;

    console.log(`\n${'='.repeat(70)}`);
    console.log(`✓ Parallel execution completed`);
    console.log(`Success: ${successCount}, Failed: ${failedCount}`);
    console.log(`${'='.repeat(70)}\n`);

    return {
      status: 'completed',
      totalAgents: agentIds.length,
      successCount,
      failedCount,
      results,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get execution history
   */
  getHistory() {
    return this.executionHistory;
  }

  /**
   * Clear execution history
   */
  clearHistory() {
    this.executionHistory = [];
  }

  /**
   * Save execution results to a file
   */
  async saveResults(results, outputPath) {
    try {
      const dir = path.dirname(outputPath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(outputPath, JSON.stringify(results, null, 2), 'utf-8');
      console.log(`✓ Results saved to: ${outputPath}`);
      return outputPath;
    } catch (error) {
      console.error(`✗ Failed to save results:`, error.message);
      throw error;
    }
  }

  /**
   * Validate agent configuration
   */
  validateAgentConfig(config) {
    const errors = [];

    if (!config.id) {
      errors.push('Missing required field: id');
    }

    if (!config.tasks || !Array.isArray(config.tasks)) {
      errors.push('Missing or invalid tasks array');
    } else {
      config.tasks.forEach((task, index) => {
        if (!task.id) {
          errors.push(`Task at index ${index} missing id`);
        }
        if (!task.action) {
          errors.push(`Task ${task.id || index} missing action`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Stop all running executors
   */
  async stopAll() {
    const cleanupPromises = Array.from(this.executors.values()).map(
      executor => executor.cleanup()
    );
    await Promise.all(cleanupPromises);
    this.executors.clear();
    console.log('✓ All executors stopped');
  }
}

export default AgentManager;
