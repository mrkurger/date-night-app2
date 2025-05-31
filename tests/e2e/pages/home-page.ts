import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class HomePage extends BasePage {
  // Define selectors for home page elements
  readonly heading: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize all locators
    this.heading = page.getByRole('heading').first();
  }

  /**
   * Navigate to home page
   */
  async goto(): Promise<void> {
    await super.goto('/');
    await this.waitForAngular();
  }

  /**
   * Get the main heading text
   */
  async getHeadingText(): Promise<string> {
    await this.waitForElement(this.heading);
    return (await this.heading.textContent()) || '';
  }
}
