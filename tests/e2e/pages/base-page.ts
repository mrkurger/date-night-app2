import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL path
   */
  async goto(path: string = '/'): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Get element by text
   */
  getByText(text: string): Locator {
    return this.page.getByText(text);
  }

  /**
   * Get element by test ID
   */
  getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  /**
   * Get input by placeholder
   */
  getByPlaceholder(placeholder: string): Locator {
    return this.page.getByPlaceholder(placeholder);
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
  }

  /**
   * Take a screenshot and save it
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `tests/e2e/screenshots/${name}.png`, fullPage: true });
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for page to stabilize (useful for Angular apps)
   */
  async waitForAngular(): Promise<void> {
    // Wait for Angular to be stable
    try {
      await this.page
        .waitForFunction(
          () => {
            const angular = (window as any).ng;
            return (
              angular?.probe &&
              Object.keys(angular.probe(document.documentElement).injector.get).length > 0
            );
          },
          { timeout: 5000 },
        )
        .catch(() => {
          // If timeout, continue anyway
          console.log('Angular detector timed out, continuing anyway');
        });
    } catch (error) {
      // Continue if Angular detection fails
      console.log('Angular detection failed, continuing anyway:', error);
    }

    // Additional stability wait
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');
  }
}
