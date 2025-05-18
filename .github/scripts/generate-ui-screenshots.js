/**
 * generate-ui-screenshots.js
 *
 * Uses Puppeteer to generate screenshots of key user journeys or paths in your web app.
 * Usage: node .github/scripts/generate-ui-screenshots.js
 */

import puppeteer from 'puppeteer';
import fs from 'fs/promises';

/**
 * Define paths/journeys to screenshot.
 * Extend this array with more user flows as needed.
 */
const paths = [
  { url: 'http://localhost:3000/', name: 'home' },
  // TODO!: Add more user journey URLs here.
];

export default async function generateScreenshots() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await fs.mkdir('ui-screenshots', { recursive: true });
  for (const p of paths) {
    await page.goto(p.url, { waitUntil: 'networkidle2' });
    await page.screenshot({ path: `ui-screenshots/${p.name}.png` });
    console.log(`[generateScreenshots] Screenshot for ${p.url} saved as ${p.name}.png`);
  }
  await browser.close();
}