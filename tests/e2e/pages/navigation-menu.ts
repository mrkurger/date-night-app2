import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class NavigationMenu extends BasePage {
  // Define selectors for navigation elements
  readonly menuButton: Locator;
  readonly profileLink: Locator;
  readonly settingsLink: Locator;
  readonly logoutButton: Locator;
  readonly logo: Locator;
  readonly navLinks: Locator;
  readonly homeLink: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize all locators - updated to work with both Angular and Next.js navbar structures
    this.menuButton = page
      .getByRole('button')
      .filter({ hasText: '' })
      .or(page.locator('button:has(.w-6, .h-6)'));
    this.profileLink = page.getByRole('link', { name: /profile/i });
    this.settingsLink = page.getByRole('link', { name: /settings/i });
    this.logoutButton = page.getByRole('button', { name: /logout|sign out|log out/i });

    // Logo selector expanded to match both implementations
    this.logo = page
      .getByAltText(/logo|brand/i)
      .or(page.locator('.logo'))
      .or(
        page
          .locator('a')
          .filter({ hasText: /Sensual|Meet|My App/ })
          .first(),
      )
      .or(page.locator('a').first());

    // Get all navigation links
    this.navLinks = page.locator('nav').getByRole('link');
    this.homeLink = page.getByRole('link', { name: /home/i });
  }

  /**
   * Open the navigation menu (if it's a collapsible mobile menu)
   */
  async openMenu(): Promise<void> {
    try {
      // Check if menu button exists (mobile view)
      if (await this.menuButton.isVisible()) {
        await this.menuButton.click();
        // Wait for animation to complete
        await this.page.waitForTimeout(300);
      }
    } catch (error) {
      // Menu might be already visible in desktop mode
      console.log('Menu might be already expanded or not collapsible');
    }
  }

  /**
   * Navigate to specific section using the menu
   */
  async navigateTo(linkText: string): Promise<void> {
    await this.openMenu();

    const link = this.page.getByRole('link', { name: new RegExp(linkText, 'i') });
    await link.click();
    await this.waitForNavigation();
  }

  /**
   * Check if user is logged in based on navigation elements
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      await this.openMenu();
      await this.profileLink.waitFor({ state: 'visible', timeout: 2000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Logout the user
   */
  async logout(): Promise<void> {
    await this.openMenu();
    await this.logoutButton.click();
    await this.waitForNavigation();
  }

  /**
   * Go to home page by clicking logo
   */
  async goToHome(): Promise<void> {
    await this.logo.click();
    await this.waitForNavigation();
  }
}
