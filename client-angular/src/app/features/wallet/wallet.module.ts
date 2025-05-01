// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for wallet.module settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ClipboardModule } from '@angular/cdk/clipboard';

import { WalletComponent } from './wallet.component';
import { DepositDialogComponent } from './dialogs/deposit-dialog.component';
import { WithdrawDialogComponent } from './dialogs/withdraw-dialog.component';
import { TransferDialogComponent } from './dialogs/transfer-dialog.component';
import { AddPaymentMethodDialogComponent } from './dialogs/add-payment-method-dialog.component';
import { TransactionDetailsDialogComponent } from './dialogs/transaction-details-dialog.component';

import { EmeraldModule } from '../../shared/emerald/emerald.module';
import { QRCodeComponent } from 'angularx-qrcode';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: WalletComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  declarations: [
    // Dialogs are now standalone components
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    MatExpansionModule,
    MatDividerModule,
    MatBadgeModule,
    MatMenuModule,
    MatSlideToggleModule,
    ClipboardModule,
    EmeraldModule,
    QRCodeComponent,
    // Standalone components
    WalletComponent,
    DepositDialogComponent,
    WithdrawDialogComponent,
    TransferDialogComponent,
    AddPaymentMethodDialogComponent,
    TransactionDetailsDialogComponent,
  ],
})
export class WalletModule {}
