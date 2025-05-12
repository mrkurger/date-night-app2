// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for payment.controller settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import paymentService from '../services/payment.service.js';
import { AppError } from '../middleware/errorHandler.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * Payment Controller for handling payment-related API endpoints
 */
class PaymentController {
  /**
   * Create a payment intent
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async createPaymentIntent(req, res, next) {
    try {
      const { amount, currency, metadata } = req.body;

      if (!amount || amount <= 0) {
        return next(new AppError('Valid amount is required', 400, 'error'));
      }

      const paymentIntent = await paymentService.createPaymentIntent(amount, currency || 'nok', {
        ...metadata,
        userId: req.user.id,
      });

      res.status(200).json({
        status: 'success',
        data: {
          clientSecret: paymentIntent.client_secret,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a subscription
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async createSubscription(req, res, next) {
    try {
      const { priceId, paymentMethodId } = req.body;

      if (!priceId || !paymentMethodId) {
        return next(new AppError('Price ID and payment method ID are required', 400, 'error'));
      }

      const subscription = await paymentService.createSubscription(
        req.user.id,
        priceId,
        paymentMethodId
      );

      res.status(200).json({
        status: 'success',
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel a subscription
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async cancelSubscription(req, res, next) {
    try {
      const result = await paymentService.cancelSubscription(req.user.id);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Boost an ad
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async boostAd(req, res, next) {
    try {
      const { adId, days, paymentMethodId } = req.body;

      if (!adId || !paymentMethodId) {
        return next(new AppError('Ad ID and payment method ID are required', 400, 'error'));
      }

      const result = await paymentService.boostAd(adId, req.user.id, days || 7, paymentMethodId);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Feature an ad
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async featureAd(req, res, next) {
    try {
      const { adId, paymentMethodId } = req.body;

      if (!adId || !paymentMethodId) {
        return next(new AppError('Ad ID and payment method ID are required', 400, 'error'));
      }

      const result = await paymentService.featureAd(adId, req.user.id, paymentMethodId);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle Stripe webhook
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async handleWebhook(req, res, next) {
    try {
      const sig = req.headers['stripe-signature'];

      if (!sig) {
        return next(new AppError('Stripe signature is missing', 400));
      }

      // Verify webhook signature
      let event;

      try {
        const stripeModule = await import('stripe');
        const stripe = stripeModule.default(process.env.STRIPE_SECRET_KEY);
        event = stripe.webhooks.constructEvent(
          req.rawBody, // Raw request body
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        return next(new AppError(`Webhook signature verification failed: ${err.message}`, 400));
      }

      // Process the event
      const result = await paymentService.handleWebhookEvent(event);

      res.status(200).json({ received: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get subscription prices
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getSubscriptionPrices(req, res, next) {
    try {
      const prices = await paymentService.getSubscriptionPrices();

      res.status(200).json({
        status: 'success',
        data: {
          prices,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export async function someHandler(req, res) {
  try {
    const result = await doSomething();
    return sendSuccess(res, result);
  } catch (err) {
    return sendError(res, err, err.status || 500);
  }
}

export default new PaymentController();
