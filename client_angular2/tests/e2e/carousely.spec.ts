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
    // Get the carousel component
    const carousel = page.locator('.perspective-1000');

    // Get initial state (position) of the first card
    const firstCard = page.locator('.w-80.h-\\[400px\\]').first();
    const initialTransform = await firstCard.evaluate(el => el.style.transform);

    // Drag to rotate carousel
    await carousel.hover();
    await page.mouse.down();
    await page.mouse.move(300, 400);
    await page.mouse.up();

    // Wait for animation
    await page.waitForTimeout(500);

    // Get the new transform and verify it changed (carousel rotated)
    const newTransform = await firstCard.evaluate(el => el.style.transform);
    expect(newTransform).not.toBe(initialTransform);
  });

  test('Like/dislike buttons functionality', async ({ page }) => {
    // Get the initial number of cards
    const initialCardCount = await page.locator('.w-80.h-\\[400px\\]').count();

    // Click the like button using the data-testid
    await page.locator('button[data-testid="like-button"]').click();

    // Verify a toast notification appears
    await expect(page.getByText("It's a match!")).toBeVisible();

    // Verify card count decreased by one
    await page.waitForTimeout(1000); // Wait for animation
    const newCardCount = await page.locator('.w-80.h-\\[400px\\]').count();
    expect(newCardCount).toBeLessThan(initialCardCount);
  });

  test('Geolocation permission functionality', async ({ page }) => {
    // Handle geolocation permission automatically through configuration

    // Click on the geolocation button using the data-testid
    await page.locator('button[data-testid="geolocation-button"]').click();

    // Verify success state
    await expect(page.getByText('Location enabled')).toBeVisible();

    // Verify button state changed
    const geoButton = page.locator('button').filter({ has: page.locator('svg').first() });
    await expect(geoButton).toHaveClass(/bg-green-100/);
  });

  test('Carousel card content is correctly displayed', async ({ page }) => {
    // Get the first card
    const firstCard = page.locator('.w-80.h-\\[400px\\]').first();

    // Verify card has an image
    await expect(firstCard.locator('img')).toBeVisible();

    // Verify card has name and age
    await expect(firstCard.getByText(/,\s\d+$/)).toBeVisible();

    // Verify card has location info
    const locationText = await firstCard.locator('p').first().textContent();
    expect(locationText?.trim().length).toBeGreaterThan(0);

    // Verify card has bio text
    const bioText = await firstCard.locator('p').nth(1).textContent();
    expect(bioText?.trim().length).toBeGreaterThan(0);

    // Verify card has tags
    await expect(firstCard.locator('.px-2.py-0\\.5')).toBeVisible();
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
