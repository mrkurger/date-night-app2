import { expect } from '@playwright/test';
import { test } from './fixtures/test-fixtures';
import { takeScreenshotWithTimestamp } from './utils/test-utils';

test.describe('Home Page Tests', () => {
  test('should load the home page', async ({ homePage, page }) => {
    // Navigate to home page
    await homePage.goto();

    // Verify page title
    const title = await page.title();
    expect(title).toBeTruthy();

    // Verify heading is present
    const headingText = await homePage.getHeadingText();
    expect(headingText).toBeTruthy();

    // Take screenshot
    await takeScreenshotWithTimestamp(page, 'home_page_loaded');
  });

  test('should have working navigation elements', async ({ homePage, navigationMenu, page }) => {
    // Navigate to home page
    await homePage.goto();

    // Check if navigation menu is present
    await expect(navigationMenu.navLinks).toBeVisible();

    // Check if logo is present
    await expect(navigationMenu.logo).toBeVisible();
  });

  test('should display proper layout on mobile', async ({ homePage, page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to home page
    await homePage.goto();

    // Check for mobile menu button visibility
    const menuButton = page.getByRole('button', { name: /menu|hamburger/i });
    await expect(menuButton).toBeVisible();

    // Take screenshot for mobile view
    await takeScreenshotWithTimestamp(page, 'home_page_mobile');
  });

  test('should load content without errors', async ({ homePage, page }) => {
    // Listen for console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Navigate to home page
    await homePage.goto();

    // Wait for network to be idle
    await page.waitForLoadState('networkidle');

    // Expect no console errors
    expect(errors).toHaveLength(0);
  });
});
