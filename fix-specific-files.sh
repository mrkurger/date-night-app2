#!/bin/bash

# Fix ad-management.component.ts
echo "Fixing ad-management.component.ts..."
cat > /Users/oivindlund/date-night-app/client-angular/src/app/features/ad-management/ad-management.component.ts << 'EOL'
import { Component } from '@angular/core';
import {
  NbCardModule,
  NbButtonModule,
  NbIconModule,
  NbLayoutModule,
} from '@nebular/theme';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-ad-management',
  templateUrl: './ad-management.component.html',
  styleUrls: ['./ad-management.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbLayoutModule,
  ],
})
export class AdManagementComponent {
  // Component logic here
}
EOL

# Fix ad-management.module.ts
echo "Fixing ad-management.module.ts..."
cat > /Users/oivindlund/date-night-app/client-angular/src/app/features/ad-management/ad-management.module.ts << 'EOL'
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import {
  NbCardModule,
  NbButtonModule,
  NbInputModule,
  NbFormFieldModule,
  NbIconModule,
  NbSpinnerModule,
  NbBadgeModule,
  NbTagModule,
  NbSelectModule,
} from '@nebular/theme';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    NbCardModule,
    NbButtonModule,
    NbInputModule,
    NbFormFieldModule,
    NbIconModule,
    NbSpinnerModule,
    NbBadgeModule,
    NbTagModule,
    NbSelectModule,
  ],
  declarations: [],
  exports: [],
})
export class AdManagementModule {}
EOL

# Fix wallet.component.ts
echo "Fixing wallet.component.ts..."
cat > /Users/oivindlund/date-night-app/client-angular/src/app/features/wallet/wallet.component.ts << 'EOL'
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  NbCardModule,
  NbButtonModule,
  NbInputModule,
  NbFormFieldModule,
  NbIconModule,
  NbSpinnerModule,
  NbAlertModule,
  NbBadgeModule,
  NbTagModule,
  NbSelectModule,
} from '@nebular/theme';

import { WalletService } from '../../core/services/wallet.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { Transaction } from '../../core/models/transaction.interface';
import { PaymentMethod } from '../../core/models/payment-method.interface';
import { User } from '../../core/models/user.interface';
import { NbDialogService } from '@nebular/theme';
import { TransactionDetailsDialogComponent } from './dialogs/transaction-details-dialog.component';
import { DepositDialogComponent } from './dialogs/deposit-dialog.component';
import { WithdrawDialogComponent } from './dialogs/withdraw-dialog.component';
import { TransferDialogComponent } from './dialogs/transfer-dialog.component';
import { AddPaymentMethodDialogComponent } from './dialogs/add-payment-method-dialog.component';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    NbCardModule,
    NbButtonModule,
    NbInputModule,
    NbFormFieldModule,
    NbIconModule,
    NbSpinnerModule,
    NbAlertModule,
    NbBadgeModule,
    NbTagModule,
    NbSelectModule,
  ],
})
export class WalletComponent implements OnInit {
  // Component properties and methods
  balance = 0;
  transactions: Transaction[] = [];
  paymentMethods: PaymentMethod[] = [];
  loading = true;
  error: string | null = null;
  currentUser: User | null = null;
  
  constructor(
    private walletService: WalletService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private dialogService: NbDialogService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadWalletData();
  }

  loadWalletData(): void {
    this.loading = true;
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.walletService.getWalletBalance().subscribe({
          next: (data) => {
            this.balance = data.balance;
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Failed to load wallet balance';
            this.loading = false;
            console.error('Error loading wallet balance:', err);
          }
        });

        this.loadTransactions();
        this.loadPaymentMethods();
      }
    });
  }

  loadTransactions(): void {
    this.walletService.getTransactions().subscribe({
      next: (transactions) => {
        this.transactions = transactions;
      },
      error: (err) => {
        this.error = 'Failed to load transactions';
        console.error('Error loading transactions:', err);
      }
    });
  }

  loadPaymentMethods(): void {
    this.walletService.getPaymentMethods().subscribe({
      next: (paymentMethods) => {
        this.paymentMethods = paymentMethods;
      },
      error: (err) => {
        this.error = 'Failed to load payment methods';
        console.error('Error loading payment methods:', err);
      }
    });
  }

  openTransactionDetails(transaction: Transaction): void {
    this.dialogService.open(TransactionDetailsDialogComponent, {
      context: {
        transaction
      }
    });
  }

  openDepositDialog(): void {
    const dialogRef = this.dialogService.open(DepositDialogComponent, {
      context: {
        paymentMethods: this.paymentMethods
      }
    });

    dialogRef.onClose.subscribe(result => {
      if (result) {
        this.notificationService.success('Deposit initiated successfully');
        this.loadWalletData();
      }
    });
  }

  openWithdrawDialog(): void {
    const dialogRef = this.dialogService.open(WithdrawDialogComponent, {
      context: {
        paymentMethods: this.paymentMethods,
        balance: this.balance
      }
    });

    dialogRef.onClose.subscribe(result => {
      if (result) {
        this.notificationService.success('Withdrawal initiated successfully');
        this.loadWalletData();
      }
    });
  }

  openTransferDialog(): void {
    const dialogRef = this.dialogService.open(TransferDialogComponent, {
      context: {
        balance: this.balance
      }
    });

    dialogRef.onClose.subscribe(result => {
      if (result) {
        this.notificationService.success('Transfer initiated successfully');
        this.loadWalletData();
      }
    });
  }

  openAddPaymentMethodDialog(): void {
    const dialogRef = this.dialogService.open(AddPaymentMethodDialogComponent);

    dialogRef.onClose.subscribe(result => {
      if (result) {
        this.notificationService.success('Payment method added successfully');
        this.loadPaymentMethods();
      }
    });
  }

  removePaymentMethod(paymentMethod: PaymentMethod): void {
    if (confirm('Are you sure you want to remove this payment method?')) {
      this.walletService.removePaymentMethod(paymentMethod.id).subscribe({
        next: () => {
          this.notificationService.success('Payment method removed successfully');
          this.loadPaymentMethods();
        },
        error: (err) => {
          this.error = 'Failed to remove payment method';
          console.error('Error removing payment method:', err);
          this.notificationService.error('Failed to remove payment method');
        }
      });
    }
  }

  setDefaultPaymentMethod(paymentMethod: PaymentMethod): void {
    this.walletService.setDefaultPaymentMethod(paymentMethod.id).subscribe({
      next: () => {
        this.notificationService.success('Default payment method updated');
        this.loadPaymentMethods();
      },
      error: (err) => {
        this.error = 'Failed to update default payment method';
        console.error('Error updating default payment method:', err);
        this.notificationService.error('Failed to update default payment method');
      }
    });
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
        return 'basic';
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
EOL

# Fix ad-form.component.ts
echo "Fixing ad-form.component.ts..."
cat > /Users/oivindlund/date-night-app/client-angular/src/app/features/ad-management/ad-form/ad-form.component.ts << 'EOL'
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  NbCardModule,
  NbFormFieldModule,
  NbSelectModule,
  NbIconModule,
  NbButtonModule,
  NbInputModule,
  NbCheckboxModule,
  NbTagModule,
  NbSpinnerModule,
  NbAlertModule,
} from '@nebular/theme';

import { Ad } from '../../../core/models/ad.interface';
import { CategoryService } from '../../../core/services/category.service';
import { LocationService } from '../../../core/services/location.service';

@Component({
  selector: 'app-ad-form',
  templateUrl: './ad-form.component.html',
  styleUrls: ['./ad-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NbCardModule,
    NbFormFieldModule,
    NbSelectModule,
    NbIconModule,
    NbButtonModule,
    NbInputModule,
    NbCheckboxModule,
    NbTagModule,
    NbSpinnerModule,
    NbAlertModule,
  ],
})
export class AdFormComponent implements OnInit {
  @Input() ad: Ad | null = null;
  @Input() submitButtonText = 'Save';
  @Input() isSubmitting = false;
  @Input() error: string | null = null;
  @Output() formSubmit = new EventEmitter<Ad>();
  @Output() formCancel = new EventEmitter<void>();

  adForm: FormGroup;
  categories: string[] = [];
  locations: string[] = [];
  uploadedImages: File[] = [];
  imagePreviewUrls: string[] = [];

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private locationService: LocationService
  ) {
    this.adForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
      price: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      location: ['', Validators.required],
      isTouring: [false],
      tags: [''],
      contactEmail: ['', [Validators.email]],
      contactPhone: [''],
      isActive: [true],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadLocations();

    if (this.ad) {
      this.adForm.patchValue({
        title: this.ad.title,
        description: this.ad.description,
        price: this.ad.price || 0,
        category: this.ad.category,
        location: this.ad.location,
        isTouring: this.ad.isTouring || false,
        tags: this.ad.tags ? this.ad.tags.join(', ') : '',
        contactEmail: this.ad.contactEmail || '',
        contactPhone: this.ad.contactPhone || '',
        isActive: this.ad.isActive !== false,
      });

      if (this.ad.images && this.ad.images.length > 0) {
        this.imagePreviewUrls = this.ad.images.map(img => 
          typeof img === 'string' ? img : img.url
        );
      }
    }
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  loadLocations(): void {
    this.locationService.getLocations().subscribe({
      next: (locations) => {
        this.locations = locations;
      },
      error: (err) => {
        console.error('Error loading locations:', err);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        if (file.type.match('image.*')) {
          this.uploadedImages.push(file);
          
          // Create preview
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.imagePreviewUrls.push(e.target.result);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }

  removeImage(index: number): void {
    this.imagePreviewUrls.splice(index, 1);
    if (index < this.uploadedImages.length) {
      this.uploadedImages.splice(index, 1);
    }
  }

  onSubmit(): void {
    if (this.adForm.valid) {
      const formData = this.adForm.value;
      
      // Process tags
      const tags = formData.tags
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag);
      
      const adData: Ad = {
        ...formData,
        tags,
        // Keep existing images if any
        images: this.ad?.images || [],
        // Add ID if editing
        _id: this.ad?._id,
      };
      
      this.formSubmit.emit(adData);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.adForm.controls).forEach(key => {
        this.adForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }
}
EOL

echo "All specific files fixed successfully!"