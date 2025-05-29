/**
 * Payment Controller Integration Tests
 *
 * Tests the payment controller endpoints with mocked payment service.
 */

import { jest } from '@jest/globals';
import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;

// Mock the payment service
jest.mock('../../../services/payment.service.js', () => ({
  __esModule: true,
  default: {
    createPaymentIntent: jest.fn(),
    createSubscription: jest.fn(),
    cancelSubscription: jest.fn(),
    boostAd: jest.fn(),
    featureAd: jest.fn(),
    getSubscriptionPrices: jest.fn(),
  },
}));

// Import dependencies after mocking
import request from 'supertest';
import express from 'express';
import { AppError } from '../../../middleware/errorHandler.js';
import errorHandler from '../../../middleware/errorHandler.js';
import paymentController from '../../../controllers/payment.controller.js';
import paymentService from '../../../services/payment.service.js';

describe('Payment Controller', () => {
  let app;
  const mockUserId = new ObjectId();
  const mockUser = { id: mockUserId.toString(), email: 'test@example.com' };

  // Setup Express app for testing
  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Mock authentication middleware
    app.use((req, res, next) => {
      req.user = mockUser;
      next();
    });

    // Setup routes
    app.post('/api/payments/create-payment-intent', paymentController.createPaymentIntent);
    app.post('/api/payments/create-subscription', paymentController.createSubscription);
    app.post('/api/payments/cancel-subscription', paymentController.cancelSubscription);
    app.post('/api/payments/boost-ad', paymentController.boostAd);
    app.post('/api/payments/feature-ad', paymentController.featureAd);
    app.get('/api/payments/subscription-prices', paymentController.getSubscriptionPrices);

    // Error handling middleware
    app.use(errorHandler);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('POST /api/payments/create-payment-intent', () => {
    it('should create a payment intent successfully', async () => {
      // Mock data
      const requestBody = {
        amount: 1000,
        currency: 'nok',
        metadata: { orderId: '123' },
      };

      const paymentIntent = {
        id: 'pi_123',
        client_secret: 'pi_123_secret_456',
        amount: 1000,
        currency: 'nok',
      };

      // Mock service response
      paymentService.createPaymentIntent.mockResolvedValue(paymentIntent);

      // Make request
      const response = await request(app)
        .post('/api/payments/create-payment-intent')
        .send(requestBody)
        .expect(200);

      // Assertions
      expect(paymentService.createPaymentIntent).toHaveBeenCalledWith(
        requestBody.amount,
        requestBody.currency,
        {
          ...requestBody.metadata,
          userId: mockUser.id,
        }
      );

      expect(response.body).toEqual({
        status: 'success',
        data: {
          clientSecret: paymentIntent.client_secret,
        },
      });
    });

    it('should return 400 if amount is missing', async () => {
      // Mock data
      const requestBody = {
        currency: 'nok',
        metadata: { orderId: '123' },
      };

      // Make request
      const response = await request(app)
        .post('/api/payments/create-payment-intent')
        .send(requestBody)
        .expect(400);

      // Assertions
      expect(paymentService.createPaymentIntent).not.toHaveBeenCalled();
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Valid amount is required');
    });

    it('should return 400 if amount is zero or negative', async () => {
      // Mock data
      const requestBody = {
        amount: 0,
        currency: 'nok',
      };

      // Make request
      const response = await request(app)
        .post('/api/payments/create-payment-intent')
        .send(requestBody)
        .expect(400);

      // Assertions
      expect(paymentService.createPaymentIntent).not.toHaveBeenCalled();
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Valid amount is required');
    });

    it('should handle service errors', async () => {
      // Mock data
      const requestBody = {
        amount: 1000,
        currency: 'nok',
      };

      // Mock service error
      const errorMessage = 'Payment service error';
      paymentService.createPaymentIntent.mockRejectedValue(new Error(errorMessage));

      // Make request
      const response = await request(app)
        .post('/api/payments/create-payment-intent')
        .send(requestBody)
        .expect(500);

      // Assertions
      expect(paymentService.createPaymentIntent).toHaveBeenCalled();
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe(errorMessage);
    });
  });

  describe('POST /api/payments/create-subscription', () => {
    it('should create a subscription successfully', async () => {
      // Mock data
      const requestBody = {
        priceId: 'price_123',
        paymentMethodId: 'pm_123',
      };

      const subscription = {
        id: 'sub_123',
        status: 'active',
        current_period_end: new Date().toISOString(),
        client_secret: 'cs_123',
      };

      // Mock service response
      paymentService.createSubscription.mockResolvedValue(subscription);

      // Make request
      const response = await request(app)
        .post('/api/payments/create-subscription')
        .send(requestBody)
        .expect(200);

      // Assertions
      expect(paymentService.createSubscription).toHaveBeenCalledWith(
        mockUser.id,
        requestBody.priceId,
        requestBody.paymentMethodId
      );

      expect(response.body).toEqual({
        status: 'success',
        data: subscription,
      });
    });

    it('should return 400 if priceId is missing', async () => {
      // Mock data
      const requestBody = {
        paymentMethodId: 'pm_123',
      };

      // Make request
      const response = await request(app)
        .post('/api/payments/create-subscription')
        .send(requestBody)
        .expect(400);

      // Assertions
      expect(paymentService.createSubscription).not.toHaveBeenCalled();
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Price ID and payment method ID are required');
    });

    it('should return 400 if paymentMethodId is missing', async () => {
      // Mock data
      const requestBody = {
        priceId: 'price_123',
      };

      // Make request
      const response = await request(app)
        .post('/api/payments/create-subscription')
        .send(requestBody)
        .expect(400);

      // Assertions
      expect(paymentService.createSubscription).not.toHaveBeenCalled();
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Price ID and payment method ID are required');
    });
  });

  describe('POST /api/payments/cancel-subscription', () => {
    it('should cancel a subscription successfully', async () => {
      // Mock service response
      const cancelResult = { canceled: true, subscription: 'sub_123' };
      paymentService.cancelSubscription.mockResolvedValue(cancelResult);

      // Make request
      const response = await request(app)
        .post('/api/payments/cancel-subscription')
        .send({})
        .expect(200);

      // Assertions
      expect(paymentService.cancelSubscription).toHaveBeenCalledWith(mockUser.id);
      expect(response.body).toEqual({
        status: 'success',
        data: cancelResult,
      });
    });

    it('should handle service errors', async () => {
      // Mock service error
      const errorMessage = 'No active subscription found';
      paymentService.cancelSubscription.mockRejectedValue(new AppError(errorMessage, 404, 'error'));

      // Make request
      const response = await request(app)
        .post('/api/payments/cancel-subscription')
        .send({})
        .expect(404);

      // Assertions
      expect(paymentService.cancelSubscription).toHaveBeenCalledWith(mockUser.id);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe(errorMessage);
    });
  });

  describe('POST /api/payments/boost-ad', () => {
    it('should boost an ad successfully', async () => {
      // Mock data
      const adId = new ObjectId().toString();
      const requestBody = {
        adId,
        days: 14,
        paymentMethodId: 'pm_123',
      };

      const boostResult = {
        adId,
        boosted: true,
        boostExpires: new Date().toISOString(),
        paymentIntentId: 'pi_123',
      };

      // Mock service response
      paymentService.boostAd.mockResolvedValue(boostResult);

      // Make request
      const response = await request(app)
        .post('/api/payments/boost-ad')
        .send(requestBody)
        .expect(200);

      // Assertions
      expect(paymentService.boostAd).toHaveBeenCalledWith(
        adId,
        mockUser.id,
        requestBody.days,
        requestBody.paymentMethodId
      );

      expect(response.body).toEqual({
        status: 'success',
        data: boostResult,
      });
    });

    it('should use default days value if not provided', async () => {
      // Mock data
      const adId = new ObjectId().toString();
      const requestBody = {
        adId,
        paymentMethodId: 'pm_123',
      };

      const boostResult = {
        adId,
        boosted: true,
        boostExpires: new Date().toISOString(),
        paymentIntentId: 'pi_123',
      };

      // Mock service response
      paymentService.boostAd.mockResolvedValue(boostResult);

      // Make request
      const response = await request(app)
        .post('/api/payments/boost-ad')
        .send(requestBody)
        .expect(200);

      // Assertions
      expect(paymentService.boostAd).toHaveBeenCalledWith(
        adId,
        mockUser.id,
        7, // Default value
        requestBody.paymentMethodId
      );

      expect(response.body).toEqual({
        status: 'success',
        data: boostResult,
      });
    });

    it('should return 400 if adId is missing', async () => {
      // Mock data
      const requestBody = {
        days: 7,
        paymentMethodId: 'pm_123',
      };

      // Make request
      const response = await request(app)
        .post('/api/payments/boost-ad')
        .send(requestBody)
        .expect(400);

      // Assertions
      expect(paymentService.boostAd).not.toHaveBeenCalled();
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Ad ID and payment method ID are required');
    });

    it('should return 400 if paymentMethodId is missing', async () => {
      // Mock data
      const requestBody = {
        adId: new ObjectId().toString(),
        days: 7,
      };

      // Make request
      const response = await request(app)
        .post('/api/payments/boost-ad')
        .send(requestBody)
        .expect(400);

      // Assertions
      expect(paymentService.boostAd).not.toHaveBeenCalled();
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Ad ID and payment method ID are required');
    });
  });

  describe('POST /api/payments/feature-ad', () => {
    it('should feature an ad successfully', async () => {
      // Mock data
      const adId = new ObjectId().toString();
      const requestBody = {
        adId,
        paymentMethodId: 'pm_123',
      };

      const featureResult = {
        adId,
        featured: true,
        paymentIntentId: 'pi_123',
      };

      // Mock service response
      paymentService.featureAd.mockResolvedValue(featureResult);

      // Make request
      const response = await request(app)
        .post('/api/payments/feature-ad')
        .send(requestBody)
        .expect(200);

      // Assertions
      expect(paymentService.featureAd).toHaveBeenCalledWith(
        adId,
        mockUser.id,
        requestBody.paymentMethodId
      );

      expect(response.body).toEqual({
        status: 'success',
        data: featureResult,
      });
    });

    it('should return 400 if adId is missing', async () => {
      // Mock data
      const requestBody = {
        paymentMethodId: 'pm_123',
      };

      // Make request
      const response = await request(app)
        .post('/api/payments/feature-ad')
        .send(requestBody)
        .expect(400);

      // Assertions
      expect(paymentService.featureAd).not.toHaveBeenCalled();
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Ad ID and payment method ID are required');
    });

    it('should return 400 if paymentMethodId is missing', async () => {
      // Mock data
      const requestBody = {
        adId: new ObjectId().toString(),
      };

      // Make request
      const response = await request(app)
        .post('/api/payments/feature-ad')
        .send(requestBody)
        .expect(400);

      // Assertions
      expect(paymentService.featureAd).not.toHaveBeenCalled();
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Ad ID and payment method ID are required');
    });
  });

  describe('GET /api/payments/subscription-prices', () => {
    it('should get subscription prices successfully', async () => {
      // Mock data
      const prices = [
        {
          id: 'price_123',
          product: 'prod_123',
          nickname: 'Premium Plan',
          unit_amount: 1999,
          currency: 'nok',
          recurring: {
            interval: 'month',
            interval_count: 1,
          },
        },
      ];

      // Mock service response
      paymentService.getSubscriptionPrices.mockResolvedValue(prices);

      // Make request
      const response = await request(app).get('/api/payments/subscription-prices').expect(200);

      // Assertions
      expect(paymentService.getSubscriptionPrices).toHaveBeenCalled();
      expect(response.body).toEqual({
        status: 'success',
        data: {
          prices,
        },
      });
    });

    it('should handle service errors', async () => {
      // Mock service error
      const errorMessage = 'Failed to fetch prices';
      paymentService.getSubscriptionPrices.mockRejectedValue(new Error(errorMessage));

      // Make request
      const response = await request(app).get('/api/payments/subscription-prices').expect(500);

      // Assertions
      expect(paymentService.getSubscriptionPrices).toHaveBeenCalled();
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe(errorMessage);
    });
  });
});
