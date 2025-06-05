// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the wallet model
//
// COMMON CUSTOMIZATIONS:
// - TEST_WALLET_DATA: Test wallet data (default: defined in this file)
//   Related to: server/models/wallet.model.js
// ===================================================

import mongoose from 'mongoose';
import Wallet from '../../../models/wallet.model.js';
import User from '../../../models/user.model.js';
import { setupTestDB, teardownTestDB, clearDatabase } from '../../setup.ts.js';
import { createTestUser } from '../../helpers.ts.js';

// Test data for wallet
const TEST_TRANSACTION = {
  type: 'deposit',
  amount: 10000, // 100 NOK in øre
  currency: 'NOK',
  status: 'completed',
  description: 'Test deposit',
  metadata: {
    paymentIntentId: 'pi_test123',
    provider: 'stripe',
  },
};

const TEST_BALANCE = {
  currency: 'NOK',
  available: 10000,
  pending: 0,
  reserved: 0,
};

const TEST_PAYMENT_METHOD = {
  type: 'card',
  provider: 'stripe',
  isDefault: true,
  cardDetails: {
    lastFour: '4242',
    brand: 'visa',
    expiryMonth: 12,
    expiryYear: 2025,
    tokenId: 'tok_visa_testtoken',
  },
};

describe('Wallet Model', () => {
  let testUser;

  // Setup and teardown for all tests
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  // Create a test user before each test
  beforeEach(async () => {
    testUser = await createTestUser();
  });

  // Clear database between tests
  afterEach(async () => {
    await clearDatabase();
  });

  describe('Basic Wallet Creation', () => {
    it('should create a new wallet successfully', async () => {
      // Create a valid wallet with required fields
      const walletData = {
        userId: testUser._id,
      };

      const wallet = new Wallet(walletData);
      const savedWallet = await wallet.save();

      // Verify the saved wallet
      expect(savedWallet._id).toBeDefined();
      expect(savedWallet.userId.toString()).toBe(testUser._id.toString());

      // Check default values
      expect(savedWallet.balances).toEqual([]);
      expect(savedWallet.transactions).toEqual([]);
      expect(savedWallet.paymentMethods).toEqual([]);
      expect(savedWallet.settings.autoWithdrawal.enabled).toBe(false);
      expect(savedWallet.settings.autoWithdrawal.threshold).toBe(100000);
      expect(savedWallet.settings.defaultCurrency).toBe('NOK');
      expect(savedWallet.settings.notificationPreferences.email.deposit).toBe(true);
      expect(savedWallet.settings.notificationPreferences.email.withdrawal).toBe(true);
      expect(savedWallet.settings.notificationPreferences.email.payment).toBe(true);
      expect(savedWallet.settings.notificationPreferences.push.deposit).toBe(true);
      expect(savedWallet.settings.notificationPreferences.push.withdrawal).toBe(true);
      expect(savedWallet.settings.notificationPreferences.push.payment).toBe(true);

      // Verify timestamps
      expect(savedWallet.createdAt).toBeDefined();
      expect(savedWallet.updatedAt).toBeDefined();
    });

    it('should require userId', async () => {
      const wallet = new Wallet({});

      // Expect validation to fail
      await expect(wallet.save()).rejects.toThrow();

      // Check specific validation errors
      try {
        await wallet.save();
      } catch (error) {
        expect(error.errors.userId).toBeDefined();
      }
    });

    it('should enforce unique userId', async () => {
      // Create first wallet
      const wallet1 = new Wallet({ userId: testUser._id });
      await wallet1.save();

      // Try to create second wallet with same userId
      const wallet2 = new Wallet({ userId: testUser._id });

      // Expect validation to fail
      await expect(wallet2.save()).rejects.toThrow();
    });
  });

  describe('Balance Methods', () => {
    let testWallet;

    beforeEach(async () => {
      // Create a test wallet for balance testing
      testWallet = new Wallet({
        userId: testUser._id,
        balances: [TEST_BALANCE],
      });

      await testWallet.save();
    });

    it('should get balance for a specific currency', async () => {
      const balance = testWallet.getBalance('NOK');

      expect(balance.currency).toBe('NOK');
      expect(balance.available).toBe(10000);
      expect(balance.pending).toBe(0);
      expect(balance.reserved).toBe(0);
    });

    it('should return zero balance for non-existent currency', async () => {
      const balance = testWallet.getBalance('USD');

      expect(balance.currency).toBe('USD');
      expect(balance.available).toBe(0);
      expect(balance.pending).toBe(0);
      expect(balance.reserved).toBe(0);
    });

    it('should update available balance', async () => {
      await testWallet.updateBalance('NOK', 5000, 'available');

      const balance = testWallet.getBalance('NOK');
      expect(balance.available).toBe(15000); // 10000 + 5000
      expect(balance.pending).toBe(0);
      expect(balance.reserved).toBe(0);
    });

    it('should update pending balance', async () => {
      await testWallet.updateBalance('NOK', 5000, 'pending');

      const balance = testWallet.getBalance('NOK');
      expect(balance.available).toBe(10000);
      expect(balance.pending).toBe(5000);
      expect(balance.reserved).toBe(0);
    });

    it('should update reserved balance', async () => {
      await testWallet.updateBalance('NOK', 5000, 'reserved');

      const balance = testWallet.getBalance('NOK');
      expect(balance.available).toBe(10000);
      expect(balance.pending).toBe(0);
      expect(balance.reserved).toBe(5000);
    });

    it('should create new balance for non-existent currency', async () => {
      // First, verify the currency doesn't exist
      const initialBalance = testWallet.getBalance('USD');
      expect(initialBalance.available).toBe(0);

      // Create a new balance entry for USD
      testWallet.balances.push({
        currency: 'USD',
        available: 0,
        pending: 0,
        reserved: 0,
      });

      // Save the wallet with the new balance
      await testWallet.save();

      // Now update the balance
      await testWallet.updateBalance('USD', 5000, 'available');

      // Reload the wallet from the database to get the updated balances
      const reloadedWallet = await Wallet.findById(testWallet._id);
      const reloadedBalance = reloadedWallet.getBalance('USD');

      // Verify the balance was updated correctly
      expect(reloadedBalance.currency).toBe('USD');
      expect(reloadedBalance.available).toBe(5000);
      expect(reloadedBalance.pending).toBe(0);
      expect(reloadedBalance.reserved).toBe(0);
    });
  });

  describe('Transaction Methods', () => {
    let testWallet;

    beforeEach(async () => {
      // Create a test wallet for transaction testing
      testWallet = new Wallet({
        userId: testUser._id,
      });

      await testWallet.save();
    });

    it('should add a transaction', async () => {
      await testWallet.addTransaction(TEST_TRANSACTION);

      // Verify transaction was added
      expect(testWallet.transactions.length).toBe(1);
      expect(testWallet.transactions[0].type).toBe(TEST_TRANSACTION.type);
      expect(testWallet.transactions[0].amount).toBe(TEST_TRANSACTION.amount);
      expect(testWallet.transactions[0].currency).toBe(TEST_TRANSACTION.currency);
      expect(testWallet.transactions[0].status).toBe(TEST_TRANSACTION.status);
      expect(testWallet.transactions[0].description).toBe(TEST_TRANSACTION.description);
      expect(testWallet.transactions[0].metadata.paymentIntentId).toBe(
        TEST_TRANSACTION.metadata.paymentIntentId
      );
      expect(testWallet.transactions[0].metadata.provider).toBe(TEST_TRANSACTION.metadata.provider);
    });

    it('should add multiple transactions', async () => {
      // Add first transaction
      await testWallet.addTransaction(TEST_TRANSACTION);

      // Add second transaction
      const secondTransaction = {
        ...TEST_TRANSACTION,
        type: 'withdrawal',
        amount: 5000,
        description: 'Test withdrawal',
      };
      await testWallet.addTransaction(secondTransaction);

      // Verify both transactions were added
      expect(testWallet.transactions.length).toBe(2);
      expect(testWallet.transactions[0].type).toBe(TEST_TRANSACTION.type);
      expect(testWallet.transactions[1].type).toBe(secondTransaction.type);
    });
  });

  describe('Payment Method Methods', () => {
    let testWallet;

    beforeEach(async () => {
      // Create a test wallet for payment method testing
      testWallet = new Wallet({
        userId: testUser._id,
      });

      await testWallet.save();
    });

    it('should add a payment method', async () => {
      await testWallet.addPaymentMethod(TEST_PAYMENT_METHOD);

      // Verify payment method was added
      expect(testWallet.paymentMethods.length).toBe(1);
      expect(testWallet.paymentMethods[0].type).toBe(TEST_PAYMENT_METHOD.type);
      expect(testWallet.paymentMethods[0].provider).toBe(TEST_PAYMENT_METHOD.provider);
      expect(testWallet.paymentMethods[0].isDefault).toBe(TEST_PAYMENT_METHOD.isDefault);
      expect(testWallet.paymentMethods[0].cardDetails.lastFour).toBe(
        TEST_PAYMENT_METHOD.cardDetails.lastFour
      );
      expect(testWallet.paymentMethods[0].cardDetails.brand).toBe(
        TEST_PAYMENT_METHOD.cardDetails.brand
      );
      expect(testWallet.paymentMethods[0].cardDetails.expiryMonth).toBe(
        TEST_PAYMENT_METHOD.cardDetails.expiryMonth
      );
      expect(testWallet.paymentMethods[0].cardDetails.expiryYear).toBe(
        TEST_PAYMENT_METHOD.cardDetails.expiryYear
      );
      expect(testWallet.paymentMethods[0].cardDetails.tokenId).toBe(
        TEST_PAYMENT_METHOD.cardDetails.tokenId
      );
    });

    it('should add multiple payment methods', async () => {
      // Add first payment method (card)
      await testWallet.addPaymentMethod(TEST_PAYMENT_METHOD);

      // Add second payment method (bank account)
      const bankPaymentMethod = {
        type: 'bank_account',
        provider: 'stripe',
        isDefault: true,
        bankDetails: {
          accountType: 'checking',
          lastFour: '6789',
          bankName: 'Test Bank',
          country: 'NO',
          currency: 'NOK',
          tokenId: 'ba_testtoken',
        },
      };
      await testWallet.addPaymentMethod(bankPaymentMethod);

      // Verify both payment methods were added
      expect(testWallet.paymentMethods.length).toBe(2);
      expect(testWallet.paymentMethods[0].type).toBe(TEST_PAYMENT_METHOD.type);
      expect(testWallet.paymentMethods[1].type).toBe(bankPaymentMethod.type);

      // Verify default status was updated correctly
      // Card should no longer be default since it's a different type
      expect(testWallet.paymentMethods[0].isDefault).toBe(true);
      expect(testWallet.paymentMethods[1].isDefault).toBe(true);
    });

    it('should handle default payment methods of the same type', async () => {
      // Add first card payment method as default
      await testWallet.addPaymentMethod(TEST_PAYMENT_METHOD);

      // Add second card payment method as default
      const secondCardPaymentMethod = {
        ...TEST_PAYMENT_METHOD,
        cardDetails: {
          ...TEST_PAYMENT_METHOD.cardDetails,
          lastFour: '1234',
          tokenId: 'tok_visa_testtoken2',
        },
      };
      await testWallet.addPaymentMethod(secondCardPaymentMethod);

      // Verify both payment methods were added
      expect(testWallet.paymentMethods.length).toBe(2);

      // Verify default status was updated correctly
      // First card should no longer be default
      expect(testWallet.paymentMethods[0].isDefault).toBe(false);
      expect(testWallet.paymentMethods[1].isDefault).toBe(true);
    });

    it('should remove a payment method', async () => {
      // Add a payment method
      await testWallet.addPaymentMethod(TEST_PAYMENT_METHOD);
      const paymentMethodId = testWallet.paymentMethods[0]._id;

      // Remove the payment method
      await testWallet.removePaymentMethod(paymentMethodId);

      // Verify payment method was removed
      expect(testWallet.paymentMethods.length).toBe(0);
    });

    it('should get default payment method for a specific type', async () => {
      // Add card payment method as default
      await testWallet.addPaymentMethod(TEST_PAYMENT_METHOD);

      // Add bank payment method as default
      const bankPaymentMethod = {
        type: 'bank_account',
        provider: 'stripe',
        isDefault: true,
        bankDetails: {
          accountType: 'checking',
          lastFour: '6789',
          bankName: 'Test Bank',
          country: 'NO',
          currency: 'NOK',
          tokenId: 'ba_testtoken',
        },
      };
      await testWallet.addPaymentMethod(bankPaymentMethod);

      // Get default card payment method
      const defaultCard = testWallet.getDefaultPaymentMethod('card');
      expect(defaultCard).toBeDefined();
      expect(defaultCard.type).toBe('card');
      expect(defaultCard.isDefault).toBe(true);

      // Get default bank payment method
      const defaultBank = testWallet.getDefaultPaymentMethod('bank_account');
      expect(defaultBank).toBeDefined();
      expect(defaultBank.type).toBe('bank_account');
      expect(defaultBank.isDefault).toBe(true);
    });

    it('should set a payment method as default', async () => {
      // Add first card payment method as default
      await testWallet.addPaymentMethod(TEST_PAYMENT_METHOD);

      // Add second card payment method as non-default
      const secondCardPaymentMethod = {
        ...TEST_PAYMENT_METHOD,
        isDefault: false,
        cardDetails: {
          ...TEST_PAYMENT_METHOD.cardDetails,
          lastFour: '1234',
          tokenId: 'tok_visa_testtoken2',
        },
      };
      await testWallet.addPaymentMethod(secondCardPaymentMethod);

      // Set second card as default
      const secondCardId = testWallet.paymentMethods[1]._id;
      await testWallet.setDefaultPaymentMethod(secondCardId);

      // Verify default status was updated correctly
      expect(testWallet.paymentMethods[0].isDefault).toBe(false);
      expect(testWallet.paymentMethods[1].isDefault).toBe(true);
    });

    it('should throw error when setting non-existent payment method as default', async () => {
      // Try to set a non-existent payment method as default
      const nonExistentId = new mongoose.Types.ObjectId();

      try {
        await testWallet.setDefaultPaymentMethod(nonExistentId);
        // If we reach here, the test should fail
        expect(true).toBe(false); // This will fail the test if no error is thrown
      } catch (error) {
        expect(error.message).toBe('Payment method not found');
      }
    });
  });
});
