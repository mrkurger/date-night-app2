import { test, expect } from '@playwright/test';

/**
 * Test suite for Travel Itinerary feature
 */
test.describe('Travel Itinerary Feature', () => {
  test.describe('Travel Itinerary Page', () => {
    test('should load the travel itinerary page correctly', async ({ page }) => {
      await page.goto('/travel');

      // Check if the page title is visible
      await expect(page.locator('h1')).toContainText('Travel Itinerary');

      // Check if the create button is visible
      await expect(page.getByRole('link', { name: 'Create New Itinerary' })).toBeVisible();

      // Check if tab options are visible
      await expect(page.getByRole('tab', { name: 'Map View' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'List View' })).toBeVisible();

      // Take screenshot for visual verification
      await page.screenshot({ path: './tests/screenshots/travel-page.png', fullPage: true });
    });

    test('should switch between map and list views', async ({ page }) => {
      await page.goto('/travel');

      // Default view should be map
      await expect(page.getByRole('tab', { name: 'Map View' })).toHaveAttribute(
        'aria-selected',
        'true',
      );

      // Switch to list view
      await page.getByRole('tab', { name: 'List View' }).click();
      await expect(page.getByRole('tab', { name: 'List View' })).toHaveAttribute(
        'aria-selected',
        'true',
      );

      // Check if list content is visible
      await expect(page.getByText('Your Travel Itineraries')).toBeVisible();

      // Switch back to map view
      await page.getByRole('tab', { name: 'Map View' }).click();
      await expect(page.getByRole('tab', { name: 'Map View' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
    });
  });

  test.describe('Create Itinerary Page', () => {
    test('should load the create itinerary page correctly', async ({ page }) => {
      // Navigate to create page
      await page.goto('/travel/create');

      // Check if form elements are visible
      await expect(page.locator('h1')).toContainText('Create Travel Itinerary');
      await expect(page.getByText('New Travel Itinerary')).toBeVisible();
      await expect(page.getByText('Destination')).toBeVisible();
      await expect(page.getByText('Travel Dates')).toBeVisible();
      await expect(page.getByText('Include Accommodation Details')).toBeVisible();

      // Take screenshot for visual verification
      await page.screenshot({
        path: './tests/screenshots/create-itinerary-page.png',
        fullPage: true,
      });
    });

    test('should toggle accommodation fields when checkbox is clicked', async ({ page }) => {
      await page.goto('/travel/create');

      // Initially, accommodation fields should not be visible
      await expect(page.getByText('Accommodation Details')).not.toBeVisible();

      // Toggle accommodation switch
      await page.getByRole('switch', { name: 'Include Accommodation Details' }).click();

      // Now accommodation fields should be visible
      await expect(page.getByText('Accommodation Details')).toBeVisible();
      await expect(page.getByLabel('Accommodation Name')).toBeVisible();
      await expect(page.getByLabel('Address')).toBeVisible();

      // Toggle it off again
      await page.getByRole('switch', { name: 'Include Accommodation Details' }).click();

      // Accommodation fields should be hidden again
      await expect(page.getByText('Accommodation Details')).not.toBeVisible();
    });
  });

  test.describe('Itinerary List Functionality', () => {
    test('should display itineraries and allow filtering', async ({ page }) => {
      await page.goto('/travel');

      // Switch to list view
      await page.getByRole('tab', { name: 'List View' }).click();

      // Wait for list to load
      await page.waitForTimeout(1500); // Wait for mock data to load

      // Check if the sample itineraries are visible
      await expect(page.getByText('Oslo, Oslo')).toBeVisible();
      await expect(page.getByText('Bergen, Vestland')).toBeVisible();
      await expect(page.getByText('Trondheim, Trøndelag')).toBeVisible();

      // Check filtering functionality
      await page.getByText('All statuses').click();
      await page.getByRole('option', { name: 'Planned' }).click();

      // After filtering, only planned itineraries should be visible
      await expect(page.getByText('Oslo, Oslo')).toBeVisible();

      // Take screenshot of filtered list
      await page.screenshot({
        path: './tests/screenshots/filtered-itineraries.png',
        fullPage: true,
      });
    });

    test('should change sorting order', async ({ page }) => {
      await page.goto('/travel');

      // Switch to list view
      await page.getByRole('tab', { name: 'List View' }).click();

      // Wait for list to load
      await page.waitForTimeout(1500);

      // Open sort dropdown and select "City (A-Z)"
      await page.getByText('Date (earliest first)').click();
      await page.getByRole('option', { name: 'City (A-Z)' }).click();

      // Take screenshot of sorted list
      await page.screenshot({ path: './tests/screenshots/sorted-itineraries.png', fullPage: true });
    });
  });

  test.describe('Itinerary Detail Page', () => {
    test('should display itinerary details correctly', async ({ page }) => {
      // Navigate to a specific itinerary (we're using mock data with ID 1)
      await page.goto('/travel/1');

      // Wait for content to load
      await page.waitForTimeout(1000);

      // Check if the page has loaded with the correct details
      await expect(page.locator('h1')).toContainText('Itinerary Details');
      await expect(page.getByText('Oslo, Oslo')).toBeVisible();

      // Check for accommodation details
      await expect(page.getByText('Accommodation')).toBeVisible();
      await expect(page.getByText('Grand Hotel Oslo')).toBeVisible();

      // Check for actions
      await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Cancel Itinerary' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Share' })).toBeVisible();

      // Check for map
      await expect(page.locator('.leaflet-container')).toBeVisible();

      // Take a screenshot
      await page.screenshot({
        path: './tests/screenshots/itinerary-detail.png',
        fullPage: true,
      });
    });

    test('should navigate back to the list from detail view', async ({ page }) => {
      await page.goto('/travel/1');

      // Click the back button
      await page.getByRole('button', { name: 'Back' }).click();

      // Check we're back on the main travel page
      await expect(page.locator('h1')).toContainText('Travel Itinerary');
      await expect(page.getByRole('tab', { name: 'Map View' })).toBeVisible();
    });
  });
});
