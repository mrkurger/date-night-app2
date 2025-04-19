// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (tags-dialog.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

export interface TagsDialogData {
  title: string;
  tags: string[];
  suggestedTags?: string[];
  maxTags?: number;
}

/**
 * Dialog component for managing tags
 * Allows users to add, edit, and remove tags
 */
@Component({
  selector: 'app-tags-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  template: `
    <div class="tags-dialog-container">
      <div class="dialog-header">
        <h2 mat-dialog-title>{{ data.title }}</h2>
        <button mat-icon-button (click)="onClose()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tags</mat-label>
          <mat-chip-grid #chipGrid>
            <mat-chip-row
              *ngFor="let tag of tags"
              (removed)="removeTag(tag)"
              [editable]="true"
              (edited)="editTag(tag, $event)"
            >
              {{ tag }}
              <button matChipRemove>
                <mat-icon>cancel</mat-icon>
              </button>
            </mat-chip-row>
            <input
              placeholder="Add tags..."
              [matChipInputFor]="chipGrid"
              [matChipInputSeparatorKeyCodes]="separatorKeysCodes"
              (matChipInputTokenEnd)="addTag($event)"
            />
          </mat-chip-grid>
          <mat-hint> Press Enter to add a tag. {{ maxTagsMessage }} </mat-hint>
        </mat-form-field>

        <div class="suggested-tags" *ngIf="data.suggestedTags && data.suggestedTags.length > 0">
          <h3>Suggested Tags</h3>
          <div class="suggested-tags-list">
            <button
              mat-chip
              *ngFor="let tag of data.suggestedTags"
              (click)="addSuggestedTag(tag)"
              [disabled]="tags.includes(tag) || (data.maxTags && tags.length >= data.maxTags)"
            >
              {{ tag }}
            </button>
          </div>
        </div>

        <div class="form-actions">
          <button mat-button type="button" (click)="onClose()">Cancel</button>
          <button mat-raised-button color="primary" (click)="onSave()">Save</button>
        </div>
      </mat-dialog-content>
    </div>
  `,
  styles: [
    `
      .tags-dialog-container {
        min-width: 400px;
        max-width: 600px;
      }

      .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        border-bottom: 1px solid #eee;
      }

      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }

      mat-dialog-content {
        padding: 24px;
      }

      .full-width {
        width: 100%;
        margin-bottom: 20px;
      }

      .suggested-tags {
        margin-bottom: 24px;
      }

      .suggested-tags h3 {
        font-size: 16px;
        margin-bottom: 8px;
        color: #555;
      }

      .suggested-tags-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
      }
    `,
  ],
})
export class TagsDialogComponent {
  tags: string[] = [];
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  constructor(
    public dialogRef: MatDialogRef<TagsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TagsDialogData
  ) {
    this.tags = [...data.tags];
  }

  /**
   * Get message about maximum tags limit
   */
  get maxTagsMessage(): string {
    if (this.data.maxTags) {
      return `Maximum ${this.data.maxTags} tags (${this.tags.length}/${this.data.maxTags}).`;
    }
    return '';
  }

  /**
   * Add a new tag
   * @param event Chip input event
   */
  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Check if we've reached the maximum number of tags
    if (this.data.maxTags && this.tags.length >= this.data.maxTags) {
      event.chipInput!.clear();
      return;
    }

    // Add tag if it doesn't already exist
    if (value && !this.tags.includes(value)) {
      this.tags.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  /**
   * Add a suggested tag
   * @param tag Tag to add
   */
  addSuggestedTag(tag: string): void {
    // Check if we've reached the maximum number of tags
    if (this.data.maxTags && this.tags.length >= this.data.maxTags) {
      return;
    }

    // Add tag if it doesn't already exist
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  /**
   * Remove a tag
   * @param tag Tag to remove
   */
  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  /**
   * Edit an existing tag
   * @param tag Tag to edit
   * @param event Edit event
   */
  editTag(tag: string, event: any): void {
    const value = event.trim();
    const index = this.tags.indexOf(tag);

    if (index >= 0 && value && !this.tags.includes(value)) {
      this.tags[index] = value;
    } else if (!value) {
      this.removeTag(tag);
    }
  }

  /**
   * Save tags and close dialog
   */
  onSave(): void {
    this.dialogRef.close(this.tags);
  }

  /**
   * Close dialog without saving
   */
  onClose(): void {
    this.dialogRef.close();
  }
}
