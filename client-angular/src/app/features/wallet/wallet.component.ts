// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (wallet.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import {
  WalletService,
  Wallet,
  WalletBalance,
  WalletTransaction,
  PaymentMethod,
  TransactionFilters,
} from '../../core/services/wallet.service';
import { PaymentService } from '../../core/services/payment.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';

import { ClipboardModule } from '@angular/cdk/clipboard';
import { QRCodeModule } from '../../shared/qrcode/qrcode.module';

// Import Emerald components
import { CardGridComponent } from '../../shared/emerald/components/card-grid/card-grid.component';
import { PagerComponent } from '../../shared/emerald/components/pager/pager.component';
import { AppCardComponent } from '../../shared/emerald/components/app-card/app-card.component';
import { FloatingActionButtonComponent } from '../../shared/emerald/components/floating-action-button/floating-action-button.component';

// Import dialogs
import { DepositDialogComponent } from './dialogs/deposit-dialog.component';
import { WithdrawDialogComponent } from './dialogs/withdraw-dialog.component';
import { TransferDialogComponent } from './dialogs/transfer-dialog.component';
import { AddPaymentMethodDialogComponent } from './dialogs/add-payment-method-dialog.component';
import { TransactionDetailsDialogComponent } from './dialogs/transaction-details-dialog.component';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    MatExpansionModule,
    MatDividerModule,
    MatBadgeModule,
    MatMenuModule,
    MatSlideToggleModule,
    QRCodeModule,
    ClipboardModule,
    // Emerald components
    CardGridComponent,
    PagerComponent,
    AppCardComponent,
    FloatingActionButtonComponent,
  ],
})
export class WalletComponent implements OnInit {
  wallet: Wallet | null = null;
  balances: WalletBalance[] = [];
  transactions: WalletTransaction[] = [];
  paymentMethods: PaymentMethod[] = [];

  // Transaction filters
  transactionFilters: TransactionFilters = {};
  currentPage = 1;
  pageSize = 10;
  totalTransactions = 0;
  totalPages = 1;

  // Loading states
  loading = {
    wallet: true,
    transactions: false,
    paymentMethods: false,
  };

  // Selected currency for operations
  selectedCurrency = 'NOK';

  // Transaction types for filtering
  transactionTypes = [
    { value: '', label: 'All Types' },
    { value: 'deposit', label: 'Deposits' },
    { value: 'withdrawal', label: 'Withdrawals' },
    { value: 'transfer', label: 'Transfers' },
    { value: 'payment', label: 'Payments' },
    { value: 'refund', label: 'Refunds' },
    { value: 'fee', label: 'Fees' },
  ];

  // Transaction statuses for filtering
  transactionStatuses = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  // Settings form
  settingsForm: FormGroup;

  // Display columns for transactions table
  displayedColumns: string[] = ['date', 'type', 'amount', 'status', 'actions'];

  constructor(
    public walletService: WalletService,
    private paymentService: PaymentService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    // Initialize settings form
    this.settingsForm = this.fb.group({
      defaultCurrency: ['NOK', Validators.required],
      autoWithdrawal: this.fb.group({
        enabled: [false],
        threshold: [100000, [Validators.required, Validators.min(10000)]],
        paymentMethodId: [''],
      }),
      notificationPreferences: this.fb.group({
        email: this.fb.group({
          deposit: [true],
          withdrawal: [true],
          payment: [true],
        }),
        push: this.fb.group({
          deposit: [true],
          withdrawal: [true],
          payment: [true],
        }),
      }),
    });
  }

  ngOnInit(): void {
    this.loadWallet();
  }

  /**
   * Load wallet data
   */
  loadWallet(): void {
    this.loading.wallet = true;

    this.walletService.getWallet().subscribe({
      next: wallet => {
        this.wallet = wallet;
        this.balances = wallet.balances;
        this.selectedCurrency = wallet.settings.defaultCurrency;

        // Update settings form
        this.settingsForm.patchValue(wallet.settings);

        this.loading.wallet = false;

        // Load transactions and payment methods
        this.loadTransactions();
        this.loadPaymentMethods();
      },
      error: error => {
        console.error('Error loading wallet:', error);
        this.notificationService.error('Failed to load wallet data');
        this.loading.wallet = false;
      },
    });
  }

  /**
   * Load transactions with current filters
   */
  loadTransactions(): void {
    this.loading.transactions = true;

    this.walletService
      .getWalletTransactions(this.transactionFilters, this.currentPage, this.pageSize)
      .subscribe({
        next: response => {
          this.transactions = response.transactions;
          this.totalTransactions = response.pagination.total;
          this.totalPages = response.pagination.pages;
          this.loading.transactions = false;
        },
        error: error => {
          console.error('Error loading transactions:', error);
          this.notificationService.error('Failed to load transactions');
          this.loading.transactions = false;
        },
      });
  }

  /**
   * Load payment methods
   */
  loadPaymentMethods(): void {
    this.loading.paymentMethods = true;

    this.walletService.getWalletPaymentMethods().subscribe({
      next: paymentMethods => {
        this.paymentMethods = paymentMethods;
        this.loading.paymentMethods = false;
      },
      error: error => {
        console.error('Error loading payment methods:', error);
        this.notificationService.error('Failed to load payment methods');
        this.loading.paymentMethods = false;
      },
    });
  }

  /**
   * Apply transaction filters
   */
  applyFilters(): void {
    this.currentPage = 1;
    this.loadTransactions();
  }

  /**
   * Reset transaction filters
   */
  resetFilters(): void {
    this.transactionFilters = {};
    this.currentPage = 1;
    this.loadTransactions();
  }

  /**
   * Handle page change
   * @param page New page number
   */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadTransactions();
  }

  /**
   * Handle page size change
   * @param size New page size
   */
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadTransactions();
  }

  /**
   * Open deposit dialog
   */
  openDepositDialog(): void {
    const dialogRef = this.dialog.open(DepositDialogComponent, {
      width: '500px',
      data: {
        currencies: this.walletService.SUPPORTED_CURRENCIES.concat(
          this.walletService.SUPPORTED_CRYPTOCURRENCIES
        ),
        paymentMethods: this.paymentMethods,
        selectedCurrency: this.selectedCurrency,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadWallet();
      }
    });
  }

  /**
   * Open withdraw dialog
   */
  openWithdrawDialog(): void {
    const dialogRef = this.dialog.open(WithdrawDialogComponent, {
      width: '500px',
      data: {
        balances: this.balances,
        paymentMethods: this.paymentMethods,
        selectedCurrency: this.selectedCurrency,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadWallet();
      }
    });
  }

  /**
   * Open transfer dialog
   */
  openTransferDialog(): void {
    const dialogRef = this.dialog.open(TransferDialogComponent, {
      width: '500px',
      data: {
        balances: this.balances,
        selectedCurrency: this.selectedCurrency,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadWallet();
      }
    });
  }

  /**
   * Open add payment method dialog
   */
  openAddPaymentMethodDialog(): void {
    const dialogRef = this.dialog.open(AddPaymentMethodDialogComponent, {
      width: '500px',
      data: {
        currencies: this.walletService.SUPPORTED_CURRENCIES,
        cryptocurrencies: this.walletService.SUPPORTED_CRYPTOCURRENCIES,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPaymentMethods();
      }
    });
  }

  /**
   * Open transaction details dialog
   * @param transaction Transaction to view
   */
  openTransactionDetailsDialog(transaction: WalletTransaction): void {
    this.dialog.open(TransactionDetailsDialogComponent, {
      width: '600px',
      data: { transaction },
    });
  }

  /**
   * Remove payment method
   * @param paymentMethodId Payment method ID
   */
  removePaymentMethod(paymentMethodId: string): void {
    if (confirm('Are you sure you want to remove this payment method?')) {
      this.walletService.removePaymentMethod(paymentMethodId).subscribe({
        next: () => {
          this.notificationService.success('Payment method removed');
          this.loadPaymentMethods();
        },
        error: error => {
          console.error('Error removing payment method:', error);
          this.notificationService.error('Failed to remove payment method');
        },
      });
    }
  }

  /**
   * Set default payment method
   * @param paymentMethodId Payment method ID
   */
  setDefaultPaymentMethod(paymentMethodId: string): void {
    this.walletService.setDefaultPaymentMethod(paymentMethodId).subscribe({
      next: () => {
        this.notificationService.success('Default payment method updated');
        this.loadPaymentMethods();
      },
      error: error => {
        console.error('Error setting default payment method:', error);
        this.notificationService.error('Failed to update default payment method');
      },
    });
  }

  /**
   * Save wallet settings
   */
  saveSettings(): void {
    if (this.settingsForm.invalid) {
      return;
    }

    const settings = this.settingsForm.value;

    this.walletService.updateWalletSettings(settings).subscribe({
      next: updatedSettings => {
        this.notificationService.success('Wallet settings updated');

        // Update local wallet settings
        if (this.wallet) {
          this.wallet.settings = updatedSettings;
        }
      },
      error: error => {
        console.error('Error updating wallet settings:', error);
        this.notificationService.error('Failed to update wallet settings');
      },
    });
  }

  /**
   * Get CSS class for transaction type
   * @param type Transaction type
   */
  getTransactionTypeClass(type: string): string {
    switch (type) {
      case 'deposit':
        return 'transaction-deposit';
      case 'withdrawal':
        return 'transaction-withdrawal';
      case 'transfer':
        return 'transaction-transfer';
      case 'payment':
        return 'transaction-payment';
      case 'refund':
        return 'transaction-refund';
      case 'fee':
        return 'transaction-fee';
      default:
        return '';
    }
  }

  /**
   * Get CSS class for transaction status
   * @param status Transaction status
   */
  getTransactionStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'completed':
        return 'status-completed';
      case 'failed':
        return 'status-failed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  /**
   * Format transaction amount with sign
   * @param transaction Transaction
   */
  formatTransactionAmount(transaction: WalletTransaction): string {
    const sign = transaction.amount >= 0 ? '+' : '';
    return `${sign}${this.walletService.formatCurrency(transaction.amount, transaction.currency)}`;
  }

  /**
   * Get payment method display name
   * @param paymentMethod Payment method
   */
  getPaymentMethodDisplayName(paymentMethod: PaymentMethod): string {
    switch (paymentMethod.type) {
      case 'card':
        if (paymentMethod.cardDetails) {
          return `${paymentMethod.cardDetails.brand} •••• ${paymentMethod.cardDetails.lastFour}`;
        }
        return 'Card';

      case 'bank_account':
        if (paymentMethod.bankDetails) {
          return `${paymentMethod.bankDetails.bankName} •••• ${paymentMethod.bankDetails.lastFour}`;
        }
        return 'Bank Account';

      case 'crypto_address':
        if (paymentMethod.cryptoDetails) {
          return `${paymentMethod.cryptoDetails.currency} Address`;
        }
        return 'Crypto Address';

      default:
        return 'Unknown Payment Method';
    }
  }

  /**
   * Get payment method icon
   * @param paymentMethod Payment method
   */
  getPaymentMethodIcon(paymentMethod: PaymentMethod): string {
    switch (paymentMethod.type) {
      case 'card':
        if (paymentMethod.cardDetails) {
          switch (paymentMethod.cardDetails.brand.toLowerCase()) {
            case 'visa':
              return 'cc-visa';
            case 'mastercard':
              return 'cc-mastercard';
            case 'amex':
              return 'cc-amex';
            default:
              return 'credit_card';
          }
        }
        return 'credit_card';

      case 'bank_account':
        return 'account_balance';

      case 'crypto_address':
        if (paymentMethod.cryptoDetails) {
          switch (paymentMethod.cryptoDetails.currency) {
            case 'BTC':
              return 'currency_bitcoin';
            case 'ETH':
              return 'currency_ethereum';
            default:
              return 'currency_exchange';
          }
        }
        return 'currency_exchange';

      default:
        return 'payment';
    }
  }

  /**
   * Get total balance in default currency
   */
  getTotalBalance(): string {
    if (!this.balances.length) {
      return this.walletService.formatCurrency(0, this.selectedCurrency);
    }

    // Find balance in default currency
    const defaultBalance = this.balances.find(b => b.currency === this.selectedCurrency);

    if (defaultBalance) {
      return this.walletService.formatCurrency(defaultBalance.available, this.selectedCurrency);
    }

    // If no balance in default currency, return 0
    return this.walletService.formatCurrency(0, this.selectedCurrency);
  }

  /**
   * Check if user has any payment methods
   */
  hasPaymentMethods(): boolean {
    return this.paymentMethods.length > 0;
  }

  /**
   * Check if user has any transactions
   */
  hasTransactions(): boolean {
    return this.totalTransactions > 0;
  }
}
