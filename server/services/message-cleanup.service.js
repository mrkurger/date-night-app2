import cron from 'node-cron';
import ChatMessage from '../models/chat-message.model.js';
import ChatAttachment from '../models/chat-attachment.schema.js';
import fs from 'fs';
import path from 'path';

class MessageCleanupService {
  constructor() {
    // Run cleanup every hour
    this.cleanupJob = cron.schedule('0 * * * *', () => {
      this.cleanupExpiredMessages();
    });
  }

  /**
   * Clean up expired messages and their attachments
   */
  async cleanupExpiredMessages() {
    try {
      const now = new Date();

      // Find expired messages
      const expiredMessages = await ChatMessage.find({
        expiresAt: { $lte: now },
      }).populate('attachments');

      for (const message of expiredMessages) {
        // Delete attachments if they exist
        if (message.attachments && message.attachments.length > 0) {
          for (const attachment of message.attachments) {
            // Delete attachment file
            const filePath = path.join(process.cwd(), attachment.url);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }

            // Delete thumbnail if it exists
            if (attachment.thumbnailUrl) {
              const thumbPath = path.join(process.cwd(), attachment.thumbnailUrl);
              if (fs.existsSync(thumbPath)) {
                fs.unlinkSync(thumbPath);
              }
            }

            // Delete attachment record
            await ChatAttachment.findByIdAndDelete(attachment._id);
          }
        }

        // Delete message
        await ChatMessage.findByIdAndDelete(message._id);
      }

      console.log(`Cleaned up ${expiredMessages.length} expired messages`);
    } catch (error) {
      console.error('Error cleaning up expired messages:', error);
    }
  }

  /**
   * Stop the cleanup job
   */
  stop() {
    if (this.cleanupJob) {
      this.cleanupJob.stop();
    }
  }
}

export default new MessageCleanupService();
