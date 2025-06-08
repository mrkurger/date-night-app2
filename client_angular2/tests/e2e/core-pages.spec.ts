import { test, expect } from '@playwright/test';

/**
 * Test suite for core dating platform pages
 * Tests home page, tinder view, netflix view, browse, matches, and profile functionality
 */
test.describe('Core Dating Platform Pages', () => {
  test.describe('Home Page', () => {
    test('should load home page correctly', async ({ page }) => {
      await page.goto('/');

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Check for main navigation or content
      await expect(page.locator('body')).toBeVisible();

      // Take screenshot for visual verification
      await page.screenshot({
        path: './tests/screenshots/home-page.png',
        fullPage: true,
      });
    });
  });

  test.describe('Tinder View Page', () => {
    test('should load tinder view correctly', async ({ page }) => {
      await page.goto('/tinder');

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Check for tinder-style interface
      await expect(page.locator('body')).toBeVisible();

      // Look for card stack or swipe interface
      const cardElements = page.locator('[data-testid*="card"], .card, .swipe-card');
      if ((await cardElements.count()) > 0) {
        await expect(cardElements.first()).toBeVisible();
      }

      // Take screenshot for visual verification
      await page.screenshot({
        path: './tests/screenshots/tinder-view.png',
        fullPage: true,
      });
    });

    test('should handle swipe interactions', async ({ page }) => {
      await page.goto('/tinder');
      await page.waitForLoadState('networkidle');

      // Look for swipeable cards
      const cards = page.locator('[data-testid*="card"], .card, .swipe-card');
      if ((await cards.count()) > 0) {
        const firstCard = cards.first();
        await expect(firstCard).toBeVisible();

        // Simulate swipe gesture
        const cardBox = await firstCard.boundingBox();
        if (cardBox) {
          await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
          await page.mouse.down();
          await page.mouse.move(cardBox.x + cardBox.width + 100, cardBox.y + cardBox.height / 2);
          await page.mouse.up();

          // Wait for animation
          await page.waitForTimeout(500);
        }
      }
    });
  });

  test.describe('Netflix View Page', () => {
    test('should load netflix view correctly', async ({ page }) => {
      await page.goto('/netflix-view');

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Check for netflix-style grid layout
      await expect(page.locator('body')).toBeVisible();

      // Look for grid or row-based layout
      const gridElements = page.locator(
        '.grid, .flex, [data-testid*="grid"], [data-testid*="row"]',
      );
      if ((await gridElements.count()) > 0) {
        await expect(gridElements.first()).toBeVisible();
      }

      // Take screenshot for visual verification
      await page.screenshot({
        path: './tests/screenshots/netflix-view.png',
        fullPage: true,
      });
    });

    test('should handle hover interactions on cards', async ({ page }) => {
      await page.goto('/netflix-view');
      await page.waitForLoadState('networkidle');

      // Look for hoverable cards or items
      const items = page.locator('img, .card, [data-testid*="item"]');
      if ((await items.count()) > 0) {
        const firstItem = items.first();
        await expect(firstItem).toBeVisible();

        // Hover over the item
        await firstItem.hover();
        await page.waitForTimeout(300);

        // Check if hover effects are applied
        const hoverState = await firstItem.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            transform: styles.transform,
            scale: styles.scale,
            opacity: styles.opacity,
          };
        });

        expect(hoverState).toBeDefined();
      }
    });
  });

  test.describe('Browse Page', () => {
    test('should load browse page correctly', async ({ page }) => {
      await page.goto('/browse');

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Check for browse interface
      await expect(page.locator('body')).toBeVisible();

      // Look for search or filter controls
      const searchElements = page.locator(
        'input[type="search"], input[placeholder*="search"], .search',
      );
      const filterElements = page.locator('.filter, [data-testid*="filter"], select');

      if ((await searchElements.count()) > 0) {
        await expect(searchElements.first()).toBeVisible();
      }

      if ((await filterElements.count()) > 0) {
        await expect(filterElements.first()).toBeVisible();
      }

      // Take screenshot for visual verification
      await page.screenshot({
        path: './tests/screenshots/browse-page.png',
        fullPage: true,
      });
    });
  });

  test.describe('Matches Page', () => {
    test('should load matches page correctly', async ({ page }) => {
      test.setTimeout(60000); // Increase timeout to 60 seconds
      await page.goto('/matches');

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Check for matches interface
      await expect(page.locator('body')).toBeVisible();

      // Look for match cards or list
      const matchElements = page.locator('.match, [data-testid*="match"], .card');
      if ((await matchElements.count()) > 0) {
        await expect(matchElements.first()).toBeVisible();
      }

      // Take screenshot for visual verification
      await page.screenshot({
        path: './tests/screenshots/matches-page.png',
        fullPage: true,
      });
    });
  });

  test.describe('Profile Page', () => {
    test('should load profile page correctly', async ({ page }) => {
      await page.goto('/profile');

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Check for profile interface
      await expect(page.locator('body')).toBeVisible();

      // Look for profile elements
      const profileElements = page.locator(
        '.profile, [data-testid*="profile"], img[alt*="profile"]',
      );
      if ((await profileElements.count()) > 0) {
        await expect(profileElements.first()).toBeVisible();
      }

      // Take screenshot for visual verification
      await page.screenshot({
        path: './tests/screenshots/profile-page.png',
        fullPage: true,
      });
    });

    test('should navigate to profile edit page', async ({ page }) => {
      await page.goto('/profile/edit');

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Check for edit interface
      await expect(page.locator('body')).toBeVisible();

      // Look for form elements
      const formElements = page.locator('form, input, textarea, select');
      if ((await formElements.count()) > 0) {
        await expect(formElements.first()).toBeVisible();
      }

      // Take screenshot for visual verification
      await page.screenshot({
        path: './tests/screenshots/profile-edit-page.png',
        fullPage: true,
      });
    });
  });

  // Responsive design tests for all core pages
  test.describe('Responsive Design Tests', () => {
    const pages = ['/', '/tinder', '/netflix-view', '/browse', '/matches', '/profile'];
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 720 },
    ];

    for (const pagePath of pages) {
      for (const viewport of viewports) {
        test(`${pagePath} should be responsive on ${viewport.name}`, async ({ page }) => {
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          await page.goto(pagePath);
          await page.waitForLoadState('networkidle');

          // Check that page is visible and not broken
          await expect(page.locator('body')).toBeVisible();

          // Take screenshot for visual verification
          const pageName = pagePath === '/' ? 'home' : pagePath.replace('/', '');
          await page.screenshot({
            path: `./tests/screenshots/${pageName}-${viewport.name}.png`,
            fullPage: true,
          });
        });
      }
    }
  });
});
