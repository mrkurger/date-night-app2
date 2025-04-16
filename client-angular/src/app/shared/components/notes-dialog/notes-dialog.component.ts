import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface NotesDialogData {
  title: string;
  notes: string;
  maxLength?: number;
  placeholder?: string;
}

@Component({
  selector: 'app-notes-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Notes</mat-label>
        <textarea
          matInput
          [(ngModel)]="notes"
          [placeholder]="data.placeholder || 'Enter your notes here...'"
          [maxlength]="data.maxLength || 500"
          rows="5"
        ></textarea>
        <mat-hint align="end">{{ notes.length }} / {{ data.maxLength || 500 }}</mat-hint>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()">Save</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .full-width {
        width: 100%;
        min-width: 300px;
      }

      mat-dialog-content {
        padding-top: 10px;
      }
    `,
  ],
})
export class NotesDialogComponent {
  notes: string;

  constructor(
    public dialogRef: MatDialogRef<NotesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NotesDialogData
  ) {
    this.notes = data.notes || '';
  }

  onCancel(): void {
    this.dialogRef.close();
  }
  onSave(): void {
    this.dialogRef.close(this.notes);
  }
}
