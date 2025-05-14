import { NbIconModule } from '@nebular/theme';
import { NbFormFieldModule } from '@nebular/theme';
import { NbCardModule } from '@nebular/theme';
import { Input } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormBuilder,
} from '@angular/forms';

import { Subscription } from 'rxjs';
import { WalletService } from '../../../core/services/wallet.service';
import { SharedModule } from '../../../shared/shared.module';
import { WalletBalance } from '../../../core/services/wallet.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { User } from '../../../core/models/user.interface';

// Define the TransferDialogData interface
export interface TransferDialogData {
  balances?: WalletBalance[];
  selectedCurrency?: string;
}

@Component({
  selector: 'app-transfer-dialog',
  templateUrl: './transfer-dialog.component.html',
  styleUrls: ['./transfer-dialog.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NbCardModule, NbButtonModule, NbInputModule, NbSelectModule, NbFormFieldModule, NbSpinnerModule, NbIconModule, SharedModule],
})
export class TransferDialogComponent implements OnInit, OnDestroy {
  transferForm: FormGroup;
  availableBalances: WalletBalance[] = [];
  maxAmount = 0;
  processingTransfer = false;
  selectedUserForTransfer: User | null = null;
  filteredUsers$ = new Subject<User[]>();
  private destroy$ = new Subject<void>();

  // Add missing properties referenced in the template
  isSubmitting = false;

  // Add getter for form controls
  get f() {
    return this.transferForm.controls;
  }

  constructor(
    private dialogRef: NbDialogRef<TransferDialogComponent>,
    private fb: FormBuilder,
    public walletService: WalletService,
    private userService: UserService,
    private notificationService: NotificationService,
  ) {
    this.transferForm = this.fb.group({
      currency: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      recipientUsername: ['', Validators.required],
      description: [''],
    });
  }

  ngOnInit() {
    // Setup currency change handler
    this.transferForm
      .get('currency')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateMaxAmount();
      });

    // Setup recipient search
    this.transferForm
      .get('recipientUsername')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((value) => {
        if (typeof value === 'string' && value.length > 2) {
          this.searchUsers(value);
        }
      });

    // Load initial balances
    this.loadBalances();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getControlStatus(controlName: string): string {
    const control = this.transferForm.get(controlName);
    if (!control) return 'basic';

    if (control.touched) {
      return control.valid ? 'success' : 'danger';
    }
    return 'basic';
  }

  closeDialog() {
    this.dialogRef.close();
  }

  // Add missing methods referenced in the template
  cancel() {
    this.dialogRef.close();
  }

  transfer() {
    this.transferFunds();
  }

  private loadBalances() {
    this.walletService
      .getWalletBalance()
      .pipe(takeUntil(this.destroy$))
      .subscribe((balances) => {
        if (Array.isArray(balances)) {
          this.availableBalances = balances.filter((b) => b.available > 0);
        }
      });
  }

  private updateMaxAmount() {
    const currency = this.transferForm.get('currency')?.value;
    const balance = this.availableBalances.find((b) => b.currency === currency);
    this.maxAmount = balance?.available || 0;

    // Update amount validator
    const amountControl = this.transferForm.get('amount');
    if (amountControl) {
      amountControl.setValidators([
        Validators.required,
        Validators.min(0.01),
        Validators.max(this.maxAmount),
      ]);
      amountControl.updateValueAndValidity();
    }
  }

  private searchUsers(term: string) {
    this.userService
      .searchUsers(term)
      .pipe(takeUntil(this.destroy$))
      .subscribe((users) => {
        this.filteredUsers$.next(users);
      });
  }

  onRecipientSelected(user: User) {
    this.selectedUserForTransfer = user;
  }

  transferFunds() {
    if (this.transferForm.invalid || !this.selectedUserForTransfer) return;

    this.isSubmitting = true;
    this.processingTransfer = true;
    const formData = this.transferForm.value;

    this.walletService
      .transferFunds(
        this.selectedUserForTransfer._id,
        formData.amount,
        formData.currency,
        formData.description || undefined,
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Transfer successful');
          this.dialogRef.close({ success: true });
        },
        error: (error) => {
          console.error('Transfer error:', error);
          this.notificationService.error('Failed to process transfer');
          this.processingTransfer = false;
          this.isSubmitting = false;
        },
      });
  }
}
