import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should load carousel within acceptable time', async ({ page }) => {
    // Start performance measurement
    const startTime = Date.now();
    
    // Navigate to page
    await page.goto('/carousely');
    
    // Wait for main content to appear
    await page.waitForSelector('h1:has-text("Find Your Match")');
    
    // Record time when main content appears
    const contentLoadTime = Date.now() - startTime;
    console.log(`Content load time: ${contentLoadTime}ms`);
    
    // Wait for carousel to load (spinner to disappear)
    await page.waitForSelector('.animate-spin', { state: 'detached', timeout: 10000 });
    
    // Record time when carousel is fully loaded
    const carouselLoadTime = Date.now() - startTime;
    console.log(`Carousel load time: ${carouselLoadTime}ms`);
    
    // Performance assertions
    expect(contentLoadTime).toBeLessThan(5000); // Content should appear within 5s
    expect(carouselLoadTime).toBeLessThan(10000); // Carousel should load within 10s
    
    // Check for client-side errors
    const errors = await page.evaluate(() => {
      // @ts-ignore
      return window.__playwright_errors__ || [];
    });
    expect(errors.length).toBe(0);
  });

  test('should efficiently handle card animations', async ({ page }) => {
    await page.goto('/carousely');
    await page.waitForSelector('.animate-spin', { state: 'detached', timeout: 10000 });
    
    // Enable performance monitoring
    await page.evaluate(() => {
      // @ts-ignore
      window.__performanceMarks = [];
      
      // Create performance observer to monitor long tasks
      const observer = new PerformanceObserver((list) => {
        // @ts-ignore
        window.__performanceMarks = window.__performanceMarks || [];
        // @ts-ignore
        window.__performanceMarks.push(...list.getEntries());
      });
      
      observer.observe({ entryTypes: ['longtask'] });
    });
    
    // Interact with carousel to trigger animations
    await page.mouse.move(400, 400);
    await page.mouse.down();
    
    // Move in a circular pattern to trigger intensive rendering
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const x = 400 + Math.cos(angle) * 100;
      const y = 400 + Math.sin(angle) * 20;
      await page.mouse.move(x, y, { steps: 5 });
      await page.waitForTimeout(50);
    }
    
    await page.mouse.up();
    await page.waitForTimeout(500); // Wait for animations to complete
    
    // Check for performance issues
    const performanceMarks = await page.evaluate(() => {
      // @ts-ignore
      return window.__performanceMarks || [];
    });
    
    // Log performance marks for analysis
    console.log(`Detected ${performanceMarks.length} long tasks during animation`);
    
    // Not too many long tasks during animation
    expect(performanceMarks.length).toBeLessThan(10);
  });

  test('should lazy load images efficiently', async ({ page }) => {
    // Navigate to page
    await page.goto('/carousely');
    await page.waitForSelector('.animate-spin', { state: 'detached', timeout: 10000 });

    // Get network requests for images
    const imageRequests = [];
    page.on('request', request => {
      if (request.resourceType() === 'image') {
        imageRequests.push(request.url());
      }
    });

    // Scroll through carousel to trigger lazy loading
    await page.mouse.move(400, 400);
    await page.mouse.down();
    
    // Rotate carousel a few times
    for (let i = 0; i < 5; i++) {
      await page.mouse.move(500, 400, { steps: 10 });
      await page.waitForTimeout(300);
      await page.mouse.move(300, 400, { steps: 10 });
      await page.waitForTimeout(300);
    }
    
    await page.mouse.up();
    await page.waitForTimeout(1000); // Allow time for image requests
    
    // Log image loading statistics
    console.log(`Total image requests: ${imageRequests.length}`);
    console.log(`Unique image requests: ${new Set(imageRequests).size}`);
    
    // Verify lazy loading is working (not all images loaded at once)
    // The exact number will depend on implementation, but should be reasonable
    const uniqueImageRequests = new Set(imageRequests).size;
    expect(uniqueImageRequests).toBeGreaterThanOrEqual(1);
    expect(uniqueImageRequests).toBeLessThan(100); // Not loading too many at once
  });
});
