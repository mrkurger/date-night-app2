import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { PaymentComponent } from './payment.component';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: PaymentComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  declarations: [
    PaymentComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    PaymentComponent
  ]
})
export class PaymentModule { }