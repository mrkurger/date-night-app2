// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for service configuration (payment.service)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import Stripe from 'stripe';
import User from '../models/user.model.js';
import Ad from '../models/ad.model.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Payment Service for handling subscriptions and one-time payments
 */
class PaymentService {
  constructor(
    stripeClient = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null,
    userModel = User,
    adModel = Ad
  ) {
    this.stripe = stripeClient;
    this.user = userModel;
    this.ad = adModel;
  }

  /**
   * Create a payment intent for Stripe
   * @param {number} amount - Amount in smallest currency unit (e.g., cents)
   * @param {string} currency - Currency code (e.g., 'usd', 'nok')
   * @param {Object} metadata - Additional metadata for the payment
   * @returns {Promise<Object>} Stripe payment intent
   */
  async createPaymentIntent(amount, currency = 'nok', metadata = {}) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        metadata,
        payment_method_types: ['card'],
      });

      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new AppError('Payment processing failed', 500);
    }
  }

  /**
   * Create a subscription for a user
   * @param {string} userId - User ID
   * @param {string} priceId - Stripe price ID
   * @param {string} paymentMethodId - Stripe payment method ID
   * @returns {Promise<Object>} Subscription details
   */
  async createSubscription(userId, priceId, paymentMethodId) {
    try {
      const user = await this.user.findById(userId);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Check if user already has a Stripe customer ID
      let customerId = user.stripeCustomerId;

      // If not, create a new customer
      if (!customerId) {
        const customer = await this.stripe.customers.create({
          email: user.email,
          name: user.username || 'User',
          metadata: {
            userId: user._id.toString(),
          },
        });

        if (!customer || !customer.id) {
          throw new AppError('Failed to create Stripe customer', 500);
        }

        customerId = customer.id;

        // Save customer ID to user
        user.stripeCustomerId = customerId;
        await user.save();
      }

      // Attach payment method to customer
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set as default payment method
      await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Create subscription
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        expand: ['latest_invoice.payment_intent'],
      });

      // Update user subscription details
      const subscriptionTiers = {
        price_premium: 'premium',
        price_vip: 'vip',
      };

      // Extract the price ID from the full price ID if needed
      const simplePriceId = priceId.includes('_') ? priceId.split('_').pop() : priceId;

      user.subscriptionTier =
        subscriptionTiers[simplePriceId] || subscriptionTiers[priceId] || 'free';

      if (!subscription || !subscription.id) {
        throw new AppError('Invalid subscription response from Stripe', 500);
      }

      user.stripeSubscriptionId = subscription.id;

      // Set subscription expiration date
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      user.subscriptionExpires = currentPeriodEnd;

      // Ensure the subscription object exists on the user model
      if (!user.subscription) {
        user.subscription = {};
      }

      // Update subscription details
      if (subscription && subscription.id) {
        user.subscription.id = subscription.id;
        user.subscription.status = subscription.status || 'unknown';
        user.subscription.currentPeriodEnd = currentPeriodEnd;
      }

      await user.save();

      // Safely extract values from the subscription object
      const subscriptionId = subscription?.id || '';
      const clientSecret = subscription?.latest_invoice?.payment_intent?.client_secret || '';
      const subscriptionStatus = subscription?.status || 'unknown';

      return {
        subscriptionId,
        clientSecret,
        subscriptionStatus,
        currentPeriodEnd,
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new AppError(error.message || 'Subscription creation failed', 500);
    }
  }

  /**
   * Cancel a user's subscription
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Cancellation details
   */
  async cancelSubscription(userId) {
    try {
      const user = await this.user.findById(userId);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Check if user has an active subscription
      if (!user.stripeSubscriptionId && (!user.subscription || !user.subscription.id)) {
        throw new AppError('No active subscription found', 400);
      }

      // Get subscription ID from either location
      const subscriptionId = user.stripeSubscriptionId || user.subscription.id;

      // Cancel at period end to allow user to use the subscription until it expires
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });

      // Update user's subscription status
      if (user.subscription) {
        user.subscription.status = 'canceled';
        await user.save();
      }

      return {
        canceled: true,
        subscriptionId: subscription.id,
      };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new AppError(error.message || 'Subscription cancellation failed', 500);
    }
  }

  /**
   * Boost an ad (one-time payment)
   * @param {string} adId - Ad ID
   * @param {string} userId - User ID
   * @param {number} days - Number of days to boost
   * @param {string} paymentMethodId - Stripe payment method ID
   * @returns {Promise<Object>} Payment details
   */
  async boostAd(adId, userId, days = 7, paymentMethodId) {
    try {
      const ad = await this.ad.findById(adId);
      const user = await this.user.findById(userId);

      if (!ad) {
        throw new AppError('Ad not found', 404);
      }

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Check if user owns the ad
      if (ad.advertiser.toString() !== userId) {
        throw new AppError('You can only boost your own ads', 403);
      }

      // Calculate amount based on days (e.g., 100 NOK per day)
      const amount = days * 10000; // 100 NOK in øre

      // Create payment intent
      const paymentIntent = await this.createPaymentIntent(amount, 'nok', {
        adId,
        userId,
        type: 'ad_boost',
        days,
      });

      // Confirm payment with payment method
      await this.stripe.paymentIntents.confirm(paymentIntent.id, {
        payment_method: paymentMethodId,
      });

      // Update ad with boost information
      const boostExpires = new Date();
      boostExpires.setDate(boostExpires.getDate() + days);

      ad.boosted = true;
      ad.boostExpires = boostExpires;
      await ad.save();

      return {
        adId,
        boosted: true,
        boostExpires,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Error boosting ad:', error);
      throw new AppError(error.message || 'Ad boost payment failed', 500);
    }
  }

  /**
   * Feature an ad (one-time payment)
   * @param {string} adId - Ad ID
   * @param {string} userId - User ID
   * @param {string} paymentMethodId - Stripe payment method ID
   * @returns {Promise<Object>} Payment details
   */
  async featureAd(adId, userId, paymentMethodId) {
    try {
      const ad = await this.ad.findById(adId);
      const user = await this.user.findById(userId);

      if (!ad) {
        throw new AppError('Ad not found', 404);
      }

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Check if user owns the ad
      if (ad.advertiser.toString() !== userId) {
        throw new AppError('You can only feature your own ads', 403);
      }

      // Fixed price for featuring an ad (e.g., 500 NOK)
      const amount = 50000; // 500 NOK in øre

      // Create payment intent
      const paymentIntent = await this.createPaymentIntent(amount, 'nok', {
        adId,
        userId,
        type: 'ad_feature',
      });

      // Confirm payment with payment method
      await this.stripe.paymentIntents.confirm(paymentIntent.id, {
        payment_method: paymentMethodId,
      });

      // Update ad with featured flag
      ad.featured = true;
      await ad.save();

      return {
        adId,
        featured: true,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Error featuring ad:', error);
      throw new AppError(error.message || 'Ad feature payment failed', 500);
    }
  }

  /**
   * Handle Stripe webhook events
   * @param {Object} event - Stripe webhook event
   * @returns {Promise<Object>} Processing result
   */
  async handleWebhookEvent(event) {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          return await this.handlePaymentIntentSucceeded(event.data.object);

        case 'payment_intent.payment_failed':
          return await this.handlePaymentIntentFailed(event.data.object);

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          return await this.handleSubscriptionUpdated(event.data.object);

        case 'customer.subscription.deleted':
          return await this.handleSubscriptionDeleted(event.data.object);

        default:
          console.log(`Unhandled event type: ${event.type}`);
          return { received: true };
      }
    } catch (error) {
      console.error('Error handling webhook event:', error);
      throw new AppError('Webhook processing failed', 500);
    }
  }

  /**
   * Handle successful payment intent
   * @param {Object} paymentIntent - Stripe payment intent
   * @returns {Promise<Object>} Processing result
   */
  async handlePaymentIntentSucceeded(paymentIntent) {
    const { metadata } = paymentIntent;

    // Handle different payment types based on metadata
    if (metadata && metadata.type) {
      switch (metadata.type) {
        case 'ad_boost':
          // Ad boost payment succeeded, already handled in boostAd method
          return { received: true, processed: true, type: 'ad_boost' };

        case 'ad_feature':
          // Ad feature payment succeeded, already handled in featureAd method
          return { received: true, processed: true, type: 'ad_feature' };

        default:
          return { received: true, processed: false };
      }
    }

    return { received: true };
  }

  /**
   * Handle failed payment intent
   * @param {Object} paymentIntent - Stripe payment intent
   * @returns {Promise<Object>} Processing result
   */
  async handlePaymentIntentFailed(paymentIntent) {
    const { metadata } = paymentIntent;

    // Handle different payment types based on metadata
    if (metadata && metadata.type) {
      switch (metadata.type) {
        case 'ad_boost':
          // Revert ad boost if payment failed
          if (metadata.adId) {
            const ad = await this.ad.findById(metadata.adId);
            if (ad) {
              ad.boosted = false;
              ad.boostExpires = null;
              await ad.save();
            }
          }
          return { received: true, processed: true, type: 'ad_boost_reverted' };

        case 'ad_feature':
          // Revert ad feature if payment failed
          if (metadata.adId) {
            const ad = await this.ad.findById(metadata.adId);
            if (ad) {
              ad.featured = false;
              await ad.save();
            }
          }
          return { received: true, processed: true, type: 'ad_feature_reverted' };

        default:
          return { received: true, processed: false };
      }
    }

    return { received: true };
  }

  /**
   * Handle subscription updates
   * @param {Object} subscription - Stripe subscription
   * @returns {Promise<Object>} Processing result
   */
  async handleSubscriptionUpdated(subscription) {
    const { customer, status, current_period_end, items } = subscription;

    // Find user by Stripe customer ID
    const user = await this.user.findOne({ stripeCustomerId: customer });

    if (!user) {
      return { received: true, processed: false, error: 'User not found' };
    }

    // Update subscription status
    user.stripeSubscriptionId = subscription.id;

    // Update subscription tier based on price ID
    if (items && items.data && items.data.length > 0) {
      const priceId = items.data[0].price.id;
      const subscriptionTiers = {
        price_premium: 'premium',
        price_vip: 'vip',
      };

      user.subscriptionTier = subscriptionTiers[priceId] || 'free';
    }

    // Update subscription expiration date
    if (current_period_end) {
      user.subscriptionExpires = new Date(current_period_end * 1000);
    }

    // If subscription is canceled or unpaid, downgrade to free tier
    if (status === 'canceled' || status === 'unpaid') {
      user.subscriptionTier = 'free';
    }

    await user.save();

    return {
      received: true,
      processed: true,
      userId: user._id,
      subscriptionTier: user.subscriptionTier,
      subscriptionExpires: user.subscriptionExpires,
    };
  }

  /**
   * Handle subscription deletion
   * @param {Object} subscription - Stripe subscription
   * @returns {Promise<Object>} Processing result
   */
  async handleSubscriptionDeleted(subscription) {
    const { customer } = subscription;

    // Find user by Stripe customer ID
    const user = await this.user.findOne({ stripeCustomerId: customer });

    if (!user) {
      return { received: true, processed: false, error: 'User not found' };
    }

    // Reset subscription information
    user.subscriptionTier = 'free';
    user.stripeSubscriptionId = null;

    await user.save();

    return {
      received: true,
      processed: true,
      userId: user._id,
      subscriptionTier: 'free',
    };
  }

  /**
   * Get subscription prices from Stripe
   * @returns {Promise<Array>} List of subscription prices
   */
  async getSubscriptionPrices() {
    try {
      const prices = await this.stripe.prices.list({
        active: true,
        type: 'recurring',
        expand: ['data.product'],
      });

      return prices.data;
    } catch (error) {
      console.error('Error fetching subscription prices:', error);
      throw new AppError('Failed to fetch prices', 500);
    }
  }
}

// Export both the class and a singleton instance
export { PaymentService };
// Only create a default instance if STRIPE_SECRET_KEY is available
export default process.env.STRIPE_SECRET_KEY ? new PaymentService() : null;
