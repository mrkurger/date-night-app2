import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ListboxModule } from 'primeng/listbox';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// PrimeNG imports
@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true,
  imports: [ProgressSpinnerModule, SelectButtonModule, TagModule, BadgeModule, ListboxModule, InputTextModule, ButtonModule, CardModule, 
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    ListboxModule,
    BadgeModule,
    TagModule,
    SelectButtonModule,
    ProgressSpinnerModule,
  ],
})
export class WalletComponent {
  // Simplified component for demonstration
  balance = 1000;
  transactions = [
    {
      _id: '1',
      type: 'deposit',
      amount: 500,
      status: 'completed',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '2',
      type: 'withdrawal',
      amount: -200,
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
  ];
  paymentMethods = [
    {
      id: '1',
      name: 'Visa Card',
      type: 'credit_card',
      isDefault: true,
      cardDetails: {
        brand: 'visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2025,
      },
    },
  ];
  loading = false;
  _error: string | null = null;
  loading = false;
  _error: string | null = null;

  openTransactionDetails(transaction: any): void {
    console.log('Transaction details:', transaction);
  }

  openDepositDialog(): void {
    console.log('Open deposit dialog');
  }

  openWithdrawDialog(): void {
    console.log('Open withdraw dialog');
  }

  openTransferDialog(): void {
    console.log('Open transfer dialog');
  }

  openAddPaymentMethodDialog(): void {
    console.log('Open add payment method dialog');
  }

  removePaymentMethod(paymentMethod: any): void {
    console.log('Remove payment method:', paymentMethod);
  }

  setDefaultPaymentMethod(paymentMethod: any): void {
    console.log('Set default payment method:', paymentMethod);
  }

  getTransactionStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'danger';
      default:
        return 'info';
        return 'info';
    }
  }

  getTransactionTypeIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'deposit':
        return 'arrow-downward-outline';
      case 'withdrawal':
        return 'arrow-upward-outline';
      case 'transfer':
        return 'swap-outline';
      case 'payment':
        return 'shopping-cart-outline';
      case 'refund':
        return 'undo-outline';
      default:
        return 'file-text-outline';
    }
  }

  getTransactionTypeIconPrime(type: string): string {
    switch (type.toLowerCase()) {
      case 'deposit':
        return 'pi-arrow-down';
      case 'withdrawal':
        return 'pi-arrow-up';
      case 'transfer':
        return 'pi-sync';
      case 'payment':
        return 'pi-shopping-cart';
      case 'refund':
        return 'pi-replay';
      default:
        return 'pi-file';
    }
  }

  getTransactionTypeIconPrime(type: string): string {
    switch (type.toLowerCase()) {
      case 'deposit':
        return 'pi-arrow-down';
      case 'withdrawal':
        return 'pi-arrow-up';
      case 'transfer':
        return 'pi-sync';
      case 'payment':
        return 'pi-shopping-cart';
      case 'refund':
        return 'pi-replay';
      default:
        return 'pi-file';
    }
  }

  getPaymentMethodIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'credit_card':
        return 'credit-card-outline';
      case 'bank_account':
        return 'home-outline';
      case 'paypal':
        return 'at-outline';
      case 'crypto':
        return 'flash-outline';
      default:
        return 'options-2-outline';
    }
  }

  getPaymentMethodIconPrime(type: string): string {
    switch (type.toLowerCase()) {
      case 'credit_card':
        return 'pi-credit-card';
      case 'bank_account':
        return 'pi-home';
      case 'paypal':
        return 'pi-paypal';
      case 'crypto':
        return 'pi-bitcoin';
      default:
        return 'pi-wallet';
    }
  }

  getPaymentMethodIconPrime(type: string): string {
    switch (type.toLowerCase()) {
      case 'credit_card':
        return 'pi-credit-card';
      case 'bank_account':
        return 'pi-home';
      case 'paypal':
        return 'pi-paypal';
      case 'crypto':
        return 'pi-bitcoin';
      default:
        return 'pi-wallet';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
