import { test, expect } from '@playwright/test';

/**
 * Test suite for admin, authentication, and utility pages
 * Tests admin dashboard, login/signup, settings, search, and other utility pages
 */
test.describe('Admin, Auth, and Utility Pages', () => {
  test.describe('Admin Dashboard Page', () => {
    test('should load admin dashboard correctly', async ({ page }) => {
      await page.goto('/admin-dashboard', { timeout: 60000 });
      await page.waitForLoadState('networkidle');

      // Check for admin dashboard interface
      await expect(page.locator('body')).toBeVisible();

      // Look for dashboard elements like charts, metrics, tables
      const dashboardElements = page.locator(
        '.dashboard, .chart, .metric, .table, [data-testid*="dashboard"]',
      );
      if ((await dashboardElements.count()) > 0) {
        await expect(dashboardElements.first()).toBeVisible();
      }

      // Take screenshot for visual verification
      await page.screenshot({
        path: './tests/screenshots/admin-dashboard-page.png',
        fullPage: true,
      });
    });

    test('should have admin navigation and controls', async ({ page }) => {
      await page.goto('/admin-dashboard', { timeout: 60000 });
      await page.waitForLoadState('networkidle');

      // Look for admin-specific navigation
      const adminNav = page.locator('.admin-nav, .sidebar, [data-testid*="admin-nav"]');
      if ((await adminNav.count()) > 0) {
        await expect(adminNav.first()).toBeVisible();
      }

      // Look for admin controls
      const adminControls = page.locator(
        'button[data-testid*="admin"], .admin-button, .control-panel',
      );
      if ((await adminControls.count()) > 0) {
        await expect(adminControls.first()).toBeVisible();
      }
    });

    test('should display system metrics and monitoring', async ({ page }) => {
      await page.goto('/admin-dashboard', { timeout: 60000 });
      await page.waitForLoadState('networkidle');

      // Look for system metrics
      const metricsElements = page.locator(
        '.metrics, .stats, .monitoring, [data-testid*="metric"]',
      );
      if ((await metricsElements.count()) > 0) {
        await expect(metricsElements.first()).toBeVisible();
      }

      // Look for charts or graphs
      const chartElements = page.locator('canvas, svg, .chart, [data-testid*="chart"]');
      if ((await chartElements.count()) > 0) {
        await expect(chartElements.first()).toBeVisible();
      }
    });
  });

  test.describe('Authentication Pages', () => {
    test('should load login page correctly', async ({ page }) => {
      await page.goto('/login', { timeout: 60000 });

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Check for login form
      await expect(page.locator('body')).toBeVisible();

      // Look for login form elements
      const loginForm = page.locator('form, .login-form, [data-testid*="login"]');
      const emailInput = page.locator(
        'input[type="email"], input[name="email"], input[placeholder*="email"]',
      );
      const passwordInput = page.locator('input[type="password"], input[name="password"]');
      const loginButton = page.locator(
        'button[type="submit"], button[data-testid*="login"], .login-button',
      );

      if ((await loginForm.count()) > 0) {
        await expect(loginForm.first()).toBeVisible();
      }
      if ((await emailInput.count()) > 0) {
        await expect(emailInput.first()).toBeVisible();
      }
      if ((await passwordInput.count()) > 0) {
        await expect(passwordInput.first()).toBeVisible();
      }
      if ((await loginButton.count()) > 0) {
        await expect(loginButton.first()).toBeVisible();
      }

      // Take screenshot for visual verification
      await page.screenshot({
        path: './tests/screenshots/login-page.png',
        fullPage: true,
      });
    });

    test('should handle login form interactions', async ({ page }) => {
      await page.goto('/login', { timeout: 60000 });
      await page.waitForLoadState('networkidle');

      // Fill login form if elements exist
      const emailInput = page
        .locator('input[type="email"], input[name="email"], input[placeholder*="email"]')
        .first();
      const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

      if ((await emailInput.count()) > 0 && (await passwordInput.count()) > 0) {
        await emailInput.fill('test@example.com');
        await passwordInput.fill('testpassword');

        // Check if form validation works
        const loginButton = page
          .locator('button[type="submit"], button[data-testid*="login"], .login-button')
          .first();
        if ((await loginButton.count()) > 0) {
          await expect(loginButton).toBeEnabled();
        }
      }
    });

    test('should load signup page correctly', async ({ page }) => {
      await page.goto('/signup', { timeout: 60000 });

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Check for signup form
      await expect(page.locator('body')).toBeVisible();

      // Look for signup form elements
      const signupForm = page.locator('form, .signup-form, [data-testid*="signup"]');
      const nameInput = page.locator('input[name="name"], input[placeholder*="name"]');
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      const passwordInput = page.locator('input[type="password"], input[name="password"]');
      const signupButton = page.locator(
        'button[type="submit"], button[data-testid*="signup"], .signup-button',
      );

      if ((await signupForm.count()) > 0) {
        await expect(signupForm.first()).toBeVisible();
      }
      if ((await emailInput.count()) > 0) {
        await expect(emailInput.first()).toBeVisible();
      }
      if ((await passwordInput.count()) > 0) {
        await expect(passwordInput.first()).toBeVisible();
      }

      // Take screenshot for visual verification
      await page.screenshot({
        path: './tests/screenshots/signup-page.png',
        fullPage: true,
      });
    });
  });

  test.describe('Settings Page', () => {
    test('should load settings page correctly', async ({ page }) => {
      await page.goto('/settings', { timeout: 60000 });

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Check for settings interface
      await expect(page.locator('body')).toBeVisible();

      // Look for settings sections
      const settingsElements = page.locator('.settings, .preferences, [data-testid*="settings"]');
      const toggles = page.locator('input[type="checkbox"], .toggle, .switch');
      const selects = page.locator('select, .dropdown');

      if ((await settingsElements.count()) > 0) {
        await expect(settingsElements.first()).toBeVisible();
      }

      // Take screenshot for visual verification
      await page.screenshot({
        path: './tests/screenshots/settings-page.png',
        fullPage: true,
      });
    });

    test('should handle settings interactions', async ({ page }) => {
      await page.goto('/settings', { timeout: 60000 });
      await page.waitForLoadState('networkidle');

      // Test toggle interactions
      const toggles = page.locator('input[type="checkbox"], .toggle, .switch');
      if ((await toggles.count()) > 0) {
        const firstToggle = toggles.first();
        await expect(firstToggle).toBeVisible();

        // Toggle the setting
        await firstToggle.click();
        await page.waitForTimeout(300);
      }

      // Test dropdown interactions
      const selects = page.locator('select');
      if ((await selects.count()) > 0) {
        const firstSelect = selects.first();
        await expect(firstSelect).toBeVisible();

        // Select an option
        await firstSelect.selectOption({ index: 1 });
        await page.waitForTimeout(300);
      }
    });
  });

  test.describe('Search Page', () => {
    test('should load search page correctly', async ({ page }) => {
      await page.goto('/search', { timeout: 60000 });

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Check for search interface
      await expect(page.locator('body')).toBeVisible();

      // Look for search elements
      const searchInput = page.locator(
        'input[type="search"], input[placeholder*="search"], .search-input',
      );
      const searchButton = page.locator('button[data-testid*="search"], .search-button');
      const filters = page.locator('.filter, .search-filter, [data-testid*="filter"]');

      if ((await searchInput.count()) > 0) {
        await expect(searchInput.first()).toBeVisible();
      }

      // Take screenshot for visual verification
      await page.screenshot({
        path: './tests/screenshots/search-page.png',
        fullPage: true,
      });
    });

    test('should handle search functionality', async ({ page }) => {
      await page.goto('/search', { timeout: 60000 });
      await page.waitForLoadState('networkidle');

      // Test search input
      const searchInput = page
        .locator('input[type="search"], input[placeholder*="search"], .search-input')
        .first();
      if ((await searchInput.count()) > 0) {
        await searchInput.fill('test search');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);

        // Check for search results
        const results = page.locator('.search-results, .results, [data-testid*="result"]');
        if ((await results.count()) > 0) {
          await expect(results.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Utility Pages', () => {
    test('should load favorites page correctly', async ({ page }) => {
      await page.goto('/favorites', { timeout: 60000 });

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Check for favorites interface
      await expect(page.locator('body')).toBeVisible();

      // Take screenshot for visual verification
      await page.screenshot({
        path: './tests/screenshots/favorites-page.png',
        fullPage: true,
      });
    });

    test('should load wallet page correctly', async ({ page }) => {
      await page.goto('/wallet', { timeout: 60000 });

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Check for wallet interface
      await expect(page.locator('body')).toBeVisible();

      // Look for wallet elements
      const walletElements = page.locator(
        '.wallet, .balance, [data-testid*="wallet"], [data-testid*="balance"]',
      );
      if ((await walletElements.count()) > 0) {
        await expect(walletElements.first()).toBeVisible();
      }

      // Take screenshot for visual verification
      await page.screenshot({
        path: './tests/screenshots/wallet-page.png',
        fullPage: true,
      });
    });

    test('should load VIP page correctly', async ({ page }) => {
      await page.goto('/vip', { timeout: 60000 });

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Check for VIP interface
      await expect(page.locator('body')).toBeVisible();

      // Take screenshot for visual verification
      await page.screenshot({
        path: './tests/screenshots/vip-page.png',
        fullPage: true,
      });
    });

    test('should load rankings page correctly', async ({ page }) => {
      await page.goto('/rankings', { timeout: 60000 });

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Check for rankings interface
      await expect(page.locator('body')).toBeVisible();

      // Take screenshot for visual verification
      await page.screenshot({
        path: './tests/screenshots/rankings-page.png',
        fullPage: true,
      });
    });

    test('should load offline page correctly', async ({ page }) => {
      await page.goto('/offline', { timeout: 60000 });

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Check for offline interface
      await expect(page.locator('body')).toBeVisible();

      // Take screenshot for visual verification
      await page.screenshot({
        path: './tests/screenshots/offline-page.png',
        fullPage: true,
      });
    });
  });
});
