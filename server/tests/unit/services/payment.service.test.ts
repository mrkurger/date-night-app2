import type { jest } from '@jest/globals';
/**
 * Payment Service Unit Tests
 *
 * Tests the functionality of the payment service, which handles
 * payment intents, subscriptions, and payment processing.
 */

import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;
import { jest } from '@jest/globals';
import { AppError } from '../../../middleware/errorHandler.js';

// Mock Stripe client
const mockStripe = {
  paymentIntents: {
    create: jest.fn(),
    confirm: jest.fn(),
  },
  customers: {
    create: jest.fn(),
    update: jest.fn(),
  },
  paymentMethods: {
    attach: jest.fn(),
    list: jest.fn(),
  },
  subscriptions: {
    create: jest.fn(),
    update: jest.fn(),
  },
  prices: {
    list: jest.fn(),
  },
  setupIntents: {
    create: jest.fn(),
  },
};

// Mock models
const mockUser = {
  findById: jest.fn(),
  findOne: jest.fn(),
};

const mockAd = {
  findById: jest.fn(),
};

// Import the PaymentService class
import { PaymentService } from '../../../services/payment.service.js';

describe('Payment Service', () => {
  let paymentService;

  beforeEach(() => {
    // Create a new instance with mocked dependencies
    paymentService = new PaymentService(mockStripe, mockUser, mockAd);
    jest.clearAllMocks();
  });

  describe('createPaymentIntent', () => {
    it('should create a payment intent successfully', async () => {
      const mockIntent = { id: 'pi_123', client_secret: 'secret_123' };
      mockStripe.paymentIntents.create.mockResolvedValue(mockIntent);

      const result = await paymentService.createPaymentIntent(1000, 'nok', { orderId: '123' });

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 1000,
        currency: 'nok',
        metadata: { orderId: '123' },
        payment_method_types: ['card'],
      });
      expect(result).toEqual(mockIntent);
    });

    it('should handle Stripe errors', async () => {
      mockStripe.paymentIntents.create.mockRejectedValue(new Error('Stripe error'));

      await expect(paymentService.createPaymentIntent(1000)).rejects.toThrow(AppError);
    });
  });

  describe('createSubscription', () => {
    const mockUserId = 'user123';
    const mockPriceId = 'price123';
    const mockPaymentMethodId = 'pm123';
    const mockCustomerId = 'cus123';

    beforeEach(() => {
      mockUser.findById.mockResolvedValue({
        _id: mockUserId,
        email: 'test@example.com',
        username: 'testuser',
        stripeCustomerId: mockCustomerId,
        save: jest.fn().mockResolvedValue(true),
      });
    });

    it('should create a subscription successfully', async () => {
      const mockSubscription = {
        id: 'sub123',
        status: 'active',
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        latest_invoice: {
          payment_intent: {
            client_secret: 'secret123',
          },
        },
      };
      mockStripe.paymentMethods.attach.mockResolvedValue({});
      mockStripe.customers.update.mockResolvedValue({});
      mockStripe.subscriptions.create.mockResolvedValue(mockSubscription);

      const result = await paymentService.createSubscription(
        mockUserId,
        mockPriceId,
        mockPaymentMethodId
      );

      expect(mockStripe.paymentMethods.attach).toHaveBeenCalledWith(mockPaymentMethodId, {
        customer: mockCustomerId,
      });
      expect(mockStripe.customers.update).toHaveBeenCalledWith(mockCustomerId, {
        invoice_settings: {
          default_payment_method: mockPaymentMethodId,
        },
      });
      expect(mockStripe.subscriptions.create).toHaveBeenCalledWith({
        customer: mockCustomerId,
        items: [{ price: mockPriceId }],
        expand: ['latest_invoice.payment_intent'],
      });
      expect(result).toEqual({
        subscriptionId: mockSubscription.id,
        clientSecret: mockSubscription.latest_invoice.payment_intent.client_secret,
        subscriptionStatus: mockSubscription.status,
        currentPeriodEnd: expect.any(Date),
      });
    });

    it('should handle user not found', async () => {
      mockUser.findById.mockResolvedValue(null);

      await expect(
        paymentService.createSubscription(mockUserId, mockPriceId, mockPaymentMethodId)
      ).rejects.toThrow(AppError);
    });
  });

  describe('cancelSubscription', () => {
    const mockUserId = 'user123';
    const mockSubscriptionId = 'sub123';

    beforeEach(() => {
      mockUser.findById.mockResolvedValue({
        _id: mockUserId,
        subscription: {
          id: mockSubscriptionId,
          status: 'active',
        },
        save: jest.fn().mockResolvedValue(true),
      });
    });

    it('should cancel a subscription successfully', async () => {
      const mockCanceledSubscription = { id: mockSubscriptionId, status: 'canceled' };
      mockStripe.subscriptions.update.mockResolvedValue(mockCanceledSubscription);

      const result = await paymentService.cancelSubscription(mockUserId);

      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(mockSubscriptionId, {
        cancel_at_period_end: true,
      });
      expect(result).toEqual({ canceled: true, subscriptionId: mockSubscriptionId });
    });

    it('should handle user not found', async () => {
      mockUser.findById.mockResolvedValue(null);

      await expect(paymentService.cancelSubscription(mockUserId)).rejects.toThrow(AppError);
    });

    it('should handle no active subscription', async () => {
      mockUser.findById.mockResolvedValue({
        _id: mockUserId,
        subscription: null,
      });

      await expect(paymentService.cancelSubscription(mockUserId)).rejects.toThrow(AppError);
    });
  });

  describe('getSubscriptionPrices', () => {
    it('should get subscription prices successfully', async () => {
      const mockPrices = {
        data: [
          {
            id: 'price1',
            unit_amount: 1000,
            currency: 'nok',
            recurring: { interval: 'month' },
            product: { name: 'Basic' },
          },
        ],
      };
      mockStripe.prices.list.mockResolvedValue(mockPrices);

      const result = await paymentService.getSubscriptionPrices();

      expect(mockStripe.prices.list).toHaveBeenCalledWith({
        active: true,
        type: 'recurring',
        expand: ['data.product'],
      });
      expect(result).toEqual(mockPrices.data);
    });

    it('should handle Stripe errors', async () => {
      mockStripe.prices.list.mockRejectedValue(new Error('Stripe error'));

      await expect(paymentService.getSubscriptionPrices()).rejects.toThrow(AppError);
    });
  });

  describe('boostAd', () => {
    const mockUserId = 'user123';
    const mockAdId = 'ad123';
    const mockPaymentMethodId = 'pm123';
    const mockCustomerId = 'cus123';

    beforeEach(() => {
      mockUser.findById.mockResolvedValue({
        _id: mockUserId,
        stripeCustomerId: mockCustomerId,
      });
      mockAd.findById.mockResolvedValue({
        _id: mockAdId,
        advertiser: mockUserId,
        boosted: false,
        boostExpires: null,
        save: jest.fn().mockResolvedValue(true),
      });
    });

    it('should boost an ad successfully', async () => {
      const mockPaymentIntent = { id: 'pi123', status: 'succeeded' };
      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);
      mockStripe.paymentIntents.confirm.mockResolvedValue(mockPaymentIntent);

      const result = await paymentService.boostAd(mockAdId, mockUserId, 7, mockPaymentMethodId);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 70000, // 7 days * 10000 øre
        currency: 'nok',
        metadata: {
          adId: mockAdId,
          userId: mockUserId,
          type: 'ad_boost',
          days: 7,
        },
        payment_method_types: ['card'],
      });
      expect(mockStripe.paymentIntents.confirm).toHaveBeenCalledWith(mockPaymentIntent.id, {
        payment_method: mockPaymentMethodId,
      });
      expect(result).toEqual({
        adId: mockAdId,
        boosted: true,
        boostExpires: expect.any(Date),
        paymentIntentId: mockPaymentIntent.id,
      });
    });

    it('should handle ad not found', async () => {
      mockAd.findById.mockResolvedValue(null);

      await expect(
        paymentService.boostAd(mockAdId, mockUserId, 7, mockPaymentMethodId)
      ).rejects.toThrow(AppError);
    });

    it('should handle user not being ad owner', async () => {
      mockAd.findById.mockResolvedValue({
        _id: mockAdId,
        advertiser: 'different-user',
      });

      await expect(
        paymentService.boostAd(mockAdId, mockUserId, 7, mockPaymentMethodId)
      ).rejects.toThrow(AppError);
    });
  });

  describe('featureAd', () => {
    const mockUserId = 'user123';
    const mockAdId = 'ad123';
    const mockPaymentMethodId = 'pm123';
    const mockCustomerId = 'cus123';

    beforeEach(() => {
      mockUser.findById.mockResolvedValue({
        _id: mockUserId,
        stripeCustomerId: mockCustomerId,
      });
      mockAd.findById.mockResolvedValue({
        _id: mockAdId,
        advertiser: mockUserId,
        featured: false,
        save: jest.fn().mockResolvedValue(true),
      });
    });

    it('should feature an ad successfully', async () => {
      const mockPaymentIntent = { id: 'pi123', status: 'succeeded' };
      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);
      mockStripe.paymentIntents.confirm.mockResolvedValue(mockPaymentIntent);

      const result = await paymentService.featureAd(mockAdId, mockUserId, mockPaymentMethodId);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 50000, // 500 NOK in øre
        currency: 'nok',
        metadata: {
          adId: mockAdId,
          userId: mockUserId,
          type: 'ad_feature',
        },
        payment_method_types: ['card'],
      });
      expect(mockStripe.paymentIntents.confirm).toHaveBeenCalledWith(mockPaymentIntent.id, {
        payment_method: mockPaymentMethodId,
      });
      expect(result).toEqual({
        adId: mockAdId,
        featured: true,
        paymentIntentId: mockPaymentIntent.id,
      });
    });

    it('should handle ad not found', async () => {
      mockAd.findById.mockResolvedValue(null);

      await expect(
        paymentService.featureAd(mockAdId, mockUserId, mockPaymentMethodId)
      ).rejects.toThrow(AppError);
    });

    it('should handle user not being ad owner', async () => {
      mockAd.findById.mockResolvedValue({
        _id: mockAdId,
        advertiser: 'different-user',
      });

      await expect(
        paymentService.featureAd(mockAdId, mockUserId, mockPaymentMethodId)
      ).rejects.toThrow(AppError);
    });
  });

  // Note: createSetupIntent and getPaymentMethods methods are not implemented in the service
  // Tests for these methods have been removed
});
