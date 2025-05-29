// ===================================================
// ANALYTICS SERVICE
// ===================================================
// This service provides methods for working with analytics data
// stored in the secondary database.
// ===================================================

import Analytic from '../models/analytic.model.js';

/**
 * Analytics service for tracking user events
 */
class AnalyticsService {
  /**
   * Track a user event
   * @param {string} event - Event name
   * @param {string|null} userId - User ID or null for anonymous events
   * @param {object} properties - Event properties
   * @param {object} context - Request context
   * @returns {Promise<object>} - Created analytic document
   */
  async trackEvent(event, userId = null, properties = {}, context = {}) {
    try {
      const { sessionId, ipAddress, userAgent } = this._extractContext(context);

      const analytic = new Analytic({
        event,
        userId,
        properties,
        sessionId,
        ipAddress,
        userAgent,
      });

      return await analytic.save();
    } catch (error) {
      console.error(`[AnalyticsService] Error tracking event: ${error.message}`);
      // We don't want analytics errors to break the application flow,
      // so we log the error but don't rethrow it
      return null;
    }
  }

  /**
   * Get analytics for a specific event
   * @param {string} event - Event name
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Array of analytic documents
   */
  async getEventAnalytics(event, options = {}) {
    try {
      const { startDate, endDate, limit = 100, skip = 0 } = options;

      let query = { event };

      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }

      return await Analytic.find(query).sort({ timestamp: -1 }).limit(limit).skip(skip).lean();
    } catch (error) {
      console.error(`[AnalyticsService] Error getting event analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user activity
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Array of analytic documents
   */
  async getUserActivity(userId, options = {}) {
    try {
      const { limit = 100, skip = 0 } = options;

      return await Analytic.find({ userId }).sort({ timestamp: -1 }).limit(limit).skip(skip).lean();
    } catch (error) {
      console.error(`[AnalyticsService] Error getting user activity: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extract context information from request
   * @param {Object} context - Request context
   * @returns {Object} - Extracted context
   * @private
   */
  _extractContext(context) {
    const { req } = context;

    if (!req) {
      return {
        sessionId: null,
        ipAddress: null,
        userAgent: null,
      };
    }

    return {
      sessionId: req.sessionID || null,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
      userAgent: req.headers['user-agent'] || null,
    };
  }
}

export default new AnalyticsService();
