import { logger } from '../utils/logger.js';
// import Wallet from '../models/wallet.model.js'; // Unused
// import User from '../models/user.model.js'; // Unused
import LiveSession from '../models/live-session.model.js';
// import { NotificationService } from './notification.service.js'; // Unused

class LiveSessionService {
  /**
   * Start a paid live session
   * @param {string} viewerId - Viewer user ID
   * @param {string} performerId - Performer user ID
   * @param {Object} sessionData - Session details
   * @returns {Promise<Object>} Session details
   */
  async startPaidSession(viewerId, performerId, sessionData) {
    const { sessionType, ratePerMinute, currency, initialDuration } = sessionData;

    try {
      // 1. Calculate initial amount to reserve
      const initialAmount = ratePerMinute * initialDuration;

      // 2. Reserve funds from viewer's wallet
      const reservationResult = await this.reserveFunds(viewerId, initialAmount, currency);

      if (!reservationResult.success) {
        throw new Error('Failed to reserve funds');
      }

      // 3. Create live session record
      const session = await LiveSession.create({
        viewerId,
        performerId,
        sessionType,
        ratePerMinute,
        currency,
        startTime: new Date(),
        status: 'active',
        reservationId: reservationResult.reservationId,
      });

      // 4. Set up periodic billing
      this.setupPeriodicBilling(session._id);

      return {
        success: true,
        sessionId: session._id,
        joinToken: this.generateSessionToken(session._id),
      };
    } catch (error) {
      logger.error('Error starting paid session:', error);
      throw error;
    }
  }

  // Helper methods...
}

export default new LiveSessionService();
