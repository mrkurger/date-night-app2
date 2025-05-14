import { NbIconModule } from '@nebular/theme';
import { NbBadgeModule } from '@nebular/theme';
import { NbCardModule } from '@nebular/theme';
import { Inject } from '@angular/core';
import { Component } from '@angular/core';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (transaction-details-dialog.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ClipboardModule } from '@angular/cdk/clipboard';


import { WalletService } from '../../../core/services/wallet.service';

export interface WalletTransaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  metadata?: {
    paymentMethodId?: string;
    recipientId?: string;
    recipientWalletId?: string;
    senderId?: string;
    senderWalletId?: string;
    transactionId?: string;
    [key: string]: any;
  };
}

@Component({
  selector: 'app-transaction-details-dialog',
  standalone: true,
  imports: [CommonModule, ClipboardModule, NbCardModule, NbButtonModule, NbIconModule, FormsModule, ReactiveFormsModule, NbBadgeModule],
  templateUrl: './transaction-details-dialog.component.html',
  styleUrls: ['./transaction-details-dialog.component.scss'],
})
export class TransactionDetailsDialogComponent {
  constructor(
    private dialogRef: NbDialogRef<TransactionDetailsDialogComponent>,
    public walletService: WalletService,
    private toastrService: NbToastrService,
    @Inject(NB_DIALOG_CONFIG) private config: { transaction: WalletTransaction },
  ) {}

  get transaction(): WalletTransaction {
    return this.config.transaction;
  }

  formatTransactionAmount(transaction: WalletTransaction): string {
    const sign = transaction.amount >= 0 ? '+' : '';
    return `${sign}${this.walletService.formatCurrency(transaction.amount, transaction.currency)}`;
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text);
    const position: NbGlobalPosition = NbGlobalPhysicalPosition.TOP_RIGHT;
    this.toastrService.success('Copied to clipboard', 'Success', { position });
  }

  getTypeStatus(type: string): string {
    switch (type.toLowerCase()) {
      case 'deposit':
        return 'success';
      case 'withdrawal':
        return 'warning';
      case 'transfer':
        return 'info';
      case 'payment':
        return 'primary';
      case 'refund':
        return 'info';
      case 'fee':
        return 'basic';
      default:
        return 'basic';
    }
  }

  getStatusStatus(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'danger';
      case 'cancelled':
        return 'basic';
      default:
        return 'basic';
    }
  }

  getMetadataKeys(): string[] {
    if (!this.transaction.metadata) {
      return [];
    }
    return Object.keys(this.transaction.metadata);
  }

  formatMetadataKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/Id$/, 'ID');
  }

  close(): void {
    this.dialogRef.close();
  }
}
