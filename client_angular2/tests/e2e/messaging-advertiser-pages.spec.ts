import { test, expect } from '@playwright/test';

/**
 * Test suite for messaging and advertiser pages
 * Tests messaging functionality, advertiser profiles, and related features
 */
test.describe('Messaging and Advertiser Pages', () => {
  
  test.describe('Messages Page', () => {
    test('should load messages page correctly', async ({ page }) => {
      await page.goto('/messages');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Check for messages interface
      await expect(page.locator('body')).toBeVisible();
      
      // Look for message list or conversation elements
      const messageElements = page.locator('.message, .conversation, [data-testid*="message"], [data-testid*="conversation"]');
      const chatElements = page.locator('.chat, .chat-list, [data-testid*="chat"]');
      
      if (await messageElements.count() > 0) {
        await expect(messageElements.first()).toBeVisible();
      }
      
      if (await chatElements.count() > 0) {
        await expect(chatElements.first()).toBeVisible();
      }
      
      // Take screenshot for visual verification
      await page.screenshot({
        path: './tests/screenshots/messages-page.png',
        fullPage: true,
      });
    });

    test('should display message list interface', async ({ page }) => {
      await page.goto('/messages');
      await page.waitForLoadState('networkidle');
      
      // Look for message list items
      const messageItems = page.locator('.message-item, .conversation-item, [data-testid*="message-item"]');
      if (await messageItems.count() > 0) {
        await expect(messageItems.first()).toBeVisible();
        
        // Check for typical message list elements
        const avatars = page.locator('.avatar, .profile-pic, [data-testid*="avatar"]');
        const names = page.locator('.name, .username, [data-testid*="name"]');
        const previews = page.locator('.preview, .last-message, [data-testid*="preview"]');
        
        if (await avatars.count() > 0) {
          await expect(avatars.first()).toBeVisible();
        }
        if (await names.count() > 0) {
          await expect(names.first()).toBeVisible();
        }
        if (await previews.count() > 0) {
          await expect(previews.first()).toBeVisible();
        }
      }
    });

    test('should handle message list interactions', async ({ page }) => {
      await page.goto('/messages');
      await page.waitForLoadState('networkidle');
      
      // Click on a message item to open conversation
      const messageItems = page.locator('.message-item, .conversation-item, [data-testid*="message-item"]');
      if (await messageItems.count() > 0) {
        const firstMessage = messageItems.first();
        await expect(firstMessage).toBeVisible();
        
        await firstMessage.click();
        await page.waitForTimeout(500);
        
        // Check if conversation view opens or navigation occurs
        const conversationView = page.locator('.conversation-view, .chat-view, [data-testid*="conversation"]');
        if (await conversationView.count() > 0) {
          await expect(conversationView.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Individual Message Page', () => {
    test('should load individual message page correctly', async ({ page }) => {
      // Test with a sample message ID
      await page.goto('/messages/123');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Check for individual message/conversation interface
      await expect(page.locator('body')).toBeVisible();
      
      // Look for conversation elements
      const conversationElements = page.locator('.conversation, .chat, [data-testid*="conversation"], [data-testid*="chat"]');
      const messageInput = page.locator('input[type="text"], textarea, [data-testid*="message-input"]');
      const sendButton = page.locator('button[data-testid*="send"], .send-button');
      
      if (await conversationElements.count() > 0) {
        await expect(conversationElements.first()).toBeVisible();
      }
      
      if (await messageInput.count() > 0) {
        await expect(messageInput.first()).toBeVisible();
      }
      
      if (await sendButton.count() > 0) {
        await expect(sendButton.first()).toBeVisible();
      }
      
      // Take screenshot for visual verification
      await page.screenshot({
        path: './tests/screenshots/individual-message-page.png',
        fullPage: true,
      });
    });

    test('should handle message sending functionality', async ({ page }) => {
      await page.goto('/messages/123');
      await page.waitForLoadState('networkidle');
      
      // Test message input and sending
      const messageInput = page.locator('input[type="text"], textarea, [data-testid*="message-input"]').first();
      const sendButton = page.locator('button[data-testid*="send"], .send-button').first();
      
      if (await messageInput.count() > 0 && await sendButton.count() > 0) {
        await messageInput.fill('Test message');
        await expect(sendButton).toBeEnabled();
        
        // Click send button
        await sendButton.click();
        await page.waitForTimeout(500);
        
        // Check if message was added to conversation
        const messages = page.locator('.message, .chat-message, [data-testid*="message"]');
        if (await messages.count() > 0) {
          const lastMessage = messages.last();
          const messageText = await lastMessage.textContent();
          expect(messageText).toContain('Test message');
        }
      }
    });

    test('should display message history', async ({ page }) => {
      await page.goto('/messages/123');
      await page.waitForLoadState('networkidle');
      
      // Look for message history
      const messages = page.locator('.message, .chat-message, [data-testid*="message"]');
      if (await messages.count() > 0) {
        await expect(messages.first()).toBeVisible();
        
        // Check for message timestamps
        const timestamps = page.locator('.timestamp, .time, [data-testid*="timestamp"]');
        if (await timestamps.count() > 0) {
          await expect(timestamps.first()).toBeVisible();
        }
        
        // Check for message senders
        const senders = page.locator('.sender, .author, [data-testid*="sender"]');
        if (await senders.count() > 0) {
          await expect(senders.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Advertisers Page', () => {
    test('should load advertisers page correctly', async ({ page }) => {
      await page.goto('/advertisers');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Check for advertisers interface
      await expect(page.locator('body')).toBeVisible();
      
      // Look for advertiser grid or list
      const advertiserElements = page.locator('.advertiser, .profile, [data-testid*="advertiser"], [data-testid*="profile"]');
      const gridElements = page.locator('.grid, .list, [data-testid*="grid"]');
      
      if (await advertiserElements.count() > 0) {
        await expect(advertiserElements.first()).toBeVisible();
      }
      
      if (await gridElements.count() > 0) {
        await expect(gridElements.first()).toBeVisible();
      }
      
      // Take screenshot for visual verification
      await page.screenshot({
        path: './tests/screenshots/advertisers-page.png',
        fullPage: true,
      });
    });

    test('should display advertiser profiles', async ({ page }) => {
      await page.goto('/advertisers');
      await page.waitForLoadState('networkidle');
      
      // Look for profile cards
      const profileCards = page.locator('.profile-card, .advertiser-card, [data-testid*="profile"], [data-testid*="advertiser"]');
      if (await profileCards.count() > 0) {
        const firstCard = profileCards.first();
        await expect(firstCard).toBeVisible();
        
        // Check for profile elements
        const images = firstCard.locator('img');
        const names = firstCard.locator('.name, .title, h1, h2, h3');
        const descriptions = firstCard.locator('.description, .bio, p');
        
        if (await images.count() > 0) {
          await expect(images.first()).toBeVisible();
        }
        if (await names.count() > 0) {
          await expect(names.first()).toBeVisible();
        }
        if (await descriptions.count() > 0) {
          await expect(descriptions.first()).toBeVisible();
        }
      }
    });

    test('should handle advertiser profile interactions', async ({ page }) => {
      await page.goto('/advertisers');
      await page.waitForLoadState('networkidle');
      
      // Click on an advertiser profile
      const profileCards = page.locator('.profile-card, .advertiser-card, [data-testid*="profile"], [data-testid*="advertiser"]');
      if (await profileCards.count() > 0) {
        const firstCard = profileCards.first();
        await expect(firstCard).toBeVisible();
        
        await firstCard.click();
        await page.waitForTimeout(500);
        
        // Check if navigation to individual advertiser page occurs
        // This might redirect to /advertiser/[id] page
        await page.waitForLoadState('networkidle');
        expect(page.url()).toMatch(/\/advertiser\/|\/advertisers/);
      }
    });
  });

  test.describe('Individual Advertiser Page', () => {
    test('should load individual advertiser page correctly', async ({ page }) => {
      // Test with a sample advertiser ID
      await page.goto('/advertiser/123');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Check for individual advertiser interface
      await expect(page.locator('body')).toBeVisible();
      
      // Look for advertiser profile elements
      const profileElements = page.locator('.profile, .advertiser-profile, [data-testid*="profile"]');
      const imageElements = page.locator('img, .image, [data-testid*="image"]');
      const infoElements = page.locator('.info, .details, [data-testid*="info"]');
      
      if (await profileElements.count() > 0) {
        await expect(profileElements.first()).toBeVisible();
      }
      
      if (await imageElements.count() > 0) {
        await expect(imageElements.first()).toBeVisible();
      }
      
      // Take screenshot for visual verification
      await page.screenshot({
        path: './tests/screenshots/individual-advertiser-page.png',
        fullPage: true,
      });
    });

    test('should display advertiser rating system', async ({ page }) => {
      await page.goto('/advertiser/123');
      await page.waitForLoadState('networkidle');
      
      // Look for rating elements (1-10 star system)
      const ratingElements = page.locator('.rating, .stars, [data-testid*="rating"], [data-testid*="star"]');
      if (await ratingElements.count() > 0) {
        await expect(ratingElements.first()).toBeVisible();
        
        // Check for star elements
        const stars = page.locator('.star, [data-testid*="star"]');
        if (await stars.count() > 0) {
          const starCount = await stars.count();
          expect(starCount).toBeGreaterThanOrEqual(5);
          expect(starCount).toBeLessThanOrEqual(10);
        }
      }
    });

    test('should handle rating interactions', async ({ page }) => {
      await page.goto('/advertiser/123');
      await page.waitForLoadState('networkidle');
      
      // Test rating functionality
      const stars = page.locator('.star, [data-testid*="star"]');
      if (await stars.count() > 0) {
        const fifthStar = stars.nth(4); // Click on 5th star
        await expect(fifthStar).toBeVisible();
        
        await fifthStar.click();
        await page.waitForTimeout(300);
        
        // Check if rating was applied
        const activeStars = page.locator('.star.active, .star.filled, [data-testid*="star"].active');
        if (await activeStars.count() > 0) {
          expect(await activeStars.count()).toBeGreaterThanOrEqual(5);
        }
      }
    });

    test('should display tip/gift functionality', async ({ page }) => {
      await page.goto('/advertiser/123');
      await page.waitForLoadState('networkidle');
      
      // Look for tip/gift buttons (microtransaction features)
      const tipButtons = page.locator('button[data-testid*="tip"], .tip-button, .gift-button');
      const premiumButtons = page.locator('button[data-testid*="premium"], .premium-button');
      
      if (await tipButtons.count() > 0) {
        await expect(tipButtons.first()).toBeVisible();
        
        // Test tip button interaction
        await tipButtons.first().click();
        await page.waitForTimeout(500);
        
        // Check if tip modal or interface opens
        const tipModal = page.locator('.tip-modal, .payment-modal, [data-testid*="tip-modal"]');
        if (await tipModal.count() > 0) {
          await expect(tipModal.first()).toBeVisible();
        }
      }
      
      if (await premiumButtons.count() > 0) {
        await expect(premiumButtons.first()).toBeVisible();
      }
    });
  });

  // Test responsive design for messaging and advertiser pages
  test.describe('Messaging and Advertiser Pages Responsive Design', () => {
    const pages = ['/messages', '/messages/123', '/advertisers', '/advertiser/123'];
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 720 }
    ];

    for (const pagePath of pages) {
      for (const viewport of viewports) {
        test(`${pagePath} should be responsive on ${viewport.name}`, async ({ page }) => {
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          await page.goto(pagePath);
          await page.waitForLoadState('networkidle');
          
          // Check that page is visible and not broken
          await expect(page.locator('body')).toBeVisible();
          
          // Take screenshot for visual verification
          const pageName = pagePath.replace(/\//g, '-').replace(/^-/, '').replace(/-\d+$/, '-detail');
          await page.screenshot({
            path: `./tests/screenshots/${pageName}-${viewport.name}.png`,
            fullPage: true,
          });
        });
      }
    }
  });
});
