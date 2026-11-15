import { chromium } from 'playwright';

/**
 * ChromiumController - A wrapper class for Playwright to control Chromium browser
 */
export class ChromiumController {
  constructor(options = {}) {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.options = {
      headless: options.headless !== undefined ? options.headless : false,
      viewport: options.viewport || { width: 1920, height: 1080 },
      args: options.args || [],
      defaultTimeout: options.defaultTimeout || 30000,
      navigationTimeout: options.navigationTimeout || 30000,
      ...options
    };
  }

  /**
   * Launch the browser
   */
  async launch() {
    try {
      const launchOptions = {
        headless: this.options.headless,
        args: this.options.args,
        ...this.options.launchOptions
      };

      this.browser = await chromium.launch(launchOptions);
      console.log('✓ Browser launched successfully');
      return this.browser;
    } catch (error) {
      console.error('Failed to launch browser:', error);
      throw error;
    }
  }

  /**
   * Create a new browser context
   */
  async newContext(options = {}) {
    if (!this.browser) {
      await this.launch();
    }

    const contextOptions = {
      viewport: this.options.viewport,
      ...options
    };

    this.context = await this.browser.newContext(contextOptions);
    this.context.setDefaultTimeout(this.options.defaultTimeout);
    this.context.setDefaultNavigationTimeout(this.options.navigationTimeout);
    
    console.log('✓ Browser context created');
    return this.context;
  }

  /**
   * Create a new page
   */
  async newPage() {
    if (!this.context) {
      await this.newContext();
    }
    
    this.page = await this.context.newPage();
    console.log('✓ New page created');
    return this.page;
  }

  /**
   * Navigate to a URL
   */
  async goto(url, options = {}) {
    if (!this.page) {
      await this.newPage();
    }
    
    const navigationOptions = {
      waitUntil: options.waitUntil || 'networkidle',
      timeout: options.timeout || this.options.navigationTimeout,
      ...options
    };

    try {
      await this.page.goto(url, navigationOptions);
      console.log(`✓ Navigated to: ${url}`);
      return true;
    } catch (error) {
      console.error(`Failed to navigate to ${url}:`, error);
      throw error;
    }
  }

  /**
   * Take a screenshot
   */
  async screenshot(options = {}) {
    if (!this.page) {
      throw new Error('No page available. Create a page first.');
    }

    const screenshotOptions = {
      path: options.path || `screenshot-${Date.now()}.png`,
      fullPage: options.fullPage !== undefined ? options.fullPage : true,
      ...options
    };

    await this.page.screenshot(screenshotOptions);
    console.log(`✓ Screenshot saved: ${screenshotOptions.path}`);
    return screenshotOptions.path;
  }

  /**
   * Execute JavaScript in the page context
   */
  async evaluate(fn, ...args) {
    if (!this.page) {
      throw new Error('No page available. Create a page first.');
    }
    return await this.page.evaluate(fn, ...args);
  }

  /**
   * Wait for a selector to appear
   */
  async waitForSelector(selector, options = {}) {
    if (!this.page) {
      throw new Error('No page available. Create a page first.');
    }
    
    const waitOptions = {
      timeout: options.timeout || 30000,
      state: options.state || 'visible',
      ...options
    };

    await this.page.waitForSelector(selector, waitOptions);
    console.log(`✓ Element found: ${selector}`);
    return true;
  }

  /**
   * Click an element
   */
  async click(selector, options = {}) {
    if (!this.page) {
      throw new Error('No page available. Create a page first.');
    }

    await this.page.click(selector, options);
    console.log(`✓ Clicked: ${selector}`);
    return true;
  }

  /**
   * Type text into an input field
   */
  async type(selector, text, options = {}) {
    if (!this.page) {
      throw new Error('No page available. Create a page first.');
    }

    // Clear existing text first if specified
    if (options.clear !== false) {
      await this.page.fill(selector, '');
    }

    await this.page.type(selector, text, options);
    console.log(`✓ Typed text into: ${selector}`);
    return true;
  }

  /**
   * Fill an input field (faster than type)
   */
  async fill(selector, text, options = {}) {
    if (!this.page) {
      throw new Error('No page available. Create a page first.');
    }

    await this.page.fill(selector, text, options);
    console.log(`✓ Filled text into: ${selector}`);
    return true;
  }

  /**
   * Get text content from an element
   */
  async getText(selector) {
    if (!this.page) {
      throw new Error('No page available. Create a page first.');
    }

    const element = await this.page.locator(selector).first();
    return await element.textContent();
  }

  /**
   * Get multiple elements' text content
   */
  async getTextAll(selector) {
    if (!this.page) {
      throw new Error('No page available. Create a page first.');
    }

    const elements = await this.page.locator(selector).all();
    const texts = await Promise.all(
      elements.map(el => el.textContent())
    );
    return texts;
  }

  /**
   * Get attribute value from an element
   */
  async getAttribute(selector, attribute) {
    if (!this.page) {
      throw new Error('No page available. Create a page first.');
    }

    const element = await this.page.locator(selector).first();
    return await element.getAttribute(attribute);
  }

  /**
   * Wait for navigation
   */
  async waitForNavigation(options = {}) {
    if (!this.page) {
      throw new Error('No page available. Create a page first.');
    }

    const navigationOptions = {
      waitUntil: options.waitUntil || 'networkidle',
      timeout: options.timeout || this.options.navigationTimeout,
      ...options
    };

    await this.page.waitForLoadState(navigationOptions.waitUntil, {
      timeout: navigationOptions.timeout
    });
    console.log('✓ Navigation completed');
    return true;
  }

  /**
   * Wait for a specific amount of time
   */
  async wait(milliseconds) {
    await this.page.waitForTimeout(milliseconds);
    console.log(`✓ Waited ${milliseconds}ms`);
  }

  /**
   * Get current page URL
   */
  async getUrl() {
    if (!this.page) {
      throw new Error('No page available. Create a page first.');
    }
    return this.page.url();
  }

  /**
   * Get page title
   */
  async getTitle() {
    if (!this.page) {
      throw new Error('No page available. Create a page first.');
    }
    return await this.page.title();
  }

  /**
   * Set viewport size
   */
  async setViewport(viewport) {
    if (!this.page) {
      throw new Error('No page available. Create a page first.');
    }
    await this.page.setViewportSize(viewport);
    console.log('✓ Viewport set:', viewport);
  }

  /**
   * Get all cookies
   */
  async getCookies() {
    if (!this.context) {
      throw new Error('No context available. Create a context first.');
    }
    return await this.context.cookies();
  }

  /**
   * Set cookies
   */
  async setCookies(cookies) {
    if (!this.context) {
      throw new Error('No context available. Create a context first.');
    }
    await this.context.addCookies(cookies);
    console.log('✓ Cookies set');
  }

  /**
   * Clear cookies
   */
  async clearCookies() {
    if (!this.context) {
      throw new Error('No context available. Create a context first.');
    }
    await this.context.clearCookies();
    console.log('✓ Cookies cleared');
  }

  /**
   * Select option from dropdown
   */
  async select(selector, value) {
    if (!this.page) {
      throw new Error('No page available. Create a page first.');
    }
    await this.page.selectOption(selector, value);
    console.log(`✓ Selected option in: ${selector}`);
  }

  /**
   * Check a checkbox or radio button
   */
  async check(selector) {
    if (!this.page) {
      throw new Error('No page available. Create a page first.');
    }
    await this.page.check(selector);
    console.log(`✓ Checked: ${selector}`);
  }

  /**
   * Uncheck a checkbox
   */
  async uncheck(selector) {
    if (!this.page) {
      throw new Error('No page available. Create a page first.');
    }
    await this.page.uncheck(selector);
    console.log(`✓ Unchecked: ${selector}`);
  }

  /**
   * Press a key
   */
  async press(selector, key) {
    if (!this.page) {
      throw new Error('No page available. Create a page first.');
    }
    await this.page.press(selector, key);
    console.log(`✓ Pressed ${key} on: ${selector}`);
  }

  /**
   * Hover over an element
   */
  async hover(selector) {
    if (!this.page) {
      throw new Error('No page available. Create a page first.');
    }
    await this.page.hover(selector);
    console.log(`✓ Hovered over: ${selector}`);
  }

  /**
   * Get element count
   */
  async count(selector) {
    if (!this.page) {
      throw new Error('No page available. Create a page first.');
    }
    return await this.page.locator(selector).count();
  }

  /**
   * Check if element is visible
   */
  async isVisible(selector) {
    if (!this.page) {
      throw new Error('No page available. Create a page first.');
    }
    return await this.page.locator(selector).first().isVisible();
  }

  /**
   * Check if element is enabled
   */
  async isEnabled(selector) {
    if (!this.page) {
      throw new Error('No page available. Create a page first.');
    }
    return await this.page.locator(selector).first().isEnabled();
  }

  /**
   * Get the current page instance
   */
  getPage() {
    return this.page;
  }

  /**
   * Get the browser context instance
   */
  getContext() {
    return this.context;
  }

  /**
   * Get the browser instance
   */
  getBrowser() {
    return this.browser;
  }

  /**
   * Close the current page
   */
  async closePage() {
    if (this.page) {
      await this.page.close();
      this.page = null;
      console.log('✓ Page closed');
    }
  }

  /**
   * Close the browser context
   */
  async closeContext() {
    if (this.context) {
      await this.context.close();
      this.context = null;
      this.page = null;
      console.log('✓ Context closed');
    }
  }

  /**
   * Close the browser
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
      console.log('✓ Browser closed');
    }
  }
}

export default ChromiumController;
