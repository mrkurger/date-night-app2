import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NebularModule } from '../../../../app/shared/nebular.module';
import {
  NbDialogRef,
  NB_DIALOG_CONFIG,
  NbCardModule,
  NbTabsetModule,
  NbInputModule,
  NbButtonModule,
  NbSelectModule,
  NbSpinnerModule,
  NbAlertModule,
  NbFormFieldModule,
  NbIconModule,
  NbTooltipModule,
  NbBadgeModule,
  NbTagModule,
  NbToastrService,
} from '@nebular/theme';

import { _SharedModule } from '../../../shared/shared.module';
import { WalletService } from '../../../core/services/wallet.service';

export interface WalletBalance {
  currency: string;
  available: number;
  total: number;
  pending: number;
  locked?: number;
}

export type PaymentMethodType = 'card' | 'bank_account' | 'crypto' | 'crypto_address' | 'paypal';

export interface CardDetails {
  brand: string;
  last4: string;
  lastFour?: string;
  expMonth?: number;
  expYear?: number;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface BankDetails {
  accountNumber?: string;
  routingNumber?: string;
  bankName: string;
  accountType: string;
  accountHolder?: string;
  lastFour?: string;
  memoName?: string;
  country?: string;
}

export interface CryptoDetails {
  address: string;
  network: string;
  currency: string;
  memoName?: string;
}

export interface PaypalDetails {
  email: string;
}

export type PaymentMethodDetails = CardDetails | BankDetails | CryptoDetails | PaypalDetails;

export interface PaymentMethod {
  id: string;
  _id?: string;
  type: PaymentMethodType;
  name: string;
  details: PaymentMethodDetails;
  currency?: string;
  isDefault?: boolean;
  // Add these properties to fix the errors
  bankDetails?: BankDetails;
  cardDetails?: CardDetails;
  cryptoDetails?: CryptoDetails;
}

export interface WalletCryptoNetwork {
  name: string;_value: string;
  fee?: string;
  memoRequired?: boolean;
}

export interface WalletCryptoCurrencyInfo {
  networks: WalletCryptoNetwork[];
  memoName?: string;
}

export interface WalletCryptoDetails {
  [currencyCode: string]: WalletCryptoCurrencyInfo;
}

export interface WithdrawDialogData {
  balances?: WalletBalance[];
  paymentMethods?: PaymentMethod[];
  selectedCurrency?: string;
  selectedTabIndex?: 0 | 1;
  currencyType?: 'fiat' | 'crypto';
}

export interface WithdrawalDialogConfig {
  balances: WalletBalance[];
  paymentMethods: PaymentMethod[];
}

export interface WithdrawalRequest {
  amount: number;
  currency: string;
  paymentMethodId: string;
  memo?: string;
}

@Component({
  selector: 'app-withdraw-dialog',
  templateUrl: './withdraw-dialog.component.html',
  styleUrls: ['./withdraw-dialog.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [NebularModule, CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NbCardModule,
    NbTabsetModule,
    NbInputModule,
    NbButtonModule,
    NbSelectModule,
    NbSpinnerModule,
    NbAlertModule,
    NbFormFieldModule,
    NbIconModule,
    NbTooltipModule,
    NbBadgeModule,
    NbTagModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WithdrawDialogComponent implements OnInit {
  balances: WalletBalance[] = [];
  paymentMethods: PaymentMethod[] = [];
  selectedCurrency?: string;
  selectedTabIndex: 0 | 1 = 0;
  withdrawalForm: FormGroup;
  loading = false;

  // Fiat withdrawal
  withdrawForm: FormGroup;
  fiatBalances: WalletBalance[] = [];
  filteredPaymentMethods: PaymentMethod[] = [];
  selectedBalance: WalletBalance = { currency: '', available: 0, total: 0, pending: 0 };
  showFeeEstimate = false;
  feeEstimate = '';
  netAmount = '';
  processingWithdrawal = false;

  // Crypto withdrawal
  cryptoWithdrawForm: FormGroup;
  cryptoBalances: WalletBalance[] = [];
  availableCryptoNetworks: WalletCryptoNetwork[] = [];
  cryptoMaxAmount = 0;
  processingCryptoWithdrawal = false;
  loadingInitialData = false;

  constructor(
    @Inject(NB_DIALOG_CONFIG) private config: WithdrawalDialogConfig,
    private dialogRef: NbDialogRef<WithdrawDialogComponent>,
    private walletService: WalletService,
    private toastr: NbToastrService,
    private formBuilder: FormBuilder,
    private cd: ChangeDetectorRef,
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.balances = this.config.balances || [];
    this.paymentMethods = this.config.paymentMethods || [];

    if (this.balances.length > 0) {
      this.selectedCurrency = this.balances[0].currency;
    }

    // Initialize fiat and crypto balances
    this.fiatBalances = this.balances.filter((b) => !this.isCryptoCurrency(b.currency));
    this.cryptoBalances = this.balances.filter((b) => this.isCryptoCurrency(b.currency));

    if (this.fiatBalances.length > 0) {
      this.selectedBalance = this.fiatBalances[0];
    }

    if (this.cryptoBalances.length > 0) {
      this.cryptoMaxAmount = this.cryptoBalances[0].available;
    }

    // Initialize filtered payment methods
    this.filterPaymentMethods();
  }

  /**
   * Check if a currency is a cryptocurrency
   */
  isCryptoCurrency(currency: string): boolean {
    const cryptoCurrencies = [
      'BTC',
      'ETH',
      'USDT',
      'XRP',
      'LTC',
      'BCH',
      'BNB',
      'DOT',
      'LINK',
      'ADA',
    ];
    return cryptoCurrencies.includes(currency);
  }

  /**
   * Filter payment methods based on selected currency
   */
  filterPaymentMethods(): void {
    if (!this.selectedCurrency || !this.paymentMethods.length) {
      this.filteredPaymentMethods = [];
      return;
    }

    this.filteredPaymentMethods = this.paymentMethods.filter((method) => {
      // For fiat currencies, filter by currency and type
      if (!this.isCryptoCurrency(this.selectedCurrency)) {
        return (
          (method.currency === this.selectedCurrency || !method.currency) &&
          (method.type === 'bank_account' || method.type === 'card')
        );
      }

      // For cryptocurrencies, filter by currency and type
      return (
        method.type === 'crypto' && (!method.currency || method.currency === this.selectedCurrency)
      );
    });
  }

  /**
   * Handle tab change
   */
  handleTabChange(event: any): void {
    this.selectedTabIndex = event.tabTitle === 'Cryptocurrency' ? 1 : 0;
  }

  /**
   * Handle balance selection
   */
  onBalanceSelect(currency: string): void {
    if (this.selectedTabIndex === 0) {
      // Fiat tab
      this.selectedBalance = this.fiatBalances.find((b) => b.currency === currency) || {
        currency: '',
        available: 0,
        total: 0,
        pending: 0,
      };
      this.filterPaymentMethods();
    } else {
      // Crypto tab
      const selectedBalance = this.cryptoBalances.find((b) => b.currency === currency);
      if (selectedBalance) {
        this.cryptoMaxAmount = selectedBalance.available;
      }
    }
  }

  /**
   * Get payment method label for display
   */
  getPaymentMethodLabel(method: PaymentMethod): string {
    if (method.type === 'bank_account' && method.bankDetails) {
      return `${method.bankDetails.bankName} (${method.bankDetails.lastFour || '****'})`;
    } else if (method.type === 'card' && method.cardDetails) {
      return `${method.cardDetails.brand} (${method.cardDetails.last4 || '****'})`;
    } else if (method.type === 'crypto' && method.cryptoDetails) {
      const address = method.cryptoDetails.address;
      const shortAddress = address.substring(0, 6) + '...' + address.substring(address.length - 4);
      return `${method.cryptoDetails.currency} (${shortAddress})`;
    }
    return method.name || 'Unknown payment method';
  }

  /**
   * Submit fiat withdrawal
   */
  submitFiatWithdrawal(): void {
    if (this.withdrawForm.invalid) return;

    this.processingWithdrawal = true;
    // Implementation would go here

    setTimeout(() => {
      this.processingWithdrawal = false;
      this.toastr.success('Withdrawal request submitted successfully');
      this.dialogRef.close(true);
      this.cd.markForCheck();
    }, 2000);
  }

  /**
   * Submit crypto withdrawal
   */
  submitCryptoWithdrawal(): void {
    if (this.cryptoWithdrawForm.invalid) return;

    this.processingCryptoWithdrawal = true;
    // Implementation would go here

    setTimeout(() => {
      this.processingCryptoWithdrawal = false;
      this.toastr.success('Crypto withdrawal request submitted successfully');
      this.dialogRef.close(true);
      this.cd.markForCheck();
    }, 2000);
  }

  /**
   * Check if a currency requires a memo
   */
  requiresMemo(currency: string): boolean {
    const memoRequiredCurrencies = ['XRP', 'XLM', 'EOS', 'BNB'];
    return memoRequiredCurrencies.includes(currency);
  }

  /**
   * Get memo name for a currency
   */
  getMemoName(currency: string): string {
    const memoNames = {
      XRP: 'Destination Tag',
      XLM: 'Memo',
      EOS: 'Memo',
      BNB: 'Memo',
    };
    return memoNames[currency as keyof typeof memoNames] || 'Memo';
  }

  /**
   * Close dialog and open add payment method dialog
   */
  closeAndOpenAddPaymentMethod(event: Event): void {
    event.preventDefault();
    this.dialogRef.close({ openAddPaymentMethod: true });
  }

  /**
   * Close the dialog
   */
  closeDialog(): void {
    this.dialogRef.close();
  }

  private initForm(): void {
    // Initialize the main withdrawal form
    this.withdrawalForm = this.formBuilder.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      paymentMethodId: ['', Validators.required],
      memo: [''],
    });

    // Initialize fiat withdrawal form
    this.withdrawForm = this.formBuilder.group({
      currency: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      paymentMethodId: ['', Validators.required],
      description: [''],
    });

    // Initialize crypto withdrawal form
    this.cryptoWithdrawForm = this.formBuilder.group({
      currency: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.00001)]],
      network: ['', Validators.required],
      address: ['', [Validators.required, Validators.minLength(10)]],
      memo: [''],
      description: [''],
    });
  }

  getMemoLabel(method: PaymentMethod): string {
    if (!method) return '';

    if (method.type === 'crypto') {
      const cryptoDetails = method.details as CryptoDetails;
      return cryptoDetails.memoName || 'Memo / Tag';
    }

    if (method.type === 'bank_account') {
      const bankDetails = method.details as BankDetails;
      return bankDetails.memoName || 'Reference / Note';
    }

    return 'Memo';
  }

  getPaymentMethodDisplay(method: PaymentMethod): string {
    if (!method) return '';

    switch (method.type) {
      case 'card': {
        const cardDetails = method.details as CardDetails;
        return `${cardDetails.brand} ending in ${cardDetails.last4}`;
      }
      case 'bank_account': {
        const bankDetails = method.details as BankDetails;
        return `${bankDetails.bankName} ending in ${bankDetails.lastFour || '****'}`;
      }
      case 'crypto': {
        const cryptoDetails = method.details as CryptoDetails;
        const shortAddress =
          cryptoDetails.address.slice(0, 6) + '...' + cryptoDetails.address.slice(-4);
        return `${cryptoDetails.currency} - ${shortAddress}`;
      }
      case 'paypal': {
        const paypalDetails = method.details as PaypalDetails;
        return `PayPal - ${paypalDetails.email}`;
      }
      default:
        return method.name;
    }
  }

  onSubmit(): void {
    if (this.withdrawalForm.invalid || !this.selectedCurrency) {
      return;
    }

    this.loading = true;
    const formValue = this.withdrawalForm.value;

    this.walletService
      .withdraw({
        amount: formValue.amount,
        currency: this.selectedCurrency,
        paymentMethodId: formValue.paymentMethodId,
        memo: formValue.memo,
      })
      .subscribe({
        next: () => {
          this.toastr.success('Withdrawal initiated successfully');
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.toastr.danger(error.message || 'Failed to process withdrawal');
          this.loading = false;
          this.cd.markForCheck();
        },
      });
  }

  close(): void {
    this.dialogRef.close();
  }
}
