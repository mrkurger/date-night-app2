import { test, expect } from '@playwright/test';

test.describe('PWA Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/carousely');
    // Wait for the content to load
    await page.waitForSelector('h1:has-text("Find Your Match")');
  });

  test('should register a service worker', async ({ page }) => {
    // Use JavaScript evaluation to check if service worker is registered
    const isServiceWorkerRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        return registrations.length > 0;
      }
      return false;
    });

    expect(isServiceWorkerRegistered).toBeTruthy();
  });

  test('should have a valid web app manifest', async ({ page, request }) => {
    // Check that manifest is linked in HTML
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json');

    // Fetch and validate manifest content
    const manifestUrl = '/manifest.json';
    const manifestResponse = await request.get(manifestUrl);
    expect(manifestResponse.ok()).toBeTruthy();

    const manifestJson = await manifestResponse.json();
    expect(manifestJson).toHaveProperty('name');
    expect(manifestJson).toHaveProperty('short_name');
    expect(manifestJson).toHaveProperty('start_url');
    expect(manifestJson).toHaveProperty('display', 'standalone');
    expect(manifestJson).toHaveProperty('icons');
  });

  test('should show geolocation permission UI', async ({ page }) => {
    // Wait for loading to complete
    await page.waitForSelector('.animate-spin', { state: 'detached', timeout: 10000 });

    // Mock geolocation permission
    await page.context().grantPermissions(['geolocation']);
    
    // Click the geolocation button
    await page.locator('[data-testid="geolocation-button"]').click();
    
    // Verify success message appears
    await expect(page.getByText('Location enabled')).toBeVisible();
    
    // Verify button state changes
    await expect(page.locator('[data-testid="geolocation-button"]')).toHaveClass(/bg-green-100/);
  });

  test('should handle offline mode gracefully', async ({ page }) => {
    // Wait for loading to complete and ensure content loads first
    await page.waitForSelector('.animate-spin', { state: 'detached', timeout: 10000 });
    await expect(page.locator('[data-testid="carousel-wheel"]')).toBeVisible();

    // Go offline
    await page.context().setOffline(true);
    
    // Reload the page
    await page.reload();
    
    // Check if offline fallback content is shown
    await expect(page.getByText(/You're offline|offline mode|connection/i)).toBeVisible();
    
    // Go back online
    await page.context().setOffline(false);
  });
});
