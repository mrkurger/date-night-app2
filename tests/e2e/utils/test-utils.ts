import { Page, Request, Response, expect } from '@playwright/test';

/**
 * Helper function to get console logs
 */
export async function getConsoleLogs(page: Page): Promise<string[]> {
  const logs: string[] = [];

  // Set up console log listener for future logs
  page.on('console', msg => {
    logs.push(`${msg.type()}: ${msg.text()}`);
  });

  return logs;
}

/**
 * Helper function to get network errors
 */
export async function getNetworkErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];

  // Set up network error listener for future errors
  page.on('requestfailed', request => {
    errors.push(`${request.url()} ${request.failure()?.errorText || 'unknown error'}`);
  });

  return errors;
}

/**
 * Monitor API requests and responses
 */
export async function monitorApiCalls(
  page: Page,
  urlPattern: string | RegExp,
): Promise<{ requests: Request[]; responses: Response[] }> {
  const requests: Request[] = [];
  const responses: Response[] = [];

  // Listen to all requests
  page.on('request', request => {
    if (request.url().match(urlPattern)) {
      requests.push(request);
    }
  });

  // Listen to all responses
  page.on('response', response => {
    if (response.url().match(urlPattern)) {
      responses.push(response);
    }
  });

  return { requests, responses };
}

/**
 * Helper function to wait for a specified time
 */
export async function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Helper to check if an element exists
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  const elements = await page.$$(selector);
  return elements.length > 0;
}

/**
 * Generate a random string for test data
 */
export function generateRandomString(length = 8): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

/**
 * Wait for network requests to complete
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Wait for Angular router navigation to complete
 */
export async function waitForAngularNavigation(page: Page, timeout = 10000): Promise<void> {
  try {
    await page.waitForFunction(
      () => {
        // For Angular
        const angular = (window as any).ng;
        if (angular?.probe) {
          const router = angular.probe(document.querySelector('app-root')).injector.get('Router');
          return !router.navigations?.next?.value;
        }
        return true;
      },
      { timeout },
    );
  } catch (error) {
    console.log('Angular navigation detection failed, continuing anyway');
  }
}

/**
 * Generate test data for forms
 */
export function generateTestUser(): {
  name: string;
  email: string;
  username: string;
  password: string;
} {
  const uuid = generateRandomString(6);
  return {
    name: `Test User ${uuid}`,
    email: `test.user.${uuid}@example.com`,
    username: `testuser_${uuid}`,
    password: `Password123!${uuid}`,
  };
}

/**
 * Take full page screenshot with timestamp
 */
export async function takeScreenshotWithTimestamp(page: Page, name: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `tests/e2e/screenshots/${name}_${timestamp}.png`;
  await page.screenshot({ path: filename, fullPage: true });
  return filename;
}

/**
 * Visual regression test helper
 */
export async function expectScreenshotMatch(page: Page, name: string): Promise<void> {
  const screenshot = await page.screenshot();
  expect(screenshot).toMatchSnapshot(`${name}.png`);
}
