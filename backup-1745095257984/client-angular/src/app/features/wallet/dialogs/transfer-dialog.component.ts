// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (transfer-dialog.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, Inject, OnInit } from '@angular/core';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, of, debounceTime, switchMap, catchError, map } from 'rxjs';

import { WalletService, WalletBalance } from '../../../core/services/wallet.service';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';

interface UserSearchResult {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

@Component({
  selector: 'app-transfer-dialog',
  template: `
    <h2 mat-dialog-title>Transfer Funds</h2>

    <mat-dialog-content>
      <form [formGroup]="transferForm" class="transfer-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Currency</mat-label>
          <mat-select formControlName="currency" (selectionChange)="updateMaxAmount()">
            <mat-option *ngFor="let balance of balances" [value]="balance.currency">
              {{ balance.currency }} ({{
                walletService.formatCurrency(balance.available, balance.currency)
              }}
              available)
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Amount</mat-label>
          <input matInput type="number" formControlName="amount" min="1" [max]="maxAmount" />
          <span matTextSuffix>{{ transferForm.get('currency')?.value }}</span>
          <mat-hint
            >Available:
            {{
              walletService.formatCurrency(maxAmount, transferForm.get('currency')?.value)
            }}</mat-hint
          >
          <mat-error *ngIf="transferForm.get('amount')?.hasError('required')">
            Amount is required
          </mat-error>
          <mat-error *ngIf="transferForm.get('amount')?.hasError('min')">
            Minimum amount is 1 {{ transferForm.get('currency')?.value }}
          </mat-error>
          <mat-error *ngIf="transferForm.get('amount')?.hasError('max')">
            Amount exceeds available balance
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Recipient Username</mat-label>
          <input
            matInput
            formControlName="recipientUsername"
            [matAutocomplete]="auto"
            placeholder="Enter username or email"
          />
          <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayUsername">
            <mat-option *ngFor="let user of filteredUsers" [value]="user">
              <div class="user-option">
                <img
                  *ngIf="user.avatarUrl"
                  [src]="user.avatarUrl"
                  class="user-avatar"
                  alt="{{ user.displayName || user.username }}"
                />
                <div class="user-info">
                  <span class="user-display-name">{{ user.displayName || user.username }}</span>
                  <span class="user-username">{{ '@' + user.username }}</span>
                </div>
              </div>
            </mat-option>
          </mat-autocomplete>
          <mat-error *ngIf="transferForm.get('recipientUsername')?.hasError('required')">
            Recipient is required
          </mat-error>
          <mat-error *ngIf="transferForm.get('recipientUsername')?.hasError('invalidUser')">
            User not found
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description (Optional)</mat-label>
          <input matInput formControlName="description" maxlength="100" />
          <mat-hint align="end"
            >{{ transferForm.get('description')?.value?.length || 0 }}/100</mat-hint
          >
        </mat-form-field>

        <div *ngIf="balances.length === 0" class="no-balances">
          <p>You don't have any available balances to transfer.</p>
        </div>

        <div *ngIf="processingTransfer" class="processing-container">
          <mat-spinner diameter="30"></mat-spinner>
          <p>Processing your transfer...</p>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="transferForm.invalid || processingTransfer || balances.length === 0"
        (click)="transferFunds()"
      >
        Transfer
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .transfer-form {
        padding: 16px 0;
      }

      .full-width {
        width: 100%;
      }

      .no-balances {
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

      .user-option {
        display: flex;
        align-items: center;

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          margin-right: 12px;
          object-fit: cover;
        }

        .user-info {
          display: flex;
          flex-direction: column;

          .user-display-name {
            font-weight: 500;
          }

          .user-username {
            font-size: 12px;
            color: rgba(0, 0, 0, 0.6);
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
    MatProgressSpinnerModule,
    MatAutocompleteModule,
  ],
})
export class TransferDialogComponent implements OnInit {
  transferForm: FormGroup;
  processingTransfer = false;
  maxAmount = 0;

  // User search
  filteredUsers: UserSearchResult[] = [];

  constructor(
    private dialogRef: MatDialogRef<TransferDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      balances: WalletBalance[];
      selectedCurrency: string;
    },
    private fb: FormBuilder,
    public walletService: WalletService,
    private userService: UserService,
    private notificationService: NotificationService
  ) {
    // Filter balances with available funds
    this.balances = data.balances.filter(b => b.available > 0);

    // Initialize form
    this.transferForm = this.fb.group({
      currency: [data.selectedCurrency, Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]],
      recipientUsername: ['', [Validators.required]],
      description: [''],
    });
  }

  // Filtered balances
  balances: WalletBalance[] = [];

  ngOnInit(): void {
    // Update max amount when currency changes
    this.updateMaxAmount();

    // Setup user search
    this.transferForm
      .get('recipientUsername')
      ?.valueChanges.pipe(
        debounceTime(300),
        switchMap(value => {
          if (typeof value === 'string' && value.length >= 2) {
            return this.searchUsers(value);
          }
          return of([]);
        })
      )
      .subscribe(users => {
        this.filteredUsers = users;
      });
  }

  /**
   * Update maximum amount based on selected currency
   */
  updateMaxAmount(): void {
    const currency = this.transferForm.get('currency')?.value;
    if (!currency) {
      this.maxAmount = 0;
      return;
    }

    const balance = this.balances.find(b => b.currency === currency);
    this.maxAmount = balance ? balance.available : 0;

    // Update amount validator
    this.transferForm
      .get('amount')
      ?.setValidators([Validators.required, Validators.min(1), Validators.max(this.maxAmount)]);
    this.transferForm.get('amount')?.updateValueAndValidity();

    // Set default amount to 50% of available balance
    const defaultAmount = Math.floor(this.maxAmount / 2);
    this.transferForm.patchValue({ amount: defaultAmount > 0 ? defaultAmount : 0 });
  }

  /**
   * Search users by username or email
   */
  searchUsers(query: string): Observable<UserSearchResult[]> {
    return this.userService.searchUsers(query).pipe(
      map(results => {
        // Ensure the results are of type UserSearchResult[]
        if (Array.isArray(results)) {
          return results.map(user => {
            if ('displayName' in user) {
              return user as UserSearchResult;
            } else {
              // Convert User to UserSearchResult if needed
              return {
                id: user.id || user._id,
                username: user.username,
                displayName:
                  `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
                avatarUrl: user.avatarUrl || user.profileImage || '',
              } as UserSearchResult;
            }
          });
        }
        return [] as UserSearchResult[];
      }),
      catchError(error => {
        console.error('Error searching users:', error);
        return of([]);
      })
    );
  }

  /**
   * Display username in autocomplete
   */
  displayUsername(user: UserSearchResult | string): string {
    if (typeof user === 'string') {
      return user;
    }
    return user ? user.displayName || user.username : '';
  }

  /**
   * Transfer funds
   */
  transferFunds(): void {
    if (this.transferForm.invalid) {
      return;
    }

    const { currency, amount, recipientUsername, description } = this.transferForm.value;

    // Get recipient user ID
    const recipientUserId = typeof recipientUsername === 'object' ? recipientUsername.id : null;

    if (!recipientUserId) {
      this.transferForm.get('recipientUsername')?.setErrors({ invalidUser: true });
      return;
    }

    this.processingTransfer = true;

    this.walletService.transferFunds(recipientUserId, amount, currency, description).subscribe({
      next: transaction => {
        this.processingTransfer = false;
        this.notificationService.success(
          `Successfully transferred ${this.walletService.formatCurrency(amount, currency)}`
        );
        this.dialogRef.close(true);
      },
      error: error => {
        this.processingTransfer = false;
        console.error('Error transferring funds:', error);
        this.notificationService.error('Failed to transfer funds. Please try again.');
      },
    });
  }
}
