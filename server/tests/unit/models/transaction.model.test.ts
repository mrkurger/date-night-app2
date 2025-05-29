// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the transaction model
//
// COMMON CUSTOMIZATIONS:
// - TEST_TRANSACTION_DATA: Test transaction data
//   Related to: server/models/transaction.model.js
// ===================================================

import mongoose from 'mongoose';
import Transaction from '../../../models/transaction.model.js';
import { setupTestDB, teardownTestDB, clearDatabase } from '../../setup.ts';

describe('Transaction Model', () => {
  // Setup test data
  const testUserId = new mongoose.Types.ObjectId();
  const testWalletId = new mongoose.Types.ObjectId();
  const testAdId = new mongoose.Types.ObjectId();
  const testSenderWalletId = new mongoose.Types.ObjectId();
  const testRecipientWalletId = new mongoose.Types.ObjectId();

  const TEST_TRANSACTION_DATA = {
    walletId: testWalletId,
    userId: testUserId,
    type: 'deposit',
    amount: 10000, // $100.00 in cents
    currency: 'USD',
    description: 'Test deposit',
    metadata: {
      paymentIntentId: 'pi_test123456',
      paymentMethodId: 'pm_test123456',
      provider: 'stripe',
      adId: testAdId,
      serviceType: 'ad_boost',
    },
    fee: {
      amount: 290, // $2.90 in cents
      currency: 'USD',
    },
  };

  // Setup and teardown for all tests
  beforeAll(async () => {
    await setupTestDB();
    // Ensure indexes are created for testing
    await Transaction.createIndexes();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  // Clear database between tests
  afterEach(async () => {
    await clearDatabase();
  });

  describe('Basic Validation', () => {
    it('should create a new transaction successfully', async () => {
      const transaction = new Transaction(TEST_TRANSACTION_DATA);
      const savedTransaction = await transaction.save();

      // Verify the saved transaction
      expect(savedTransaction._id).toBeDefined();
      expect(savedTransaction.walletId.toString()).toBe(testWalletId.toString());
      expect(savedTransaction.userId.toString()).toBe(testUserId.toString());
      expect(savedTransaction.type).toBe(TEST_TRANSACTION_DATA.type);
      expect(savedTransaction.amount).toBe(TEST_TRANSACTION_DATA.amount);
      expect(savedTransaction.currency).toBe(TEST_TRANSACTION_DATA.currency);
      expect(savedTransaction.status).toBe('pending'); // Default status
      expect(savedTransaction.description).toBe(TEST_TRANSACTION_DATA.description);
      expect(savedTransaction.metadata.paymentIntentId).toBe(
        TEST_TRANSACTION_DATA.metadata.paymentIntentId
      );
      expect(savedTransaction.metadata.paymentMethodId).toBe(
        TEST_TRANSACTION_DATA.metadata.paymentMethodId
      );
      expect(savedTransaction.metadata.provider).toBe(TEST_TRANSACTION_DATA.metadata.provider);
      expect(savedTransaction.metadata.adId.toString()).toBe(testAdId.toString());
      expect(savedTransaction.metadata.serviceType).toBe(
        TEST_TRANSACTION_DATA.metadata.serviceType
      );
      expect(savedTransaction.fee.amount).toBe(TEST_TRANSACTION_DATA.fee.amount);
      expect(savedTransaction.fee.currency).toBe(TEST_TRANSACTION_DATA.fee.currency);
      expect(savedTransaction.createdAt).toBeDefined();
      expect(savedTransaction.updatedAt).toBeDefined();
    });

    it('should require walletId, userId, type, amount, and currency', async () => {
      const transactionWithoutRequiredFields = new Transaction({
        description: 'Missing required fields',
      });

      // Expect validation to fail
      await expect(transactionWithoutRequiredFields.save()).rejects.toThrow();
    });

    it('should enforce type enum validation', async () => {
      const transactionWithInvalidType = new Transaction({
        ...TEST_TRANSACTION_DATA,
        type: 'invalid-type', // Not in enum: ['deposit', 'withdrawal', 'transfer', 'payment', 'refund', 'fee']
      });

      // Expect validation to fail
      await expect(transactionWithInvalidType.save()).rejects.toThrow();
    });

    it('should enforce status enum validation', async () => {
      const transactionWithInvalidStatus = new Transaction({
        ...TEST_TRANSACTION_DATA,
        status: 'invalid-status', // Not in enum: ['pending', 'completed', 'failed', 'cancelled']
      });

      // Expect validation to fail
      await expect(transactionWithInvalidStatus.save()).rejects.toThrow();
    });

    it('should use default status when not provided', async () => {
      const transactionWithoutStatus = new Transaction({
        ...TEST_TRANSACTION_DATA,
        status: undefined, // Not providing a status
      });

      const savedTransaction = await transactionWithoutStatus.save();
      expect(savedTransaction.status).toBe('pending'); // Default status
    });
  });

  describe('Transaction Types', () => {
    it('should handle deposit transactions', async () => {
      const depositTransaction = new Transaction({
        ...TEST_TRANSACTION_DATA,
        type: 'deposit',
      });

      const savedTransaction = await depositTransaction.save();
      expect(savedTransaction.type).toBe('deposit');
    });

    it('should handle withdrawal transactions', async () => {
      const withdrawalTransaction = new Transaction({
        ...TEST_TRANSACTION_DATA,
        type: 'withdrawal',
        metadata: {
          ...TEST_TRANSACTION_DATA.metadata,
          address: '0x1234567890abcdef',
          network: 'ethereum',
          memo: 'Withdrawal to external wallet',
        },
      });

      const savedTransaction = await withdrawalTransaction.save();
      expect(savedTransaction.type).toBe('withdrawal');
      expect(savedTransaction.metadata.address).toBe('0x1234567890abcdef');
      expect(savedTransaction.metadata.network).toBe('ethereum');
      expect(savedTransaction.metadata.memo).toBe('Withdrawal to external wallet');
    });

    it('should handle transfer transactions', async () => {
      const transferTransaction = new Transaction({
        ...TEST_TRANSACTION_DATA,
        type: 'transfer',
        metadata: {
          ...TEST_TRANSACTION_DATA.metadata,
          senderWalletId: testSenderWalletId,
          recipientWalletId: testRecipientWalletId,
        },
      });

      const savedTransaction = await transferTransaction.save();
      expect(savedTransaction.type).toBe('transfer');
      expect(savedTransaction.metadata.senderWalletId.toString()).toBe(
        testSenderWalletId.toString()
      );
      expect(savedTransaction.metadata.recipientWalletId.toString()).toBe(
        testRecipientWalletId.toString()
      );
    });

    it('should handle payment transactions', async () => {
      const paymentTransaction = new Transaction({
        ...TEST_TRANSACTION_DATA,
        type: 'payment',
        metadata: {
          ...TEST_TRANSACTION_DATA.metadata,
          serviceType: 'subscription',
        },
      });

      const savedTransaction = await paymentTransaction.save();
      expect(savedTransaction.type).toBe('payment');
      expect(savedTransaction.metadata.serviceType).toBe('subscription');
    });

    it('should handle refund transactions', async () => {
      const refundTransaction = new Transaction({
        ...TEST_TRANSACTION_DATA,
        type: 'refund',
        metadata: {
          ...TEST_TRANSACTION_DATA.metadata,
          transactionId: 'original_transaction_123',
        },
      });

      const savedTransaction = await refundTransaction.save();
      expect(savedTransaction.type).toBe('refund');
      expect(savedTransaction.metadata.transactionId).toBe('original_transaction_123');
    });

    it('should handle fee transactions', async () => {
      const feeTransaction = new Transaction({
        ...TEST_TRANSACTION_DATA,
        type: 'fee',
        description: 'Platform fee',
      });

      const savedTransaction = await feeTransaction.save();
      expect(savedTransaction.type).toBe('fee');
      expect(savedTransaction.description).toBe('Platform fee');
    });
  });

  describe('Transaction Statuses', () => {
    it('should handle pending status', async () => {
      const pendingTransaction = new Transaction({
        ...TEST_TRANSACTION_DATA,
        status: 'pending',
      });

      const savedTransaction = await pendingTransaction.save();
      expect(savedTransaction.status).toBe('pending');
    });

    it('should handle completed status', async () => {
      const completedTransaction = new Transaction({
        ...TEST_TRANSACTION_DATA,
        status: 'completed',
      });

      const savedTransaction = await completedTransaction.save();
      expect(savedTransaction.status).toBe('completed');
    });

    it('should handle failed status', async () => {
      const failedTransaction = new Transaction({
        ...TEST_TRANSACTION_DATA,
        status: 'failed',
        description: 'Payment failed due to insufficient funds',
      });

      const savedTransaction = await failedTransaction.save();
      expect(savedTransaction.status).toBe('failed');
      expect(savedTransaction.description).toBe('Payment failed due to insufficient funds');
    });

    it('should handle cancelled status', async () => {
      const cancelledTransaction = new Transaction({
        ...TEST_TRANSACTION_DATA,
        status: 'cancelled',
        description: 'User cancelled the transaction',
      });

      const savedTransaction = await cancelledTransaction.save();
      expect(savedTransaction.status).toBe('cancelled');
      expect(savedTransaction.description).toBe('User cancelled the transaction');
    });
  });

  describe('Cryptocurrency Transactions', () => {
    it('should handle cryptocurrency deposit transactions', async () => {
      const cryptoDepositTransaction = new Transaction({
        ...TEST_TRANSACTION_DATA,
        currency: 'BTC',
        amount: 100000, // 0.001 BTC in satoshis
        metadata: {
          provider: 'coinbase',
          txHash: '0x1234567890abcdef1234567890abcdef',
          blockConfirmations: 6,
        },
      });

      const savedTransaction = await cryptoDepositTransaction.save();
      expect(savedTransaction.currency).toBe('BTC');
      expect(savedTransaction.amount).toBe(100000);
      expect(savedTransaction.metadata.provider).toBe('coinbase');
      expect(savedTransaction.metadata.txHash).toBe('0x1234567890abcdef1234567890abcdef');
      expect(savedTransaction.metadata.blockConfirmations).toBe(6);
    });

    it('should handle cryptocurrency withdrawal transactions', async () => {
      const cryptoWithdrawalTransaction = new Transaction({
        ...TEST_TRANSACTION_DATA,
        type: 'withdrawal',
        currency: 'ETH',
        amount: 500000000000000000, // 0.5 ETH in wei
        metadata: {
          provider: 'internal',
          address: '0x1234567890abcdef',
          network: 'ethereum',
          txHash: '0xabcdef1234567890abcdef1234567890',
          blockConfirmations: 12,
        },
      });

      const savedTransaction = await cryptoWithdrawalTransaction.save();
      expect(savedTransaction.type).toBe('withdrawal');
      expect(savedTransaction.currency).toBe('ETH');
      expect(savedTransaction.amount).toBe(500000000000000000);
      expect(savedTransaction.metadata.provider).toBe('internal');
      expect(savedTransaction.metadata.address).toBe('0x1234567890abcdef');
      expect(savedTransaction.metadata.network).toBe('ethereum');
      expect(savedTransaction.metadata.txHash).toBe('0xabcdef1234567890abcdef1234567890');
      expect(savedTransaction.metadata.blockConfirmations).toBe(12);
    });
  });

  describe('Indexes', () => {
    it('should have the expected indexes', async () => {
      const indexes = await Transaction.collection.indexes();

      // Check for index on walletId
      const walletIdIndex = indexes.find(index => index.key.walletId === 1);
      expect(walletIdIndex).toBeDefined();

      // Check for index on userId
      const userIdIndex = indexes.find(index => index.key.userId === 1);
      expect(userIdIndex).toBeDefined();

      // Check for index on type
      const typeIndex = indexes.find(index => index.key.type === 1);
      expect(typeIndex).toBeDefined();

      // Check for index on currency
      const currencyIndex = indexes.find(index => index.key.currency === 1);
      expect(currencyIndex).toBeDefined();

      // Check for index on status
      const statusIndex = indexes.find(index => index.key.status === 1);
      expect(statusIndex).toBeDefined();

      // Check for index on createdAt
      const createdAtIndex = indexes.find(index => index.key.createdAt === -1);
      expect(createdAtIndex).toBeDefined();

      // Check for index on metadata.paymentIntentId
      const paymentIntentIdIndex = indexes.find(
        index => index.key['metadata.paymentIntentId'] === 1
      );
      expect(paymentIntentIdIndex).toBeDefined();

      // Check for index on metadata.txHash
      const txHashIndex = indexes.find(index => index.key['metadata.txHash'] === 1);
      expect(txHashIndex).toBeDefined();

      // Check for index on metadata.transactionId
      const transactionIdIndex = indexes.find(index => index.key['metadata.transactionId'] === 1);
      expect(transactionIdIndex).toBeDefined();
    });
  });
});
