import { test, expect } from '@playwright/test';

/**
 * Test suite for demo and component showcase pages
 * Tests demo components, masonry view, review ranking, and component demonstrations
 */
test.describe('Demo and Component Pages', () => {
  
  test.describe('Demo Components Page', () => {
    test('should load demo components page correctly', async ({ page }) => {
      await page.goto('/demo/components');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Check for demo components interface
      await expect(page.locator('body')).toBeVisible();
      
      // Look for component demonstrations
      const componentElements = page.locator('.component, .demo, [data-testid*="component"], [data-testid*="demo"]');
      if (await componentElements.count() > 0) {
        await expect(componentElements.first()).toBeVisible();
      }
      
      // Take screenshot for visual verification
      await page.screenshot({
        path: './tests/screenshots/demo-components-page.png',
        fullPage: true,
      });
    });

    test('should display multiple component examples', async ({ page }) => {
      await page.goto('/demo/components');
      await page.waitForLoadState('networkidle');
      
      // Look for different types of components
      const carouselComponents = page.locator('[data-testid*="carousel"], .carousel');
      const tinderComponents = page.locator('[data-testid*="tinder"], .tinder');
      const masonryComponents = page.locator('[data-testid*="masonry"], .masonry');
      const netflixComponents = page.locator('[data-testid*="netflix"], .netflix');
      
      // Check if various component types are present
      const componentTypes = [carouselComponents, tinderComponents, masonryComponents, netflixComponents];
      let visibleComponents = 0;
      
      for (const componentType of componentTypes) {
        if (await componentType.count() > 0) {
          visibleComponents++;
        }
      }
      
      // Expect at least some components to be visible
      expect(visibleComponents).toBeGreaterThan(0);
    });

    test('should have interactive component demonstrations', async ({ page }) => {
      await page.goto('/demo/components');
      await page.waitForLoadState('networkidle');
      
      // Look for interactive elements
      const interactiveElements = page.locator('button, .interactive, [data-testid*="interactive"]');
      if (await interactiveElements.count() > 0) {
        const firstInteractive = interactiveElements.first();
        await expect(firstInteractive).toBeVisible();
        
        // Test interaction
        await firstInteractive.click();
        await page.waitForTimeout(500);
      }
      
      // Look for hover effects
      const hoverElements = page.locator('.hover-effect, [data-testid*="hover"]');
      if (await hoverElements.count() > 0) {
        const firstHover = hoverElements.first();
        await firstHover.hover();
        await page.waitForTimeout(300);
      }
    });
  });

  test.describe('Masonry Demo Page', () => {
    test('should load masonry demo page correctly', async ({ page }) => {
      await page.goto('/demo/components/masonry');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Check for masonry layout
      await expect(page.locator('body')).toBeVisible();
      
      // Look for masonry grid elements
      const masonryElements = page.locator('.masonry, .grid, [data-testid*="masonry"]');
      const gridItems = page.locator('.grid-item, .masonry-item, [data-testid*="item"]');
      
      if (await masonryElements.count() > 0) {
        await expect(masonryElements.first()).toBeVisible();
      }
      
      if (await gridItems.count() > 0) {
        await expect(gridItems.first()).toBeVisible();
        
        // Check that multiple items are present
        expect(await gridItems.count()).toBeGreaterThan(1);
      }
      
      // Take screenshot for visual verification
      await page.screenshot({
        path: './tests/screenshots/masonry-demo-page.png',
        fullPage: true,
      });
    });

    test('should display masonry layout with different sized items', async ({ page }) => {
      await page.goto('/demo/components/masonry');
      await page.waitForLoadState('networkidle');
      
      // Check for items with different heights/sizes
      const items = page.locator('.grid-item, .masonry-item, [data-testid*="item"]');
      if (await items.count() > 2) {
        const firstItem = items.nth(0);
        const secondItem = items.nth(1);
        const thirdItem = items.nth(2);
        
        // Get bounding boxes to check for different sizes
        const firstBox = await firstItem.boundingBox();
        const secondBox = await secondItem.boundingBox();
        const thirdBox = await thirdItem.boundingBox();
        
        if (firstBox && secondBox && thirdBox) {
          // Check that items have different heights (masonry characteristic)
          const heights = [firstBox.height, secondBox.height, thirdBox.height];
          const uniqueHeights = [...new Set(heights)];
          expect(uniqueHeights.length).toBeGreaterThan(1);
        }
      }
    });

    test('should handle masonry item interactions', async ({ page }) => {
      await page.goto('/demo/components/masonry');
      await page.waitForLoadState('networkidle');
      
      // Test clicking on masonry items
      const items = page.locator('.grid-item, .masonry-item, [data-testid*="item"]');
      if (await items.count() > 0) {
        const firstItem = items.first();
        await expect(firstItem).toBeVisible();
        
        // Click on the item
        await firstItem.click();
        await page.waitForTimeout(500);
        
        // Check if modal or detail view opens
        const modal = page.locator('.modal, .popup, .detail-view, [data-testid*="modal"]');
        if (await modal.count() > 0) {
          await expect(modal.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Review Ranking Demo Page', () => {
    test('should load review ranking demo page correctly', async ({ page }) => {
      await page.goto('/demo/components/review-ranking');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Check for review ranking interface
      await expect(page.locator('body')).toBeVisible();
      
      // Look for ranking elements
      const rankingElements = page.locator('.ranking, .review, [data-testid*="ranking"], [data-testid*="review"]');
      const starElements = page.locator('.star, .rating, [data-testid*="star"], [data-testid*="rating"]');
      
      if (await rankingElements.count() > 0) {
        await expect(rankingElements.first()).toBeVisible();
      }
      
      if (await starElements.count() > 0) {
        await expect(starElements.first()).toBeVisible();
      }
      
      // Take screenshot for visual verification
      await page.screenshot({
        path: './tests/screenshots/review-ranking-demo-page.png',
        fullPage: true,
      });
    });

    test('should display rating system (1-10 stars)', async ({ page }) => {
      await page.goto('/demo/components/review-ranking');
      await page.waitForLoadState('networkidle');
      
      // Look for star rating system
      const stars = page.locator('.star, [data-testid*="star"]');
      if (await stars.count() > 0) {
        // Check if we have a 1-10 rating system
        const starCount = await stars.count();
        expect(starCount).toBeGreaterThanOrEqual(5); // At least 5 stars visible
        expect(starCount).toBeLessThanOrEqual(10); // At most 10 stars
      }
      
      // Look for rating numbers or values
      const ratingValues = page.locator('.rating-value, [data-testid*="rating-value"]');
      if (await ratingValues.count() > 0) {
        const ratingText = await ratingValues.first().textContent();
        expect(ratingText).toBeTruthy();
      }
    });

    test('should handle rating interactions', async ({ page }) => {
      await page.goto('/demo/components/review-ranking');
      await page.waitForLoadState('networkidle');
      
      // Test clicking on stars to rate
      const stars = page.locator('.star, [data-testid*="star"]');
      if (await stars.count() > 0) {
        const thirdStar = stars.nth(2); // Click on 3rd star
        await expect(thirdStar).toBeVisible();
        
        await thirdStar.click();
        await page.waitForTimeout(300);
        
        // Check if rating was applied
        const activeStars = page.locator('.star.active, .star.filled, [data-testid*="star"].active');
        if (await activeStars.count() > 0) {
          expect(await activeStars.count()).toBeGreaterThanOrEqual(3);
        }
      }
    });
  });

  test.describe('Carousel Demo Page', () => {
    test('should load carousel demo page correctly', async ({ page }) => {
      await page.goto('/carousel-demo');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Check for carousel demo interface
      await expect(page.locator('body')).toBeVisible();
      
      // Look for carousel elements
      const carouselElements = page.locator('.carousel, [data-testid*="carousel"]');
      if (await carouselElements.count() > 0) {
        await expect(carouselElements.first()).toBeVisible();
      }
      
      // Take screenshot for visual verification
      await page.screenshot({
        path: './tests/screenshots/carousel-demo-page.png',
        fullPage: true,
      });
    });
  });

  test.describe('Components Demo Page', () => {
    test('should load components demo page correctly', async ({ page }) => {
      await page.goto('/components-demo');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Check for components demo interface
      await expect(page.locator('body')).toBeVisible();
      
      // Take screenshot for visual verification
      await page.screenshot({
        path: './tests/screenshots/components-demo-page.png',
        fullPage: true,
      });
    });
  });

  // Test responsive design for all demo pages
  test.describe('Demo Pages Responsive Design', () => {
    const demoPages = [
      '/demo/components',
      '/demo/components/masonry',
      '/demo/components/review-ranking',
      '/carousel-demo',
      '/components-demo'
    ];
    
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 720 }
    ];

    for (const demoPage of demoPages) {
      for (const viewport of viewports) {
        test(`${demoPage} should be responsive on ${viewport.name}`, async ({ page }) => {
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          await page.goto(demoPage);
          await page.waitForLoadState('networkidle');
          
          // Check that page is visible and not broken
          await expect(page.locator('body')).toBeVisible();
          
          // Take screenshot for visual verification
          const pageName = demoPage.replace(/\//g, '-').replace(/^-/, '');
          await page.screenshot({
            path: `./tests/screenshots/${pageName}-${viewport.name}.png`,
            fullPage: true,
          });
        });
      }
    }
  });

  // Test component functionality across demo pages
  test.describe('Component Functionality Tests', () => {
    test('should demonstrate dating platform features in components', async ({ page }) => {
      const demoPages = ['/demo/components', '/demo/components/review-ranking'];
      
      for (const demoPage of demoPages) {
        await page.goto(demoPage);
        await page.waitForLoadState('networkidle');
        
        // Look for dating platform specific elements
        const profileElements = page.locator('.profile, [data-testid*="profile"]');
        const ratingElements = page.locator('.rating, .star, [data-testid*="rating"]');
        const matchElements = page.locator('.match, [data-testid*="match"]');
        
        // At least one type of dating platform element should be present
        const elementCounts = [
          await profileElements.count(),
          await ratingElements.count(),
          await matchElements.count()
        ];
        
        const totalElements = elementCounts.reduce((sum, count) => sum + count, 0);
        expect(totalElements).toBeGreaterThan(0);
      }
    });
  });
});
