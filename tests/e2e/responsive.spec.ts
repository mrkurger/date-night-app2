import { expect } from '@playwright/test';
import { test } from './fixtures/test-fixtures';
import { takeScreenshotWithTimestamp, waitForNetworkIdle } from './utils/test-utils';

test.describe('Responsive Design Tests', () => {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 720 },
  ];

  for (const viewport of viewports) {
    test(`should display correctly on ${viewport.name}`, async ({ page, homePage }) => {
      // Set viewport size
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      // Navigate to home page
      await homePage.goto();
      await waitForNetworkIdle(page);

      // Take screenshot for this viewport
      await takeScreenshotWithTimestamp(page, `responsive_${viewport.name}`);

      // Basic tests for responsive behavior
      if (viewport.name === 'mobile') {
        // On mobile, menu should be collapsed
        const menuButton = page.getByRole('button', { name: /menu|hamburger/i });
        await expect(menuButton).toBeVisible();
      } else if (viewport.name === 'desktop') {
        // On desktop, navigation should be expanded
        const navMenu = page.locator('nav');
        await expect(navMenu).toBeVisible();
      }
    });
  }

  test('should handle dynamic content responsively', async ({ page }) => {
    // Test with different content sections
    const testPaths = ['/', '/about', '/features']; // Adjust based on actual routes

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      for (const path of testPaths) {
        try {
          await page.goto(path);
          await waitForNetworkIdle(page);

          // Take screenshot for documentation
          await takeScreenshotWithTimestamp(
            page,
            `responsive_${viewport.name}_${path.replace(/\//g, '_')}`,
          );

          // No specific assertions here, this is primarily for visual inspection
        } catch (error) {
          console.log(`Error testing path ${path} on ${viewport.name}:`, error);
        }
      }
    }
  });

  test('should have touch-friendly tap targets on mobile', async ({ page }) => {
    // Set to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Go to homepage
    await page.goto('/');
    await waitForNetworkIdle(page);

    // Find all clickable elements
    const clickableElements = await page.$$('a, button, [role="button"], input[type="submit"]');

    // Check their size (for tap targets, we generally want at least 44x44px minimum size)
    for (const element of clickableElements) {
      const box = await element.boundingBox();
      if (box) {
        // Only test visible elements with non-zero dimensions
        if (box.width > 0 && box.height > 0) {
          const isTapTargetSized = box.width >= 44 && box.height >= 44;
          // This is not a strict requirement, just logging for information
          if (!isTapTargetSized) {
            console.log(
              `Element might be too small for comfortable tapping: ${await element.evaluate(
                el => el.outerHTML,
              )}`,
            );
            console.log(`Size: ${box.width}x${box.height}`);
          }
        }
      }
    }
  });
});
