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
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  NbDialogRef,
  NbToastrService,
  NbCardModule,
  NbTabsetModule,
  NbInputModule,
  NbButtonModule,
  NbSelectModule,
  NbSpinnerModule,
  NbAlertModule,
  NbFormFieldModule,
  NbIconModule,
  NB_DIALOG_CONFIG,
} from '@nebular/theme';
import { SharedModule } from '../../../shared/shared.module';
import { WalletService } from '../../../core/services/wallet.service';

export interface WalletBalance {
  currency: string;
  available: number;
  total: number;
  pending: number;
  locked?: number;
}

export interface PaymentMethod {
  id: string;
  _id?: string;
  type: string;
  name: string;
  details: any;
  currency?: string;
  isDefault?: boolean;
  cardDetails?: {
    brand: string;
    lastFour: string;
  };
  bankDetails?: {
    bankName: string;
    lastFour: string;
    accountType: string;
  };
  cryptoDetails?: {
    currency: string;
  };
}

export interface WalletCryptoNetwork {
  name: string;
  value: string;
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

@Component({
  selector: 'app-withdraw-dialog',
  templateUrl: './withdraw-dialog.component.html',
  styleUrls: ['./withdraw-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
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
    SharedModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WithdrawDialogComponent implements OnInit {
  balances: WalletBalance[] = [];
  paymentMethods: PaymentMethod[] = [];
  fiatBalances: WalletBalance[] = [];
  cryptoBalances: WalletBalance[] = [];
  selectedBalance: WalletBalance | null = null;
  selectedCurrency: string | null = null;
  feeEstimate = '';
  netAmount = '';
  withdrawForm!: FormGroup;
  cryptoWithdrawForm!: FormGroup;

  maxAmount = 0;
  cryptoMaxAmount = 0;
  filteredPaymentMethods: PaymentMethod[] = [];
  selectedTabIndex = 0;

  loadingInitialData = true;
  processingWithdrawal = false;
  processingCryptoWithdrawal = false;

  cryptoDetails: WalletCryptoDetails = {
    BTC: { networks: [{ name: 'Bitcoin', value: 'bitcoin' }] },
    ETH: { networks: [{ name: 'Ethereum (ERC20)', value: 'ethereum' }] },
    USDT: {
      networks: [
        { name: 'Ethereum (ERC20)', value: 'erc20' },
        { name: 'Tron (TRC20)', value: 'trc20' },
      ],
    },
    USDC: { networks: [{ name: 'Ethereum (ERC20)', value: 'erc20' }] },
    XRP: {
      networks: [{ name: 'Ripple', value: 'ripple', memoRequired: true }],
      memoName: 'Destination Tag',
    },
    ADA: { networks: [{ name: 'Cardano', value: 'cardano' }] },
  };
  availableCryptoNetworks: WalletCryptoNetwork[] = [];
  showFeeEstimate = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: NbDialogRef<WithdrawDialogComponent>,
    public walletService: WalletService,
    private toastrService: NbToastrService,
    private cdr: ChangeDetectorRef,
    @Inject(NB_DIALOG_CONFIG) public data: WithdrawDialogData,
  ) {}

  ngOnInit(): void {
    this.initWithdrawForm();
    this.initCryptoWithdrawForm();
    this.loadInitialData();
  }

  private initWithdrawForm(): void {
    this.withdrawForm = this.fb.group({
      currency: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      paymentMethodId: [null, Validators.required],
      description: ['', Validators.maxLength(100)],
    });

    this.withdrawForm.get('currency')?.valueChanges.subscribe((value) => {
      this.selectedCurrency = value;
      this.onFiatCurrencyChange();
    });

    this.withdrawForm.get('amount')?.valueChanges.subscribe(() => {
      this.calculateFeeAndNetAmount();
    });
  }

  private initCryptoWithdrawForm(): void {
    this.cryptoWithdrawForm = this.fb.group({
      currency: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(0.000001)]],
      address: ['', [Validators.required, Validators.minLength(20)]],
      network: [null, Validators.required],
      memo: [''],
      description: ['', Validators.maxLength(100)],
    });

    this.cryptoWithdrawForm.get('currency')?.valueChanges.subscribe((currencyCode) => {
      this.onCryptoCurrencyChange(currencyCode);
    });

    this.cryptoWithdrawForm.get('network')?.valueChanges.subscribe(() => {
      this.updateMemoValidator(this.cryptoWithdrawForm.get('currency')?.value);
    });
  }

  loadInitialData(): void {
    this.loadingInitialData = true;
    this.balances = this.data?.balances || [];
    this.paymentMethods = this.data?.paymentMethods || [];

    this.fiatBalances = this.balances.filter((b) => !this.isCryptoCurrency(b.currency));
    this.cryptoBalances = this.balances.filter((b) => this.isCryptoCurrency(b.currency));

    const preselectedCurrency = this.data?.selectedCurrency;
    let preselectedType = this.data?.currencyType;

    if (this.data?.selectedTabIndex !== undefined) {
      this.selectedTabIndex = this.data.selectedTabIndex;
    } else if (preselectedCurrency) {
      this.selectedTabIndex = this.isCryptoCurrency(preselectedCurrency) ? 1 : 0;
    } else {
      this.selectedTabIndex =
        this.fiatBalances.length > 0 ? 0 : this.cryptoBalances.length > 0 ? 1 : 0;
    }

    if (preselectedCurrency) {
      preselectedType =
        preselectedType || (this.isCryptoCurrency(preselectedCurrency) ? 'crypto' : 'fiat');
      if (
        preselectedType === 'fiat' &&
        this.fiatBalances.some((b) => b.currency === preselectedCurrency)
      ) {
        this.withdrawForm.get('currency')?.setValue(preselectedCurrency, { emitEvent: false });
      } else if (
        preselectedType === 'crypto' &&
        this.cryptoBalances.some((b) => b.currency === preselectedCurrency)
      ) {
        this.cryptoWithdrawForm
          .get('currency')
          ?.setValue(preselectedCurrency, { emitEvent: false });
      }
    }

    if (this.selectedTabIndex === 0) {
      if (!this.withdrawForm.get('currency')?.value && this.fiatBalances.length > 0) {
        this.withdrawForm
          .get('currency')
          ?.setValue(this.fiatBalances[0].currency, { emitEvent: false });
      }
      this.onFiatCurrencyChange();
    } else if (this.selectedTabIndex === 1) {
      if (!this.cryptoWithdrawForm.get('currency')?.value && this.cryptoBalances.length > 0) {
        this.cryptoWithdrawForm
          .get('currency')
          ?.setValue(this.cryptoBalances[0].currency, { emitEvent: false });
      }
      this.onCryptoCurrencyChange(this.cryptoWithdrawForm.get('currency')?.value);
    }

    this.loadingInitialData = false;
    this.cdr.markForCheck();
  }

  onFiatCurrencyChange(): void {
    const currentCurrency = this.withdrawForm.get('currency')?.value;
    this.selectedCurrency = currentCurrency;
    this.selectedBalance = this.fiatBalances.find((b) => b.currency === currentCurrency) || null;
    this.updateMaxAmount();
    this.filterPaymentMethods();
    this.calculateFeeAndNetAmount();
    this.cdr.markForCheck();
  }

  onCryptoCurrencyChange(currencyCode: string | null): void {
    if (!currencyCode) {
      this.cryptoMaxAmount = 0;
      this.availableCryptoNetworks = [];
      this.cryptoWithdrawForm.patchValue(
        { network: null, address: null, memo: null },
        { emitEvent: false },
      );
      this.updateMemoValidator(null);
      this.cryptoWithdrawForm
        .get('amount')
        ?.setValidators([Validators.required, Validators.min(0.000001)]);
      this.cryptoWithdrawForm.get('amount')?.updateValueAndValidity();
      this.cdr.markForCheck();
      return;
    }

    const balance = this.cryptoBalances.find((b) => b.currency === currencyCode);
    this.cryptoMaxAmount = balance
      ? this.walletService.convertToMajorUnit(balance.available, currencyCode)
      : 0;
    this.availableCryptoNetworks = this.getCryptoNetworks(currencyCode);
    this.updateMemoValidator(currencyCode);

    this.cryptoWithdrawForm.get('network')?.reset();
    this.cryptoWithdrawForm.get('network')?.setValidators(Validators.required);
    this.cryptoWithdrawForm.get('network')?.updateValueAndValidity();

    this.cryptoWithdrawForm.get('address')?.reset();
    this.cryptoWithdrawForm
      .get('address')
      ?.setValidators([Validators.required, Validators.minLength(20)]);
    this.cryptoWithdrawForm.get('address')?.updateValueAndValidity();

    if (this.availableCryptoNetworks.length === 1) {
      this.cryptoWithdrawForm.get('network')?.setValue(this.availableCryptoNetworks[0].value);
    }
    this.updateCryptoMaxAmount();
    this.cdr.markForCheck();
  }

  filterPaymentMethods(): void {
    const selectedFiatCurrency = this.withdrawForm.get('currency')?.value;
    if (selectedFiatCurrency) {
      this.filteredPaymentMethods = this.paymentMethods.filter(
        (method) => method.type === 'bank_account',
      );
    } else {
      this.filteredPaymentMethods = [];
    }

    const paymentMethodControl = this.withdrawForm.get('paymentMethodId');
    if (paymentMethodControl) {
      const currentSelection = paymentMethodControl.value;
      if (this.filteredPaymentMethods.length > 0) {
        if (
          !currentSelection ||
          !this.filteredPaymentMethods.find((pm) => pm._id === currentSelection)
        ) {
          paymentMethodControl.setValue(this.filteredPaymentMethods[0]._id);
        }
      } else {
        paymentMethodControl.reset();
        paymentMethodControl.setErrors({ noPaymentMethodAvailable: true });
      }
    }
    this.cdr.markForCheck();
  }

  getCryptoNetworks(currencyCode: string): WalletCryptoNetwork[] {
    if (!currencyCode) return [];
    return this.cryptoDetails[currencyCode.toUpperCase()]?.networks || [];
  }

  updateMemoValidator(currencyCode: string | null): void {
    const memoControl = this.cryptoWithdrawForm.get('memo');
    if (!memoControl) return;

    if (currencyCode && this.requiresMemo(currencyCode)) {
      memoControl.setValidators(Validators.required);
    } else {
      memoControl.clearValidators();
    }
    memoControl.updateValueAndValidity();
  }

  updateMaxAmount(): void {
    const selectedFiatCurrency = this.withdrawForm.get('currency')?.value;
    const balance = this.fiatBalances.find((b) => b.currency === selectedFiatCurrency);
    this.maxAmount = balance ? balance.available : 0;
    const amountControl = this.withdrawForm.get('amount');
    amountControl?.setValidators([
      Validators.required,
      Validators.min(0.01),
      Validators.max(this.maxAmount > 0 ? this.maxAmount : 0.01),
    ]);
    amountControl?.updateValueAndValidity();
    this.cdr.markForCheck();
  }

  updateCryptoMaxAmount(): void {
    const selectedCryptoCurrency = this.cryptoWithdrawForm.get('currency')?.value;
    const balance = this.cryptoBalances.find((b) => b.currency === selectedCryptoCurrency);
    this.cryptoMaxAmount = balance
      ? this.walletService.convertToMajorUnit(balance.available, selectedCryptoCurrency)
      : 0;
    const amountControl = this.cryptoWithdrawForm.get('amount');
    amountControl?.setValidators([
      Validators.required,
      Validators.min(0.000001),
      Validators.max(this.cryptoMaxAmount > 0 ? this.cryptoMaxAmount : 0.000001),
    ]);
    amountControl?.updateValueAndValidity();
    this.cdr.markForCheck();
  }

  calculateFeeAndNetAmount(): void {
    const amount = this.withdrawForm.get('amount')?.value;
    const currency = this.withdrawForm.get('currency')?.value;
    if (amount && currency && amount > 0) {
      const feeRate = 0.01;
      const fee = amount * feeRate;
      const feeInSmallestUnit = this.walletService.convertToSmallestUnit(fee, currency);
      this.feeEstimate = this.walletService.formatCurrency(feeInSmallestUnit, currency);

      const net = amount - fee;
      const netInSmallestUnit = this.walletService.convertToSmallestUnit(
        net > 0 ? net : 0,
        currency,
      );
      this.netAmount = this.walletService.formatCurrency(netInSmallestUnit, currency);
      this.showFeeEstimate = true;
    } else {
      this.feeEstimate = 'N/A';
      this.netAmount = 'N/A';
      this.showFeeEstimate = false;
    }
    this.cdr.markForCheck();
  }

  submitFiatWithdrawal(): void {
    if (this.withdrawForm.invalid) {
      this.toastrService.warning('Please fill all required fields correctly.', 'Invalid Form');
      this.withdrawForm.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }
    this.processingWithdrawal = true;
    this.cdr.markForCheck();
    const { currency, amount, paymentMethodId, description } = this.withdrawForm.value;
    const amountInSmallestUnit = this.walletService.convertToSmallestUnit(amount, currency);

    this.walletService
      .withdrawFunds(amountInSmallestUnit, currency, paymentMethodId, description || undefined)
      .subscribe({
        next: (response) => {
          this.toastrService.success(
            `Withdrawal of ${this.walletService.formatCurrency(amountInSmallestUnit, currency)} initiated.`,
            'Withdrawal Initiated',
          );
          this.dialogRef.close({ success: true, type: 'fiat', data: response });
        },
        error: (err) => {
          console.error('Fiat withdrawal error:', err);
          this.toastrService.danger(
            err.error?.message || 'Failed to process fiat withdrawal. Please try again.',
            'Withdrawal Failed',
          );
        },
        complete: () => {
          this.processingWithdrawal = false;
          this.cdr.markForCheck();
        },
      });
  }

  submitCryptoWithdrawal(): void {
    if (this.cryptoWithdrawForm.invalid) {
      this.toastrService.warning('Please fill all required fields correctly.', 'Invalid Form');
      this.cryptoWithdrawForm.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    this.processingCryptoWithdrawal = true;
    this.cdr.markForCheck();
    const { currency, amount, address, network, memo, description } = this.cryptoWithdrawForm.value;

    if (!currency || amount === null || !address || !network) {
      this.toastrService.danger('Critical error: Form data missing after validation.', 'Error');
      this.processingCryptoWithdrawal = false;
      this.cdr.markForCheck();
      return;
    }

    const amountInSmallestUnit = this.walletService.convertToSmallestUnit(amount, currency);

    this.walletService
      .withdrawCrypto(
        amountInSmallestUnit,
        currency,
        address,
        network,
        memo || undefined,
        description || undefined,
      )
      .subscribe({
        next: (response) => {
          this.toastrService.success(
            `Withdrawal of ${this.walletService.formatCurrency(amountInSmallestUnit, currency)} initiated.`,
            'Withdrawal Initiated',
          );
          this.dialogRef.close({ success: true, type: 'crypto', data: response });
        },
        error: (err) => {
          console.error('Crypto withdrawal error:', err);
          this.toastrService.danger(
            err.error?.message || 'Failed to process crypto withdrawal. Please try again.',
            'Withdrawal Failed',
          );
        },
        complete: () => {
          this.processingCryptoWithdrawal = false;
          this.cdr.markForCheck();
        },
      });
  }

  getPaymentMethodLabel(method: PaymentMethod): string {
    const idSuffix = method._id ? `...${method._id.slice(-4)}` : '';
    if (method.type === 'card' && method.cardDetails) {
      return `${method.cardDetails.brand || 'Card'} ending in ${method.cardDetails.lastFour} (${idSuffix})`;
    }
    if (method.type === 'bank_account' && method.bankDetails) {
      return `${method.bankDetails.bankName || 'Bank'} ending in ${method.bankDetails.lastFour} (${idSuffix})`;
    }
    return `Unknown Method (${idSuffix})`;
  }

  isCryptoCurrency(currency: string): boolean {
    if (!currency) return false;
    return !!this.cryptoDetails[currency.toUpperCase()];
  }

  requiresMemo(currencyCode: string | null | undefined): boolean {
    if (!currencyCode) return false;
    const details = this.cryptoDetails[currencyCode.toUpperCase()];
    if (!details) return false;

    const selectedNetworkValue = this.cryptoWithdrawForm.get('network')?.value;
    if (selectedNetworkValue) {
      const selectedNetwork = details.networks.find((n) => n.value === selectedNetworkValue);
      return !!selectedNetwork?.memoRequired;
    }
    return details.networks.some((network) => network.memoRequired);
  }

  getMemoName(currencyCode: string | null | undefined): string {
    if (!currencyCode) return 'Memo / Tag';
    const details = this.cryptoDetails[currencyCode.toUpperCase()];
    return details?.memoName || 'Memo / Tag';
  }

  handleTabChange(event: { tabTitle?: string; tabId?: string; responsive?: boolean }): void {
    const previousTabIndex = this.selectedTabIndex;
    if (event.tabTitle === 'Fiat Currency') {
      this.selectedTabIndex = 0;
    } else if (event.tabTitle === 'Cryptocurrency') {
      this.selectedTabIndex = 1;
    }

    if (previousTabIndex !== this.selectedTabIndex) {
      if (this.selectedTabIndex === 0) {
        const currentCurrency = this.withdrawForm.get('currency')?.value;
        if (currentCurrency) {
          this.onBalanceSelect(currentCurrency);
        }
      } else {
        const currentCurrency = this.cryptoWithdrawForm.get('currency')?.value;
        if (currentCurrency) {
          this.onBalanceSelect(currentCurrency);
        }
      }
    }
    this.cdr.markForCheck();
  }

  closeDialog(result?: unknown): void {
    this.dialogRef.close(result);
  }

  closeAndOpenAddPaymentMethod(event?: MouseEvent): void {
    if (event) {
      event.preventDefault();
    }
    this.dialogRef.close('add-payment-method');
  }

  onBalanceSelect(currency: string): void {
    if (this.selectedTabIndex === 0) {
      this.selectedBalance = this.fiatBalances.find((b) => b.currency === currency) || null;
      this.updateMaxAmount();
      this.filterPaymentMethods();
      this.calculateFeeAndNetAmount();
    } else {
      const balance = this.cryptoBalances.find((b) => b.currency === currency);
      this.cryptoMaxAmount = balance
        ? this.walletService.convertToMajorUnit(balance.available, currency)
        : 0;
      this.availableCryptoNetworks = this.getCryptoNetworks(currency);
      this.updateMemoValidator(currency);
      this.updateCryptoMaxAmount();
    }
    this.cdr.markForCheck();
  }
}
