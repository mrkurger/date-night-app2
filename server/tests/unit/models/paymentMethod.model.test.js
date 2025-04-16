// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the paymentMethod model
//
// COMMON CUSTOMIZATIONS:
// - TEST_PAYMENT_METHOD_DATA: Test payment method data (default: defined in this file)
//   Related to: server/models/paymentMethod.model.js
// ===================================================

const mongoose = require('mongoose');
const PaymentMethod = require('../../../models/paymentMethod.model');
const User = require('../../../models/user.model');
const Wallet = require('../../../models/wallet.model');
const { setupTestDB, teardownTestDB, clearDatabase } = require('../../setup');
const { createTestUser } = require('../../helpers');

// Test data for payment methods
const TEST_CARD_PAYMENT_METHOD = {
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

const TEST_BANK_PAYMENT_METHOD = {
  type: 'bank_account',
  provider: 'stripe',
  isDefault: false,
  bankDetails: {
    accountType: 'checking',
    lastFour: '6789',
    bankName: 'Test Bank',
    country: 'NO',
    currency: 'NOK',
    tokenId: 'ba_testtoken',
  },
};

const TEST_CRYPTO_PAYMENT_METHOD = {
  type: 'crypto_address',
  provider: 'coinbase',
  isDefault: false,
  cryptoDetails: {
    currency: 'BTC',
    address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    network: 'mainnet',
    memo: '',
  },
};

describe('PaymentMethod Model', () => {
  let testUser;
  let testWallet;

  // Setup and teardown for all tests
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  // Create a test user and wallet before each test
  beforeEach(async () => {
    testUser = await createTestUser();

    // Create a wallet for the test user
    testWallet = new Wallet({
      userId: testUser._id,
      balance: 0,
      currency: 'NOK',
      isActive: true,
    });

    await testWallet.save();
  });

  // Clear database between tests
  afterEach(async () => {
    await clearDatabase();
  });

  describe('Basic PaymentMethod Creation', () => {
    it('should create a card payment method successfully', async () => {
      // Create a valid card payment method
      const paymentMethodData = {
        ...TEST_CARD_PAYMENT_METHOD,
        userId: testUser._id,
        walletId: testWallet._id,
      };

      const paymentMethod = new PaymentMethod(paymentMethodData);
      const savedPaymentMethod = await paymentMethod.save();

      // Verify the saved payment method
      expect(savedPaymentMethod._id).toBeDefined();
      expect(savedPaymentMethod.type).toBe(paymentMethodData.type);
      expect(savedPaymentMethod.provider).toBe(paymentMethodData.provider);
      expect(savedPaymentMethod.isDefault).toBe(paymentMethodData.isDefault);
      expect(savedPaymentMethod.userId.toString()).toBe(testUser._id.toString());
      expect(savedPaymentMethod.walletId.toString()).toBe(testWallet._id.toString());

      // Verify card details
      expect(savedPaymentMethod.cardDetails.lastFour).toBe(paymentMethodData.cardDetails.lastFour);
      expect(savedPaymentMethod.cardDetails.brand).toBe(paymentMethodData.cardDetails.brand);
      expect(savedPaymentMethod.cardDetails.expiryMonth).toBe(
        paymentMethodData.cardDetails.expiryMonth
      );
      expect(savedPaymentMethod.cardDetails.expiryYear).toBe(
        paymentMethodData.cardDetails.expiryYear
      );
      expect(savedPaymentMethod.cardDetails.tokenId).toBe(paymentMethodData.cardDetails.tokenId);

      // Verify timestamps
      expect(savedPaymentMethod.createdAt).toBeDefined();
      expect(savedPaymentMethod.updatedAt).toBeDefined();
    });

    it('should create a bank account payment method successfully', async () => {
      // Create a valid bank account payment method
      const paymentMethodData = {
        ...TEST_BANK_PAYMENT_METHOD,
        userId: testUser._id,
        walletId: testWallet._id,
      };

      const paymentMethod = new PaymentMethod(paymentMethodData);
      const savedPaymentMethod = await paymentMethod.save();

      // Verify the saved payment method
      expect(savedPaymentMethod._id).toBeDefined();
      expect(savedPaymentMethod.type).toBe(paymentMethodData.type);
      expect(savedPaymentMethod.provider).toBe(paymentMethodData.provider);
      expect(savedPaymentMethod.isDefault).toBe(paymentMethodData.isDefault);
      expect(savedPaymentMethod.userId.toString()).toBe(testUser._id.toString());
      expect(savedPaymentMethod.walletId.toString()).toBe(testWallet._id.toString());

      // Verify bank details
      expect(savedPaymentMethod.bankDetails.accountType).toBe(
        paymentMethodData.bankDetails.accountType
      );
      expect(savedPaymentMethod.bankDetails.lastFour).toBe(paymentMethodData.bankDetails.lastFour);
      expect(savedPaymentMethod.bankDetails.bankName).toBe(paymentMethodData.bankDetails.bankName);
      expect(savedPaymentMethod.bankDetails.country).toBe(paymentMethodData.bankDetails.country);
      expect(savedPaymentMethod.bankDetails.currency).toBe(paymentMethodData.bankDetails.currency);
      expect(savedPaymentMethod.bankDetails.tokenId).toBe(paymentMethodData.bankDetails.tokenId);
    });

    it('should create a crypto address payment method successfully', async () => {
      // Create a valid crypto address payment method
      const paymentMethodData = {
        ...TEST_CRYPTO_PAYMENT_METHOD,
        userId: testUser._id,
        walletId: testWallet._id,
      };

      const paymentMethod = new PaymentMethod(paymentMethodData);
      const savedPaymentMethod = await paymentMethod.save();

      // Verify the saved payment method
      expect(savedPaymentMethod._id).toBeDefined();
      expect(savedPaymentMethod.type).toBe(paymentMethodData.type);
      expect(savedPaymentMethod.provider).toBe(paymentMethodData.provider);
      expect(savedPaymentMethod.isDefault).toBe(paymentMethodData.isDefault);
      expect(savedPaymentMethod.userId.toString()).toBe(testUser._id.toString());
      expect(savedPaymentMethod.walletId.toString()).toBe(testWallet._id.toString());

      // Verify crypto details
      expect(savedPaymentMethod.cryptoDetails.currency).toBe(
        paymentMethodData.cryptoDetails.currency
      );
      expect(savedPaymentMethod.cryptoDetails.address).toBe(
        paymentMethodData.cryptoDetails.address
      );
      expect(savedPaymentMethod.cryptoDetails.network).toBe(
        paymentMethodData.cryptoDetails.network
      );
      expect(savedPaymentMethod.cryptoDetails.memo).toBe(paymentMethodData.cryptoDetails.memo);
    });
  });

  describe('PaymentMethod Validation', () => {
    it('should require userId, walletId, type, and provider', async () => {
      const paymentMethod = new PaymentMethod({});

      // Expect validation to fail
      await expect(paymentMethod.save()).rejects.toThrow();

      // Check specific validation errors
      try {
        await paymentMethod.save();
      } catch (error) {
        expect(error.errors.userId).toBeDefined();
        expect(error.errors.walletId).toBeDefined();
        expect(error.errors.type).toBeDefined();
        expect(error.errors.provider).toBeDefined();
      }
    });

    it('should validate type enum values', async () => {
      const paymentMethodData = {
        userId: testUser._id,
        walletId: testWallet._id,
        type: 'invalid_type', // Invalid type
        provider: 'stripe',
      };

      const paymentMethod = new PaymentMethod(paymentMethodData);

      // Expect validation to fail
      await expect(paymentMethod.save()).rejects.toThrow();

      // Check specific validation error
      try {
        await paymentMethod.save();
      } catch (error) {
        expect(error.errors.type).toBeDefined();
      }
    });
  });

  describe('PaymentMethod Default Status', () => {
    it('should allow setting a payment method as default', async () => {
      // Create a non-default payment method
      const paymentMethodData = {
        ...TEST_CARD_PAYMENT_METHOD,
        userId: testUser._id,
        walletId: testWallet._id,
        isDefault: false,
      };

      const paymentMethod = new PaymentMethod(paymentMethodData);
      let savedPaymentMethod = await paymentMethod.save();

      // Verify it's not default
      expect(savedPaymentMethod.isDefault).toBe(false);

      // Update to make it default
      savedPaymentMethod.isDefault = true;
      savedPaymentMethod = await savedPaymentMethod.save();

      // Verify it's now default
      expect(savedPaymentMethod.isDefault).toBe(true);
    });

    it('should allow multiple payment methods for the same user', async () => {
      // Create first payment method (card)
      const cardPaymentMethodData = {
        ...TEST_CARD_PAYMENT_METHOD,
        userId: testUser._id,
        walletId: testWallet._id,
      };

      const cardPaymentMethod = new PaymentMethod(cardPaymentMethodData);
      await cardPaymentMethod.save();

      // Create second payment method (bank account)
      const bankPaymentMethodData = {
        ...TEST_BANK_PAYMENT_METHOD,
        userId: testUser._id,
        walletId: testWallet._id,
      };

      const bankPaymentMethod = new PaymentMethod(bankPaymentMethodData);
      await bankPaymentMethod.save();

      // Query all payment methods for the user
      const userPaymentMethods = await PaymentMethod.find({ userId: testUser._id });

      // Verify both payment methods were saved
      expect(userPaymentMethods.length).toBe(2);
      expect(userPaymentMethods.some(pm => pm.type === 'card')).toBe(true);
      expect(userPaymentMethods.some(pm => pm.type === 'bank_account')).toBe(true);
    });
  });

  describe('PaymentMethod Queries', () => {
    beforeEach(async () => {
      // Create multiple payment methods for testing queries
      const paymentMethods = [
        {
          ...TEST_CARD_PAYMENT_METHOD,
          userId: testUser._id,
          walletId: testWallet._id,
          isDefault: true,
        },
        {
          ...TEST_BANK_PAYMENT_METHOD,
          userId: testUser._id,
          walletId: testWallet._id,
          isDefault: false,
        },
        {
          ...TEST_CRYPTO_PAYMENT_METHOD,
          userId: testUser._id,
          walletId: testWallet._id,
          isDefault: false,
        },
      ];

      // Save all payment methods
      for (const methodData of paymentMethods) {
        const paymentMethod = new PaymentMethod(methodData);
        await paymentMethod.save();
      }
    });

    it('should find all payment methods for a user', async () => {
      const userPaymentMethods = await PaymentMethod.find({ userId: testUser._id });

      // Should find 3 payment methods
      expect(userPaymentMethods.length).toBe(3);
    });

    it('should find payment methods by type', async () => {
      const cardPaymentMethods = await PaymentMethod.find({
        userId: testUser._id,
        type: 'card',
      });

      // Should find 1 card payment method
      expect(cardPaymentMethods.length).toBe(1);
      expect(cardPaymentMethods[0].type).toBe('card');

      const bankPaymentMethods = await PaymentMethod.find({
        userId: testUser._id,
        type: 'bank_account',
      });

      // Should find 1 bank payment method
      expect(bankPaymentMethods.length).toBe(1);
      expect(bankPaymentMethods[0].type).toBe('bank_account');

      const cryptoPaymentMethods = await PaymentMethod.find({
        userId: testUser._id,
        type: 'crypto_address',
      });

      // Should find 1 crypto payment method
      expect(cryptoPaymentMethods.length).toBe(1);
      expect(cryptoPaymentMethods[0].type).toBe('crypto_address');
    });

    it('should find default payment method', async () => {
      const defaultPaymentMethods = await PaymentMethod.find({
        userId: testUser._id,
        isDefault: true,
      });

      // Should find 1 default payment method
      expect(defaultPaymentMethods.length).toBe(1);
      expect(defaultPaymentMethods[0].isDefault).toBe(true);
      expect(defaultPaymentMethods[0].type).toBe('card'); // The card is set as default
    });
  });
});
