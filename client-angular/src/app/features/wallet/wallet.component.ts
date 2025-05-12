// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (wallet.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
// Nebular Imports (will be expanded as needed)
import {
  NbCardModule,
  NbButtonModule,
  NbIconModule,
  NbTabsetModule,
  NbSelectModule,
  NbCheckboxModule,
  NbRadioModule,
  NbToggleModule,
  NbInputModule,
  NbFormFieldModule,
  NbSpinnerModule,
  NbTooltipModule,
  NbBadgeModule,
  NbMenuModule,
  NbActionsModule,
  NbDialogService,
  NbToastrService,
  NbListModule,
  NbAlertModule,
  NbTagModule,
  NbUserModule,
  NbAccordionModule,
  NbDatepickerModule,
} from '@nebular/theme';

import {
  WalletService,
  Wallet,
  WalletTransaction,
  TransactionFilters,
  PaymentMethod,
  WalletBalance,
} from '../../core/services/wallet.service';
import { PaymentService } from '../../core/services/payment.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';

import { QRCodeModule } from '../../shared/qrcode/qrcode.module';

// Import dialogs
import { DepositDialogComponent } from './dialogs/deposit-dialog.component';
import { WithdrawDialogComponent } from './dialogs/withdraw-dialog.component';
import { TransferDialogComponent } from './dialogs/transfer-dialog.component';
import { AddPaymentMethodDialogComponent } from './dialogs/add-payment-method-dialog.component';
import { TransactionDetailsDialogComponent } from './dialogs/transaction-details-dialog.component';

type TransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'refund' | null;
type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | null;

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
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbTabsetModule,
    NbSelectModule,
    NbCheckboxModule,
    NbRadioModule,
    NbToggleModule,
    NbInputModule,
    NbFormFieldModule,
    NbSpinnerModule,
    NbTooltipModule,
    NbBadgeModule,
    NbMenuModule,
    NbActionsModule,
    NbListModule,
    NbAlertModule,
    NbTagModule,
    NbUserModule,
    NbAccordionModule,
    QRCodeModule,
    NbDatepickerModule,
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

  // Filter properties
  selectedType: TransactionType = null;
  selectedStatus: TransactionStatus = null;
  fromDate: Date | null = null;
  toDate: Date | null = null;

  // New properties for filtering
  balanceFilter: { search: string } = { search: '' };
  paymentMethodsFilter: { search: string; type: string } = { search: '', type: '' };
  filteredBalances: WalletBalance[] = [];
  filteredPaymentMethods: PaymentMethod[] = [];

  constructor(
    public walletService: WalletService,
    private paymentService: PaymentService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private dialogService: NbDialogService,
    private toastrService: NbToastrService,
    private fb: FormBuilder,
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
      next: (wallet) => {
        this.wallet = wallet;
        // Map balances to match expected interface
        this.balances = wallet.balances.map((balance) => ({
          currency: balance.currency,
          available: balance.available,
          pending: balance.pending,
          reserved: balance.reserved,
          total: balance.available + balance.pending, // Calculate total for withdraw dialog
        }));
        this.selectedCurrency = wallet.settings.defaultCurrency;
        this.filterBalances();
        this.loading.wallet = false;
      },
      error: (error) => {
        this.toastrService.danger('Failed to load wallet. Please try again.', 'Wallet Error');
        console.error('Error loading wallet:', error);
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
        next: (response) => {
          this.transactions = response.transactions;
          this.totalTransactions = response.pagination.total;
          this.totalPages = response.pagination.pages;
          this.loading.transactions = false;
        },
        error: (error) => {
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

    this.walletService.getPaymentMethods().subscribe({
      next: (methods) => {
        // Map payment methods to include name and details properties
        this.paymentMethods = methods.map((method) => ({
          ...method,
          name: this.getPaymentMethodDisplayName(method), // Add name property
          details: this.getPaymentMethodDetails(method), // Add details property
        }));
        this.filterPaymentMethods();
        this.loading.paymentMethods = false;
      },
      error: (error) => {
        this.toastrService.danger(
          'Failed to load payment methods. Please try again.',
          'Payment Methods Error',
        );
        console.error('Error loading payment methods:', error);
        this.loading.paymentMethods = false;
      },
    });
  }

  // Add helper method to get payment method details
  private getPaymentMethodDetails(method: PaymentMethod): any {
    if (method.cardDetails) {
      return method.cardDetails;
    } else if (method.bankDetails) {
      return method.bankDetails;
    } else if (method.cryptoDetails) {
      return method.cryptoDetails;
    }
    return {};
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
    const dialogRef = this.dialogService.open<any>(DepositDialogComponent, {
      context: {
        currencies: this.walletService.SUPPORTED_CURRENCIES.concat(
          this.walletService.SUPPORTED_CRYPTOCURRENCIES,
        ),
        paymentMethods: this.paymentMethods,
        selectedCurrency: this.selectedCurrency,
      },
    });

    dialogRef.onClose.subscribe((result) => {
      if (result?.success) {
        this.loadWallet();
      }
    });
  }

  /**
   * Filter balances based on search and active filters
   */
  filterBalances(): void {
    if (!this.balances?.length) {
      this.filteredBalances = [];
      return;
    }

    this.filteredBalances = this.balances.filter((balance) => {
      const matchesCurrency =
        !this.balanceFilter.search ||
        balance.currency.toLowerCase().includes(this.balanceFilter.search.toLowerCase());
      return matchesCurrency;
    });
  }

  /**
   * Filter payment methods based on search and active filters
   */
  filterPaymentMethods(): void {
    if (!this.paymentMethods?.length) {
      this.filteredPaymentMethods = [];
      return;
    }

    this.filteredPaymentMethods = this.paymentMethods.filter((method) => {
      const methodName = this.getPaymentMethodDisplayName(method).toLowerCase();
      const matchesSearch =
        !this.paymentMethodsFilter.search ||
        methodName.includes(this.paymentMethodsFilter.search.toLowerCase());
      const matchesType =
        !this.paymentMethodsFilter.type || method.type === this.paymentMethodsFilter.type;
      return matchesSearch && matchesType;
    });
  }

  /**
   * Map wallet balance to withdraw balance
   */
  private mapToWithdrawBalance(balance: WalletBalance): WalletBalance {
    return {
      currency: balance.currency,
      available: balance.available,
      pending: balance.pending,
      reserved: balance.reserved || 0,
      total: balance.available + balance.pending,
    };
  }

  /**
   * Map payment method to withdraw payment method
   */
  private mapToWithdrawPaymentMethod(method: PaymentMethod): PaymentMethod {
    return {
      ...method,
      id: method._id || method.id || '',
      name: this.getPaymentMethodDisplayName(method),
      details: method.cardDetails || method.bankDetails || method.cryptoDetails || {},
    };
  }

  /**
   * Open withdraw dialog
   */
  openWithdrawDialog(): void {
    // Create copies of balances and payment methods with the required properties
    const mappedBalances = this.balances.map((balance) => ({
      ...balance,
      total: balance.total || balance.available + balance.pending, // Ensure total is non-optional
    }));

    const mappedPaymentMethods = this.paymentMethods.map((method) => ({
      ...method,
      name: method.name || this.getPaymentMethodDisplayName(method), // Ensure name is non-optional
      details: method.details || this.getPaymentMethodDetails(method), // Ensure details is non-optional
    }));

    this.dialogService
      .open(WithdrawDialogComponent, {
        context: {
          balances: mappedBalances,
          paymentMethods: mappedPaymentMethods,
          selectedCurrency: this.selectedCurrency,
        },
        hasBackdrop: true,
        closeOnBackdropClick: false,
      })
      .onClose.subscribe((result) => {
        if (result) {
          this.loadWallet();
          this.loadPaymentMethods();
          this.loadTransactions();
        }
      });
  }

  /**
   * Open transfer dialog
   */
  openTransferDialog(): void {
    const dialogRef = this.dialogService.open(TransferDialogComponent, {
      context: {},
    });

    dialogRef.onClose.subscribe((result) => {
      if (result === true || result?.success) {
        this.loadWallet();
      }
    });
  }

  /**
   * Open add payment method dialog
   */
  openAddPaymentMethodDialog(): void {
    const dialogRef = this.dialogService.open(AddPaymentMethodDialogComponent, {
      context: {},
    });

    dialogRef.onClose.subscribe((result) => {
      if (result === true || result?.success) {
        this.loadPaymentMethods();
      }
    });
  }

  /**
   * Open transaction details dialog
   * @param transaction Transaction to view
   */
  openTransactionDetailsDialog(transaction: WalletTransaction): void {
    // Create a new object that exactly matches the expected interface
    const transactionWithId = {
      id: transaction._id || '',
      _id: transaction._id,
      type: transaction.type,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      paymentMethodId: transaction.paymentMethodId,
      paymentMethod: transaction.paymentMethod,
      fee: transaction.fee,
      description: transaction.description,
      createdAt:
        typeof transaction.createdAt === 'object'
          ? (transaction.createdAt as Date).toISOString()
          : transaction.createdAt,
    };

    // Use type assertion to satisfy the compiler
    this.dialogService.open(TransactionDetailsDialogComponent, {
      context: { transaction: transactionWithId as any },
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
        error: (error) => {
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
      error: (error) => {
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
      next: (updatedSettings) => {
        this.notificationService.success('Wallet settings updated');

        // Update local wallet settings
        if (this.wallet) {
          this.wallet.settings = updatedSettings;
        }
      },
      error: (error) => {
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
    return `transaction-${type.toLowerCase()}`;
  }

  /**
   * Get CSS class for transaction status
   * @param status Transaction status
   */
  getTransactionStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
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
    const defaultBalance = this.balances.find((b) => b.currency === this.selectedCurrency);

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

  /**
   * Copy text to clipboard and show a notification
   */
  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(
      () => {
        this.notificationService.success('Address copied to clipboard');
      },
      (err) => {
        console.error('Could not copy text: ', err);
        this.notificationService.error('Failed to copy to clipboard');
      },
    );
  }
}
