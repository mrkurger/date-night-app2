import express from 'express';
// import type { Request, Response, NextFunction } from 'express'; // Unused
import paymentController from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.js';
import bodyParser from 'body-parser';
import { ValidationUtils } from '../utils/validation-utils.js';
import PaymentSchemas from '../middleware/validators/payment.validator.js';

const router = express.Router();

// Special raw body parser for Stripe webhooks
const stripeWebhookParser = bodyParser.raw({ type: 'application/json' });

// Public routes
router.post(
  '/webhook',
  stripeWebhookParser,
  ValidationUtils.validateWithZod(PaymentSchemas.webhookRequest),
  paymentController.handleWebhook
);

router.get('/subscription-prices', paymentController.getSubscriptionPrices);

// Protected routes (require authentication)
router.use(protect);

router.post(
  '/create-payment-intent',
  ValidationUtils.validateWithZod(PaymentSchemas.createPaymentIntent),
  paymentController.createPaymentIntent
);

router.post(
  '/create-subscription',
  ValidationUtils.validateWithZod(PaymentSchemas.subscription),
  paymentController.createSubscription
);

router.post('/cancel-subscription', paymentController.cancelSubscription);

router.post(
  '/boost-ad',
  ValidationUtils.validateWithZod(PaymentSchemas.boostAd),
  paymentController.boostAd
);

router.post(
  '/feature-ad',
  ValidationUtils.validateWithZod(PaymentSchemas.featureAd),
  paymentController.featureAd
);

export default router;
