// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for service configuration (wallet.service)
//
// COMMON CUSTOMIZATIONS:
// - SUPPORTED_CURRENCIES: List of supported fiat currencies (default: ['NOK', 'USD', 'EUR', 'GBP'])
//   Related to: wallet.model.js:SUPPORTED_CURRENCIES
// - SUPPORTED_CRYPTOCURRENCIES: List of supported cryptocurrencies (default: ['BTC', 'ETH', 'USDT', 'USDC'])
//   Related to: wallet.model.js:SUPPORTED_CRYPTOCURRENCIES
// - MINIMUM_WITHDRAWAL: Minimum withdrawal amount in smallest currency unit (default: 10000 = 100 NOK)
//   Related to: wallet.model.js:MINIMUM_WITHDRAWAL
// - WITHDRAWAL_FEE_PERCENTAGE: Fee percentage for withdrawals (default: 2.5)
// - DEPOSIT_FEE_PERCENTAGE: Fee percentage for deposits (default: 1.5)
// - CRYPTO_WITHDRAWAL_FEE: Fixed fee for crypto withdrawals in smallest currency unit (default: 5000 = 50 NOK)
// ===================================================
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Wallet = require('../models/wallet.model');
const User = require('../models/user.model');
const { AppError } = require('../middleware/errorHandler');
const axios = require('axios');
const crypto = require('crypto');

// Constants
const SUPPORTED_CURRENCIES = ['NOK', 'USD', 'EUR', 'GBP'];
const SUPPORTED_CRYPTOCURRENCIES = ['BTC', 'ETH', 'USDT', 'USDC'];
const MINIMUM_WITHDRAWAL = 10000; // 100 NOK in øre
const WITHDRAWAL_FEE_PERCENTAGE = 2.5;
const DEPOSIT_FEE_PERCENTAGE = 1.5;
const CRYPTO_WITHDRAWAL_FEE = 5000; // 50 NOK in øre

// Exchange rate API endpoint
const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest/NOK';

/**
 * Wallet Service for handling wallet operations
 */
class WalletService {
  /**
   * Get or create a wallet for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Wallet object
   */
  async getOrCreateWallet(userId) {
    try {
      // Check if user exists
      const user = await User.findById(userId);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Find existing wallet or create a new one
      let wallet = await Wallet.findOne({ userId });

      if (!wallet) {
        wallet = new Wallet({
          userId,
          balances: [
            {
              currency: 'NOK',
              available: 0,
              pending: 0,
              reserved: 0,
            },
          ],
          settings: {
            defaultCurrency: 'NOK',
          },
        });

        await wallet.save();
      }

      return wallet;
    } catch (error) {
      console.error('Error getting or creating wallet:', error);
      throw error;
    }
  }

  /**
   * Get wallet balance for a user
   * @param {string} userId - User ID
   * @param {string} currency - Currency code (optional)
   * @returns {Promise<Object>} Wallet balance
   */
  async getWalletBalance(userId, currency) {
    try {
      const wallet = await this.getOrCreateWallet(userId);

      if (currency) {
        return wallet.getBalance(currency);
      }

      return wallet.balances;
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      throw error;
    }
  }

  /**
   * Get wallet transactions for a user
   * @param {string} userId - User ID
   * @param {Object} filters - Filter options
   * @param {number} page - Page number
   * @param {number} limit - Number of transactions per page
   * @returns {Promise<Object>} Wallet transactions
   */
  async getWalletTransactions(userId, filters = {}, page = 1, limit = 20) {
    try {
      const wallet = await this.getOrCreateWallet(userId);

      // Build query
      let query = {};

      if (filters.type) {
        query.type = filters.type;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.currency) {
        query.currency = filters.currency;
      }

      if (filters.startDate && filters.endDate) {
        query.createdAt = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate),
        };
      } else if (filters.startDate) {
        query.createdAt = { $gte: new Date(filters.startDate) };
      } else if (filters.endDate) {
        query.createdAt = { $lte: new Date(filters.endDate) };
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Get transactions
      const transactions = wallet.transactions
        .filter(t => {
          // Apply filters
          let match = true;

          if (query.type && t.type !== query.type) {
            match = false;
          }

          if (query.status && t.status !== query.status) {
            match = false;
          }

          if (query.currency && t.currency !== query.currency) {
            match = false;
          }

          if (query.createdAt) {
            const createdAt = new Date(t.createdAt);

            if (query.createdAt.$gte && createdAt < query.createdAt.$gte) {
              match = false;
            }

            if (query.createdAt.$lte && createdAt > query.createdAt.$lte) {
              match = false;
            }
          }

          return match;
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(skip, skip + limit);

      // Count total transactions
      const total = wallet.transactions.filter(t => {
        // Apply filters
        let match = true;

        if (query.type && t.type !== query.type) {
          match = false;
        }

        if (query.status && t.status !== query.status) {
          match = false;
        }

        if (query.currency && t.currency !== query.currency) {
          match = false;
        }

        if (query.createdAt) {
          const createdAt = new Date(t.createdAt);

          if (query.createdAt.$gte && createdAt < query.createdAt.$gte) {
            match = false;
          }

          if (query.createdAt.$lte && createdAt > query.createdAt.$lte) {
            match = false;
          }
        }

        return match;
      }).length;

      return {
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error getting wallet transactions:', error);
      throw error;
    }
  }

  /**
   * Get wallet payment methods for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Wallet payment methods
   */
  async getWalletPaymentMethods(userId) {
    try {
      const wallet = await this.getOrCreateWallet(userId);
      return wallet.paymentMethods;
    } catch (error) {
      console.error('Error getting wallet payment methods:', error);
      throw error;
    }
  }

  /**
   * Add a payment method to a wallet
   * @param {string} userId - User ID
   * @param {Object} paymentMethodData - Payment method data
   * @returns {Promise<Object>} Added payment method
   */
  async addPaymentMethod(userId, paymentMethodData) {
    try {
      const wallet = await this.getOrCreateWallet(userId);

      // Validate payment method data
      if (!paymentMethodData.type) {
        throw new AppError('Payment method type is required', 400);
      }

      if (!paymentMethodData.provider) {
        throw new AppError('Payment method provider is required', 400);
      }

      // Handle different payment method types
      switch (paymentMethodData.type) {
        case 'card':
          if (!paymentMethodData.cardDetails) {
            throw new AppError('Card details are required', 400);
          }
          break;

        case 'bank_account':
          if (!paymentMethodData.bankDetails) {
            throw new AppError('Bank account details are required', 400);
          }
          break;

        case 'crypto_address':
          if (!paymentMethodData.cryptoDetails) {
            throw new AppError('Crypto address details are required', 400);
          }

          if (!SUPPORTED_CRYPTOCURRENCIES.includes(paymentMethodData.cryptoDetails.currency)) {
            throw new AppError(
              `Unsupported cryptocurrency: ${paymentMethodData.cryptoDetails.currency}`,
              400
            );
          }
          break;

        default:
          throw new AppError(`Unsupported payment method type: ${paymentMethodData.type}`, 400);
      }

      // Add payment method to wallet
      await wallet.addPaymentMethod(paymentMethodData);

      // Return the added payment method
      return wallet.paymentMethods[wallet.paymentMethods.length - 1];
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }

  /**
   * Remove a payment method from a wallet
   * @param {string} userId - User ID
   * @param {string} paymentMethodId - Payment method ID
   * @returns {Promise<boolean>} Success status
   */
  async removePaymentMethod(userId, paymentMethodId) {
    try {
      const wallet = await this.getOrCreateWallet(userId);

      // Check if payment method exists
      const paymentMethod = wallet.paymentMethods.id(paymentMethodId);

      if (!paymentMethod) {
        throw new AppError('Payment method not found', 404);
      }

      // Remove payment method from wallet
      await wallet.removePaymentMethod(paymentMethodId);

      return true;
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw error;
    }
  }

  /**
   * Set a payment method as default
   * @param {string} userId - User ID
   * @param {string} paymentMethodId - Payment method ID
   * @returns {Promise<Object>} Updated payment method
   */
  async setDefaultPaymentMethod(userId, paymentMethodId) {
    try {
      const wallet = await this.getOrCreateWallet(userId);

      // Check if payment method exists
      const paymentMethod = wallet.paymentMethods.id(paymentMethodId);

      if (!paymentMethod) {
        throw new AppError('Payment method not found', 404);
      }

      // Set payment method as default
      await wallet.setDefaultPaymentMethod(paymentMethodId);

      return wallet.paymentMethods.id(paymentMethodId);
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  }

  /**
   * Deposit funds to a wallet using Stripe
   * @param {string} userId - User ID
   * @param {number} amount - Amount in smallest currency unit (e.g., cents)
   * @param {string} currency - Currency code
   * @param {string} paymentMethodId - Stripe payment method ID
   * @param {string} description - Deposit description
   * @returns {Promise<Object>} Deposit transaction
   */
  async depositFundsWithStripe(
    userId,
    amount,
    currency,
    paymentMethodId,
    description = 'Wallet deposit'
  ) {
    try {
      // Validate inputs
      if (!amount || amount <= 0) {
        throw new AppError('Valid amount is required', 400);
      }

      if (!SUPPORTED_CURRENCIES.includes(currency)) {
        throw new AppError(`Unsupported currency: ${currency}`, 400);
      }

      if (!paymentMethodId) {
        throw new AppError('Payment method ID is required', 400);
      }

      const wallet = await this.getOrCreateWallet(userId);
      const user = await User.findById(userId);

      // Calculate fee
      const feePercentage = DEPOSIT_FEE_PERCENTAGE;
      const feeAmount = Math.round(amount * (feePercentage / 100));
      const netAmount = amount - feeAmount;

      // Create a payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: currency.toLowerCase(),
        payment_method: paymentMethodId,
        confirm: true,
        metadata: {
          userId,
          walletId: wallet._id.toString(),
          type: 'wallet_deposit',
        },
        description: `Wallet deposit for ${user.username}`,
      });

      // Create a transaction record
      const transaction = {
        type: 'deposit',
        amount: netAmount,
        currency,
        status: paymentIntent.status === 'succeeded' ? 'completed' : 'pending',
        description,
        metadata: {
          paymentIntentId: paymentIntent.id,
          paymentMethodId,
          provider: 'stripe',
        },
        fee: {
          amount: feeAmount,
          currency,
        },
      };

      // Add transaction to wallet
      await wallet.addTransaction(transaction);

      // Update wallet balance if payment succeeded
      if (paymentIntent.status === 'succeeded') {
        await wallet.updateBalance(currency, netAmount);
      }

      return {
        transaction: wallet.transactions[wallet.transactions.length - 1],
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error) {
      console.error('Error depositing funds with Stripe:', error);
      throw error;
    }
  }

  /**
   * Deposit cryptocurrency to a wallet
   * @param {string} userId - User ID
   * @param {string} currency - Cryptocurrency code
   * @returns {Promise<Object>} Deposit address
   */
  async depositCrypto(userId, currency) {
    try {
      // Validate inputs
      if (!SUPPORTED_CRYPTOCURRENCIES.includes(currency)) {
        throw new AppError(`Unsupported cryptocurrency: ${currency}`, 400);
      }

      const wallet = await this.getOrCreateWallet(userId);

      // Check if a crypto payment method already exists for this currency
      let cryptoPaymentMethod = wallet.paymentMethods.find(
        pm => pm.type === 'crypto_address' && pm.cryptoDetails.currency === currency
      );

      // If not, create a new one
      if (!cryptoPaymentMethod) {
        // In a real implementation, you would integrate with a crypto payment provider
        // to generate a unique deposit address for the user

        // For demonstration purposes, we'll generate a mock address
        const mockAddress = this.generateMockCryptoAddress(currency);

        cryptoPaymentMethod = {
          type: 'crypto_address',
          provider: 'mock',
          isDefault: false,
          cryptoDetails: {
            currency,
            address: mockAddress,
            network: 'mainnet',
          },
        };

        await wallet.addPaymentMethod(cryptoPaymentMethod);
        cryptoPaymentMethod = wallet.paymentMethods[wallet.paymentMethods.length - 1];
      }

      return {
        currency,
        address: cryptoPaymentMethod.cryptoDetails.address,
        network: cryptoPaymentMethod.cryptoDetails.network,
        memo: cryptoPaymentMethod.cryptoDetails.memo,
      };
    } catch (error) {
      console.error('Error generating crypto deposit address:', error);
      throw error;
    }
  }

  /**
   * Withdraw funds from a wallet to a bank account
   * @param {string} userId - User ID
   * @param {number} amount - Amount in smallest currency unit (e.g., cents)
   * @param {string} currency - Currency code
   * @param {string} paymentMethodId - Payment method ID
   * @param {string} description - Withdrawal description
   * @returns {Promise<Object>} Withdrawal transaction
   */
  async withdrawFunds(
    userId,
    amount,
    currency,
    paymentMethodId,
    description = 'Wallet withdrawal'
  ) {
    try {
      // Validate inputs
      if (!amount || amount <= 0) {
        throw new AppError('Valid amount is required', 400);
      }

      if (amount < MINIMUM_WITHDRAWAL) {
        throw new AppError(
          `Minimum withdrawal amount is ${MINIMUM_WITHDRAWAL / 100} ${currency}`,
          400
        );
      }

      if (!SUPPORTED_CURRENCIES.includes(currency)) {
        throw new AppError(`Unsupported currency: ${currency}`, 400);
      }

      if (!paymentMethodId) {
        throw new AppError('Payment method ID is required', 400);
      }

      const wallet = await this.getOrCreateWallet(userId);

      // Check if payment method exists
      const paymentMethod = wallet.paymentMethods.id(paymentMethodId);

      if (!paymentMethod) {
        throw new AppError('Payment method not found', 404);
      }

      // Check if wallet has sufficient balance
      const balance = wallet.getBalance(currency);

      if (balance.available < amount) {
        throw new AppError(
          `Insufficient balance. Available: ${balance.available / 100} ${currency}`,
          400
        );
      }

      // Calculate fee
      const feePercentage = WITHDRAWAL_FEE_PERCENTAGE;
      const feeAmount = Math.round(amount * (feePercentage / 100));
      // Net amount will be used in future implementation for receipt generation
      // eslint-disable-next-line no-unused-vars
      const netAmount = amount - feeAmount;

      // Create a transaction record
      const transaction = {
        type: 'withdrawal',
        amount: -amount, // Negative amount for withdrawal
        currency,
        status: 'pending',
        description,
        metadata: {
          paymentMethodId,
          provider: paymentMethod.provider,
        },
        fee: {
          amount: feeAmount,
          currency,
        },
      };

      // Add transaction to wallet
      await wallet.addTransaction(transaction);

      // Reserve the funds
      await wallet.updateBalance(currency, -amount, 'available');
      await wallet.updateBalance(currency, amount, 'reserved');

      // In a real implementation, you would initiate a bank transfer or payout
      // through your payment provider here

      // For demonstration purposes, we'll simulate a successful withdrawal after a delay
      setTimeout(async () => {
        try {
          // Find the transaction
          const updatedWallet = await Wallet.findOne({ userId });
          const pendingTransaction = updatedWallet.transactions.find(
            t =>
              t.status === 'pending' &&
              t.type === 'withdrawal' &&
              t._id.toString() === transaction._id.toString()
          );

          if (pendingTransaction) {
            // Update transaction status
            pendingTransaction.status = 'completed';
            pendingTransaction.updatedAt = new Date();

            // Release reserved funds
            const balanceIndex = updatedWallet.balances.findIndex(b => b.currency === currency);
            if (balanceIndex !== -1) {
              updatedWallet.balances[balanceIndex].reserved -= amount;
            }

            await updatedWallet.save();
          }
        } catch (error) {
          console.error('Error completing withdrawal:', error);
        }
      }, 5000); // 5 seconds delay

      return wallet.transactions[wallet.transactions.length - 1];
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      throw error;
    }
  }

  /**
   * Withdraw cryptocurrency from a wallet
   * @param {string} userId - User ID
   * @param {number} amount - Amount in smallest currency unit
   * @param {string} currency - Cryptocurrency code
   * @param {string} address - Destination address
   * @param {string} network - Blockchain network
   * @param {string} memo - Optional memo/tag for certain cryptocurrencies
   * @param {string} description - Withdrawal description
   * @returns {Promise<Object>} Withdrawal transaction
   */
  async withdrawCrypto(
    userId,
    amount,
    currency,
    address,
    network,
    memo,
    description = 'Crypto withdrawal'
  ) {
    try {
      // Validate inputs
      if (!amount || amount <= 0) {
        throw new AppError('Valid amount is required', 400);
      }

      if (!SUPPORTED_CRYPTOCURRENCIES.includes(currency)) {
        throw new AppError(`Unsupported cryptocurrency: ${currency}`, 400);
      }

      if (!address) {
        throw new AppError('Destination address is required', 400);
      }

      const wallet = await this.getOrCreateWallet(userId);

      // Check if wallet has sufficient balance
      const balance = wallet.getBalance(currency);

      if (balance.available < amount) {
        throw new AppError(
          `Insufficient balance. Available: ${balance.available} ${currency}`,
          400
        );
      }

      // Calculate fee (fixed fee for crypto withdrawals)
      const feeAmount = CRYPTO_WITHDRAWAL_FEE;

      // Convert fee to crypto currency if needed
      let cryptoFeeAmount = feeAmount;
      if (currency !== 'NOK') {
        // Get exchange rate
        const exchangeRate = await this.getExchangeRate('NOK', currency);
        cryptoFeeAmount = Math.round(feeAmount * exchangeRate);
      }

      // Check if balance is sufficient after fee
      if (balance.available < amount + cryptoFeeAmount) {
        throw new AppError(
          `Insufficient balance after fee. Available: ${balance.available} ${currency}, Required: ${amount + cryptoFeeAmount} ${currency}`,
          400
        );
      }

      // Create a transaction record
      const transaction = {
        type: 'withdrawal',
        amount: -amount, // Negative amount for withdrawal
        currency,
        status: 'pending',
        description,
        metadata: {
          provider: 'crypto',
          address,
          network,
          memo,
        },
        fee: {
          amount: cryptoFeeAmount,
          currency,
        },
      };

      // Add transaction to wallet
      await wallet.addTransaction(transaction);

      // Reserve the funds (including fee)
      const totalAmount = amount + cryptoFeeAmount;
      await wallet.updateBalance(currency, -totalAmount, 'available');
      await wallet.updateBalance(currency, totalAmount, 'reserved');

      // In a real implementation, you would initiate a cryptocurrency transfer
      // through your crypto payment provider here

      // For demonstration purposes, we'll simulate a successful withdrawal after a delay
      setTimeout(async () => {
        try {
          // Find the transaction
          const updatedWallet = await Wallet.findOne({ userId });
          const pendingTransaction = updatedWallet.transactions.find(
            t =>
              t.status === 'pending' &&
              t.type === 'withdrawal' &&
              t._id.toString() === transaction._id.toString()
          );

          if (pendingTransaction) {
            // Update transaction status
            pendingTransaction.status = 'completed';
            pendingTransaction.updatedAt = new Date();
            pendingTransaction.metadata.txHash = this.generateMockTxHash();

            // Release reserved funds
            const balanceIndex = updatedWallet.balances.findIndex(b => b.currency === currency);
            if (balanceIndex !== -1) {
              updatedWallet.balances[balanceIndex].reserved -= totalAmount;
            }

            await updatedWallet.save();
          }
        } catch (error) {
          console.error('Error completing crypto withdrawal:', error);
        }
      }, 10000); // 10 seconds delay

      return wallet.transactions[wallet.transactions.length - 1];
    } catch (error) {
      console.error('Error withdrawing cryptocurrency:', error);
      throw error;
    }
  }

  /**
   * Transfer funds between users
   * @param {string} senderUserId - Sender user ID
   * @param {string} recipientUserId - Recipient user ID
   * @param {number} amount - Amount in smallest currency unit
   * @param {string} currency - Currency code
   * @param {string} description - Transfer description
   * @returns {Promise<Object>} Transfer transaction
   */
  async transferFunds(
    senderUserId,
    recipientUserId,
    amount,
    currency,
    description = 'Wallet transfer'
  ) {
    try {
      // Validate inputs
      if (!amount || amount <= 0) {
        throw new AppError('Valid amount is required', 400);
      }

      if (
        !SUPPORTED_CURRENCIES.includes(currency) &&
        !SUPPORTED_CRYPTOCURRENCIES.includes(currency)
      ) {
        throw new AppError(`Unsupported currency: ${currency}`, 400);
      }

      if (senderUserId === recipientUserId) {
        throw new AppError('Cannot transfer to yourself', 400);
      }

      // Get sender and recipient wallets
      const senderWallet = await this.getOrCreateWallet(senderUserId);
      const recipientWallet = await this.getOrCreateWallet(recipientUserId);

      // Check if sender has sufficient balance
      const senderBalance = senderWallet.getBalance(currency);

      if (senderBalance.available < amount) {
        throw new AppError(
          `Insufficient balance. Available: ${senderBalance.available / 100} ${currency}`,
          400
        );
      }

      // Create sender transaction record
      const senderTransaction = {
        type: 'transfer',
        amount: -amount, // Negative amount for sender
        currency,
        status: 'completed',
        description,
        metadata: {
          recipientWalletId: recipientWallet._id,
          provider: 'internal',
        },
      };

      // Create recipient transaction record
      const recipientTransaction = {
        type: 'transfer',
        amount, // Positive amount for recipient
        currency,
        status: 'completed',
        description,
        metadata: {
          senderWalletId: senderWallet._id,
          provider: 'internal',
        },
      };

      // Add transactions to wallets
      await senderWallet.addTransaction(senderTransaction);
      await recipientWallet.addTransaction(recipientTransaction);

      // Update balances
      await senderWallet.updateBalance(currency, -amount);
      await recipientWallet.updateBalance(currency, amount);

      return senderWallet.transactions[senderWallet.transactions.length - 1];
    } catch (error) {
      console.error('Error transferring funds:', error);
      throw error;
    }
  }

  /**
   * Update wallet settings
   * @param {string} userId - User ID
   * @param {Object} settings - Wallet settings
   * @returns {Promise<Object>} Updated wallet settings
   */
  async updateWalletSettings(userId, settings) {
    try {
      const wallet = await this.getOrCreateWallet(userId);

      // Update settings
      if (settings.defaultCurrency) {
        if (
          !SUPPORTED_CURRENCIES.includes(settings.defaultCurrency) &&
          !SUPPORTED_CRYPTOCURRENCIES.includes(settings.defaultCurrency)
        ) {
          throw new AppError(`Unsupported currency: ${settings.defaultCurrency}`, 400);
        }

        wallet.settings.defaultCurrency = settings.defaultCurrency;
      }

      if (settings.autoWithdrawal !== undefined) {
        wallet.settings.autoWithdrawal = {
          ...wallet.settings.autoWithdrawal,
          ...settings.autoWithdrawal,
        };
      }

      if (settings.notificationPreferences) {
        wallet.settings.notificationPreferences = {
          ...wallet.settings.notificationPreferences,
          ...settings.notificationPreferences,
        };
      }

      await wallet.save();

      return wallet.settings;
    } catch (error) {
      console.error('Error updating wallet settings:', error);
      throw error;
    }
  }

  /**
   * Process a webhook event for crypto deposits
   * @param {Object} event - Webhook event
   * @returns {Promise<Object>} Processing result
   */
  async processCryptoWebhook(event) {
    try {
      // In a real implementation, you would verify the webhook signature
      // and process the event based on your crypto payment provider's API

      // For demonstration purposes, we'll simulate processing a deposit

      const { type, data } = event;

      if (type === 'crypto_deposit') {
        const { address, amount, currency, txHash } = data;

        // Find the wallet with this crypto address
        const wallet = await Wallet.findOne({
          'paymentMethods.type': 'crypto_address',
          'paymentMethods.cryptoDetails.address': address,
        });

        if (!wallet) {
          return { received: true, processed: false, error: 'Wallet not found' };
        }

        // Check if transaction already exists
        const existingTransaction = wallet.transactions.find(t => t.metadata.txHash === txHash);

        if (existingTransaction) {
          return { received: true, processed: false, error: 'Transaction already processed' };
        }

        // Calculate fee
        const feePercentage = DEPOSIT_FEE_PERCENTAGE;
        const feeAmount = Math.round(amount * (feePercentage / 100));
        const netAmount = amount - feeAmount;

        // Create a transaction record
        const transaction = {
          type: 'deposit',
          amount: netAmount,
          currency,
          status: 'completed',
          description: 'Cryptocurrency deposit',
          metadata: {
            txHash,
            provider: 'crypto',
            blockConfirmations: data.confirmations,
          },
          fee: {
            amount: feeAmount,
            currency,
          },
        };

        // Add transaction to wallet
        await wallet.addTransaction(transaction);

        // Update wallet balance
        await wallet.updateBalance(currency, netAmount);

        return {
          received: true,
          processed: true,
          walletId: wallet._id,
          userId: wallet.userId,
          amount: netAmount,
          currency,
        };
      }

      return { received: true, processed: false };
    } catch (error) {
      console.error('Error processing crypto webhook:', error);
      throw error;
    }
  }

  /**
   * Get exchange rate between currencies
   * @param {string} fromCurrency - From currency code
   * @param {string} toCurrency - To currency code
   * @returns {Promise<number>} Exchange rate
   */
  async getExchangeRate(fromCurrency, toCurrency) {
    try {
      // Use exchange rate API to get rates
      const response = await axios.get(EXCHANGE_RATE_API);
      const rates = response.data.rates;

      // Convert from NOK to target currency
      if (fromCurrency === 'NOK') {
        return rates[toCurrency] || 0;
      }

      // Convert from source currency to NOK
      if (toCurrency === 'NOK') {
        return 1 / (rates[fromCurrency] || 1);
      }

      // Convert between two non-NOK currencies
      const fromRate = rates[fromCurrency] || 1;
      const toRate = rates[toCurrency] || 1;

      return toRate / fromRate;
    } catch (error) {
      console.error('Error getting exchange rate:', error);
      return 1; // Default to 1:1 exchange rate on error
    }
  }

  /**
   * Generate a mock cryptocurrency address for testing
   * @param {string} currency - Cryptocurrency code
   * @returns {string} Mock address
   */
  generateMockCryptoAddress(currency) {
    const prefixes = {
      BTC: '1',
      ETH: '0x',
      USDT: '0x',
      USDC: '0x',
    };

    const prefix = prefixes[currency] || '';
    const randomBytes = crypto.randomBytes(20).toString('hex');

    return `${prefix}${randomBytes}`;
  }

  /**
   * Generate a mock transaction hash for testing
   * @returns {string} Mock transaction hash
   */
  generateMockTxHash() {
    return `0x${crypto.randomBytes(32).toString('hex')}`;
  }
}

module.exports = new WalletService();
