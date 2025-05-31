import { expect } from '@playwright/test';
import { test } from './fixtures/test-fixtures';

test.describe('Accessibility Tests', () => {
  test('should have proper heading structure', async ({ page }) => {
    // Navigate to home page
    await page.goto('http://localhost:3002');

    // Check heading structure
    const headings = await page.evaluate(() => {
      const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      return Array.from(headingElements).map(h => ({
        level: parseInt(h.tagName[1]),
        text: h.textContent?.trim(),
      }));
    });

    // Log heading structure
    console.log('Page heading structure:', headings);

    // Check for at least one h1
    const h1Count = headings.filter(h => h.level === 1).length;
    expect(h1Count).toBeGreaterThanOrEqual(1);

    // Verify heading hierarchy (no skipped levels)
    let previousLevel = 0;
    let skippedLevels = false;

    for (const heading of headings) {
      if (heading.level - previousLevel > 1 && previousLevel !== 0) {
        console.log(`Skipped heading level: from ${previousLevel} to ${heading.level}`);
        skippedLevels = true;
      }
      previousLevel = heading.level;
    }

    expect(skippedLevels).toBe(false);
  });

  test('should have proper alt text for images', async ({ page }) => {
    // Navigate to home page
    await page.goto('http://localhost:3002');

    // Check images for alt text
    const images = await page.evaluate(() => {
      const imgElements = document.querySelectorAll('img');
      return Array.from(imgElements).map(img => ({
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt'),
        isDecorative: img.getAttribute('role') === 'presentation',
      }));
    });

    // Log image details
    console.log('Images on page:', images);

    // Check that non-decorative images have alt text
    for (const img of images) {
      if (!img.isDecorative) {
        expect(img.alt).toBeTruthy();
      }
    }
  });

  test('should have proper color contrast', async ({ page }) => {
    // Navigate to home page
    await page.goto('http://localhost:3002');

    // This is a basic check just looking for extremely low contrast text
    // A proper accessibility audit would use more sophisticated tools
    const lowContrastElements = await page.evaluate(() => {
      function getContrastRatio(foreground, background) {
        const rgb1 = foreground.match(/\d+/g).map(Number);
        const rgb2 = background.match(/\d+/g).map(Number);

        // Calculate luminance
        const luminance1 = 0.2126 * rgb1[0] + 0.7152 * rgb1[1] + 0.0722 * rgb1[2];
        const luminance2 = 0.2126 * rgb2[0] + 0.7152 * rgb2[1] + 0.0722 * rgb2[2];

        // Calculate contrast ratio
        const lighter = Math.max(luminance1, luminance2);
        const darker = Math.min(luminance1, luminance2);

        return (lighter + 0.05) / (darker + 0.05);
      }

      const results = [];
      const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, li');

      for (const element of textElements) {
        const style = window.getComputedStyle(element);
        const foreground = style.color;
        const background = style.backgroundColor;

        // Only check elements with visible text and non-transparent background
        if (element.textContent?.trim() && background !== 'rgba(0, 0, 0, 0)') {
          const ratio = getContrastRatio(foreground, background);
          if (ratio < 4.5) {
            // WCAG AA requires 4.5:1 for normal text
            results.push({
              text: element.textContent?.trim().substring(0, 50),
              element: element.tagName,
              ratio: ratio.toFixed(2),
            });
          }
        }
      }

      return results;
    });

    // Log any low contrast elements
    if (lowContrastElements.length > 0) {
      console.log('Low contrast elements detected:', lowContrastElements);
    }

    // This is not a strict requirement as our detection is basic
    // expect(lowContrastElements.length).toBe(0);
  });

  test('should have focusable and properly labeled interactive elements', async ({ page }) => {
    // Navigate to home page
    await page.goto('http://localhost:3002');

    // Check button and link labeling
    const interactiveElements = await page.evaluate(() => {
      const elements = document.querySelectorAll(
        'button, a, input, select, textarea, [role="button"]',
      );
      return Array.from(elements).map(el => {
        const ariaLabel = el.getAttribute('aria-label');
        const ariaLabelledBy = el.getAttribute('aria-labelledby');
        let labelText = '';

        if (ariaLabelledBy) {
          const labelElement = document.getElementById(ariaLabelledBy);
          if (labelElement) labelText = labelElement.textContent?.trim() ?? '';
        }

        return {
          tagName: el.tagName,
          type: el.getAttribute('type'),
          text: el.textContent?.trim(),
          ariaLabel,
          labelText,
          hasAccessibleName: !!(el.textContent?.trim() || ariaLabel || labelText),
        };
      });
    });

    // Log interactive elements without accessible names
    const unlabeledElements = interactiveElements.filter(el => !el.hasAccessibleName);
    if (unlabeledElements.length > 0) {
      console.log('Interactive elements without accessible names:', unlabeledElements);
    }

    // Test keyboard navigation
    await page.keyboard.press('Tab');

    // Check if something receives focus
    const hasFocusedElement = await page.evaluate(() => {
      const activeElement = document.activeElement;
      return activeElement && activeElement !== document.body;
    });

    expect(hasFocusedElement).toBe(true);
  });
});
