/**
 * Payment Service Unit Tests
 *
 * Tests the functionality of the payment service, which handles
 * payment intents, subscriptions, and payment processing.
 */

const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const paymentService = require('../../../services/payment.service');
const User = require('../../../models/user.model');
const Ad = require('../../../models/ad.model');
const { AppError } = require('../../../middleware/errorHandler');

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn(() => ({
    paymentIntents: {
      create: jest.fn(),
      retrieve: jest.fn(),
    },
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
    },
    subscriptions: {
      create: jest.fn(),
      update: jest.fn(),
      cancel: jest.fn(),
      retrieve: jest.fn(),
    },
    prices: {
      list: jest.fn(),
    },
    setupIntents: {
      create: jest.fn(),
    },
    paymentMethods: {
      attach: jest.fn(),
      detach: jest.fn(),
      list: jest.fn(),
    },
  }));
});

// Mock dependencies
jest.mock('../../../models/user.model');
jest.mock('../../../models/ad.model');

describe('Payment Service', () => {
  // Setup common test variables
  const mockUserId = new ObjectId();
  const mockAdId = new ObjectId();
  const mockPaymentMethodId = 'pm_123456789';
  const mockPriceId = 'price_123456789';
  const mockCustomerId = 'cus_123456789';
  const mockSubscriptionId = 'sub_123456789';
  const mockPaymentIntentId = 'pi_123456789';
  const mockSetupIntentId = 'seti_123456789';
  const mockClientSecret = 'secret_123456789';

  // Mock user object
  const mockUser = {
    _id: mockUserId,
    email: 'test@example.com',
    stripeCustomerId: mockCustomerId,
    subscription: {
      id: mockSubscriptionId,
      status: 'active',
      currentPeriodEnd: new Date(),
    },
    save: jest.fn().mockResolvedValue(true),
  };

  // Mock ad object
  const mockAd = {
    _id: mockAdId,
    title: 'Test Ad',
    advertiser: mockUserId,
    boosted: false,
    boostExpires: null,
    featured: false,
    save: jest.fn().mockResolvedValue(true),
  };

  // Get Stripe mock
  const stripe = require('stripe')();

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPaymentIntent', () => {
    it('should create a payment intent successfully', async () => {
      // Mock the Stripe paymentIntents.create method
      const mockPaymentIntent = {
        id: mockPaymentIntentId,
        client_secret: mockClientSecret,
        amount: 1000,
        currency: 'nok',
        status: 'requires_payment_method',
      };
      stripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      // Call the service method
      const amount = 1000;
      const currency = 'nok';
      const metadata = { userId: mockUserId.toString() };
      const result = await paymentService.createPaymentIntent(amount, currency, metadata);

      // Assertions
      expect(stripe.paymentIntents.create).toHaveBeenCalledWith({
        amount,
        currency,
        metadata,
        payment_method_types: ['card'],
      });
      expect(result).toEqual(mockPaymentIntent);
    });

    it('should throw an AppError if Stripe payment intent creation fails', async () => {
      // Mock the Stripe paymentIntents.create method to throw an error
      stripe.paymentIntents.create.mockRejectedValue(new Error('Stripe API error'));

      // Call the service method and expect it to throw
      const amount = 1000;
      const currency = 'nok';
      await expect(paymentService.createPaymentIntent(amount, currency)).rejects.toThrow(AppError);
    });
  });

  describe('createSubscription', () => {
    it('should create a subscription for a new customer', async () => {
      // Mock the User.findById method
      const userWithoutStripeId = { ...mockUser, stripeCustomerId: null };
      User.findById.mockResolvedValue(userWithoutStripeId);

      // Mock the Stripe customers.create method
      const mockCustomer = { id: mockCustomerId };
      stripe.customers.create.mockResolvedValue(mockCustomer);

      // Mock the Stripe paymentMethods.attach method
      stripe.paymentMethods.attach.mockResolvedValue({ id: mockPaymentMethodId });

      // Mock the Stripe customers.update method
      stripe.customers.update.mockResolvedValue(mockCustomer);

      // Mock the Stripe subscriptions.create method
      const mockSubscription = {
        id: mockSubscriptionId,
        status: 'active',
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
        latest_invoice: {
          payment_intent: {
            client_secret: mockClientSecret,
          },
        },
      };
      stripe.subscriptions.create.mockResolvedValue(mockSubscription);

      // Call the service method
      const result = await paymentService.createSubscription(
        mockUserId.toString(),
        mockPriceId,
        mockPaymentMethodId
      );

      // Assertions
      expect(User.findById).toHaveBeenCalledWith(mockUserId.toString());
      expect(stripe.customers.create).toHaveBeenCalledWith({
        email: userWithoutStripeId.email,
        metadata: { userId: mockUserId.toString() },
      });
      expect(stripe.paymentMethods.attach).toHaveBeenCalledWith(mockPaymentMethodId, {
        customer: mockCustomerId,
      });
      expect(stripe.customers.update).toHaveBeenCalledWith(mockCustomerId, {
        invoice_settings: { default_payment_method: mockPaymentMethodId },
      });
      expect(stripe.subscriptions.create).toHaveBeenCalledWith({
        customer: mockCustomerId,
        items: [{ price: mockPriceId }],
        expand: ['latest_invoice.payment_intent'],
      });
      expect(userWithoutStripeId.stripeCustomerId).toBe(mockCustomerId);
      expect(userWithoutStripeId.subscription).toEqual({
        id: mockSubscriptionId,
        status: 'active',
        currentPeriodEnd: expect.any(Date),
      });
      expect(userWithoutStripeId.save).toHaveBeenCalled();
      expect(result).toEqual({
        subscriptionId: mockSubscriptionId,
        clientSecret: mockClientSecret,
        subscriptionStatus: 'active',
        currentPeriodEnd: expect.any(Date),
      });
    });

    it('should create a subscription for an existing customer', async () => {
      // Mock the User.findById method
      User.findById.mockResolvedValue(mockUser);

      // Mock the Stripe paymentMethods.attach method
      stripe.paymentMethods.attach.mockResolvedValue({ id: mockPaymentMethodId });

      // Mock the Stripe customers.update method
      stripe.customers.update.mockResolvedValue({ id: mockCustomerId });

      // Mock the Stripe subscriptions.create method
      const mockSubscription = {
        id: mockSubscriptionId,
        status: 'active',
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
        latest_invoice: {
          payment_intent: {
            client_secret: mockClientSecret,
          },
        },
      };
      stripe.subscriptions.create.mockResolvedValue(mockSubscription);

      // Call the service method
      const result = await paymentService.createSubscription(
        mockUserId.toString(),
        mockPriceId,
        mockPaymentMethodId
      );

      // Assertions
      expect(User.findById).toHaveBeenCalledWith(mockUserId.toString());
      expect(stripe.customers.create).not.toHaveBeenCalled();
      expect(stripe.paymentMethods.attach).toHaveBeenCalledWith(mockPaymentMethodId, {
        customer: mockCustomerId,
      });
      expect(stripe.customers.update).toHaveBeenCalledWith(mockCustomerId, {
        invoice_settings: { default_payment_method: mockPaymentMethodId },
      });
      expect(stripe.subscriptions.create).toHaveBeenCalledWith({
        customer: mockCustomerId,
        items: [{ price: mockPriceId }],
        expand: ['latest_invoice.payment_intent'],
      });
      expect(mockUser.subscription).toEqual({
        id: mockSubscriptionId,
        status: 'active',
        currentPeriodEnd: expect.any(Date),
      });
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toEqual({
        subscriptionId: mockSubscriptionId,
        clientSecret: mockClientSecret,
        subscriptionStatus: 'active',
        currentPeriodEnd: expect.any(Date),
      });
    });

    it('should throw an error if user is not found', async () => {
      // Mock the User.findById method to return null
      User.findById.mockResolvedValue(null);

      // Call the service method and expect it to throw
      await expect(
        paymentService.createSubscription(mockUserId.toString(), mockPriceId, mockPaymentMethodId)
      ).rejects.toThrow('User not found');
    });

    it('should throw an error if subscription creation fails', async () => {
      // Mock the User.findById method
      User.findById.mockResolvedValue(mockUser);

      // Mock the Stripe paymentMethods.attach method
      stripe.paymentMethods.attach.mockResolvedValue({ id: mockPaymentMethodId });

      // Mock the Stripe customers.update method
      stripe.customers.update.mockResolvedValue({ id: mockCustomerId });

      // Mock the Stripe subscriptions.create method to throw an error
      stripe.subscriptions.create.mockRejectedValue(new Error('Subscription creation failed'));

      // Call the service method and expect it to throw
      await expect(
        paymentService.createSubscription(mockUserId.toString(), mockPriceId, mockPaymentMethodId)
      ).rejects.toThrow(AppError);
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel a subscription successfully', async () => {
      // Mock the User.findById method
      User.findById.mockResolvedValue(mockUser);

      // Mock the Stripe subscriptions.cancel method
      const mockCanceledSubscription = {
        id: mockSubscriptionId,
        status: 'canceled',
      };
      stripe.subscriptions.cancel.mockResolvedValue(mockCanceledSubscription);

      // Call the service method
      const result = await paymentService.cancelSubscription(mockUserId.toString());

      // Assertions
      expect(User.findById).toHaveBeenCalledWith(mockUserId.toString());
      expect(stripe.subscriptions.cancel).toHaveBeenCalledWith(mockSubscriptionId);
      expect(mockUser.subscription.status).toBe('canceled');
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toEqual({ canceled: true, subscriptionId: mockSubscriptionId });
    });

    it('should throw an error if user is not found', async () => {
      // Mock the User.findById method to return null
      User.findById.mockResolvedValue(null);

      // Call the service method and expect it to throw
      await expect(paymentService.cancelSubscription(mockUserId.toString())).rejects.toThrow(
        'User not found'
      );
    });

    it('should throw an error if user has no active subscription', async () => {
      // Mock the User.findById method
      const userWithoutSubscription = { ...mockUser, subscription: null };
      User.findById.mockResolvedValue(userWithoutSubscription);

      // Call the service method and expect it to throw
      await expect(paymentService.cancelSubscription(mockUserId.toString())).rejects.toThrow(
        'No active subscription found'
      );
    });

    it('should throw an error if subscription cancellation fails', async () => {
      // Mock the User.findById method
      User.findById.mockResolvedValue(mockUser);

      // Mock the Stripe subscriptions.cancel method to throw an error
      stripe.subscriptions.cancel.mockRejectedValue(new Error('Cancellation failed'));

      // Call the service method and expect it to throw
      await expect(paymentService.cancelSubscription(mockUserId.toString())).rejects.toThrow(
        AppError
      );
    });
  });

  describe('getSubscriptionPrices', () => {
    it('should get subscription prices successfully', async () => {
      // Mock the Stripe prices.list method
      const mockPrices = {
        data: [
          {
            id: 'price_1',
            product: 'prod_1',
            unit_amount: 1999,
            currency: 'nok',
            recurring: { interval: 'month', interval_count: 1 },
            metadata: { name: 'Basic Plan', description: 'Basic features' },
          },
          {
            id: 'price_2',
            product: 'prod_2',
            unit_amount: 4999,
            currency: 'nok',
            recurring: { interval: 'month', interval_count: 1 },
            metadata: { name: 'Premium Plan', description: 'Premium features' },
          },
        ],
      };
      stripe.prices.list.mockResolvedValue(mockPrices);

      // Call the service method
      const result = await paymentService.getSubscriptionPrices();

      // Assertions
      expect(stripe.prices.list).toHaveBeenCalledWith({
        active: true,
        type: 'recurring',
        expand: ['data.product'],
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id', 'price_1');
      expect(result[1]).toHaveProperty('id', 'price_2');
    });

    it('should throw an error if price retrieval fails', async () => {
      // Mock the Stripe prices.list method to throw an error
      stripe.prices.list.mockRejectedValue(new Error('Price retrieval failed'));

      // Call the service method and expect it to throw
      await expect(paymentService.getSubscriptionPrices()).rejects.toThrow(AppError);
    });
  });

  describe('boostAd', () => {
    it('should boost an ad successfully', async () => {
      // Mock the Ad.findById method
      Ad.findById.mockResolvedValue(mockAd);

      // Mock the User.findById method
      User.findById.mockResolvedValue(mockUser);

      // Mock the Stripe paymentIntents.create method
      const mockPaymentIntent = {
        id: mockPaymentIntentId,
        client_secret: mockClientSecret,
        status: 'succeeded',
      };
      stripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      // Call the service method
      const days = 7;
      const result = await paymentService.boostAd(
        mockUserId.toString(),
        mockAdId.toString(),
        days,
        mockPaymentMethodId
      );

      // Assertions
      expect(Ad.findById).toHaveBeenCalledWith(mockAdId.toString());
      expect(User.findById).toHaveBeenCalledWith(mockUserId.toString());
      expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: expect.any(Number),
          currency: 'nok',
          customer: mockCustomerId,
          payment_method: mockPaymentMethodId,
          confirm: true,
          metadata: expect.objectContaining({
            userId: mockUserId.toString(),
            adId: mockAdId.toString(),
            type: 'boost',
            days: days.toString(),
          }),
        })
      );
      expect(mockAd.boosted).toBe(true);
      expect(mockAd.boostExpires).toBeInstanceOf(Date);
      expect(mockAd.save).toHaveBeenCalled();
      expect(result).toEqual({
        adId: mockAdId.toString(),
        boosted: true,
        boostExpires: expect.any(Date),
        paymentIntentId: mockPaymentIntentId,
      });
    });

    it('should throw an error if ad is not found', async () => {
      // Mock the Ad.findById method to return null
      Ad.findById.mockResolvedValue(null);

      // Call the service method and expect it to throw
      await expect(
        paymentService.boostAd(mockUserId.toString(), mockAdId.toString(), 7, mockPaymentMethodId)
      ).rejects.toThrow('Ad not found');
    });

    it('should throw an error if user is not the ad owner', async () => {
      // Mock the Ad.findById method
      const adWithDifferentOwner = { ...mockAd, advertiser: new ObjectId() };
      Ad.findById.mockResolvedValue(adWithDifferentOwner);

      // Call the service method and expect it to throw
      await expect(
        paymentService.boostAd(mockUserId.toString(), mockAdId.toString(), 7, mockPaymentMethodId)
      ).rejects.toThrow('User is not the owner of this ad');
    });

    it('should throw an error if payment fails', async () => {
      // Mock the Ad.findById method
      Ad.findById.mockResolvedValue(mockAd);

      // Mock the User.findById method
      User.findById.mockResolvedValue(mockUser);

      // Mock the Stripe paymentIntents.create method to throw an error
      stripe.paymentIntents.create.mockRejectedValue(new Error('Payment failed'));

      // Call the service method and expect it to throw
      await expect(
        paymentService.boostAd(mockUserId.toString(), mockAdId.toString(), 7, mockPaymentMethodId)
      ).rejects.toThrow(AppError);
    });
  });

  describe('featureAd', () => {
    it('should feature an ad successfully', async () => {
      // Mock the Ad.findById method
      Ad.findById.mockResolvedValue(mockAd);

      // Mock the User.findById method
      User.findById.mockResolvedValue(mockUser);

      // Mock the Stripe paymentIntents.create method
      const mockPaymentIntent = {
        id: mockPaymentIntentId,
        client_secret: mockClientSecret,
        status: 'succeeded',
      };
      stripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      // Call the service method
      const result = await paymentService.featureAd(
        mockUserId.toString(),
        mockAdId.toString(),
        mockPaymentMethodId
      );

      // Assertions
      expect(Ad.findById).toHaveBeenCalledWith(mockAdId.toString());
      expect(User.findById).toHaveBeenCalledWith(mockUserId.toString());
      expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: expect.any(Number),
          currency: 'nok',
          customer: mockCustomerId,
          payment_method: mockPaymentMethodId,
          confirm: true,
          metadata: expect.objectContaining({
            userId: mockUserId.toString(),
            adId: mockAdId.toString(),
            type: 'feature',
          }),
        })
      );
      expect(mockAd.featured).toBe(true);
      expect(mockAd.save).toHaveBeenCalled();
      expect(result).toEqual({
        adId: mockAdId.toString(),
        featured: true,
        paymentIntentId: mockPaymentIntentId,
      });
    });

    it('should throw an error if ad is not found', async () => {
      // Mock the Ad.findById method to return null
      Ad.findById.mockResolvedValue(null);

      // Call the service method and expect it to throw
      await expect(
        paymentService.featureAd(mockUserId.toString(), mockAdId.toString(), mockPaymentMethodId)
      ).rejects.toThrow('Ad not found');
    });

    it('should throw an error if user is not the ad owner', async () => {
      // Mock the Ad.findById method
      const adWithDifferentOwner = { ...mockAd, advertiser: new ObjectId() };
      Ad.findById.mockResolvedValue(adWithDifferentOwner);

      // Call the service method and expect it to throw
      await expect(
        paymentService.featureAd(mockUserId.toString(), mockAdId.toString(), mockPaymentMethodId)
      ).rejects.toThrow('User is not the owner of this ad');
    });

    it('should throw an error if payment fails', async () => {
      // Mock the Ad.findById method
      Ad.findById.mockResolvedValue(mockAd);

      // Mock the User.findById method
      User.findById.mockResolvedValue(mockUser);

      // Mock the Stripe paymentIntents.create method to throw an error
      stripe.paymentIntents.create.mockRejectedValue(new Error('Payment failed'));

      // Call the service method and expect it to throw
      await expect(
        paymentService.featureAd(mockUserId.toString(), mockAdId.toString(), mockPaymentMethodId)
      ).rejects.toThrow(AppError);
    });
  });

  describe('createSetupIntent', () => {
    it('should create a setup intent successfully', async () => {
      // Mock the User.findById method
      User.findById.mockResolvedValue(mockUser);

      // Mock the Stripe setupIntents.create method
      const mockSetupIntent = {
        id: mockSetupIntentId,
        client_secret: mockClientSecret,
      };
      stripe.setupIntents.create.mockResolvedValue(mockSetupIntent);

      // Call the service method
      const result = await paymentService.createSetupIntent(mockUserId.toString());

      // Assertions
      expect(User.findById).toHaveBeenCalledWith(mockUserId.toString());
      expect(stripe.setupIntents.create).toHaveBeenCalledWith({
        customer: mockCustomerId,
        payment_method_types: ['card'],
      });
      expect(result).toEqual({ clientSecret: mockClientSecret });
    });

    it('should create a customer if user has no Stripe customer ID', async () => {
      // Mock the User.findById method
      const userWithoutStripeId = { ...mockUser, stripeCustomerId: null, save: jest.fn() };
      User.findById.mockResolvedValue(userWithoutStripeId);

      // Mock the Stripe customers.create method
      const mockCustomer = { id: mockCustomerId };
      stripe.customers.create.mockResolvedValue(mockCustomer);

      // Mock the Stripe setupIntents.create method
      const mockSetupIntent = {
        id: mockSetupIntentId,
        client_secret: mockClientSecret,
      };
      stripe.setupIntents.create.mockResolvedValue(mockSetupIntent);

      // Call the service method
      const result = await paymentService.createSetupIntent(mockUserId.toString());

      // Assertions
      expect(User.findById).toHaveBeenCalledWith(mockUserId.toString());
      expect(stripe.customers.create).toHaveBeenCalledWith({
        email: userWithoutStripeId.email,
        metadata: { userId: mockUserId.toString() },
      });
      expect(userWithoutStripeId.stripeCustomerId).toBe(mockCustomerId);
      expect(userWithoutStripeId.save).toHaveBeenCalled();
      expect(stripe.setupIntents.create).toHaveBeenCalledWith({
        customer: mockCustomerId,
        payment_method_types: ['card'],
      });
      expect(result).toEqual({ clientSecret: mockClientSecret });
    });

    it('should throw an error if user is not found', async () => {
      // Mock the User.findById method to return null
      User.findById.mockResolvedValue(null);

      // Call the service method and expect it to throw
      await expect(paymentService.createSetupIntent(mockUserId.toString())).rejects.toThrow(
        'User not found'
      );
    });

    it('should throw an error if setup intent creation fails', async () => {
      // Mock the User.findById method
      User.findById.mockResolvedValue(mockUser);

      // Mock the Stripe setupIntents.create method to throw an error
      stripe.setupIntents.create.mockRejectedValue(new Error('Setup intent creation failed'));

      // Call the service method and expect it to throw
      await expect(paymentService.createSetupIntent(mockUserId.toString())).rejects.toThrow(
        AppError
      );
    });
  });

  describe('getPaymentMethods', () => {
    it('should get payment methods successfully', async () => {
      // Mock the User.findById method
      User.findById.mockResolvedValue(mockUser);

      // Mock the Stripe paymentMethods.list method
      const mockPaymentMethods = {
        data: [
          {
            id: 'pm_1',
            type: 'card',
            card: {
              brand: 'visa',
              last4: '4242',
              exp_month: 12,
              exp_year: 2025,
            },
          },
          {
            id: 'pm_2',
            type: 'card',
            card: {
              brand: 'mastercard',
              last4: '5555',
              exp_month: 10,
              exp_year: 2024,
            },
          },
        ],
      };
      stripe.paymentMethods.list.mockResolvedValue(mockPaymentMethods);

      // Call the service method
      const result = await paymentService.getPaymentMethods(mockUserId.toString());

      // Assertions
      expect(User.findById).toHaveBeenCalledWith(mockUserId.toString());
      expect(stripe.paymentMethods.list).toHaveBeenCalledWith({
        customer: mockCustomerId,
        type: 'card',
      });
      expect(result).toEqual(mockPaymentMethods.data);
    });

    it('should throw an error if user is not found', async () => {
      // Mock the User.findById method to return null
      User.findById.mockResolvedValue(null);

      // Call the service method and expect it to throw
      await expect(paymentService.getPaymentMethods(mockUserId.toString())).rejects.toThrow(
        'User not found'
      );
    });

    it('should throw an error if user has no Stripe customer ID', async () => {
      // Mock the User.findById method
      const userWithoutStripeId = { ...mockUser, stripeCustomerId: null };
      User.findById.mockResolvedValue(userWithoutStripeId);

      // Call the service method and expect it to throw
      await expect(paymentService.getPaymentMethods(mockUserId.toString())).rejects.toThrow(
        'User has no payment methods'
      );
    });

    it('should throw an error if payment methods retrieval fails', async () => {
      // Mock the User.findById method
      User.findById.mockResolvedValue(mockUser);

      // Mock the Stripe paymentMethods.list method to throw an error
      stripe.paymentMethods.list.mockRejectedValue(new Error('Payment methods retrieval failed'));

      // Call the service method and expect it to throw
      await expect(paymentService.getPaymentMethods(mockUserId.toString())).rejects.toThrow(
        AppError
      );
    });
  });
});
