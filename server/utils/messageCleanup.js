// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for messageCleanup settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import ChatMessage from '../models/chat-message.model.js';
import cron from 'node-cron';

/**
 * Message cleanup utility for auto-deleting expired messages
 */
class MessageCleanup {
  /**
   * Initialize the cleanup scheduler
   */
  init() {
    // Run cleanup every hour
    cron.schedule('0 * * * *', async () => {
      try {
        console.log('Running message cleanup task...');
        await this.cleanupExpiredMessages();
      } catch (error) {
        console.error('Error in message cleanup task:', error);
      }
    });

    console.log('Message cleanup scheduler initialized');
  }

  /**
   * Delete expired messages
   * @returns {Promise<number>} Number of deleted messages
   */
  async cleanupExpiredMessages() {
    try {
      const now = new Date();

      // Find and delete expired messages
      const result = await ChatMessage.deleteMany({
        expiresAt: { $lt: now },
      });

      if (result.deletedCount > 0) {
        console.log(`Deleted ${result.deletedCount} expired messages`);
      }

      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up expired messages:', error);
      throw error;
    }
  }

  /**
   * Get messages that will expire soon
   * @param {number} minutesThreshold Minutes threshold (default: 5)
   * @returns {Promise<Array>} Array of messages about to expire
   */
  async getMessagesAboutToExpire(minutesThreshold = 5) {
    try {
      const now = new Date();
      const expiryThreshold = new Date(now.getTime() + minutesThreshold * 60 * 1000);

      const messages = await ChatMessage.find({
        expiresAt: {
          $gt: now,
          $lte: expiryThreshold,
        },
      });

      return messages;
    } catch (error) {
      console.error('Error getting messages about to expire:', error);
      throw error;
    }
  }
}

export default new MessageCleanup();
