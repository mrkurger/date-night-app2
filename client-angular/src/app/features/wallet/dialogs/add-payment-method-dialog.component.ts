// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (add-payment-method-dialog.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  NbDialogRef,
  NbCardModule,
  NbButtonModule,
  NbIconModule,
  NbFormFieldModule,
  NbInputModule,
  NbSelectModule,
  NbRadioModule,
  NbTabsetModule,
  NbSpinnerModule,
  NbStepperModule,
  NbCheckboxModule,
  NbAlertModule,
} from '@nebular/theme';
import { WalletService, PaymentMethod } from '../../../core/services/wallet.service';
import { PaymentService } from '../../../core/services/payment.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-add-payment-method-dialog',
  templateUrl: './add-payment-method-dialog.component.html',
  styleUrls: ['./add-payment-method-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbFormFieldModule,
    NbInputModule,
    NbSelectModule,
    NbRadioModule,
    NbTabsetModule,
    NbSpinnerModule,
    NbStepperModule,
    NbCheckboxModule,
    NbAlertModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddPaymentMethodDialogComponent implements OnInit {
  addPaymentMethodForm: FormGroup;
  paymentMethodType: 'card' | 'bank_account' = 'card';
  isLoading = false;

  constructor(
    protected dialogRef: NbDialogRef<AddPaymentMethodDialogComponent>,
    private fb: FormBuilder,
    private walletService: WalletService,
    private paymentService: PaymentService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
  ) {
    this.addPaymentMethodForm = this.fb.group({
      nameOnCard: ['', Validators.required],
      accountHolderName: [''],
      accountNumber: [''],
      routingNumber: [''],
    });
  }

  ngOnInit() {
    this.updateFormValidators();
  }

  updateFormValidators() {
    if (this.paymentMethodType === 'card') {
      this.addPaymentMethodForm.get('nameOnCard')?.setValidators(Validators.required);
      this.addPaymentMethodForm.get('accountHolderName')?.clearValidators();
      this.addPaymentMethodForm.get('accountNumber')?.clearValidators();
      this.addPaymentMethodForm.get('routingNumber')?.clearValidators();
    } else {
      this.addPaymentMethodForm.get('nameOnCard')?.clearValidators();
      this.addPaymentMethodForm.get('accountHolderName')?.setValidators(Validators.required);
      this.addPaymentMethodForm.get('accountNumber')?.setValidators(Validators.required);
      this.addPaymentMethodForm.get('routingNumber')?.setValidators(Validators.required);
    }
    this.addPaymentMethodForm.get('nameOnCard')?.updateValueAndValidity();
    this.addPaymentMethodForm.get('accountHolderName')?.updateValueAndValidity();
    this.addPaymentMethodForm.get('accountNumber')?.updateValueAndValidity();
    this.addPaymentMethodForm.get('routingNumber')?.updateValueAndValidity();
    this.cdr.detectChanges();
  }

  onPaymentMethodTypeChange(type: 'card' | 'bank_account') {
    this.paymentMethodType = type;
    this.updateFormValidators();
  }

  async savePaymentMethod() {
    if (this.addPaymentMethodForm.invalid) {
      this.notificationService.warning('Please fill all required fields.');
      return;
    }
    this.isLoading = true;
    this.cdr.detectChanges();

    try {
      let paymentMethodData: Partial<PaymentMethod>;

      if (this.paymentMethodType === 'card') {
        this.notificationService.info(
          'Card processing logic needs to be implemented with a payment provider.',
        );
        paymentMethodData = {
          type: 'card',
          provider: 'stripe',
        };
      } else {
        paymentMethodData = {
          type: 'bank_account',
          provider: 'manual',
          bankDetails: {
            accountHolderName: this.addPaymentMethodForm.value.accountHolderName,
            lastFour: this.addPaymentMethodForm.value.accountNumber?.slice(-4) || '',
            accountType: 'checking',
            bankName: 'Default Bank',
            country: 'US',
            currency: 'USD',
            tokenId: '', // added to satisfy required field
          } as PaymentMethod['bankDetails'],
        };
      }

      this.walletService.addPaymentMethod(paymentMethodData).subscribe({
        next: (newMethod) => {
          this.notificationService.success('Payment method added successfully!');
          this.dialogRef.close(newMethod);
        },
        error: (err) => {
          console.error('Error adding payment method:', err);
          this.notificationService.error(
            'Failed to add payment method. ' + (err.error?.message || err.message || ''),
          );
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        complete: () => {
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
    } catch (error: unknown) {
      console.error('Error saving payment method:', error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      this.notificationService.error('An unexpected error occurred: ' + message);
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  close() {
    this.dialogRef.close();
  }
}
