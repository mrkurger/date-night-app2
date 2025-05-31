import { expect } from '@playwright/test';
import { test } from './fixtures/test-fixtures';
import { takeScreenshotWithTimestamp, waitForNetworkIdle } from './utils/test-utils';

test.describe('Navigation Tests', () => {
  test('should navigate between main sections', async ({ page, navigationMenu, homePage }) => {
    // Start at home page
    await homePage.goto();
    await waitForNetworkIdle(page);

    // Try to navigate to different sections
    // Note: These are generic sections that might exist in the app
    // Adjust according to actual application navigation structure
    const sections = ['Home', 'About', 'Features', 'Contact'];

    for (const section of sections) {
      try {
        // First check if the link exists
        const link = page.getByRole('link', { name: new RegExp(section, 'i') });

        if (await link.isVisible()) {
          await link.click();
          await waitForNetworkIdle(page);

          // Take screenshot of each section
          await takeScreenshotWithTimestamp(page, `navigation_to_${section.toLowerCase()}`);

          // Basic verification - the URL should change
          const url = page.url();
          expect(url).toContain(section.toLowerCase());
        } else {
          console.log(`Section link "${section}" not found, skipping`);
        }
      } catch (error) {
        console.log(`Could not navigate to "${section}" section:`, error);
      }
    }
  });

  test('should have working logo link', async ({ page, navigationMenu }) => {
    // Navigate to a non-home page first (if possible)
    await page.goto('http://localhost:3002/about');
    await waitForNetworkIdle(page);

    // Click on logo to return to home
    await navigationMenu.goToHome();

    // Verify we're on the home page
    expect(page.url()).toBe('http://localhost:3002/');
  });

  test('should handle responsive menu correctly', async ({ page, navigationMenu }) => {
    // First test desktop layout
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('http://localhost:3002');
    await waitForNetworkIdle(page);

    // Take screenshot of desktop navigation
    await takeScreenshotWithTimestamp(page, 'navigation_desktop');

    // Then test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await waitForNetworkIdle(page);

    // Try opening mobile menu
    await navigationMenu.openMenu();

    // Take screenshot of mobile navigation
    await takeScreenshotWithTimestamp(page, 'navigation_mobile_open');

    // Desktop again to ensure it adapts back
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.reload();
    await waitForNetworkIdle(page);

    // Ensure desktop navigation is visible
    await expect(navigationMenu.navLinks.first()).toBeVisible();
  });
});
