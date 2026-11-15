// Quick test to verify imports work correctly
import { ChromiumController, TaskExecutor, AgentManager } from './src/index.js';
import DefaultController from './src/index.js';

console.log('✓ Named imports work:');
console.log('  - ChromiumController:', typeof ChromiumController);
console.log('  - TaskExecutor:', typeof TaskExecutor);
console.log('  - AgentManager:', typeof AgentManager);
console.log('✓ Default import works:', typeof DefaultController);

if (ChromiumController === DefaultController) {
  console.log('✓ Default export matches ChromiumController');
} else {
  console.log('✗ Warning: Default export does not match');
}

console.log('\n✅ All imports successful!');
