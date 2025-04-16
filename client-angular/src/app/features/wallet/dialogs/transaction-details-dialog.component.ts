
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (transaction-details-dialog.component)
// 
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { WalletService, WalletTransaction } from '../../../core/services/wallet.service';

@Component({
  selector: 'app-transaction-details-dialog',
  template: `
    <h2 mat-dialog-title>Transaction Details</h2>
    
    <mat-dialog-content>
      <div class="transaction-details">
        <!-- Transaction ID -->
        <div class="detail-row">
          <div class="detail-label">Transaction ID</div>
          <div class="detail-value id-value">
            {{ transaction._id }}
            <button 
              mat-icon-button 
              [cdkCopyToClipboard]="transaction._id"
              (click)="copyToClipboard('Transaction ID')">
              <mat-icon>content_copy</mat-icon>
            </button>
          </div>
        </div>
        
        <!-- Transaction Type -->
        <div class="detail-row">
          <div class="detail-label">Type</div>
          <div class="detail-value">
            <span class="transaction-type" [ngClass]="getTransactionTypeClass(transaction.type)">
              {{ transaction.type | titlecase }}
            </span>
          </div>
        </div>
        
        <!-- Amount -->
        <div class="detail-row">
          <div class="detail-label">Amount</div>
          <div class="detail-value">
            <span [ngClass]="{'positive-amount': transaction.amount > 0, 'negative-amount': transaction.amount < 0}">
              {{ formatTransactionAmount(transaction) }}
            </span>
          </div>
        </div>
        
        <!-- Fee (if any) -->
        <div class="detail-row" *ngIf="transaction.fee">
          <div class="detail-label">Fee</div>
          <div class="detail-value negative-amount">
            {{ walletService.formatCurrency(transaction.fee.amount, transaction.fee.currency) }}
          </div>
        </div>
        
        <!-- Status -->
        <div class="detail-row">
          <div class="detail-label">Status</div>
          <div class="detail-value">
            <span class="transaction-status" [ngClass]="getTransactionStatusClass(transaction.status)">
              {{ transaction.status | titlecase }}
            </span>
          </div>
        </div>
        
        <!-- Date -->
        <div class="detail-row">
          <div class="detail-label">Date</div>
          <div class="detail-value">
            {{ transaction.createdAt | date:'medium' }}
          </div>
        </div>
        
        <!-- Description -->
        <div class="detail-row" *ngIf="transaction.description">
          <div class="detail-label">Description</div>
          <div class="detail-value">
            {{ transaction.description }}
          </div>
        </div>
        
        <mat-divider class="detail-divider"></mat-divider>
        
        <!-- Metadata -->
        <h3 class="metadata-title">Additional Information</h3>
        
        <!-- Payment Method -->
        <div class="detail-row" *ngIf="transaction.metadata?.paymentMethodId">
          <div class="detail-label">Payment Method</div>
          <div class="detail-value">
            {{ transaction.metadata.paymentMethodId }}
          </div>
        </div>
        
        <!-- Payment Intent ID -->
        <div class="detail-row" *ngIf="transaction.metadata?.paymentIntentId">
          <div class="detail-label">Payment Intent ID</div>
          <div class="detail-value id-value">
            {{ transaction.metadata.paymentIntentId }}
            <button 
              mat-icon-button 
              [cdkCopyToClipboard]="transaction.metadata.paymentIntentId"
              (click)="copyToClipboard('Payment Intent ID')">
              <mat-icon>content_copy</mat-icon>
            </button>
          </div>
        </div>
        
        <!-- Transaction ID (external) -->
        <div class="detail-row" *ngIf="transaction.metadata?.transactionId">
          <div class="detail-label">Transaction ID</div>
          <div class="detail-value id-value">
            {{ transaction.metadata.transactionId }}
            <button 
              mat-icon-button 
              [cdkCopyToClipboard]="transaction.metadata.transactionId"
              (click)="copyToClipboard('Transaction ID')">
              <mat-icon>content_copy</mat-icon>
            </button>
          </div>
        </div>
        
        <!-- Blockchain Transaction Hash -->
        <div class="detail-row" *ngIf="transaction.metadata?.txHash">
          <div class="detail-label">Transaction Hash</div>
          <div class="detail-value id-value">
            {{ transaction.metadata.txHash }}
            <button 
              mat-icon-button 
              [cdkCopyToClipboard]="transaction.metadata.txHash"
              (click)="copyToClipboard('Transaction Hash')">
              <mat-icon>content_copy</mat-icon>
            </button>
          </div>
        </div>
        
        <!-- Block Confirmations -->
        <div class="detail-row" *ngIf="transaction.metadata?.blockConfirmations !== undefined">
          <div class="detail-label">Confirmations</div>
          <div class="detail-value">
            {{ transaction.metadata.blockConfirmations }}
          </div>
        </div>
        
        <!-- Provider -->
        <div class="detail-row" *ngIf="transaction.metadata?.provider">
          <div class="detail-label">Provider</div>
          <div class="detail-value">
            {{ transaction.metadata.provider }}
          </div>
        </div>
        
        <!-- Sender/Recipient Wallet ID -->
        <div class="detail-row" *ngIf="transaction.metadata?.senderWalletId">
          <div class="detail-label">Sender</div>
          <div class="detail-value id-value">
            {{ transaction.metadata.senderWalletId }}
          </div>
        </div>
        
        <div class="detail-row" *ngIf="transaction.metadata?.recipientWalletId">
          <div class="detail-label">Recipient</div>
          <div class="detail-value id-value">
            {{ transaction.metadata.recipientWalletId }}
          </div>
        </div>
        
        <!-- Ad ID -->
        <div class="detail-row" *ngIf="transaction.metadata?.adId">
          <div class="detail-label">Ad ID</div>
          <div class="detail-value id-value">
            {{ transaction.metadata.adId }}
          </div>
        </div>
        
        <!-- Service Type -->
        <div class="detail-row" *ngIf="transaction.metadata?.serviceType">
          <div class="detail-label">Service Type</div>
          <div class="detail-value">
            {{ transaction.metadata.serviceType }}
          </div>
        </div>
        
        <!-- Crypto Address -->
        <div class="detail-row" *ngIf="transaction.metadata?.address">
          <div class="detail-label">Address</div>
          <div class="detail-value id-value">
            {{ transaction.metadata.address }}
            <button 
              mat-icon-button 
              [cdkCopyToClipboard]="transaction.metadata.address"
              (click)="copyToClipboard('Address')">
              <mat-icon>content_copy</mat-icon>
            </button>
          </div>
        </div>
        
        <!-- Network -->
        <div class="detail-row" *ngIf="transaction.metadata?.network">
          <div class="detail-label">Network</div>
          <div class="detail-value">
            {{ transaction.metadata.network }}
          </div>
        </div>
        
        <!-- Memo -->
        <div class="detail-row" *ngIf="transaction.metadata?.memo">
          <div class="detail-label">Memo/Tag</div>
          <div class="detail-value id-value">
            {{ transaction.metadata.memo }}
            <button 
              mat-icon-button 
              [cdkCopyToClipboard]="transaction.metadata.memo"
              (click)="copyToClipboard('Memo/Tag')">
              <mat-icon>content_copy</mat-icon>
            </button>
          </div>
        </div>
      </div>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .transaction-details {
      padding: 8px 0;
    }
    
    .detail-row {
      display: flex;
      margin-bottom: 16px;
    }
    
    .detail-label {
      flex: 0 0 140px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .detail-value {
      flex: 1;
      
      &.id-value {
        display: flex;
        align-items: center;
        font-family: monospace;
        word-break: break-all;
        
        button {
          margin-left: 8px;
        }
      }
    }
    
    .detail-divider {
      margin: 24px 0;
    }
    
    .metadata-title {
      margin-bottom: 16px;
      font-weight: 500;
    }
    
    .transaction-type {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      
      &.transaction-deposit {
        background-color: #e6f4ea;
        color: #137333;
      }
      
      &.transaction-withdrawal {
        background-color: #fef7e0;
        color: #ea8600;
      }
      
      &.transaction-transfer {
        background-color: #e8f0fe;
        color: #1a73e8;
      }
      
      &.transaction-payment {
        background-color: #e8f0fe;
        color: #1a73e8;
      }
      
      &.transaction-refund {
        background-color: #e6f4ea;
        color: #137333;
      }
      
      &.transaction-fee {
        background-color: #f8f9fa;
        color: #5f6368;
      }
    }
    
    .transaction-status {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      
      &.status-pending {
        background-color: #fef7e0;
        color: #ea8600;
      }
      
      &.status-completed {
        background-color: #e6f4ea;
        color: #137333;
      }
      
      &.status-failed {
        background-color: #fce8e6;
        color: #c5221f;
      }
      
      &.status-cancelled {
        background-color: #f8f9fa;
        color: #5f6368;
      }
    }
    
    .positive-amount {
      color: #34a853;
      font-weight: 500;
    }
    
    .negative-amount {
      color: #ea4335;
      font-weight: 500;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    ClipboardModule,
    MatSnackBarModule
  ]
})
export class TransactionDetailsDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<TransactionDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      transaction: WalletTransaction;
    },
    public walletService: WalletService,
    private snackBar: MatSnackBar
  ) {}
  
  get transaction(): WalletTransaction {
    return this.data.transaction;
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
   * Copy text to clipboard and show notification
   * @param label Label for the copied text
   */
  copyToClipboard(label: string): void {
    this.snackBar.open(`${label} copied to clipboard`, 'Dismiss', {
      duration: 3000
    });
  }
}