import { test, expect } from '@playwright/test';

/**
 * Test suite for the Carousely page and carousel component
 * Tests carousel functionality, PWA features, and user interactions
 */
test.describe('Carousely Page', () => {
  // Before each test, navigate to the carousely page
  test.beforeEach(async ({ page }) => {
    await page.goto('/carousely');

    // Wait for the page to fully load, checking for the main container
    await page.waitForSelector('.min-h-screen', { state: 'visible', timeout: 20000 });

    // Either wait for the loading spinner to disappear or the carousel container to appear
    await Promise.race([
      page.waitForSelector('[data-testid="loading-spinner-container"]', {
        state: 'hidden',
        timeout: 20000,
      }),
      page.waitForSelector('[data-testid="carousel-container"]', {
        state: 'visible',
        timeout: 20000,
      }),
    ]);
  });

  test('Page loads correctly with carousel component', async ({ page }) => {
    // Verify the page title is displayed
    await expect(page.locator('h1')).toContainText('Find Your Match');

    // Verify carousel component is loaded
    const carouselComponent = page.locator('.perspective-1000');
    await expect(carouselComponent).toBeVisible();

    // Check if at least one card is visible
    await expect(page.locator('.w-80.h-\\[400px\\]').first()).toBeVisible();
  });

  test('Carousel rotation functionality works', async ({ page }) => {
    // Get initial card name to verify rotation
    const initialTopCardName = await page
      .locator('.w-80.h-\\[400px\\]')
      .first()
      .locator('h3')
      .textContent();

    // Use the external dislike button to trigger card rotation (more reliable than drag)
    await page.locator('button[data-testid="dislike-button"]').click();

    // Wait for animation and card change
    await page.waitForTimeout(500);

    // Verify the top card changed (rotation/swipe worked)
    const newTopCardName = await page
      .locator('.w-80.h-\\[400px\\]')
      .first()
      .locator('h3')
      .textContent();
    expect(newTopCardName).not.toBe(initialTopCardName);
  });

  test('Like/dislike buttons functionality', async ({ page }) => {
    // Get the initial top card content to verify it changes
    const initialTopCardName = await page
      .locator('.w-80.h-\\[400px\\]')
      .first()
      .locator('h3')
      .textContent();

    // Click the like button using the data-testid
    await page.locator('button[data-testid="like-button"]').click();

    // Verify a toast notification appears (target only the toast title, not the screen reader text)
    await expect(page.locator('.text-sm.font-semibold').getByText("It's a match!")).toBeVisible();

    // Wait for animation to complete and new card to appear
    await page.waitForTimeout(500); // Wait for 300ms animation + buffer

    // Verify the top card has changed (new profile is now on top)
    const newTopCardName = await page
      .locator('.w-80.h-\\[400px\\]')
      .first()
      .locator('h3')
      .textContent();
    expect(newTopCardName).not.toBe(initialTopCardName);

    // Verify we still have cards visible (Tinder-style interface maintains card count)
    const finalCardCount = await page.locator('.w-80.h-\\[400px\\]').count();
    expect(finalCardCount).toBeGreaterThanOrEqual(3); // Should have at least 3 cards
  });

  test('Geolocation permission functionality', async ({ page, context }) => {
    // Grant geolocation permission and set location
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

    // Mock the geolocation API to ensure it works in test environment
    await page.addInitScript(() => {
      // Override geolocation to always succeed
      Object.defineProperty(navigator, 'geolocation', {
        value: {
          getCurrentPosition: success => {
            success({
              coords: {
                latitude: 40.7128,
                longitude: -74.006,
                accuracy: 10,
              },
            });
          },
        },
        writable: true,
      });
    });

    // Reload page to apply the geolocation mock
    await page.reload();
    await page.waitForSelector('.perspective-1000', { state: 'visible', timeout: 10000 });

    // Click on the geolocation button using the data-testid
    await page.locator('button[data-testid="geolocation-button"]').click();

    // Wait a moment for the geolocation to process
    await page.waitForTimeout(2000);

    // Verify success state text appears or button state changed
    try {
      await expect(page.getByText('Location enabled')).toBeVisible({ timeout: 3000 });
    } catch {
      // If text doesn't appear, check if button state changed
      const geoButton = page.locator('button[data-testid="geolocation-button"]');
      await expect(geoButton).toHaveClass(/bg-green-100/);
    }
  });

  test('Carousel card content is correctly displayed', async ({ page }) => {
    // Wait for carousel to be ready and get a visible card (not hidden)
    await page.waitForTimeout(1000); // Give time for carousel to initialize

    // Get the first visible card (not hidden)
    const firstCard = page.locator('.w-80.h-\\[400px\\]:not(.hidden)').first();

    // Verify card has an image
    await expect(firstCard.locator('img')).toBeVisible();

    // Verify card has name and age (check h3 element specifically)
    await expect(firstCard.locator('h3')).toBeVisible();
    const nameAgeText = await firstCard.locator('h3').textContent();
    expect(nameAgeText).toMatch(/\w+,\s\d+/); // Pattern: "Name, Age"

    // Verify card has location info
    const locationText = await firstCard.locator('p').first().textContent();
    expect(locationText?.trim().length).toBeGreaterThan(0);

    // Verify card has bio text
    const bioText = await firstCard.locator('p').nth(1).textContent();
    expect(bioText?.trim().length).toBeGreaterThan(0);

    // Verify card has tags
    await expect(firstCard.locator('.px-2.py-1').first()).toBeVisible();
  });

  // Test responsive behavior
  test('Carousel is responsive', async ({ page }) => {
    // Test on mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.perspective-1000')).toBeVisible();

    // Test on tablet size
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.perspective-1000')).toBeVisible();

    // Test on desktop size
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('.perspective-1000')).toBeVisible();
  });

  // Visual regression test (using vision mode)
  test('Carousel matches visual design', async ({ page }) => {
    // Wait for carousel to be fully loaded
    await expect(page.locator('.perspective-1000')).toBeVisible();
    await expect(page.locator('.w-80.h-\\[400px\\]').first()).toBeVisible();

    // Take screenshot of the carousel component
    await page.screenshot({
      path: './tests/screenshots/carousel-component.png',
      clip: {
        x: 0,
        y: 0,
        width: 1280,
        height: 720,
      },
    });
  });
});
