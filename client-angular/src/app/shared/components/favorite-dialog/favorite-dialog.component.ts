import { Component, Inject } from '@angular/core';
import { _NebularModule } from '../../nebular.module';

import { CommonModule } from '@angular/common';
import {
  NbDialogRef,
  NB_DIALOG_CONFIG,
  NbTagInputAddEvent,
  ,
  ,
  ,
  ,
  ,
  ,
  ,
  NbToggleModule,
  ,
} from '@nebular/theme';

import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  _FormControl,
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
  imports: [CommonModule,
    NbToggleModule,
    FormsModule,
    ReactiveFormsModule],
  template: `
    <nb-card class="favorite-dialog-container">
      <nb-card-header class="dialog-header">
        <h2>{{ isEdit ? 'Edit Favorite' : 'Add to Favorites' }}</h2>
        <button nbButton ghost (click)="onClose()">
          <nb-icon icon="close-outline"></nb-icon>
        </button>
      </nb-card-header>

      <nb-card-body>
        <form [formGroup]="favoriteForm" (ngSubmit)="onSubmit()">
          <h3 class="ad-title">{{ data.adTitle }}</h3>

          <div class="form-group">
            <label class="label" for="notes">Notes</label>
            <textarea
              nbInput
              fullWidth
              id="notes"
              formControlName="notes"
              placeholder="Add personal notes about this ad"
              rows="3"
            ></textarea>
            <p class="caption status-basic">
              {{ favoriteForm.get('notes')?.value?.length || 0 }}/500
            </p>
            <p
              class="caption status-danger"
              *ngIf="favoriteForm.get('notes')?.hasError('maxlength')"
            >
              Notes cannot exceed 500 characters
            </p>
          </div>

          <div class="form-group">
            <label class="label" for="tags">Tags</label>
            <nb-form-field>
              <nb-tag-list (tagRemove)="removeTag($event)">
                <nb-tag
                  *ngFor="let tag of tags"
                  [text]="tag"
                  removable
                  (remove)="removeTag(tag)"
                ></nb-tag>
                <input
                  nbTagInput
                  fullWidth
                  [separatorKeys]="separatorKeysCodes"
                  placeholder="Add tags..."
                  (tagAdd)="addTag($event)"
                />
              </nb-tag-list>
            </nb-form-field>
            <p class="caption status-basic">Press Enter to add a tag</p>
          </div>

          <div class="form-group">
            <label class="label" for="priority">Priority</label>
            <nb-select fullWidth formControlName="priority" id="priority">
              <nb-option value="high">
                <nb-icon icon="arrow-up-outline" class="priority-icon high"></nb-icon> High
              </nb-option>
              <nb-option value="normal">
                <nb-icon icon="minus-outline" class="priority-icon normal"></nb-icon> Normal
              </nb-option>
              <nb-option value="low">
                <nb-icon icon="arrow-down-outline" class="priority-icon low"></nb-icon> Low
              </nb-option>
            </nb-select>
          </div>

          <div class="form-group notifications-toggle">
            <nb-toggle formControlName="notificationsEnabled" status="primary">
              Enable notifications
            </nb-toggle>
            <p class="caption status-basic notifications-hint">
              Get notified when this advertiser updates their profile or travel plans
            </p>
          </div>

          <div class="form-actions">
            <button nbButton ghost type="button" (click)="onClose()">Cancel</button>
            <button nbButton status="primary" type="submit">
              {{ isEdit ? 'Update' : 'Add to Favorites' }}
            </button>
          </div>
        </form>
      </nb-card-body>
    </nb-card>
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
      }

      h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 500;
      }

      .ad-title {
        margin-top: 0;
        margin-bottom: 1.5rem;
        font-size: 1.25rem;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      .notifications-toggle {
        margin-bottom: 1.5rem;
      }

      .notifications-hint {
        margin-top: 0.5rem;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 2rem;
      }

      .priority-icon {
        &.high {
          color: var(--color-danger-default);
        }
        &.normal {
          color: var(--color-primary-default);
        }
        &.low {
          color: var(--color-basic-600);
        }
      }

      nb-tag-list {
        width: 100%;
      }
    `,
  ],
})
export class FavoriteDialogComponent {
  favoriteForm: FormGroup;
  tags: string[] = [];
  isEdit = false;
  readonly separatorKeysCodes: number[] = [13, 188]; // Enter and comma

  constructor(
    private fb: FormBuilder,
    public dialogRef: NbDialogRef<FavoriteDialogComponent>,
    @Inject(NB_DIALOG_CONFIG) public data: FavoriteDialogData,
  ) {
    this.isEdit = !!data.existingNotes || !!data.existingTags?.length;
    this.tags = data.existingTags || [];

    this.favoriteForm = this.fb.group({
      notes: [data.existingNotes || '', [Validators.maxLength(500)]],
      tags: [this.tags],
      priority: [data.existingPriority || 'normal'],
      notificationsEnabled: [data.existingNotificationsEnabled || false],
    });
  }

  addTag(event: NbTagInputAddEvent): void {
    const value = event.value.trim();
    if (value) {
      if (!this.tags.includes(value)) {
        this.tags.push(value);
        this.favoriteForm.patchValue({ tags: this.tags });
      }
    }
    if (event.input) {
      event.input.nativeElement.value = '';
    }
  }

  removeTag(tag: any): void {
    // Handle both string and NbTagComponent
    const tagValue = typeof tag === 'string' ? tag : tag.text;
    const index = this.tags.indexOf(tagValue);
    if (index >= 0) {
      this.tags.splice(index, 1);
      this.favoriteForm.patchValue({ tags: this.tags });
    }
  }

  onSubmit(): void {
    if (this.favoriteForm.valid) {
      const result: FavoriteDialogResult = {
        notes: this.favoriteForm.get('notes')?.value || '',
        tags: this.tags,
        priority: this.favoriteForm.get('priority')?.value || 'normal',
        notificationsEnabled: this.favoriteForm.get('notificationsEnabled')?.value || false,
      };
      this.dialogRef.close(result);
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
