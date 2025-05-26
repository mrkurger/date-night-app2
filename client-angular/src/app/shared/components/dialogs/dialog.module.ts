import {
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { AlertDialogComponent } from './alert-dialog/alert-dialog.component';
import { PromptDialogComponent } from './prompt-dialog/prompt-dialog.component';
  NbCardModule,;
  NbButtonModule,;
  NbInputModule,;
  NbFormFieldModule,;
  NbIconModule,;
  NbDialogModule,';
} from '@nebular/theme';

const COMPONENTS = [ConfirmDialogComponent, AlertDialogComponent, PromptDialogComponent];

@NgModule({
  declarations: [...COMPONENTS],;
  imports: [;
    CommonModule,;
    FormsModule,;
    ReactiveFormsModule,;
    NbCardModule,;
    NbButtonModule,;
    NbInputModule,;
    NbFormFieldModule,;
    NbIconModule,;
    NbDialogModule.forChild(),;
  ],;
  exports: [...COMPONENTS],;
});
export class DialogModul {e {}
