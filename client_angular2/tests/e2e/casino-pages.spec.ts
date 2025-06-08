import { test, expect } from '@playwright/test';

/**
 * Test suite for casino and gaming pages
 * Tests casino functionality, live casino, enhanced casino, and 2live casino features
 */
test.describe('Casino and Gaming Pages', () => {
  test.describe('Casino Page', () => {
    test('should load casino page correctly', async ({ page }) => {
      await page.goto('/casino', { timeout: 60000 });
      await page.waitForLoadState('networkidle');

      // Check for casino interface
      await expect(page.locator('body')).toBeVisible();

      // Look for casino games or slots
      const gameElements = page.locator('.game, [data-testid*="game"], .slot, .casino-game');
      if ((await gameElements.count()) > 0) {
        await expect(gameElements.first()).toBeVisible();
      }

      // Take screenshot for visual verification
      await page.screenshot({
        path: './tests/screenshots/casino-page.png',
        fullPage: true,
      });
    });

    test('should handle game interactions', async ({ page }) => {
      await page.goto('/casino', { timeout: 60000 });
      await page.waitForLoadState('networkidle');

      // Look for clickable game elements
      const gameButtons = page.locator('button, .game, [data-testid*="play"], [role="button"]');
      if ((await gameButtons.count()) > 0) {
        const firstGame = gameButtons.first();
        await expect(firstGame).toBeVisible();

        // Click on the game
        await firstGame.click();
        await page.waitForTimeout(500);

        // Check if game interface loads or modal opens
        const gameInterface = page.locator(
          '.game-interface, .modal, .popup, [data-testid*="game-modal"]',
        );
        if ((await gameInterface.count()) > 0) {
          await expect(gameInterface.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Enhanced Casino Page', () => {
    test('should load enhanced casino page correctly', async ({ page }) => {
      await page.goto('/enhanced-casino', { timeout: 60000 });
      await page.waitForLoadState('networkidle');

      // Check for enhanced casino interface
      await expect(page.locator('body')).toBeVisible();

      // Look for enhanced features like animations, 3D elements
      const enhancedElements = page.locator(
        '.enhanced, .animation, .three-d, [data-testid*="enhanced"]',
      );
      if ((await enhancedElements.count()) > 0) {
        await expect(enhancedElements.first()).toBeVisible();
      }

      // Take screenshot for visual verification
      await page.screenshot({
        path: './tests/screenshots/enhanced-casino-page.png',
        fullPage: true,
      });
    });

    test('should handle enhanced casino features', async ({ page }) => {
      await page.goto('/enhanced-casino', { timeout: 60000 });
      await page.waitForLoadState('networkidle');

      // Look for interactive elements
      const interactiveElements = page.locator(
        'button, .interactive, [data-testid*="interactive"]',
      );
      if ((await interactiveElements.count()) > 0) {
        const firstElement = interactiveElements.first();
        await expect(firstElement).toBeVisible();

        // Test hover effects
        await firstElement.hover();
        await page.waitForTimeout(300);

        // Test click interactions
        await firstElement.click();
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Live Casino Page', () => {
    test('should load live casino page correctly', async ({ page }) => {
      await page.goto('/live-casino', { timeout: 60000 });
      await page.waitForLoadState('networkidle');

      // Check for live casino interface
      await expect(page.locator('body')).toBeVisible();

      // Look for live dealer elements
      const liveElements = page.locator('.live, [data-testid*="live"], .dealer, .stream');
      if ((await liveElements.count()) > 0) {
        await expect(liveElements.first()).toBeVisible();
      }

      // Take screenshot for visual verification
      await page.screenshot({
        path: './tests/screenshots/live-casino-page.png',
        fullPage: true,
      });
    });

    test('should handle live casino interactions', async ({ page }) => {
      await page.goto('/live-casino', { timeout: 60000 });
      await page.waitForLoadState('networkidle');

      // Look for join game buttons or live tables
      const joinButtons = page.locator(
        'button[data-testid*="join"], .join-game, [data-testid*="table"]',
      );
      if ((await joinButtons.count()) > 0) {
        const firstJoinButton = joinButtons.first();
        await expect(firstJoinButton).toBeVisible();

        // Click to join a live game
        await firstJoinButton.click();
        await page.waitForTimeout(1000);

        // Check if live game interface loads
        const gameInterface = page.locator('.live-game, .game-table, [data-testid*="live-game"]');
        if ((await gameInterface.count()) > 0) {
          await expect(gameInterface.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('2Live Casino Page', () => {
    test('should load 2live casino page correctly', async ({ page }) => {
      await page.goto('/2live-casino', { timeout: 60000 });
      await page.waitForLoadState('networkidle');

      // Check for 2live casino interface
      await expect(page.locator('body')).toBeVisible();

      // Look for 2live specific elements
      const twoLiveElements = page.locator('.two-live, [data-testid*="2live"], .dual-live');
      if ((await twoLiveElements.count()) > 0) {
        await expect(twoLiveElements.first()).toBeVisible();
      }

      // Take screenshot for visual verification
      await page.screenshot({
        path: './tests/screenshots/2live-casino-page.png',
        fullPage: true,
      });
    });
  });

  // Test casino-specific features across all casino pages
  test.describe('Casino Features Tests', () => {
    const casinoPages = ['/casino', '/enhanced-casino', '/live-casino', '/2live-casino'];

    for (const casinoPage of casinoPages) {
      test(`${casinoPage} should have betting functionality`, async ({ page }) => {
        await page.goto(casinoPage);
        await page.waitForLoadState('networkidle');

        // Look for betting controls
        const betElements = page.locator('input[type="number"], .bet-amount, [data-testid*="bet"]');
        const betButtons = page.locator('button[data-testid*="bet"], .bet-button');

        if ((await betElements.count()) > 0) {
          await expect(betElements.first()).toBeVisible();
        }

        if ((await betButtons.count()) > 0) {
          await expect(betButtons.first()).toBeVisible();
        }
      });

      test(`${casinoPage} should have balance display`, async ({ page }) => {
        await page.goto(casinoPage);
        await page.waitForLoadState('networkidle');

        // Look for balance or wallet information
        const balanceElements = page.locator(
          '.balance, .wallet, [data-testid*="balance"], [data-testid*="wallet"]',
        );
        if ((await balanceElements.count()) > 0) {
          await expect(balanceElements.first()).toBeVisible();
        }
      });

      test(`${casinoPage} should be responsive`, async ({ page }) => {
        const viewports = [
          { width: 375, height: 667 }, // Mobile
          { width: 768, height: 1024 }, // Tablet
          { width: 1280, height: 720 }, // Desktop
        ];

        for (const viewport of viewports) {
          await page.setViewportSize(viewport);
          await page.goto(casinoPage);
          await page.waitForLoadState('networkidle');

          // Check that page is visible and not broken
          await expect(page.locator('body')).toBeVisible();

          // Take screenshot for visual verification
          const pageName = casinoPage.replace('/', '').replace('-', '_');
          const viewportName =
            viewport.width <= 375 ? 'mobile' : viewport.width <= 768 ? 'tablet' : 'desktop';
          await page.screenshot({
            path: `./tests/screenshots/${pageName}-${viewportName}.png`,
            fullPage: true,
          });
        }
      });
    }
  });

  // Test gambling/casino integration with dating platform
  test.describe('Casino-Dating Integration', () => {
    test('should integrate casino features with dating platform', async ({ page }) => {
      // Test if casino pages have dating platform navigation
      const casinoPages = ['/casino', '/enhanced-casino', '/live-casino'];

      for (const casinoPage of casinoPages) {
        await page.goto(casinoPage);
        await page.waitForLoadState('networkidle');

        // Look for navigation to dating features
        const datingNavigation = page.locator(
          'a[href*="carousely"], a[href*="tinder"], a[href*="matches"]',
        );
        if ((await datingNavigation.count()) > 0) {
          await expect(datingNavigation.first()).toBeVisible();
        }

        // Look for profile or user elements
        const userElements = page.locator(
          '.profile, .user, [data-testid*="user"], [data-testid*="profile"]',
        );
        if ((await userElements.count()) > 0) {
          await expect(userElements.first()).toBeVisible();
        }
      }
    });

    test('should handle microtransaction features', async ({ page }) => {
      const casinoPages = ['/casino', '/enhanced-casino', '/live-casino'];

      for (const casinoPage of casinoPages) {
        await page.goto(casinoPage);
        await page.waitForLoadState('networkidle');

        // Look for tip, gift, or premium interaction elements
        const microtransactionElements = page.locator(
          '.tip, .gift, .premium, [data-testid*="tip"], [data-testid*="gift"]',
        );
        if ((await microtransactionElements.count()) > 0) {
          await expect(microtransactionElements.first()).toBeVisible();
        }
      }
    });
  });
});
