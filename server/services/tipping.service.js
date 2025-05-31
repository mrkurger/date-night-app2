import { logger } from '../utils/logger.js';
import Wallet from '../models/wallet.model.js';
// import User from '../models/user.model.js'; // Unused
// import Transaction from '../models/transaction.model.js'; // Unused
import { NotificationService } from './notification.service.js';

class TippingService {
  /**
   * Process a tip from one user to another
   * @param {string} senderId - Sender user ID
   * @param {string} recipientId - Recipient user ID
   * @param {Object} tipData - Tip details
   * @returns {Promise<Object>} Transaction details
   */
  async processTip(senderId, recipientId, tipData) {
    const { amount, currency, contentId, contentType } = tipData;

    try {
      // 1. Validate sender has sufficient balance
      const senderWallet = await Wallet.findOne({ userId: senderId });
      if (!senderWallet) {
        throw new Error('Sender wallet not found');
      }

      const balance = this.getBalance(senderWallet, currency);
      if (balance < amount) {
        throw new Error('Insufficient balance');
      }

      // 2. Get recipient wallet
      const recipientWallet = await Wallet.findOne({ userId: recipientId });
      if (!recipientWallet) {
        throw new Error('Recipient wallet not found');
      }

      // 3. Create transaction records
      const transaction = await this.createTipTransaction(
        senderId,
        recipientId,
        amount,
        currency,
        contentId,
        contentType
      );

      // 4. Update balances
      await this.updateWalletBalances(senderWallet, recipientWallet, amount, currency);

      // 5. Send notification to recipient
      await NotificationService.sendTipNotification(
        senderId,
        recipientId,
        amount,
        currency,
        contentType
      );

      return { success: true, transactionId: transaction._id };
    } catch (error) {
      logger.error('Error processing tip:', error);
      throw error;
    }
  }

  // Helper methods...
}

export default new TippingService();
