
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (withdraw-dialog.component)
// 
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { WalletService, WalletBalance, PaymentMethod } from '../../../core/services/wallet.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-withdraw-dialog',
  template: `
    <h2 mat-dialog-title>Withdraw Funds</h2>
    
    <mat-dialog-content>
      <mat-tab-group animationDuration="0ms">
        <!-- Fiat Currency Withdrawal -->
        <mat-tab label="Fiat Currency">
          <form [formGroup]="withdrawForm" class="withdraw-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Currency</mat-label>
              <mat-select formControlName="currency" (selectionChange)="updateMaxAmount()">
                <mat-option *ngFor="let balance of balances" [value]="balance.currency">
                  {{ balance.currency }} ({{ walletService.formatCurrency(balance.available, balance.currency) }} available)
                </mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Amount</mat-label>
              <input matInput type="number" formControlName="amount" min="1" [max]="maxAmount">
              <span matTextSuffix>{{ withdrawForm.get('currency')?.value }}</span>
              <mat-hint>Available: {{ walletService.formatCurrency(maxAmount, withdrawForm.get('currency')?.value) }}</mat-hint>
              <mat-error *ngIf="withdrawForm.get('amount')?.hasError('required')">
                Amount is required
              </mat-error>
              <mat-error *ngIf="withdrawForm.get('amount')?.hasError('min')">
                Minimum amount is 1 {{ withdrawForm.get('currency')?.value }}
              </mat-error>
              <mat-error *ngIf="withdrawForm.get('amount')?.hasError('max')">
                Amount exceeds available balance
              </mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Payment Method</mat-label>
              <mat-select formControlName="paymentMethodId">
                <mat-option *ngFor="let method of filteredPaymentMethods" [value]="method._id">
                  {{ getPaymentMethodDisplayName(method) }}
                </mat-option>
              </mat-select>
              <mat-error *ngIf="withdrawForm.get('paymentMethodId')?.hasError('required')">
                Payment method is required
              </mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description (Optional)</mat-label>
              <input matInput formControlName="description" maxlength="100">
              <mat-hint align="end">{{ withdrawForm.get('description')?.value?.length || 0 }}/100</mat-hint>
            </mat-form-field>
            
            <div *ngIf="filteredPaymentMethods.length === 0" class="no-payment-methods">
              <p>You don't have any suitable payment methods for this currency. Please add a payment method first.</p>
              <button mat-raised-button color="primary" (click)="closeAndOpenAddPaymentMethod()">
                Add Payment Method
              </button>
            </div>
            
            <div *ngIf="processingWithdrawal" class="processing-container">
              <mat-spinner diameter="30"></mat-spinner>
              <p>Processing your withdrawal...</p>
            </div>
          </form>
        </mat-tab>
        
        <!-- Cryptocurrency Withdrawal -->
        <mat-tab label="Cryptocurrency">
          <form [formGroup]="cryptoWithdrawForm" class="withdraw-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Cryptocurrency</mat-label>
              <mat-select formControlName="currency" (selectionChange)="updateCryptoMaxAmount()">
                <mat-option *ngFor="let balance of cryptoBalances" [value]="balance.currency">
                  {{ balance.currency }} ({{ walletService.formatCurrency(balance.available, balance.currency) }} available)
                </mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Amount</mat-label>
              <input matInput type="number" formControlName="amount" min="1" [max]="cryptoMaxAmount">
              <span matTextSuffix>{{ cryptoWithdrawForm.get('currency')?.value }}</span>
              <mat-hint>Available: {{ walletService.formatCurrency(cryptoMaxAmount, cryptoWithdrawForm.get('currency')?.value) }}</mat-hint>
              <mat-error *ngIf="cryptoWithdrawForm.get('amount')?.hasError('required')">
                Amount is required
              </mat-error>
              <mat-error *ngIf="cryptoWithdrawForm.get('amount')?.hasError('min')">
                Minimum amount is required
              </mat-error>
              <mat-error *ngIf="cryptoWithdrawForm.get('amount')?.hasError('max')">
                Amount exceeds available balance
              </mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Destination Address</mat-label>
              <input matInput formControlName="address">
              <mat-error *ngIf="cryptoWithdrawForm.get('address')?.hasError('required')">
                Destination address is required
              </mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Network</mat-label>
              <mat-select formControlName="network">
                <mat-option *ngFor="let network of getNetworksForCurrency(cryptoWithdrawForm.get('currency')?.value)" [value]="network.value">
                  {{ network.label }}
                </mat-option>
              </mat-select>
              <mat-error *ngIf="cryptoWithdrawForm.get('network')?.hasError('required')">
                Network is required
              </mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width" *ngIf="requiresMemo(cryptoWithdrawForm.get('currency')?.value)">
              <mat-label>Memo / Tag (Required)</mat-label>
              <input matInput formControlName="memo">
              <mat-error *ngIf="cryptoWithdrawForm.get('memo')?.hasError('required')">
                Memo/Tag is required for this currency
              </mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description (Optional)</mat-label>
              <input matInput formControlName="description" maxlength="100">
              <mat-hint align="end">{{ cryptoWithdrawForm.get('description')?.value?.length || 0 }}/100</mat-hint>
            </mat-form-field>
            
            <div *ngIf="cryptoBalances.length === 0" class="no-payment-methods">
              <p>You don't have any cryptocurrency balances. Please deposit cryptocurrency first.</p>
            </div>
            
            <div *ngIf="processingCryptoWithdrawal" class="processing-container">
              <mat-spinner diameter="30"></mat-spinner>
              <p>Processing your withdrawal...</p>
            </div>
            
            <div class="crypto-warning">
              <p><strong>Important:</strong> Please double-check the destination address and network before confirming.</p>
              <p>Withdrawals to incorrect addresses or networks cannot be reversed.</p>
            </div>
          </form>
        </mat-tab>
      </mat-tab-group>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button 
        mat-raised-button 
        color="primary" 
        [disabled]="withdrawForm.invalid || processingWithdrawal || filteredPaymentMethods.length === 0" 
        (click)="withdrawFiat()"
        *ngIf="selectedTabIndex === 0">
        Withdraw
      </button>
      <button 
        mat-raised-button 
        color="primary" 
        [disabled]="cryptoWithdrawForm.invalid || processingCryptoWithdrawal || cryptoBalances.length === 0" 
        (click)="withdrawCrypto()"
        *ngIf="selectedTabIndex === 1">
        Withdraw
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .withdraw-form {
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
    
    .crypto-warning {
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
  `],
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
    MatSnackBarModule
  ]
})
export class WithdrawDialogComponent implements OnInit {
  withdrawForm: FormGroup;
  cryptoWithdrawForm: FormGroup;
  
  processingWithdrawal = false;
  processingCryptoWithdrawal = false;
  
  maxAmount = 0;
  cryptoMaxAmount = 0;
  
  selectedTabIndex = 0;
  
  // Filtered balances and payment methods
  balances: WalletBalance[] = [];
  cryptoBalances: WalletBalance[] = [];
  filteredPaymentMethods: PaymentMethod[] = [];
  
  // Networks for cryptocurrencies
  cryptoNetworks = {
    'BTC': [
      { value: 'bitcoin', label: 'Bitcoin (BTC)' },
      { value: 'lightning', label: 'Lightning Network' }
    ],
    'ETH': [
      { value: 'ethereum', label: 'Ethereum (ERC-20)' },
      { value: 'arbitrum', label: 'Arbitrum' },
      { value: 'optimism', label: 'Optimism' }
    ],
    'USDT': [
      { value: 'ethereum', label: 'Ethereum (ERC-20)' },
      { value: 'tron', label: 'Tron (TRC-20)' },
      { value: 'bsc', label: 'Binance Smart Chain (BEP-20)' }
    ],
    'USDC': [
      { value: 'ethereum', label: 'Ethereum (ERC-20)' },
      { value: 'solana', label: 'Solana' },
      { value: 'polygon', label: 'Polygon' }
    ]
  };
  
  // Currencies that require memo/tag
  memoRequiredCurrencies = ['XRP', 'XLM', 'BNB', 'ATOM'];
  
  constructor(
    private dialogRef: MatDialogRef<WithdrawDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      balances: WalletBalance[];
      paymentMethods: PaymentMethod[];
      selectedCurrency: string;
    },
    private fb: FormBuilder,
    public walletService: WalletService,
    private notificationService: NotificationService
  ) {
    // Filter balances
    this.balances = data.balances.filter(b => 
      this.walletService.SUPPORTED_CURRENCIES.includes(b.currency) && b.available > 0
    );
    
    this.cryptoBalances = data.balances.filter(b => 
      this.walletService.SUPPORTED_CRYPTOCURRENCIES.includes(b.currency) && b.available > 0
    );
    
    // Initialize fiat withdrawal form
    this.withdrawForm = this.fb.group({
      currency: [data.selectedCurrency, Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]],
      paymentMethodId: ['', Validators.required],
      description: ['']
    });
    
    // Initialize crypto withdrawal form
    this.cryptoWithdrawForm = this.fb.group({
      currency: [this.cryptoBalances.length > 0 ? this.cryptoBalances[0].currency : '', Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]],
      address: ['', Validators.required],
      network: ['', Validators.required],
      memo: [''],
      description: ['']
    });
    
    // Update validators for memo field based on selected currency
    this.cryptoWithdrawForm.get('currency')?.valueChanges.subscribe(currency => {
      const memoControl = this.cryptoWithdrawForm.get('memo');
      if (this.requiresMemo(currency)) {
        memoControl?.setValidators([Validators.required]);
      } else {
        memoControl?.clearValidators();
      }
      memoControl?.updateValueAndValidity();
    });
    
    // Filter payment methods based on selected currency
    this.withdrawForm.get('currency')?.valueChanges.subscribe(currency => {
      this.updateFilteredPaymentMethods(currency);
      this.updateMaxAmount();
    });
  }
  
  ngOnInit(): void {
    // Set initial values
    this.updateFilteredPaymentMethods(this.withdrawForm.get('currency')?.value);
    this.updateMaxAmount();
    this.updateCryptoMaxAmount();
  }
  
  /**
   * Update filtered payment methods based on selected currency
   */
  updateFilteredPaymentMethods(currency: string): void {
    if (!currency) return;
    
    this.filteredPaymentMethods = this.data.paymentMethods.filter(method => {
      if (method.type === 'card') {
        return true; // Cards can be used for any currency
      } else if (method.type === 'bank_account' && method.bankDetails) {
        return method.bankDetails.currency === currency;
      }
      return false;
    });
    
    // Update payment method selection
    if (this.filteredPaymentMethods.length > 0) {
      const defaultMethod = this.filteredPaymentMethods.find(m => m.isDefault);
      this.withdrawForm.patchValue({
        paymentMethodId: defaultMethod ? defaultMethod._id : this.filteredPaymentMethods[0]._id
      });
    } else {
      this.withdrawForm.patchValue({ paymentMethodId: '' });
    }
  }
  
  /**
   * Update maximum amount based on selected currency
   */
  updateMaxAmount(): void {
    const currency = this.withdrawForm.get('currency')?.value;
    if (!currency) {
      this.maxAmount = 0;
      return;
    }
    
    const balance = this.balances.find(b => b.currency === currency);
    this.maxAmount = balance ? balance.available : 0;
    
    // Update amount validator
    this.withdrawForm.get('amount')?.setValidators([
      Validators.required,
      Validators.min(1),
      Validators.max(this.maxAmount)
    ]);
    this.withdrawForm.get('amount')?.updateValueAndValidity();
    
    // Set default amount to 50% of available balance
    const defaultAmount = Math.floor(this.maxAmount / 2);
    this.withdrawForm.patchValue({ amount: defaultAmount > 0 ? defaultAmount : 0 });
  }
  
  /**
   * Update maximum crypto amount based on selected currency
   */
  updateCryptoMaxAmount(): void {
    const currency = this.cryptoWithdrawForm.get('currency')?.value;
    if (!currency) {
      this.cryptoMaxAmount = 0;
      return;
    }
    
    const balance = this.cryptoBalances.find(b => b.currency === currency);
    this.cryptoMaxAmount = balance ? balance.available : 0;
    
    // Update amount validator
    this.cryptoWithdrawForm.get('amount')?.setValidators([
      Validators.required,
      Validators.min(1),
      Validators.max(this.cryptoMaxAmount)
    ]);
    this.cryptoWithdrawForm.get('amount')?.updateValueAndValidity();
    
    // Set default amount to 50% of available balance
    const defaultAmount = Math.floor(this.cryptoMaxAmount / 2);
    this.cryptoWithdrawForm.patchValue({ amount: defaultAmount > 0 ? defaultAmount : 0 });
    
    // Set default network
    const networks = this.getNetworksForCurrency(currency);
    if (networks.length > 0) {
      this.cryptoWithdrawForm.patchValue({ network: networks[0].value });
    }
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
   * Withdraw fiat currency
   */
  withdrawFiat(): void {
    if (this.withdrawForm.invalid) {
      return;
    }
    
    const { currency, amount, paymentMethodId, description } = this.withdrawForm.value;
    
    this.processingWithdrawal = true;
    
    this.walletService.withdrawFunds(amount, currency, paymentMethodId, description)
      .subscribe({
        next: (transaction) => {
          this.processingWithdrawal = false;
          this.notificationService.success(`Withdrawal of ${this.walletService.formatCurrency(amount, currency)} initiated`);
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.processingWithdrawal = false;
          console.error('Error withdrawing funds:', error);
          this.notificationService.error('Failed to withdraw funds. Please try again.');
        }
      });
  }
  
  /**
   * Withdraw cryptocurrency
   */
  withdrawCrypto(): void {
    if (this.cryptoWithdrawForm.invalid) {
      return;
    }
    
    const { currency, amount, address, network, memo, description } = this.cryptoWithdrawForm.value;
    
    this.processingCryptoWithdrawal = true;
    
    this.walletService.withdrawCrypto(amount, currency, address, network, memo, description)
      .subscribe({
        next: (transaction) => {
          this.processingCryptoWithdrawal = false;
          this.notificationService.success(`Withdrawal of ${this.walletService.formatCurrency(amount, currency)} initiated`);
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.processingCryptoWithdrawal = false;
          console.error('Error withdrawing cryptocurrency:', error);
          this.notificationService.error('Failed to withdraw cryptocurrency. Please try again.');
        }
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
    } else if (paymentMethod.type === 'bank_account' && paymentMethod.bankDetails) {
      return `${paymentMethod.bankDetails.bankName} •••• ${paymentMethod.bankDetails.lastFour}`;
    }
    return 'Payment Method';
  }
}