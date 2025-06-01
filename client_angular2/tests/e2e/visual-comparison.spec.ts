import { test, expect } from '@playwright/test';

/**
 * Visual comparison tests to capture current page layouts
 * and compare with prototype designs
 */
test.describe('Visual Comparison Tests', () => {
  let baseUrl = 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    // Set a consistent viewport for screenshots
    await page.setViewportSize({ width: 1280, height: 720 });

    // Test if port 3000 is available, fallback to 3001
    try {
      await page.goto(`${baseUrl}/`);
    } catch (error) {
      console.log('Port 3000 not available, trying 3001...');
      baseUrl = 'http://localhost:3001';
      await page.goto(`${baseUrl}/`);
    }
  });

  test('Capture Carousely page layout', async ({ page }) => {
    await page.goto(`${baseUrl}/carousely`);

    // Wait for the page to fully load
    await page.waitForSelector('.min-h-screen', { state: 'visible', timeout: 20000 });

    // Wait for carousel to be ready
    await page.waitForTimeout(3000);

    // Take full page screenshot
    await page.screenshot({
      path: './tests/screenshots/carousely-current.png',
      fullPage: true,
    });

    // Take viewport screenshot for comparison
    await page.screenshot({
      path: './tests/screenshots/carousely-viewport.png',
      clip: {
        x: 0,
        y: 0,
        width: 1280,
        height: 720,
      },
    });

    console.log('Carousely screenshots captured');
  });

  test('Capture Netflix View page layout', async ({ page }) => {
    await page.goto(`${baseUrl}/netflix-view`);

    // Wait for the page to fully load
    await page.waitForSelector('.min-h-screen', { state: 'visible', timeout: 20000 });

    // Wait for images to load
    await page.waitForTimeout(3000);

    // Take full page screenshot
    await page.screenshot({
      path: './tests/screenshots/netflix-view-current.png',
      fullPage: true,
    });

    // Take viewport screenshot for comparison
    await page.screenshot({
      path: './tests/screenshots/netflix-view-viewport.png',
      clip: {
        x: 0,
        y: 0,
        width: 1280,
        height: 720,
      },
    });

    console.log('Netflix View screenshots captured');
  });

  test('Capture both pages side by side for comparison', async ({ page }) => {
    // First capture carousely
    await page.goto(`${baseUrl}/carousely`);
    await page.waitForSelector('.min-h-screen', { state: 'visible', timeout: 20000 });
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: './tests/screenshots/comparison-carousely.png',
      clip: {
        x: 0,
        y: 0,
        width: 1280,
        height: 720,
      },
    });

    // Then capture netflix-view
    await page.goto(`${baseUrl}/netflix-view`);
    await page.waitForSelector('.min-h-screen', { state: 'visible', timeout: 20000 });
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: './tests/screenshots/comparison-netflix-view.png',
      clip: {
        x: 0,
        y: 0,
        width: 1280,
        height: 720,
      },
    });

    console.log('Comparison screenshots captured');
  });
});
