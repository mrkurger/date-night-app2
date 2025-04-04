const ChatMessage = require('../models/chat-message.model');
const cron = require('node-cron');

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
        expiresAt: { $lt: now }
      });
      
      console.log(`Deleted ${result.deletedCount} expired messages`);
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up expired messages:', error);
      throw error;
    }
  }
}

module.exports = new MessageCleanup();