import { expect } from '@playwright/test';
import { test } from './fixtures/test-fixtures';
import { monitorApiCalls, waitForNetworkIdle } from './utils/test-utils';

test.describe('Performance Tests', () => {
  test('should load the home page within reasonable time', async ({ page }) => {
    // Start performance measurement
    const startTime = Date.now();

    // Navigate to the page
    await page.goto('http://localhost:3002');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('load');

    // Calculate total load time
    const loadTime = Date.now() - startTime;

    // Log performance data
    console.log(`Page load time: ${loadTime}ms`);

    // Assertion - adjust threshold as needed for your application
    expect(loadTime).toBeLessThan(10000); // 10 seconds max
  });

  test('should have acceptable API response times', async ({ page }) => {
    // Monitor API calls
    const { requests, responses } = await monitorApiCalls(page, /\/api\//);

    // Navigate to the page
    await page.goto('http://localhost:3002');

    // Interact with the page to trigger API calls
    await page.waitForLoadState('networkidle');

    // Wait a bit for any delayed API calls
    await page.waitForTimeout(2000);

    // Check response times for API calls
    for (const response of responses) {
      try {
        const timing = response.timing();
        if (timing) {
          const responseTime = timing.responseEnd - timing.requestStart;
          console.log(`API call to ${response.url()} took ${responseTime}ms`);

          // Assertion - adjust threshold as needed
          expect(responseTime).toBeLessThan(2000); // 2 seconds max per API call
        }
      } catch (error) {
        console.log(`Could not measure timing for ${response.url()}`);
      }
    }
  });

  test('should not have excessive DOM size', async ({ page }) => {
    // Navigate to the page
    await page.goto('http://localhost:3002');
    await waitForNetworkIdle(page);

    // Count DOM elements
    const domCount = await page.evaluate(() => document.querySelectorAll('*').length);

    // Log DOM size
    console.log(`Total DOM elements: ${domCount}`);

    // Large DOM sizes can cause performance issues
    expect(domCount).toBeLessThan(3000); // Adjust based on reasonable expectations
  });

  test('should not have JavaScript errors', async ({ page }) => {
    // Collect JS errors
    const jsErrors: string[] = [];
    page.on('console', message => {
      if (message.type() === 'error') {
        jsErrors.push(message.text());
      }
    });

    page.on('pageerror', exception => {
      jsErrors.push(exception.message);
    });

    // Navigate and wait for full page load
    await page.goto('http://localhost:3002');
    await waitForNetworkIdle(page);

    // Interact with the page a bit
    await page.mouse.move(100, 100);
    await page.mouse.wheel(0, 200); // Scroll down
    await page.waitForTimeout(1000);

    // Check for JS errors
    if (jsErrors.length > 0) {
      console.log('JavaScript errors detected:', jsErrors);
    }

    expect(jsErrors.length).toBe(0);
  });
});
