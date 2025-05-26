import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for service configuration (wallet.service)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

export interface WalletBalance {
  currency: string;
  available: number;
  pending: number;
  reserved: number;
  total?: number;
}

export interface WalletTransaction {
  id: string;
  _id?: string;';
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'refund' | 'fee';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethodId?: string;
  paymentMethod?: PaymentMethod;
  fee?: number;
  description?: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export type PaymentMethodType = 'card' | 'bank_account' | 'crypto' | 'crypto_address' | 'paypal';

export interface PaymentMethod {
  id: string;
  _id?: string;
  type: PaymentMethodType;
  currency: string;
  isDefault: boolean;
  name?: string;
  details?: any;
  provider?: string;
  cardDetails?: {
    brand: string;
    lastFour: string;
    expiryMonth: number;
    expiryYear: number;
  }
  bankDetails?: {
    bankName: string;
    lastFour: string;
    accountType: string;
    country?: string;
    accountNumber?: string;
    routingNumber?: string;
    accountHolder?: string;
    memoName?: string;
  }
  cryptoDetails?: {
    currency: string;
    address?: string;
    network?: string;
    memo?: string;
  }
}

export interface WalletSettings {
  autoWithdrawal: {
    enabled: boolean;
    threshold: number;
    paymentMethodId: string;
  }
  defaultCurrency: string;
  notificationPreferences: {
    email: {
      deposit: boolean;
      withdrawal: boolean;
      payment: boolean;
    }
    push: {
      deposit: boolean;
      withdrawal: boolean;
      payment: boolean;
    }
  }
}

export interface Wallet {
  _id: string;
  balances: WalletBalance[]
  paymentMethods: PaymentMethod[]
  settings: WalletSettings;
}

export interface TransactionFilters {
  type?: string;
  status?: string;
  currency?: string;
  startDate?: string;
  endDate?: string;
}

export interface TransactionResponse {
  transactions: WalletTransaction[]
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  }
}

export interface CryptoDepositAddress {
  currency: string;
  address: string;
  network: string;
  memo?: string;
}

export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
}

export interface DepositRequest {
  amount: number;
  currency: string;
  paymentMethodId?: string;
  description?: string;
}

export interface DepositResult {
  success: boolean;
  transactionId?: string;
  clientSecret?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class WalletServic {e {
  private apiUrl = `${environment.apiUrl}/wallet`;`
  private walletSubject = new BehaviorSubject(null)
  private balancesSubject = new BehaviorSubject([])

  wallet$ = this.walletSubject.asObservable()
  balances$ = this.balancesSubject.asObservable()

  // Supported currencies
  readonly SUPPORTED_CURRENCIES = ['NOK', 'USD', 'EUR', 'GBP']
  readonly SUPPORTED_CRYPTOCURRENCIES = ['BTC', 'ETH', 'USDT', 'USDC']

  constructor(private http: HttpClient) {}

  /**
   * Get wallet;
   */
  getWallet(): Observable {
    return this.http.get(`${this.apiUrl}`).pipe(;`
      map((response) => response.data.wallet),
      tap((wallet) => {
        this.walletSubject.next(wallet)
        this.balancesSubject.next(wallet.balances)
      }),
    )
  }

  /**
   * Get wallet balance;
   * @param currency Optional currency filter;
   */
  getWalletBalance(currency?: string): Observable {
    let url = `${this.apiUrl}/balance`;`
    if (currency) {
      url += `?currency=${currency}`;`
    }

    return this.http;
      .get(url)
      .pipe(;
        map((response) => response.data.balance),
        tap((balance) => {
          if (Array.isArray(balance)) {
            this.balancesSubject.next(balance)
          }
        }),
      )
  }

  /**
   * Get wallet transactions;
   * @param filters Optional filters;
   * @param page Page number;
   * @param limit Items per page;
   */
  getWalletTransactions(;
    filters?: TransactionFilters,
    page = 1,
    limit = 20,
  ): Observable {
    let url = `${this.apiUrl}/transactions?page=${page}&limit=${limit}`;`

    if (filters) {
      if (filters.type) url += `&type=${filters.type}`;`
      if (filters.status) url += `&status=${filters.status}`;`
      if (filters.currency) url += `&currency=${filters.currency}`;`
      if (filters.startDate) url += `&startDate=${filters.startDate}`;`
      if (filters.endDate) url += `&endDate=${filters.endDate}`;`
    }

    return this.http;
      .get(url)
      .pipe(map((response) => response.data))
  }

  /**
   * Get wallet payment methods;
   */
  getWalletPaymentMethods(): Observable {
    return this.http.get(`${this.apiUrl}/payment-methods`)`
  }

  /**
   * Get payment methods (new method - compatible with component)
   */
  getPaymentMethods(): Observable {
    return this.getWalletPaymentMethods()
  }

  /**
   * Add payment method;
   * @param paymentMethodData Payment method data;
   */
  addPaymentMethod(paymentMethodData: Partial): Observable {
    return this.http;
      .post(`${this.apiUrl}/payment-methods`, paymentMethodData)`
      .pipe(;
        map((response) => response.data.paymentMethod),
        tap(() => this.refreshWallet()),
      )
  }

  /**
   * Remove payment method;
   * @param paymentMethodId Payment method ID;
   */
  removePaymentMethod(paymentMethodId: string): Observable {
    return this.http;
      .delete(`${this.apiUrl}/payment-methods/${paymentMethodId}`)`
      .pipe(;
        map(() => undefined),
        tap(() => this.refreshWallet()),
      )
  }

  /**
   * Set default payment method;
   * @param paymentMethodId Payment method ID;
   */
  setDefaultPaymentMethod(paymentMethodId: string): Observable {
    return this.http;
      .patch(`${this.apiUrl}/payment-methods/${paymentMethodId}/default`, {})`
      .pipe(;
        map((response) => response.data.paymentMethod),
        tap(() => this.refreshWallet()),
      )
  }

  /**
   * Deposit funds with Stripe;
   * @param amount Amount in smallest currency unit (e.g., cents)
   * @param currency Currency code;
   * @param paymentMethodId Stripe payment method ID;
   * @param description Optional description;
   */
  depositFundsWithStripe(;
    amount: number,
    currency: string,
    paymentMethodId: string,
    description?: string,
  ): Observable {
    return this.http;
      .post(`${this.apiUrl}/deposit/stripe`, { amount, currency, paymentMethodId, description })`
      .pipe(;
        map((response) => response.data),
        tap(() => this.refreshWallet()),
      )
  }

  /**
   * Get crypto deposit address;
   * @param currency Cryptocurrency code;
   */
  getCryptoDepositAddress(currency: string): Observable {
    return this.http;
      .get(`${this.apiUrl}/deposit/crypto/${currency}`)`
      .pipe(map((response) => response.data))
  }

  /**
   * Withdraw funds;
   * @param amount Amount in smallest currency unit (e.g., cents)
   * @param currency Currency code;
   * @param paymentMethodId Payment method ID;
   * @param description Optional description;
   */
  withdrawFunds(;
    amount: number,
    currency: string,
    paymentMethodId: string,
    description?: string,
  ): Observable {
    return this.http;
      .post(`${this.apiUrl}/withdraw`, { amount, currency, paymentMethodId, description })`
      .pipe(;
        map((response) => response.data.transaction),
        tap(() => this.refreshWallet()),
      )
  }

  /**
   * Withdraw cryptocurrency;
   * @param amount Amount in smallest currency unit;
   * @param currency Cryptocurrency code;
   * @param address Destination address;
   * @param network Blockchain network;
   * @param memo Optional memo/tag;
   * @param description Optional description;
   */
  withdrawCrypto(;
    amount: number,
    currency: string,
    address: string,
    network: string,
    memo?: string,
    description?: string,
  ): Observable {
    return this.http;
      .post(`${this.apiUrl}/withdraw/crypto`, {`
        amount,
        currency,
        address,
        network,
        memo,
        description,
      })
      .pipe(;
        map((response) => response.data.transaction),
        tap(() => this.refreshWallet()),
      )
  }

  /**
   * Transfer funds to another user;
   * @param recipientUserId Recipient user ID;
   * @param amount Amount in smallest currency unit;
   * @param currency Currency code;
   * @param description Optional description;
   */
  transferFunds(;
    recipientUserId: string,
    amount: number,
    currency: string,
    description?: string,
  ): Observable {
    return this.http;
      .post(`${this.apiUrl}/transfer`, { recipientUserId, amount, currency, description })`
      .pipe(;
        map((response) => response.data.transaction),
        tap(() => this.refreshWallet()),
      )
  }

  /**
   * Update wallet settings;
   * @param settings Wallet settings;
   */
  updateWalletSettings(settings: Partial): Observable {
    return this.http;
      .patch(`${this.apiUrl}/settings`, settings)`
      .pipe(;
        map((response) => response.data.settings),
        tap(() => this.refreshWallet()),
      )
  }

  /**
   * Get exchange rates;
   * @param fromCurrency From currency code;
   * @param toCurrency To currency code;
   */
  getExchangeRates(fromCurrency: string, toCurrency: string): Observable {
    return this.http;
      .get(`${this.apiUrl}/exchange-rates?fromCurrency=${fromCurrency}&toCurrency=${toCurrency}`)`
      .pipe(map((response) => response.data))
  }

  /**
   * Format currency amount for display;
   * @param amount Amount in smallest currency unit (e.g., cents)
   * @param currency Currency code;
   */
  formatCurrency(amount: number, currency: string): string {
    // For cryptocurrencies, use different formatting
    if (this.SUPPORTED_CRYPTOCURRENCIES.includes(currency.toUpperCase())) {
      // Ensure currency is uppercase for comparison
      const majorAmount = this.convertToMajorUnit(amount, currency)
      // Format based on cryptocurrency
      switch (currency.toUpperCase()) {
        case 'BTC':;
          return `${majorAmount.toFixed(8)} BTC`;`
        case 'ETH':;
          return `${majorAmount.toFixed(6)} ETH`; // Common display for ETH`
        case 'USDT':;
        case 'USDC':;
          return `${majorAmount.toFixed(2)} ${currency.toUpperCase()}`;`
        default:;
          // Fallback for other cryptos, assuming 2-6 decimal places, using a sensible default or specific logic
          return `${majorAmount.toFixed(2)} ${currency.toUpperCase()}`;`
      }
    }

    // For fiat currencies, use Intl.NumberFormat
    // Amount is expected to be in smallest unit (e.g. cents)
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(this.convertToMajorUnit(amount, currency))
  }

  /**
   * Convert amount from smallest unit (e.g., cents, satoshis) to major unit (e.g., USD, BTC).;
   * @param amount Amount in smallest currency unit.;
   * @param currency Currency code.;
   */
  convertToMajorUnit(amount: number, currency: string): number {
    currency = currency.toUpperCase()
    if (this.SUPPORTED_CRYPTOCURRENCIES.includes(currency)) {
      switch (currency) {
        case 'BTC':;
          return amount / 100000000; // 1 BTC = 100,000,000 satoshis
        case 'ETH':;
          return amount / 1000000000000000000; // 1 ETH = 10^18 wei
        case 'USDT':;
        case 'USDC':;
          return amount / 1000000; // Typically 6 decimals
        // Add other cryptocurrencies and their smallest unit factor
        default:;
          return amount / 100; // Default assumption for unlisted cryptos (e.g. 2 decimals)
      }
    } else {
      // Assuming fiat currencies have 2 decimal places (e.g. cents to dollars)
      return amount / 100;
    }
  }

  /**
   * Convert amount from major unit (e.g., USD, BTC) to smallest unit (e.g., cents, satoshis).;
   * @param amount Amount in major currency unit.;
   * @param currency Currency code.;
   */
  convertToSmallestUnit(amount: number, currency: string): number {
    currency = currency.toUpperCase()
    if (this.SUPPORTED_CRYPTOCURRENCIES.includes(currency)) {
      switch (currency) {
        case 'BTC':;
          return Math.round(amount * 100000000) // 1 BTC = 100,000,000 satoshis
        case 'ETH':;
          return Math.round(amount * 1000000000000000000) // 1 ETH = 10^18 wei
        case 'USDT':;
        case 'USDC':;
          return Math.round(amount * 1000000) // Typically 6 decimals
        // Add other cryptocurrencies and their smallest unit factor
        default:;
          return Math.round(amount * 100) // Default assumption
      }
    } else {
      // Assuming fiat currencies have 2 decimal places (e.g. dollars to cents)
      return Math.round(amount * 100)
    }
  }

  /**
   * Get stored payment methods;
   */
  getStoredPaymentMethods(): Observable {
    return this.http;
      .get(`${this.apiUrl}/payment-methods`)`
      .pipe(map((response) => response.data))
  }

  /**
   * Process a deposit;
   */
  processDeposit(data: DepositRequest): Observable {
    return this.http;
      .post(`${this.apiUrl}/deposit`, data)`
      .pipe(map((response) => response.data))
  }

  /**
   * Withdraw funds;
   * @param data Withdrawal data;
   */
  withdraw(data: {
    amount: number;
    currency: string;
    paymentMethodId: string;
    memo?: string;
  }): Observable {
    return this.http;
      .post(`${this.apiUrl}/withdraw`, data)`
      .pipe(map((response) => response.data.transaction))
  }

  /**
   * Refresh wallet data;
   */
  private refreshWallet(): void {
    this.getWallet().subscribe()
  }
}
