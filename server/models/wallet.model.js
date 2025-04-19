// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for wallet.model settings
//
// COMMON CUSTOMIZATIONS:
// - SUPPORTED_CURRENCIES: List of supported fiat currencies (default: ['NOK', 'USD', 'EUR', 'GBP'])
//   Related to: payment.service.js:SUPPORTED_CURRENCIES
// - SUPPORTED_CRYPTOCURRENCIES: List of supported cryptocurrencies (default: ['BTC', 'ETH', 'USDT', 'USDC'])
//   Related to: payment.service.js:SUPPORTED_CRYPTOCURRENCIES
// - MINIMUM_WITHDRAWAL: Minimum withdrawal amount in smallest currency unit (default: 10000 = 100 NOK)
//   Related to: payment.service.js:MINIMUM_WITHDRAWAL
// ===================================================
import mongoose from 'mongoose';

// Define the transaction schema
const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'transfer', 'payment', 'refund', 'fee'],
    required: true,
  },
  amount: {
    type: Number, // Amount in smallest currency unit (e.g., cents, satoshi)
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  },
  description: {
    type: String,
  },
  metadata: {
    // For payment provider specific data
    paymentIntentId: String,
    paymentMethodId: String,
    transactionId: String,
    txHash: String, // For cryptocurrency transactions
    blockConfirmations: Number, // For cryptocurrency transactions
    provider: String, // Payment provider (e.g., 'stripe', 'coinbase', 'internal')
    senderWalletId: mongoose.Schema.Types.ObjectId,
    recipientWalletId: mongoose.Schema.Types.ObjectId,
    adId: mongoose.Schema.Types.ObjectId,
    serviceType: String, // e.g., 'ad_boost', 'subscription', 'tip'
  },
  fee: {
    amount: Number,
    currency: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Define the wallet balance schema
const balanceSchema = new mongoose.Schema({
  currency: {
    type: String,
    required: true,
  },
  available: {
    type: Number,
    default: 0,
  },
  pending: {
    type: Number,
    default: 0,
  },
  reserved: {
    type: Number,
    default: 0,
  },
});

// Define the payment method schema
const paymentMethodSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['card', 'bank_account', 'crypto_address'],
    required: true,
  },
  provider: {
    type: String,
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  // For cards
  cardDetails: {
    lastFour: String,
    brand: String,
    expiryMonth: Number,
    expiryYear: Number,
    tokenId: String, // Token from payment provider
  },
  // For bank accounts
  bankDetails: {
    accountType: String,
    lastFour: String,
    bankName: String,
    country: String,
    currency: String,
    tokenId: String, // Token from payment provider
  },
  // For crypto addresses
  cryptoDetails: {
    currency: String,
    address: String,
    network: String, // e.g., 'mainnet', 'testnet'
    memo: String, // For currencies that require memo/tag
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Define the wallet schema
const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    balances: [balanceSchema],
    transactions: [transactionSchema],
    paymentMethods: [paymentMethodSchema],
    settings: {
      autoWithdrawal: {
        enabled: {
          type: Boolean,
          default: false,
        },
        threshold: {
          type: Number,
          default: 100000, // 1000 NOK in øre
        },
        paymentMethodId: mongoose.Schema.Types.ObjectId,
      },
      defaultCurrency: {
        type: String,
        default: 'NOK',
      },
      notificationPreferences: {
        email: {
          deposit: { type: Boolean, default: true },
          withdrawal: { type: Boolean, default: true },
          payment: { type: Boolean, default: true },
        },
        push: {
          deposit: { type: Boolean, default: true },
          withdrawal: { type: Boolean, default: true },
          payment: { type: Boolean, default: true },
        },
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Add indexes for better query performance
// Note: userId already has a unique index from the schema definition
walletSchema.index({ 'transactions.status': 1 });
walletSchema.index({ 'transactions.createdAt': 1 });
walletSchema.index({ 'transactions.metadata.paymentIntentId': 1 });
walletSchema.index({ 'transactions.metadata.txHash': 1 });

// Update the updatedAt field on save
walletSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Method to get balance for a specific currency
walletSchema.methods.getBalance = function (currency) {
  const balance = this.balances.find(b => b.currency === currency);
  if (!balance) {
    return {
      currency,
      available: 0,
      pending: 0,
      reserved: 0,
    };
  }
  return balance;
};

// Method to add a transaction
walletSchema.methods.addTransaction = function (transaction) {
  this.transactions.push(transaction);
  return this.save();
};

// Method to update balance
walletSchema.methods.updateBalance = function (currency, amount, type = 'available') {
  let balance = this.balances.find(b => b.currency === currency);

  // If balance doesn't exist, create it
  if (!balance) {
    balance = {
      currency,
      available: 0,
      pending: 0,
      reserved: 0,
    };
    this.balances.push(balance);
  }

  // Update the specified balance type
  balance[type] += amount;

  return this.save();
};

// Method to add a payment method
walletSchema.methods.addPaymentMethod = function (paymentMethod) {
  // If this is set as default, unset any existing default of the same type
  if (paymentMethod.isDefault) {
    this.paymentMethods.forEach(pm => {
      if (pm.type === paymentMethod.type) {
        pm.isDefault = false;
      }
    });
  }

  this.paymentMethods.push(paymentMethod);
  return this.save();
};

// Method to remove a payment method
walletSchema.methods.removePaymentMethod = function (paymentMethodId) {
  this.paymentMethods = this.paymentMethods.filter(
    pm => pm._id.toString() !== paymentMethodId.toString()
  );
  return this.save();
};

// Method to get default payment method for a specific type
walletSchema.methods.getDefaultPaymentMethod = function (type) {
  return this.paymentMethods.find(pm => pm.type === type && pm.isDefault);
};

// Method to set a payment method as default
walletSchema.methods.setDefaultPaymentMethod = function (paymentMethodId) {
  const paymentMethod = this.paymentMethods.id(paymentMethodId);

  if (!paymentMethod) {
    throw new Error('Payment method not found');
  }

  // Unset any existing default of the same type
  this.paymentMethods.forEach(pm => {
    if (pm.type === paymentMethod.type) {
      pm.isDefault = false;
    }
  });

  // Set the specified payment method as default
  paymentMethod.isDefault = true;

  return this.save();
};

// Check if model already exists before defining
const Wallet = mongoose.models.Wallet || mongoose.model('Wallet', walletSchema);

export default Wallet;
