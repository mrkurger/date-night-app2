// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for wallet.routes settings
// 
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const { authenticateToken } = require('../middleware/authenticateToken');
const { asyncHandler } = require('../middleware/asyncHandler');

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
router.post('/payment-methods', asyncHandler(walletController.addPaymentMethod));

// Remove payment method
router.delete('/payment-methods/:paymentMethodId', asyncHandler(walletController.removePaymentMethod));

// Set default payment method
router.patch('/payment-methods/:paymentMethodId/default', asyncHandler(walletController.setDefaultPaymentMethod));

// Deposit funds with Stripe
router.post('/deposit/stripe', asyncHandler(walletController.depositFundsWithStripe));

// Get crypto deposit address
router.get('/deposit/crypto/:currency', asyncHandler(walletController.getCryptoDepositAddress));

// Withdraw funds
router.post('/withdraw', asyncHandler(walletController.withdrawFunds));

// Withdraw cryptocurrency
router.post('/withdraw/crypto', asyncHandler(walletController.withdrawCrypto));

// Transfer funds
router.post('/transfer', asyncHandler(walletController.transferFunds));

// Update wallet settings
router.patch('/settings', asyncHandler(walletController.updateWalletSettings));

// Get exchange rates
router.get('/exchange-rates', asyncHandler(walletController.getExchangeRates));

// Crypto webhook (no authentication required)
router.post('/webhook/crypto', 
  express.raw({ type: 'application/json' }), 
  asyncHandler(walletController.handleCryptoWebhook)
);

module.exports = router;