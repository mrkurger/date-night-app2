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
