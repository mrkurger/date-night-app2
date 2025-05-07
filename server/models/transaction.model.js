// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for transaction.model settings
//
// COMMON CUSTOMIZATIONS:
// - TRANSACTION_TYPES: List of supported transaction types (default: ['deposit', 'withdrawal', 'transfer', 'payment', 'refund', 'fee'])
// - TRANSACTION_STATUSES: List of supported transaction statuses (default: ['pending', 'completed', 'failed', 'cancelled'])
// ===================================================
import mongoose from 'mongoose';

// Define the transaction schema
const transactionSchema = new mongoose.Schema(
  {
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['deposit', 'withdrawal', 'transfer', 'payment', 'refund', 'fee'],
      required: true,
      index: true,
    },
    amount: {
      type: Number, // Amount in smallest currency unit (e.g., cents, satoshi)
      required: true,
    },
    currency: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
      index: true,
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
      address: String, // For cryptocurrency withdrawals
      network: String, // For cryptocurrency withdrawals
      memo: String, // For cryptocurrency withdrawals
    },
    fee: {
      amount: Number,
      currency: String,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Add indexes for better query performance
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ 'metadata.paymentIntentId': 1 });
transactionSchema.index({ 'metadata.txHash': 1 });
transactionSchema.index({ 'metadata.transactionId': 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
export { Transaction };
