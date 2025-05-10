// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (add-payment-method-dialog.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, Inject, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule, MatRadioGroup } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { WalletService } from '../../../core/services/wallet.service';
import { PaymentService } from '../../../core/services/payment.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-add-payment-method-dialog',
  template: `
    <h2 mat-dialog-title>Add Payment Method</h2>

    <mat-dialog-content>
      <!-- Payment method type selection -->
      <div class="payment-type-selection">
        <mat-radio-group [(ngModel)]="selectedPaymentType" class="payment-type-radio-group">
          <mat-radio-button value="card">Credit/Debit Card</mat-radio-button>
          <mat-radio-button value="bank_account">Bank Account</mat-radio-button>
          <mat-radio-button value="crypto_address">Cryptocurrency Address</mat-radio-button>
        </mat-radio-group>
      </div>

      <!-- Credit/Debit Card Form -->
      <form *ngIf="selectedPaymentType === 'card'" [formGroup]="cardForm" class="payment-form">
        <div class="card-element-container">
          <label class="card-element-label">Card Information</label>
          <div #cardElement class="card-element"></div>
          <div class="card-element-error" *ngIf="cardError">{{ cardError }}</div>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Cardholder Name</mat-label>
          <input matInput formControlName="cardholderName" />
          <mat-error *ngIf="cardForm.get('cardholderName')?.hasError('required')">
            Cardholder name is required
          </mat-error>
        </mat-form-field>

        <mat-checkbox formControlName="setAsDefault" color="primary">
          Set as default payment method
        </mat-checkbox>
      </form>

      <!-- Bank Account Form -->
      <form
        *ngIf="selectedPaymentType === 'bank_account'"
        [formGroup]="bankForm"
        class="payment-form"
      >
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Account Holder Name</mat-label>
          <input matInput formControlName="accountHolderName" />
          <mat-error *ngIf="bankForm.get('accountHolderName')?.hasError('required')">
            Account holder name is required
          </mat-error>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline" class="form-col">
            <mat-label>Bank Name</mat-label>
            <input matInput formControlName="bankName" />
            <mat-error *ngIf="bankForm.get('bankName')?.hasError('required')">
              Bank name is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-col">
            <mat-label>Currency</mat-label>
            <mat-select formControlName="currency">
              <mat-option *ngFor="let currency of currencies" [value]="currency">
                {{ currency }}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="bankForm.get('currency')?.hasError('required')">
              Currency is required
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="form-col">
            <mat-label>Account Number</mat-label>
            <input matInput formControlName="accountNumber" />
            <mat-error *ngIf="bankForm.get('accountNumber')?.hasError('required')">
              Account number is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-col">
            <mat-label>Routing Number</mat-label>
            <input matInput formControlName="routingNumber" />
            <mat-error *ngIf="bankForm.get('routingNumber')?.hasError('required')">
              Routing number is required
            </mat-error>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Account Type</mat-label>
          <mat-select formControlName="accountType">
            <mat-option value="checking">Checking</mat-option>
            <mat-option value="savings">Savings</mat-option>
          </mat-select>
          <mat-error *ngIf="bankForm.get('accountType')?.hasError('required')">
            Account type is required
          </mat-error>
        </mat-form-field>

        <mat-checkbox formControlName="setAsDefault" color="primary">
          Set as default payment method
        </mat-checkbox>
      </form>

      <!-- Cryptocurrency Address Form -->
      <form
        *ngIf="selectedPaymentType === 'crypto_address'"
        [formGroup]="cryptoForm"
        class="payment-form"
      >
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Cryptocurrency</mat-label>
          <mat-select formControlName="currency">
            <mat-option *ngFor="let currency of cryptocurrencies" [value]="currency">
              {{ currency }}
            </mat-option>
          </mat-select>
          <mat-error *ngIf="cryptoForm.get('currency')?.hasError('required')">
            Cryptocurrency is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Wallet Address</mat-label>
          <input matInput formControlName="address" />
          <mat-error *ngIf="cryptoForm.get('address')?.hasError('required')">
            Wallet address is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Network</mat-label>
          <mat-select formControlName="network">
            <mat-option
              *ngFor="let network of getNetworksForCurrency(cryptoForm.get('currency')?.value)"
              [value]="network.value"
            >
              {{ network.label }}
            </mat-option>
          </mat-select>
          <mat-error *ngIf="cryptoForm.get('network')?.hasError('required')">
            Network is required
          </mat-error>
        </mat-form-field>

        <mat-form-field
          appearance="outline"
          class="full-width"
          *ngIf="requiresMemo(cryptoForm.get('currency')?.value)"
        >
          <mat-label>Memo / Tag (Required)</mat-label>
          <input matInput formControlName="memo" />
          <mat-error *ngIf="cryptoForm.get('memo')?.hasError('required')">
            Memo/Tag is required for this currency
          </mat-error>
        </mat-form-field>

        <mat-checkbox formControlName="setAsDefault" color="primary">
          Set as default payment method
        </mat-checkbox>
      </form>

      <div *ngIf="processingAddPaymentMethod" class="processing-container">
        <mat-spinner diameter="30"></mat-spinner>
        <p>Adding payment method...</p>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="
          (selectedPaymentType === 'card' &&
            (cardForm.invalid || !cardComplete || processingAddPaymentMethod)) ||
          (selectedPaymentType === 'bank_account' &&
            (bankForm.invalid || processingAddPaymentMethod)) ||
          (selectedPaymentType === 'crypto_address' &&
            (cryptoForm.invalid || processingAddPaymentMethod))
        "
        (click)="addPaymentMethod()"
      >
        Add Payment Method
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .payment-form {
        padding: 16px 0;
      }

      .full-width {
        width: 100%;
      }

      .payment-type-selection {
        margin-bottom: 24px;
      }

      .payment-type-radio-group {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .card-element-container {
        margin-bottom: 16px;
      }

      .card-element-label {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
      }

      .card-element {
        padding: 16px;
        border: 1px solid rgba(0, 0, 0, 0.12);
        border-radius: 4px;
        background-color: #f5f5f5;
      }

      .card-element-error {
        color: #f44336;
        font-size: 12px;
        margin-top: 8px;
      }

      .form-row {
        display: flex;
        gap: 16px;

        .form-col {
          flex: 1;
        }
      }

      .processing-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 24px 0;

        p {
          margin-top: 16px;
        }
      }
    `,
  ],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatCheckboxModule,
  ],
})
export class AddPaymentMethodDialogComponent implements OnInit, AfterViewInit {
  @ViewChild('cardElement') cardElement!: ElementRef;

  selectedPaymentType = 'card';
  cardForm: FormGroup;
  bankForm: FormGroup;
  cryptoForm: FormGroup;

  cardComplete = false;
  cardError = '';

  processingAddPaymentMethod = false;

  // Stripe card element
  private card: any;

  // Networks for cryptocurrencies
  cryptoNetworks = {
    BTC: [
      { value: 'bitcoin', label: 'Bitcoin (BTC)' },
      { value: 'lightning', label: 'Lightning Network' },
    ],
    ETH: [
      { value: 'ethereum', label: 'Ethereum (ERC-20)' },
      { value: 'arbitrum', label: 'Arbitrum' },
      { value: 'optimism', label: 'Optimism' },
    ],
    USDT: [
      { value: 'ethereum', label: 'Ethereum (ERC-20)' },
      { value: 'tron', label: 'Tron (TRC-20)' },
      { value: 'bsc', label: 'Binance Smart Chain (BEP-20)' },
    ],
    USDC: [
      { value: 'ethereum', label: 'Ethereum (ERC-20)' },
      { value: 'solana', label: 'Solana' },
      { value: 'polygon', label: 'Polygon' },
    ],
  };

  // Currencies that require memo/tag
  memoRequiredCurrencies = ['XRP', 'XLM', 'BNB', 'ATOM'];

  constructor(
    private dialogRef: MatDialogRef<AddPaymentMethodDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      currencies: string[];
      cryptocurrencies: string[];
    },
    private fb: FormBuilder,
    private walletService: WalletService,
    private paymentService: PaymentService,
    private notificationService: NotificationService,
  ) {
    // Initialize card form
    this.cardForm = this.fb.group({
      cardholderName: ['', Validators.required],
      setAsDefault: [false],
    });

    // Initialize bank form
    this.bankForm = this.fb.group({
      accountHolderName: ['', Validators.required],
      bankName: ['', Validators.required],
      accountNumber: ['', Validators.required],
      routingNumber: ['', Validators.required],
      accountType: ['checking', Validators.required],
      currency: ['NOK', Validators.required],
      setAsDefault: [false],
    });

    // Initialize crypto form
    this.cryptoForm = this.fb.group({
      currency: ['BTC', Validators.required],
      address: ['', Validators.required],
      network: ['bitcoin', Validators.required],
      memo: [''],
      setAsDefault: [false],
    });

    // Update validators for memo field based on selected currency
    this.cryptoForm.get('currency')?.valueChanges.subscribe((currency) => {
      const memoControl = this.cryptoForm.get('memo');
      if (this.requiresMemo(currency)) {
        memoControl?.setValidators([Validators.required]);
      } else {
        memoControl?.clearValidators();
      }
      memoControl?.updateValueAndValidity();

      // Set default network
      const networks = this.getNetworksForCurrency(currency);
      if (networks.length > 0) {
        this.cryptoForm.patchValue({ network: networks[0].value });
      }
    });
  }

  // Available currencies
  currencies: string[] = [];
  cryptocurrencies: string[] = [];

  ngOnInit(): void {
    this.currencies = this.data.currencies;
    this.cryptocurrencies = this.data.cryptocurrencies;
  }

  ngAfterViewInit(): void {
    // Initialize Stripe card element
    this.initializeStripeCard();
  }

  /**
   * Initialize Stripe card element
   */
  initializeStripeCard(): void {
    // This is a mock implementation since we don't have actual Stripe integration
    // In a real application, you would use Stripe.js to create a card element
    setTimeout(() => {
      this.cardComplete = true;
    }, 1000);
  }

  /**
   * Get networks for selected cryptocurrency
   */
  getNetworksForCurrency(currency: string): { value: string; label: string }[] {
    return this.cryptoNetworks[currency as keyof typeof this.cryptoNetworks] || [];
  }

  /**
   * Check if currency requires memo/tag
   */
  requiresMemo(currency: string): boolean {
    return this.memoRequiredCurrencies.includes(currency);
  }

  /**
   * Add payment method
   */
  addPaymentMethod(): void {
    if (
      (this.selectedPaymentType === 'card' && this.cardForm.invalid) ||
      (this.selectedPaymentType === 'bank_account' && this.bankForm.invalid) ||
      (this.selectedPaymentType === 'crypto_address' && this.cryptoForm.invalid)
    ) {
      return;
    }

    this.processingAddPaymentMethod = true;

    let paymentMethodData: any = {
      type: this.selectedPaymentType,
    };

    if (this.selectedPaymentType === 'card') {
      // In a real application, you would use Stripe.js to create a payment method
      // and then send the payment method ID to your server
      paymentMethodData = {
        type: 'card',
        provider: 'stripe',
        isDefault: this.cardForm.value.setAsDefault,
        cardDetails: {
          lastFour: '4242', // Mock data
          brand: 'Visa', // Mock data
          expiryMonth: 12, // Mock data
          expiryYear: 2025, // Mock data
          tokenId: 'pm_mock_' + Math.random().toString(36).substring(2, 15),
        },
      };
    } else if (this.selectedPaymentType === 'bank_account') {
      const { accountHolderName, bankName, accountNumber, accountType, currency, setAsDefault } =
        this.bankForm.value;

      paymentMethodData = {
        type: 'bank_account',
        provider: 'plaid', // Mock provider
        isDefault: setAsDefault,
        bankDetails: {
          accountType,
          lastFour: accountNumber.slice(-4),
          bankName,
          country: 'NO', // Assuming Norway
          currency,
          tokenId: 'ba_mock_' + Math.random().toString(36).substring(2, 15),
        },
      };
    } else if (this.selectedPaymentType === 'crypto_address') {
      const { currency, address, network, memo, setAsDefault } = this.cryptoForm.value;

      paymentMethodData = {
        type: 'crypto_address',
        provider: 'internal',
        isDefault: setAsDefault,
        cryptoDetails: {
          currency,
          address,
          network,
          memo: memo || undefined,
        },
      };
    }

    this.walletService.addPaymentMethod(paymentMethodData).subscribe({
      next: () => {
        this.processingAddPaymentMethod = false;
        this.notificationService.success('Payment method added successfully');
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.processingAddPaymentMethod = false;
        console.error('Error adding payment method:', error);
        this.notificationService.error('Failed to add payment method. Please try again.');
      },
    });
  }
}
