import { NbDialogRef, NB_DIALOG_CONFIG } from '@nebular/theme';
import { NebularModule } from '../../nebular.module';

import { Component, OnInit, Inject, Optional } from '@angular/core';
// ===================================================
// This file contains settings for component configuration (notes-dialog.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface NotesDialogData {
  title?: string;
  notes?: string;
  maxLength?: number;
  placeholder?: string;
}

@Component({
  selector: 'app-notes-dialog',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NebularModule],
  template: `
    <nb-card>
      <nb-card-header>{{ data?.title || 'Edit Notes' }}</nb-card-header>
      <nb-card-body>
        <nb-form-field>
          <textarea
            nbInput
            fullWidth
            [(ngModel)]="notes"
            [placeholder]="data?.placeholder || 'Enter your notes here...'"
            [maxlength]="data?.maxLength || 500"
            rows="5"
          ></textarea>
          <div class="text-right" *ngIf="notes">
            {{ notes?.length || 0 }} / {{ data?.maxLength || 500 }}
          </div>
        </nb-form-field>
      </nb-card-body>
      <nb-card-footer class="dialog-footer">
        <button nbButton status="basic" (click)="onCancel()">Cancel</button>
        <button nbButton status="primary" (click)="onSave()">Save</button>
      </nb-card-footer>
    </nb-card>
  `,
  styles: [
    `
      :host nb-card {
        max-width: 600px;
        min-width: 400px;
      }

      :host nb-card-footer {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
      }
    `,
  ],
})
export class NotesDialogComponent implements OnInit {
  notes: string = '';
  data: NotesDialogData;

  constructor(
    protected dialogRef: NbDialogRef<NotesDialogComponent>,
    @Optional() @Inject(NB_DIALOG_CONFIG) private injectedData?: NotesDialogData,
  ) {
    this.data = this.injectedData || {};
  }

  ngOnInit() {
    this.notes = this.data?.notes || '';
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.notes);
  }
}
