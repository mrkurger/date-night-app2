// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for wallet.routes settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import express from 'express';
import walletController from '../controllers/wallet.controller.js';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { ValidationUtils } from '../utils/validation-utils.js';
import { WalletSchemas } from '../middleware/validators/wallet.validator.ts';

const router = express.Router();

// Protect all wallet routes except webhook
router.use(authenticateToken);

// Get wallet
router.get('/', asyncHandler(walletController.getWallet));

// Get wallet balance
router.get('/balance', asyncHandler(walletController.getWalletBalance));

// Get wallet transactions
router.get('/transactions', asyncHandler(walletController.getWalletTransactions));

// Get wallet payment methods
router.get('/payment-methods', asyncHandler(walletController.getWalletPaymentMethods));

// Add payment method
router.post(
  '/payment-methods',
  ValidationUtils.validateWithZod(WalletSchemas.paymentMethod),
  asyncHandler(walletController.addPaymentMethod)
);

// Remove payment method
router.delete(
  '/payment-methods/:paymentMethodId',
  ValidationUtils.validateWithZod(WalletSchemas.paymentMethodIdParam, 'params'),
  asyncHandler(walletController.removePaymentMethod)
);

// Set default payment method
router.patch(
  '/payment-methods/:paymentMethodId/default',
  ValidationUtils.validateWithZod(WalletSchemas.paymentMethodIdParam, 'params'),
  asyncHandler(walletController.setDefaultPaymentMethod)
);

// Deposit funds with Stripe
router.post(
  '/deposit/stripe',
  ValidationUtils.validateWithZod(WalletSchemas.deposit),
  asyncHandler(walletController.depositFundsWithStripe)
);

// Get crypto deposit address
router.post(
  '/deposit/crypto',
  ValidationUtils.validateWithZod(WalletSchemas.cryptoDeposit),
  asyncHandler(walletController.getCryptoDepositAddress)
);

// Withdraw funds
router.post(
  '/withdraw',
  ValidationUtils.validateWithZod(WalletSchemas.withdrawal),
  asyncHandler(walletController.withdrawFunds)
);

// Withdraw cryptocurrency
router.post(
  '/withdraw/crypto',
  ValidationUtils.validateWithZod(WalletSchemas.cryptoWithdrawal),
  asyncHandler(walletController.withdrawCrypto)
);

// Transfer funds
router.post(
  '/transfer',
  ValidationUtils.validateWithZod(WalletSchemas.transfer),
  asyncHandler(walletController.transferFunds)
);

// Update wallet settings
router.patch(
  '/settings',
  ValidationUtils.validateWithZod(WalletSchemas.walletSettings),
  asyncHandler(walletController.updateWalletSettings)
);

// Get exchange rates
router.get('/exchange-rates', asyncHandler(walletController.getExchangeRates));

// Crypto webhook (no authentication required)
router.post(
  '/webhook/crypto',
  express.raw({ type: 'application/json' }),
  asyncHandler(walletController.handleCryptoWebhook)
);

export default router;
