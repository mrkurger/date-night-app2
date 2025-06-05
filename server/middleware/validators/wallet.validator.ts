import { z } from 'zod';
import { zodSchemas } from '../../utils/validation-utils.js';

export const WalletSchemas = {
  // Schema for payment method
  paymentMethod: z.object({
    type: z.enum(['card', 'bank_account', 'crypto']),
    details: z.object({
      token: z.string().min(1),
      saveForFuture: z.boolean().optional(),
    }),
  }),

  // Schema for payment method ID param
  paymentMethodIdParam: z.object({
    paymentMethodId: zodSchemas.objectId,
  }),

  // Schema for deposit
  deposit: z.object({
    amount: z.number().positive(),
    currency: z.enum(['nok', 'usd', 'eur']),
    paymentMethodId: zodSchemas.objectId.optional(),
  }),

  // Schema for crypto deposit
  cryptoDeposit: z.object({
    currency: z.string().min(1),
  }),

  // Schema for withdrawal
  withdrawal: z.object({
    amount: z.number().positive(),
    currency: z.enum(['nok', 'usd', 'eur']),
    destinationId: zodSchemas.objectId,
  }),

  // Schema for crypto withdrawal
  cryptoWithdrawal: z.object({
    amount: z.number().positive(),
    currency: z.string().min(1),
    address: z.string().min(1),
    networkId: z.string().optional(),
  }),

  // Schema for funds transfer
  transfer: z.object({
    amount: z.number().positive(),
    currency: z.enum(['nok', 'usd', 'eur']),
    recipientId: zodSchemas.objectId,
    note: zodSchemas.shortString.optional(),
  }),

  // Schema for wallet settings
  walletSettings: z.object({
    defaultCurrency: z.enum(['nok', 'usd', 'eur']).optional(),
    autoConvert: z.boolean().optional(),
    withdrawalThreshold: z.number().positive().optional(),
    notificationPreferences: z
      .object({
        balanceAlerts: z.boolean().optional(),
        depositNotifications: z.boolean().optional(),
        withdrawalNotifications: z.boolean().optional(),
      })
      .optional(),
  }),
};
