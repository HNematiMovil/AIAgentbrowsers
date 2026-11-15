import ChromiumController from './ChromiumController.js';
import { BaleBot } from './BaleBot.js';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * TaskExecutor - Handles execution of browser tasks from agent configurations
 */
export class TaskExecutor {
  constructor(agentConfig) {
    this.config = agentConfig;
    this.controller = null;
    this.baleBot = null;
    this.taskResults = [];
    this.isRunning = false;
    this.lastScreenshotPath = null;
  }

  /**
   * Initialize the browser controller with agent's browser settings
   */
  async initialize() {
    const browserOptions = {
      headless: this.config.browser?.headless ?? false,
      viewport: this.config.browser?.viewport || { width: 1920, height: 1080 },
      defaultTimeout: this.config.browser?.defaultTimeout || 30000,
      navigationTimeout: this.config.browser?.navigationTimeout || 30000,
      ...this.config.browser
    };

    this.controller = new ChromiumController(browserOptions);
    await this.controller.launch();
    await this.controller.newPage();

    // Initialize BaleBot if token is provided
    if (this.config.bale?.token) {
      this.baleBot = new BaleBot(this.config.bale.token);
      console.log('✓ Bale Bot initialized');
    }

    console.log(`✓ Initialized browser for agent: ${this.config.name}`);
  }

  /**
   * Resolve a value from the agent configuration
   * Supports paths like "credentials.username"
   */
  resolveValue(valueFrom) {
    if (!valueFrom) return null;

    const parts = valueFrom.split('.');
    let value = this.config;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return null;
      }
    }

    return value;
  }

  /**
   * Execute a single task
   */
  async executeTask(task) {
    const startTime = Date.now();
    console.log(`\n→ Executing task: ${task.id} (${task.action})`);

    try {
      let result = null;

      switch (task.action) {
        case 'goto':
          await this.controller.goto(task.url, {
            waitUntil: task.waitUntil || 'networkidle',
            timeout: task.timeout || this.config.browser?.navigationTimeout
          });
          result = { url: task.url };
          break;

        case 'click':
          if (task.waitForNavigation) {
            await Promise.all([
              this.controller.waitForNavigation({ 
                waitUntil: task.waitUntil || 'networkidle',
                timeout: task.timeout || this.config.browser?.navigationTimeout
              }),
              this.controller.click(task.selector, task.options)
            ]);
          } else {
            await this.controller.click(task.selector, task.options);
          }
          result = { selector: task.selector };
          break;

        case 'type':
          let value = task.value;
          
          // Resolve value from config if valueFrom is specified
          if (task.valueFrom) {
            value = this.resolveValue(task.valueFrom);
            if (value === null) {
              throw new Error(`Could not resolve value from: ${task.valueFrom}`);
            }
          }

          // Use fill for faster input if no delay specified
          if (!task.options?.delay) {
            await this.controller.fill(task.selector, value, task.options);
          } else {
            await this.controller.type(task.selector, value, task.options);
          }
          result = { selector: task.selector, typed: '***' }; // Don't log sensitive data
          break;

        case 'wait':
          await this.controller.wait(task.duration || 1000);
          result = { duration: task.duration };
          break;

        case 'waitForSelector':
          await this.controller.waitForSelector(task.selector, {
            timeout: task.timeout || 30000,
            state: task.state || 'visible',
            ...task.options
          });
          result = { selector: task.selector };
          break;

        case 'screenshot':
          const screenshotPath = task.path || `screenshots/${this.config.id}-${Date.now()}.png`;
          
          // Ensure directory exists
          const dir = path.dirname(screenshotPath);
          await fs.mkdir(dir, { recursive: true });

          await this.controller.screenshot({
            path: screenshotPath,
            fullPage: task.fullPage ?? true,
            ...task.options
          });
          
          // Store the last screenshot path
          this.lastScreenshotPath = screenshotPath;
          
          result = { path: screenshotPath };
          break;

        case 'getText':
          const text = await this.controller.getText(task.selector);
          result = { selector: task.selector, text };
          break;

        case 'getTextAll':
          const texts = await this.controller.getTextAll(task.selector);
          result = { selector: task.selector, texts, count: texts.length };
          break;

        case 'getAttribute':
          const attribute = await this.controller.getAttribute(task.selector, task.attribute);
          result = { selector: task.selector, attribute: task.attribute, value: attribute };
          break;

        case 'evaluate':
          const evalResult = await this.controller.evaluate(task.function);
          result = { result: evalResult };
          break;

        case 'setCookies':
          await this.controller.setCookies(task.cookies);
          result = { cookiesSet: task.cookies.length };
          break;

        case 'getCookies':
          const cookies = await this.controller.getCookies();
          result = { cookies, count: cookies.length };
          break;

        case 'clearCookies':
          await this.controller.clearCookies();
          result = { cleared: true };
          break;

        case 'setViewport':
          await this.controller.setViewport(task.viewport);
          result = { viewport: task.viewport };
          break;

        case 'select':
          await this.controller.select(task.selector, task.value);
          result = { selector: task.selector, value: task.value };
          break;

        case 'check':
          await this.controller.check(task.selector);
          result = { selector: task.selector, checked: true };
          break;

        case 'uncheck':
          await this.controller.uncheck(task.selector);
          result = { selector: task.selector, checked: false };
          break;

        case 'press':
          await this.controller.press(task.selector, task.key);
          result = { selector: task.selector, key: task.key };
          break;

        case 'hover':
          await this.controller.hover(task.selector);
          result = { selector: task.selector };
          break;

        case 'fill':
          let fillValue = task.value;
          if (task.valueFrom) {
            fillValue = this.resolveValue(task.valueFrom);
            if (fillValue === null) {
              throw new Error(`Could not resolve value from: ${task.valueFrom}`);
            }
          }
          await this.controller.fill(task.selector, fillValue, task.options);
          result = { selector: task.selector, filled: '***' };
          break;

        case 'count':
          const count = await this.controller.count(task.selector);
          result = { selector: task.selector, count };
          break;

        case 'isVisible':
          const visible = await this.controller.isVisible(task.selector);
          result = { selector: task.selector, visible };
          break;

        case 'isEnabled':
          const enabled = await this.controller.isEnabled(task.selector);
          result = { selector: task.selector, enabled };
          break;

        case 'sendToBale':
          if (!this.baleBot) {
            throw new Error('Bale bot not initialized. Add "bale.token" to agent config');
          }

          let filePath = task.file || this.lastScreenshotPath;
          
          if (task.fileFrom) {
            filePath = this.resolveValue(task.fileFrom);
          }

          if (!filePath) {
            throw new Error('No file specified. Use "file", "fileFrom", or take a screenshot first');
          }

          let chatId = task.chatId;
          if (task.chatIdFrom) {
            chatId = this.resolveValue(task.chatIdFrom);
          }

          if (!chatId) {
            throw new Error('chatId is required for sendToBale action');
          }

          const sendResult = await this.baleBot.sendPhoto(chatId, filePath, {
            caption: task.caption || '',
            parse_mode: task.parseMode
          });

          result = { 
            chatId, 
            file: filePath, 
            messageId: sendResult.message_id,
            sent: true 
          };
          break;

        case 'sendMessageToBale':
          if (!this.baleBot) {
            throw new Error('Bale bot not initialized. Add "bale.token" to agent config');
          }

          let messageText = task.text;
          if (task.textFrom) {
            messageText = this.resolveValue(task.textFrom);
          }

          if (!messageText) {
            throw new Error('text is required for sendMessageToBale action');
          }

          let messageChatId = task.chatId;
          if (task.chatIdFrom) {
            messageChatId = this.resolveValue(task.chatIdFrom);
          }

          if (!messageChatId) {
            throw new Error('chatId is required for sendMessageToBale action');
          }

          const messageResult = await this.baleBot.sendMessage(messageChatId, messageText, {
            parse_mode: task.parseMode,
            reply_markup: task.replyMarkup
          });

          result = { 
            chatId: messageChatId, 
            text: messageText,
            messageId: messageResult.message_id,
            sent: true 
          };
          break;

        default:
          throw new Error(`Unknown action: ${task.action}`);
      }

      const duration = Date.now() - startTime;
      const taskResult = {
        taskId: task.id,
        action: task.action,
        status: 'success',
        duration,
        result,
        timestamp: new Date().toISOString()
      };

      this.taskResults.push(taskResult);
      console.log(`✓ Task completed in ${duration}ms`);

      return taskResult;

    } catch (error) {
      const duration = Date.now() - startTime;
      const taskResult = {
        taskId: task.id,
        action: task.action,
        status: 'failed',
        duration,
        error: error.message,
        timestamp: new Date().toISOString()
      };

      this.taskResults.push(taskResult);
      console.error(`✗ Task failed: ${error.message}`);

      // Decide whether to continue or stop
      if (task.continueOnError !== true) {
        throw error;
      }

      return taskResult;
    }
  }

  /**
   * Execute all tasks in the agent configuration
   */
  async executeTasks() {
    if (!this.config.enabled) {
      console.log(`⊘ Agent ${this.config.name} is disabled`);
      return {
        agentId: this.config.id,
        status: 'disabled',
        results: []
      };
    }

    if (!this.config.tasks || this.config.tasks.length === 0) {
      console.log(`⊘ No tasks defined for agent ${this.config.name}`);
      return {
        agentId: this.config.id,
        status: 'no_tasks',
        results: []
      };
    }

    this.isRunning = true;
    this.taskResults = [];
    const startTime = Date.now();

    console.log(`\n${'='.repeat(60)}`);
    console.log(`Starting task execution for: ${this.config.name}`);
    console.log(`Agent ID: ${this.config.id}`);
    console.log(`Total tasks: ${this.config.tasks.length}`);
    console.log(`${'='.repeat(60)}`);

    try {
      await this.initialize();

      for (const task of this.config.tasks) {
        await this.executeTask(task);

        // Optional delay between tasks
        if (task.delayAfter) {
          console.log(`⏳ Waiting ${task.delayAfter}ms before next task...`);
          await this.controller.wait(task.delayAfter);
        }
      }

      const totalDuration = Date.now() - startTime;
      const successCount = this.taskResults.filter(r => r.status === 'success').length;
      const failedCount = this.taskResults.filter(r => r.status === 'failed').length;

      console.log(`\n${'='.repeat(60)}`);
      console.log(`✓ All tasks completed for: ${this.config.name}`);
      console.log(`Total duration: ${totalDuration}ms`);
      console.log(`Success: ${successCount}, Failed: ${failedCount}`);
      console.log(`${'='.repeat(60)}\n`);

      return {
        agentId: this.config.id,
        agentName: this.config.name,
        status: 'completed',
        totalDuration,
        successCount,
        failedCount,
        results: this.taskResults,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      const totalDuration = Date.now() - startTime;
      console.error(`\n✗ Task execution failed for ${this.config.name}:`, error.message);

      return {
        agentId: this.config.id,
        agentName: this.config.name,
        status: 'failed',
        totalDuration,
        error: error.message,
        results: this.taskResults,
        timestamp: new Date().toISOString()
      };

    } finally {
      this.isRunning = false;
      await this.cleanup();
    }
  }

  /**
   * Stop execution and cleanup
   */
  async cleanup() {
    if (this.controller) {
      await this.controller.close();
      this.controller = null;
      console.log('✓ Browser closed');
    }
  }

  /**
   * Get task execution results
   */
  getResults() {
    return {
      agentId: this.config.id,
      agentName: this.config.name,
      results: this.taskResults
    };
  }

  /**
   * Check if executor is currently running
   */
  isExecuting() {
    return this.isRunning;
  }
}

export default TaskExecutor;
