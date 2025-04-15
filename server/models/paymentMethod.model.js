// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for paymentMethod.model settings
// 
// COMMON CUSTOMIZATIONS:
// - PAYMENT_METHOD_TYPES: List of supported payment method types (default: ['card', 'bank_account', 'crypto_address'])
// ===================================================
const mongoose = require('mongoose');

// Define the payment method schema
const paymentMethodSchema = new mongoose.Schema({
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['card', 'bank_account', 'crypto_address'],
    required: true,
    index: true
  },
  provider: {
    type: String,
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  // For cards
  cardDetails: {
    lastFour: String,
    brand: String,
    expiryMonth: Number,
    expiryYear: Number,
    tokenId: String // Token from payment provider
  },
  // For bank accounts
  bankDetails: {
    accountType: String,
    lastFour: String,
    bankName: String,
    country: String,
    currency: String,
    tokenId: String // Token from payment provider
  },
  // For crypto addresses
  cryptoDetails: {
    currency: String,
    address: String,
    network: String, // e.g., 'mainnet', 'testnet'
    memo: String // For currencies that require memo/tag
  }
}, {
  timestamps: true // Automatically manage createdAt and updatedAt
});

// Add indexes for better query performance
paymentMethodSchema.index({ isDefault: 1 });
paymentMethodSchema.index({ 'cardDetails.tokenId': 1 });
paymentMethodSchema.index({ 'bankDetails.tokenId': 1 });
paymentMethodSchema.index({ 'cryptoDetails.address': 1 });

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);