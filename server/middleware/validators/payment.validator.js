/**
 * Validation middleware for payment-related routes
 */
import { body } from 'express-validator';
import { AppError } from '../errorHandler.js';

// Helper function to check validation results
const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new AppError(
        `Validation error: ${errors
          .array()
          .map(e => e.msg)
          .join(', ')}`,
        400
      )
    );
  }
  next();
};

// Validate payment intent creation
const validatePaymentIntent = [
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isInt({ min: 1 })
    .withMessage('Amount must be greater than 0'),

  body('currency')
    .optional()
    .isIn(['nok', 'usd', 'eur'])
    .withMessage('Currency must be NOK, USD, or EUR'),

  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object'),

  validateResults,
];

// Validate subscription creation
const validateSubscription = [
  body('priceId')
    .notEmpty()
    .withMessage('Price ID is required')
    .matches(/^price_/)
    .withMessage('Invalid price ID format'),

  body('paymentMethodId')
    .notEmpty()
    .withMessage('Payment method ID is required')
    .matches(/^pm_/)
    .withMessage('Invalid payment method ID format'),

  validateResults,
];

// Validate ad boost
const validateBoostAd = [
  body('adId')
    .notEmpty()
    .withMessage('Ad ID is required')
    .isMongoId()
    .withMessage('Invalid ad ID format'),

  body('paymentMethodId')
    .notEmpty()
    .withMessage('Payment method ID is required')
    .matches(/^pm_/)
    .withMessage('Invalid payment method ID format'),

  body('days')
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage('Days must be between 1 and 30'),

  validateResults,
];

// Validate ad feature
const validateFeatureAd = [
  body('adId')
    .notEmpty()
    .withMessage('Ad ID is required')
    .isMongoId()
    .withMessage('Invalid ad ID format'),

  body('paymentMethodId')
    .notEmpty()
    .withMessage('Payment method ID is required')
    .matches(/^pm_/)
    .withMessage('Invalid payment method ID format'),

  validateResults,
];

// Validate webhook signature and request
const validateWebhook = (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  if (!signature) {
    return next(new AppError('Stripe signature is missing', 400));
  }

  // Raw body is required for signature verification
  if (!req.rawBody) {
    return next(new AppError('Raw request body is required', 400));
  }

  next();
};

export {
  validatePaymentIntent,
  validateSubscription,
  validateBoostAd,
  validateFeatureAd,
  validateWebhook,
};

export default {
  validatePaymentIntent,
  validateSubscription,
  validateBoostAd,
  validateFeatureAd,
  validateWebhook,
};
