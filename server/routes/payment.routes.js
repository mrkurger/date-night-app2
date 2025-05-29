// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for payment.routes settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import express from 'express';
const router = express.Router();
import paymentController from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.js';
import bodyParser from 'body-parser';
import { validateWithZod } from '../utils/validation-utils.js';
import { PaymentSchemas } from '../middleware/validators/payment.validator.js';

// Special raw body parser for Stripe webhooks
const stripeWebhookParser = bodyParser.raw({ type: 'application/json' });

// Public routes
router.post(
  '/webhook',
  stripeWebhookParser,
  validateWithZod(PaymentSchemas.webhookRequest),
  paymentController.handleWebhook
);

router.get('/subscription-prices', paymentController.getSubscriptionPrices);

// Protected routes (require authentication)
router.use(protect);

router.post(
  '/create-payment-intent',
  validateWithZod(PaymentSchemas.createPaymentIntent),
  paymentController.createPaymentIntent
);

router.post(
  '/create-subscription',
  validateWithZod(PaymentSchemas.subscription),
  paymentController.createSubscription
);

router.post('/cancel-subscription', paymentController.cancelSubscription);

router.post('/boost-ad', validateWithZod(PaymentSchemas.boostAd), paymentController.boostAd);

router.post('/feature-ad', validateWithZod(PaymentSchemas.featureAd), paymentController.featureAd);

export default router;
