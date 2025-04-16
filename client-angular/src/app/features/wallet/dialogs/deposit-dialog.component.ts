// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (deposit-dialog.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
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
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { QRCodeComponent } from 'angularx-qrcode';
import { ClipboardModule } from '@angular/cdk/clipboard';

import {
  WalletService,
  PaymentMethod,
  CryptoDepositAddress,
} from '../../../core/services/wallet.service';
import { PaymentService } from '../../../core/services/payment.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-deposit-dialog',
  template: `
    <h2 mat-dialog-title>Deposit Funds</h2>

    <mat-dialog-content>
      <mat-tab-group animationDuration="0ms">
        <!-- Fiat Currency Deposit -->
        <mat-tab label="Fiat Currency">
          <form [formGroup]="depositForm" class="deposit-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Currency</mat-label>
              <mat-select formControlName="currency">
                <mat-option *ngFor="let currency of fiatCurrencies" [value]="currency">
                  {{ currency }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Amount</mat-label>
              <input matInput type="number" formControlName="amount" min="1" />
              <span matTextSuffix>{{ depositForm.get('currency')?.value }}</span>
              <mat-hint>Minimum deposit: 10 {{ depositForm.get('currency')?.value }}</mat-hint>
              <mat-error *ngIf="depositForm.get('amount')?.hasError('required')">
                Amount is required
              </mat-error>
              <mat-error *ngIf="depositForm.get('amount')?.hasError('min')">
                Minimum amount is 10 {{ depositForm.get('currency')?.value }}
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Payment Method</mat-label>
              <mat-select formControlName="paymentMethodId">
                <mat-option *ngFor="let method of cardPaymentMethods" [value]="method._id">
                  {{ getPaymentMethodDisplayName(method) }}
                </mat-option>
              </mat-select>
              <mat-error *ngIf="depositForm.get('paymentMethodId')?.hasError('required')">
                Payment method is required
              </mat-error>
            </mat-form-field>

            <div *ngIf="cardPaymentMethods.length === 0" class="no-payment-methods">
              <p>You don't have any payment methods. Please add a payment method first.</p>
              <button mat-raised-button color="primary" (click)="closeAndOpenAddPaymentMethod()">
                Add Payment Method
              </button>
            </div>

            <div *ngIf="processingDeposit" class="processing-container">
              <mat-spinner diameter="30"></mat-spinner>
              <p>Processing your deposit...</p>
            </div>
          </form>
        </mat-tab>

        <!-- Cryptocurrency Deposit -->
        <mat-tab label="Cryptocurrency">
          <div class="crypto-deposit-container">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Cryptocurrency</mat-label>
              <mat-select
                [(ngModel)]="selectedCrypto"
                (selectionChange)="getCryptoDepositAddress()"
              >
                <mat-option *ngFor="let crypto of cryptocurrencies" [value]="crypto">
                  {{ crypto }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <div *ngIf="loadingCryptoAddress" class="processing-container">
              <mat-spinner diameter="30"></mat-spinner>
              <p>Generating deposit address...</p>
            </div>

            <div
              *ngIf="cryptoDepositAddress && !loadingCryptoAddress"
              class="crypto-address-container"
            >
              <h3>Deposit Address</h3>

              <div class="qr-code">
                <qrcode
                  [qrdata]="cryptoDepositAddress.address"
                  [width]="200"
                  [errorCorrectionLevel]="'M'"
                >
                </qrcode>
              </div>

              <div class="address-container">
                <p class="address-label">{{ selectedCrypto }} Address:</p>
                <div class="address">
                  <code>{{ cryptoDepositAddress.address }}</code>
                  <button
                    mat-icon-button
                    [cdkCopyToClipboard]="cryptoDepositAddress.address"
                    (click)="notifyAddressCopied()"
                  >
                    <mat-icon>content_copy</mat-icon>
                  </button>
                </div>
              </div>

              <div *ngIf="cryptoDepositAddress.network" class="network-info">
                <p><strong>Network:</strong> {{ cryptoDepositAddress.network }}</p>
              </div>

              <div *ngIf="cryptoDepositAddress.memo" class="memo-container">
                <p class="memo-label"><strong>Memo/Tag (Required):</strong></p>
                <div class="memo">
                  <code>{{ cryptoDepositAddress.memo }}</code>
                  <button
                    mat-icon-button
                    [cdkCopyToClipboard]="cryptoDepositAddress.memo"
                    (click)="notifyMemoCopied()"
                  >
                    <mat-icon>content_copy</mat-icon>
                  </button>
                </div>
              </div>

              <div class="crypto-instructions">
                <p>
                  Send only {{ selectedCrypto }} to this address. Sending any other cryptocurrency
                  may result in permanent loss.
                </p>
                <p>
                  Your deposit will be credited to your wallet after network confirmation (typically
                  10-60 minutes).
                </p>
              </div>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="depositForm.invalid || processingDeposit || cardPaymentMethods.length === 0"
        (click)="depositFiat()"
        *ngIf="!cryptoDepositAddress"
      >
        Deposit
      </button>
      <button mat-raised-button color="primary" mat-dialog-close *ngIf="cryptoDepositAddress">
        Done
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .deposit-form {
        padding: 16px 0;
      }

      .full-width {
        width: 100%;
      }

      .no-payment-methods {
        margin: 16px 0;
        text-align: center;

        p {
          margin-bottom: 16px;
          color: #f44336;
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

      .crypto-deposit-container {
        padding: 16px 0;
      }

      .crypto-address-container {
        margin-top: 24px;

        h3 {
          margin-bottom: 16px;
        }
      }

      .qr-code {
        display: flex;
        justify-content: center;
        margin-bottom: 24px;
      }

      .address-container,
      .memo-container {
        margin-bottom: 16px;
      }

      .address-label,
      .memo-label {
        margin-bottom: 8px;
        font-weight: 500;
      }

      .address,
      .memo {
        display: flex;
        align-items: center;
        background-color: #f5f5f5;
        padding: 8px 16px;
        border-radius: 4px;

        code {
          flex: 1;
          word-break: break-all;
          font-family: monospace;
        }
      }

      .network-info {
        margin-bottom: 16px;
      }

      .crypto-instructions {
        margin-top: 24px;
        padding: 16px;
        background-color: #fff8e1;
        border-radius: 4px;

        p {
          margin-bottom: 8px;

          &:last-child {
            margin-bottom: 0;
          }
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
    MatSnackBarModule,
    QRCodeComponent,
    ClipboardModule,
  ],
})
export class DepositDialogComponent implements OnInit {
  depositForm: FormGroup;
  processingDeposit = false;
  loadingCryptoAddress = false;

  // Crypto deposit
  selectedCrypto = 'BTC';
  cryptoDepositAddress: CryptoDepositAddress | null = null;

  // Filtered currencies and payment methods
  fiatCurrencies: string[] = [];
  cryptocurrencies: string[] = [];
  cardPaymentMethods: PaymentMethod[] = [];

  constructor(
    private dialogRef: MatDialogRef<DepositDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      currencies: string[];
      paymentMethods: PaymentMethod[];
      selectedCurrency: string;
    },
    private fb: FormBuilder,
    private walletService: WalletService,
    private paymentService: PaymentService,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar
  ) {
    // Initialize form
    this.depositForm = this.fb.group({
      currency: [data.selectedCurrency, Validators.required],
      amount: [1000, [Validators.required, Validators.min(1000)]],
      paymentMethodId: ['', Validators.required],
    });

    // Filter currencies
    this.fiatCurrencies = this.walletService.SUPPORTED_CURRENCIES;
    this.cryptocurrencies = this.walletService.SUPPORTED_CRYPTOCURRENCIES;

    // Filter payment methods (only cards for fiat deposits)
    this.cardPaymentMethods = data.paymentMethods.filter(method => method.type === 'card');

    // Set default payment method if available
    const defaultCard = this.cardPaymentMethods.find(method => method.isDefault);
    if (defaultCard) {
      this.depositForm.patchValue({ paymentMethodId: defaultCard._id });
    } else if (this.cardPaymentMethods.length > 0) {
      this.depositForm.patchValue({ paymentMethodId: this.cardPaymentMethods[0]._id });
    }
  }

  ngOnInit(): void {}

  /**
   * Deposit fiat currency
   */
  depositFiat(): void {
    if (this.depositForm.invalid) {
      return;
    }

    const { currency, amount, paymentMethodId } = this.depositForm.value;

    this.processingDeposit = true;

    this.walletService.depositFundsWithStripe(amount, currency, paymentMethodId).subscribe({
      next: result => {
        this.processingDeposit = false;
        this.notificationService.success(
          `Successfully deposited ${this.walletService.formatCurrency(amount, currency)}`
        );
        this.dialogRef.close(true);
      },
      error: error => {
        this.processingDeposit = false;
        console.error('Error depositing funds:', error);
        this.notificationService.error('Failed to deposit funds. Please try again.');
      },
    });
  }

  /**
   * Get crypto deposit address
   */
  getCryptoDepositAddress(): void {
    this.loadingCryptoAddress = true;
    this.cryptoDepositAddress = null;

    this.walletService.getCryptoDepositAddress(this.selectedCrypto).subscribe({
      next: address => {
        this.cryptoDepositAddress = address;
        this.loadingCryptoAddress = false;
      },
      error: error => {
        this.loadingCryptoAddress = false;
        console.error('Error getting crypto deposit address:', error);
        this.notificationService.error('Failed to generate deposit address. Please try again.');
      },
    });
  }

  /**
   * Close dialog and open add payment method dialog
   */
  closeAndOpenAddPaymentMethod(): void {
    this.dialogRef.close('add-payment-method');
  }

  /**
   * Get payment method display name
   */
  getPaymentMethodDisplayName(paymentMethod: PaymentMethod): string {
    if (paymentMethod.type === 'card' && paymentMethod.cardDetails) {
      return `${paymentMethod.cardDetails.brand} •••• ${paymentMethod.cardDetails.lastFour}`;
    }
    return 'Card';
  }

  /**
   * Show notification when address is copied
   */
  notifyAddressCopied(): void {
    this.snackBar.open('Address copied to clipboard', 'Dismiss', {
      duration: 3000,
    });
  }

  /**
   * Show notification when memo is copied
   */
  notifyMemoCopied(): void {
    this.snackBar.open('Memo copied to clipboard', 'Dismiss', {
      duration: 3000,
    });
  }
}
