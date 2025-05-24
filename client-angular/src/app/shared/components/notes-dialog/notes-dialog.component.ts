import { DialogService, DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared.module';

export interface NotesDialogData {
  title?: string;
  notes?: string;
  maxLength?: number;
  placeholder?: string;
}

@Component({
  selector: 'app-notes-dialog',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SharedModule],
  template: `
    <p-dialog
      [header]="data.title || 'Edit Notes'"
      [(visible)]="visible"
      [modal]="true"
      [style]="{ width: '600px', minWidth: '400px' }"
      [contentStyle]="{ padding: '1rem' }"
      [baseZIndex]="10000"
      [draggable]="false"
      [resizable]="false"
    >
      <div class="p-fluid">
        <div class="p-field">
          <textarea
            pInputTextarea
            [(ngModel)]="notes"
            [placeholder]="data.placeholder || 'Enter your notes here...'"
            [maxlength]="data.maxLength || 500"
            rows="5"
            class="w-full"
          ></textarea>
          <small class="text-right" *ngIf="notes">
            {{ notes?.length || 0 }} / {{ data.maxLength || 500 }}
          </small>
        </div>
      </div>
      <ng-template pTemplate="footer">
        <div class="p-dialog-footer">
          <p-button label="Cancel" styleClass="p-button-text" (onClick)="onCancel()"></p-button>
          <p-button label="Save" (onClick)="onSave()"></p-button>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [
    `
      :host ::ng-deep .p-dialog .p-dialog-content {
        padding: 0;
      }

      .p-dialog-footer {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
      }

      .text-right {
        display: block;
        text-align: right;
        margin-top: 0.25rem;
      }

      :host ::ng-deep textarea.p-inputtextarea {
        min-height: 120px;
      }
    `,
  ],
})
export class NotesDialogComponent implements OnInit {
  notes: string = '';
  data: NotesDialogData;
  visible: boolean = true;

  constructor(
    private dialogRef: DynamicDialogRef,
    private config: DynamicDialogConfig,
  ) {
    this.data = this.config.data || {};
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
