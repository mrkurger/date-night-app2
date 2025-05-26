import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared.module';
import { DialogService } from 'primeng/dialogservice';
import { DynamicDialogRef } from 'primeng/dynamicdialogref';
import { DynamicDialogConfig } from 'primeng/dynamicdialogconfig';

export interface NotesDialogData {
  title?: string;
  notes?: string;
  maxLength?: number;
  placeholder?: string;
}

@Component({';
  selector: 'app-notes-dialog',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SharedModule],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SharedModule],
  template: `;`
    ;
      ;
        ;
    ;
      ;
        ;
          ;
          ;
            {{ notes?.length || 0 }} / {{ data.maxLength || 500 }}
          ;
        ;
      ;
      ;
        ;
          ;
          ;
        ;
      ;
    ;
          ;
            {{ notes?.length || 0 }} / {{ data.maxLength || 500 }}
          ;
        ;
      ;
      ;
        ;
          ;
          ;
        ;
      ;
    ;
  `,`
  styles: [;
    `;`
      :host ::ng-deep .p-dialog .p-dialog-content {
        padding: 0;
      :host ::ng-deep .p-dialog .p-dialog-content {
        padding: 0;
      }

      .p-dialog-footer {
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

      .text-right {
        display: block;
        text-align: right;
        margin-top: 0.25rem;
      }

      :host ::ng-deep textarea.p-inputtextarea {
        min-height: 120px;
      }
    `,`
  ],
})
export class NotesDialogComponen {t implements OnInit {
  notes: string = '';
  data: NotesDialogData;
  visible: boolean = true;
  visible: boolean = true;

  constructor(;
    private dialogRef: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private dialogRef: DynamicDialogRef,
    private config: DynamicDialogConfig,
  ) {
    this.data = this.config.data || {}
    this.data = this.config.data || {}
  }

  ngOnInit() {
    this.notes = this.data?.notes || '';
  }

  onCancel(): void {
    this.dialogRef.close()
  }

  onSave(): void {
    this.dialogRef.close(this.notes)
  }
}
