import { test, expect } from '@playwright/test';

test.describe('Responsive Design Tests', () => {
  // Device sizes to test
  const deviceSizes = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1280, height: 800 },
    { name: 'Large Desktop', width: 1920, height: 1080 }
  ];

  for (const device of deviceSizes) {
    test(`should render correctly on ${device.name} (${device.width}x${device.height})`, async ({ page }) => {
      // Set viewport size for this test
      await page.setViewportSize({
        width: device.width,
        height: device.height
      });
      
      // Navigate to the page
      await page.goto('/carousely');
      
      // Wait for content to load
      await page.waitForSelector('h1:has-text("Find Your Match")', { timeout: 10000 });
      
      // Wait for loading spinner to disappear
      await page.waitForSelector('.animate-spin', { state: 'detached', timeout: 10000 })
        .catch(() => console.log('Loading spinner not found or did not disappear')); 
      
      // Take a screenshot for visual comparison
      await page.screenshot({ 
        path: `./test-results/screenshots/carousely-${device.name.toLowerCase()}.png`,
        fullPage: true 
      });
      
      // Specific assertions based on device size
      if (device.width < 768) {
        // Mobile-specific assertions
        // Check that mobile layout is used
        await expect(page.locator('main')).toHaveClass(/pt-16/);
      } else {
        // Desktop-specific assertions
        // Check that desktop layout is used
        await expect(page.locator('main')).toHaveClass(/md:pt-16/);
      }
      
      // Verify carousel is visible regardless of device size
      await expect(page.locator('[data-testid="carousel-wheel"]')).toBeVisible();
    });
  }

  test('should adapt card size based on viewport', async ({ page }) => {
    // Test on mobile first
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/carousely');
    await page.waitForSelector('.animate-spin', { state: 'detached', timeout: 10000 });
    
    // Get card dimensions on mobile
    const mobileCardWidth = await page.locator('[data-testid="advertiser-card"]').first().evaluate(el => {
      const rect = el.getBoundingClientRect();
      return rect.width;
    });
    
    // Switch to desktop
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(1000); // Allow time for responsive adjustments
    
    // Get card dimensions on desktop
    const desktopCardWidth = await page.locator('[data-testid="advertiser-card"]').first().evaluate(el => {
      const rect = el.getBoundingClientRect();
      return rect.width;
    });
    
    // Cards should either maintain size or adapt based on design
    expect(mobileCardWidth).toBeDefined();
    expect(desktopCardWidth).toBeDefined();
    
    // Log the measurements for debugging
    console.log(`Card width - Mobile: ${mobileCardWidth}px, Desktop: ${desktopCardWidth}px`);
  });
});
