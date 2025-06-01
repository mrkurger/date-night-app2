const { chromium } = require('playwright');

async function takeScreenshots() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1200, height: 800 }
  });
  const page = await context.newPage();

  try {
    // Screenshot of carousely page
    console.log('Taking screenshot of carousely page...');
    await page.goto('http://localhost:3000/carousely');
    await page.waitForTimeout(3000); // Wait for images to load
    await page.screenshot({ 
      path: 'screenshots/carousely-current.png',
      fullPage: true 
    });
    console.log('Carousely screenshot saved to screenshots/carousely-current.png');

    // Screenshot of tinder page
    console.log('Taking screenshot of tinder page...');
    await page.goto('http://localhost:3000/tinder');
    await page.waitForTimeout(3000); // Wait for images to load
    await page.screenshot({ 
      path: 'screenshots/tinder-current.png',
      fullPage: true 
    });
    console.log('Tinder screenshot saved to screenshots/tinder-current.png');

  } catch (error) {
    console.error('Error taking screenshots:', error);
  } finally {
    await browser.close();
  }
}

takeScreenshots();
