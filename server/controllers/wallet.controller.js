// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for wallet.controller settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import walletService from '../services/wallet.service.js';
import { AppError } from '../middleware/errorHandler.js';
import { sendError } from '../utils/response.js';

/**
 * Wallet Controller for handling wallet-related API endpoints
 */
class WalletController {
  /**
   * Get wallet for the authenticated user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getWallet(req, res, next) {
    try {
      const wallet = await walletService.getOrCreateWallet(req.user.id);

      res.status(200).json({
        status: 'success',
        data: {
          wallet: {
            _id: wallet._id,
            balances: wallet.balances,
            settings: wallet.settings,
            paymentMethods: wallet.paymentMethods,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get wallet balance
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getWalletBalance(req, res, next) {
    try {
      const { currency } = req.query;
      const balance = await walletService.getWalletBalance(req.user.id, currency);

      res.status(200).json({
        status: 'success',
        data: {
          balance,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get wallet transactions
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getWalletTransactions(req, res, next) {
    try {
      const { type, status, currency, startDate, endDate, page = 1, limit = 20 } = req.query;

      const filters = {
        type,
        status,
        currency,
        startDate,
        endDate,
      };

      const result = await walletService.getWalletTransactions(
        req.user.id,
        filters,
        parseInt(page),
        parseInt(limit)
      );

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get wallet payment methods
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getWalletPaymentMethods(req, res, next) {
    try {
      const paymentMethods = await walletService.getWalletPaymentMethods(req.user.id);

      res.status(200).json({
        status: 'success',
        data: {
          paymentMethods,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add a payment method
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async addPaymentMethod(req, res, next) {
    try {
      const paymentMethodData = req.body;

      if (!paymentMethodData) {
        return next(new AppError('Payment method data is required', 400));
      }

      const paymentMethod = await walletService.addPaymentMethod(req.user.id, paymentMethodData);

      res.status(201).json({
        status: 'success',
        data: {
          paymentMethod,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove a payment method
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async removePaymentMethod(req, res, next) {
    try {
      const { paymentMethodId } = req.params;

      if (!paymentMethodId) {
        return next(new AppError('Payment method ID is required', 400));
      }

      await walletService.removePaymentMethod(req.user.id, paymentMethodId);

      res.status(200).json({
        status: 'success',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Set default payment method
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async setDefaultPaymentMethod(req, res, next) {
    try {
      const { paymentMethodId } = req.params;

      if (!paymentMethodId) {
        return next(new AppError('Payment method ID is required', 400));
      }

      const paymentMethod = await walletService.setDefaultPaymentMethod(
        req.user.id,
        paymentMethodId
      );

      res.status(200).json({
        status: 'success',
        data: {
          paymentMethod,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deposit funds with Stripe
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async depositFundsWithStripe(req, res, next) {
    try {
      const { amount, currency, paymentMethodId, description } = req.body;

      if (!amount || !currency || !paymentMethodId) {
        return next(new AppError('Amount, currency, and payment method ID are required', 400));
      }

      const result = await walletService.depositFundsWithStripe(
        req.user.id,
        amount,
        currency,
        paymentMethodId,
        description
      );

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get crypto deposit address
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getCryptoDepositAddress(req, res, next) {
    try {
      const { currency } = req.params;

      if (!currency) {
        return next(new AppError('Currency is required', 400));
      }

      const result = await walletService.depositCrypto(req.user.id, currency);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Withdraw funds
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async withdrawFunds(req, res, next) {
    try {
      const { amount, currency, paymentMethodId, description } = req.body;

      if (!amount || !currency || !paymentMethodId) {
        return next(new AppError('Amount, currency, and payment method ID are required', 400));
      }

      const transaction = await walletService.withdrawFunds(
        req.user.id,
        amount,
        currency,
        paymentMethodId,
        description
      );

      res.status(200).json({
        status: 'success',
        data: {
          transaction,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Withdraw cryptocurrency
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async withdrawCrypto(req, res, next) {
    try {
      const { amount, currency, address, network, memo, description } = req.body;

      if (!amount || !currency || !address) {
        return next(new AppError('Amount, currency, and address are required', 400));
      }

      const transaction = await walletService.withdrawCrypto(
        req.user.id,
        amount,
        currency,
        address,
        network,
        memo,
        description
      );

      res.status(200).json({
        status: 'success',
        data: {
          transaction,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Transfer funds to another user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async transferFunds(req, res, next) {
    try {
      const { recipientUserId, amount, currency, description } = req.body;

      if (!recipientUserId || !amount || !currency) {
        return next(new AppError('Recipient user ID, amount, and currency are required', 400));
      }

      const transaction = await walletService.transferFunds(
        req.user.id,
        recipientUserId,
        amount,
        currency,
        description
      );

      res.status(200).json({
        status: 'success',
        data: {
          transaction,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update wallet settings
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updateWalletSettings(req, res, next) {
    try {
      const settings = req.body;

      if (!settings) {
        return next(new AppError('Settings are required', 400));
      }

      const updatedSettings = await walletService.updateWalletSettings(req.user.id, settings);

      res.status(200).json({
        status: 'success',
        data: {
          settings: updatedSettings,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle crypto webhook
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async handleCryptoWebhook(req, res, next) {
    try {
      const event = req.body;

      if (!event) {
        return next(new AppError('Event data is required', 400));
      }

      const result = await walletService.processCryptoWebhook(event);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get exchange rates
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getExchangeRates(req, res, next) {
    try {
      const { fromCurrency, toCurrency } = req.query;

      if (!fromCurrency || !toCurrency) {
        return next(new AppError('From and to currencies are required', 400));
      }

      const rate = await walletService.getExchangeRate(fromCurrency, toCurrency);

      res.status(200).json({
        status: 'success',
        data: {
          fromCurrency,
          toCurrency,
          rate,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export async function someHandler(req, res) {
  // TODO: Implement wallet handler
  return sendError(res, new Error('NOT_IMPLEMENTED'), 501);
}

export default new WalletController();
