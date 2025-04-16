import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

export interface FavoriteDialogData {
  adId: string;
  adTitle: string;
  existingNotes?: string;
  existingTags?: string[];
  existingPriority?: 'low' | 'normal' | 'high';
  existingNotificationsEnabled?: boolean;
}

export interface FavoriteDialogResult {
  notes: string;
  tags: string[];
  priority: 'low' | 'normal' | 'high';
  notificationsEnabled: boolean;
}

/**
 * Dialog component for adding or editing favorites
 * Allows users to add notes, tags, set priority, and configure notifications
 */
@Component({
  selector: 'app-favorite-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatSlideToggleModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  template: `
    <div class="favorite-dialog-container">
      <div class="dialog-header">
        <h2 mat-dialog-title>{{ isEdit ? 'Edit Favorite' : 'Add to Favorites' }}</h2>
        <button mat-icon-button (click)="onClose()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <form [formGroup]="favoriteForm" (ngSubmit)="onSubmit()">
          <h3 class="ad-title">{{ data.adTitle }}</h3>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Notes</mat-label>
            <textarea
              matInput
              formControlName="notes"
              placeholder="Add personal notes about this ad"
              rows="3"
            ></textarea>
            <mat-hint align="end">{{ favoriteForm.get('notes')?.value?.length || 0 }}/500</mat-hint>
            <mat-error *ngIf="favoriteForm.get('notes')?.hasError('maxlength')">
              Notes cannot exceed 500 characters
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Tags</mat-label>
            <mat-chip-grid #chipGrid formControlName="tags">
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
            <mat-hint>Press Enter to add a tag</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Priority</mat-label>
            <mat-select formControlName="priority">
              <mat-option value="high">
                <mat-icon class="priority-icon high">priority_high</mat-icon> High
              </mat-option>
              <mat-option value="normal">
                <mat-icon class="priority-icon normal">remove_circle_outline</mat-icon> Normal
              </mat-option>
              <mat-option value="low">
                <mat-icon class="priority-icon low">arrow_downward</mat-icon> Low
              </mat-option>
            </mat-select>
          </mat-form-field>

          <div class="notifications-toggle">
            <mat-slide-toggle formControlName="notificationsEnabled" color="primary">
              Enable notifications
            </mat-slide-toggle>
            <div class="notifications-hint">
              Get notified when this advertiser updates their profile or travel plans
            </div>
          </div>

          <div class="form-actions">
            <button mat-button type="button" (click)="onClose()">Cancel</button>
            <button mat-raised-button color="primary" type="submit">
              {{ isEdit ? 'Update' : 'Add to Favorites' }}
            </button>
          </div>
        </form>
      </mat-dialog-content>
    </div>
  `,
  styles: [
    `
      .favorite-dialog-container {
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

      .ad-title {
        margin-top: 0;
        margin-bottom: 20px;
        color: #333;
        font-size: 18px;
      }

      .full-width {
        width: 100%;
        margin-bottom: 20px;
      }

      .notifications-toggle {
        margin-bottom: 24px;
      }

      .notifications-hint {
        margin-top: 4px;
        font-size: 12px;
        color: #666;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
      }

      .priority-icon {
        vertical-align: middle;
        margin-right: 4px;
      }

      .priority-icon.high {
        color: #f44336;
      }

      .priority-icon.normal {
        color: #2196f3;
      }

      .priority-icon.low {
        color: #4caf50;
      }
    `,
  ],
})
export class FavoriteDialogComponent {
  favoriteForm: FormGroup;
  tags: string[] = [];
  isEdit = false;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<FavoriteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FavoriteDialogData
  ) {
    this.isEdit = !!(data.existingNotes || data.existingTags || data.existingPriority);

    // Initialize tags from existing data
    this.tags = data.existingTags || [];

    // Create form with existing data or defaults
    this.favoriteForm = this.fb.group({
      notes: [data.existingNotes || '', Validators.maxLength(500)],
      tags: [this.tags],
      priority: [data.existingPriority || 'normal'],
      notificationsEnabled: [
        data.existingNotificationsEnabled !== undefined ? data.existingNotificationsEnabled : true,
      ],
    });
  }

  /**
   * Add a new tag
   * @param event Chip input event
   */
  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add tag
    if (value) {
      this.tags.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();
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

    if (index >= 0 && value) {
      this.tags[index] = value;
    } else if (!value) {
      this.removeTag(tag);
    }
  }

  /**
   * Submit the form
   */
  onSubmit(): void {
    if (this.favoriteForm.valid) {
      const result: FavoriteDialogResult = {
        notes: this.favoriteForm.value.notes,
        tags: this.tags,
        priority: this.favoriteForm.value.priority,
        notificationsEnabled: this.favoriteForm.value.notificationsEnabled,
      };

      this.dialogRef.close(result);
    }
  }

  /**
   * Close the dialog without saving
   */
  onClose(): void {
    this.dialogRef.close();
  }
}
