const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const authenticateToken = require('../middleware/authenticateToken');
const bodyParser = require('body-parser');

// Special raw body parser for Stripe webhooks
const stripeWebhookParser = bodyParser.raw({ type: 'application/json' });

// Public routes
router.post('/webhook', stripeWebhookParser, paymentController.handleWebhook);
router.get('/subscription-prices', paymentController.getSubscriptionPrices);

// Protected routes (require authentication)
router.use(authenticateToken);

router.post('/create-payment-intent', paymentController.createPaymentIntent);
router.post('/create-subscription', paymentController.createSubscription);
router.post('/cancel-subscription', paymentController.cancelSubscription);
router.post('/boost-ad', paymentController.boostAd);
router.post('/feature-ad', paymentController.featureAd);

module.exports = router;