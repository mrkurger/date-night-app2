import { NbIconModule } from '@nebular/theme';
import { NbSelectModule } from '@nebular/theme';
import { NbFormFieldModule } from '@nebular/theme';
import { NbAlertModule } from '@nebular/theme';
import { NbCardModule } from '@nebular/theme';
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

export type PaymentMethodType = 'card' | 'bank_account' | 'crypto' | 'paypal';

export interface CardDetails {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

export interface BankDetails {
  accountNumber: string;
  routingNumber: string;
  bankName: string;
  accountType: 'checking' | 'savings';
  accountHolder?: string;
  lastFour?: string;
  memoName?: string;
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
  selectedCurrency?: string;
  selectedTabIndex: 0 | 1 = 0;
  withdrawalForm: FormGroup;
  loading = false;

  constructor(
    @Inject(NB_DIALOG_CONFIG) public config: WithdrawalDialogConfig,
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
  }

  private initForm(): void {
    this.withdrawalForm = this.formBuilder.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      paymentMethodId: ['', Validators.required],
      memo: [''],
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
