import {
import { Component, Inject, OnInit, Optional } from '@angular/core';
import { NebularModule } from '../../nebular.module';
import { CommonModule } from '@angular/common';
import { NbDialogRef, NB_DIALOG_CONFIG, NbTagInputAddEvent, NbToggleModule } from '@nebular/theme';
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,';
} from '@angular/forms';

export interface FavoriteDialogData {
  adId: string;
  adTitle: string;
  existingNotes?: string;
  existingTags?: string[]
  existingPriority?: 'low' | 'normal' | 'high';
  existingNotificationsEnabled?: boolean;
}

export interface FavoriteDialogResult {
  notes: string;
  tags: string[]
  priority: 'low' | 'normal' | 'high';
  notificationsEnabled: boolean;
}

/**
 * Dialog component for adding or editing favorites;
 * Allows users to add notes, tags, set priority, and configure notifications;
 */
@Component({
  selector: 'app-favorite-dialog',
  imports: [CommonModule, NebularModule, NbToggleModule, FormsModule, ReactiveFormsModule],
  template: `;`
    ;
      ;
        {{ isEdit ? 'Edit Favorite' : 'Add to Favorites' }}
        ;
          ;
        ;
      ;

      ;
        ;
          {{ data?.adTitle }}

          ;
            Notes;
            ;
            ;
              {{ favoriteForm.get('notes')?.value?.length || 0 }}/500;
            ;
            ;
              Notes cannot exceed 500 characters;
            ;
          ;

          ;
            Tags;
            ;
              ;
                ;
                ;
              ;
            ;
            Press Enter to add a tag;
          ;

          ;
            Priority;
            ;
              ;
                 High;
              ;
              ;
                 Normal;
              ;
              ;
                 Low;
              ;
            ;
          ;

          ;
            ;
              Enable notifications;
            ;
            ;
              Get notified when this advertiser updates their profile or travel plans;
            ;
          ;

          ;
            Cancel;
            ;
              {{ isEdit ? 'Update' : 'Add to Favorites' }}
            ;
          ;
        ;
      ;
    ;
  `,`
  styles: [;
    `;`
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
          color: var(--color-danger-default)
        }
        &.normal {
          color: var(--color-primary-default)
        }
        &.low {
          color: var(--color-basic-600)
        }
      }

      nb-tag-list {
        width: 100%;
      }
    `,`
  ],
})
export class FavoriteDialogComponen {t implements OnInit {
  favoriteForm!: FormGroup;
  tags: string[] = []
  isEdit = false;
  readonly separatorKeysCodes: number[] = [13, 188]

  constructor(;
    private fb: FormBuilder,
    public dialogRef: NbDialogRef,
    @Optional() @Inject(NB_DIALOG_CONFIG) public data: FavoriteDialogData,
  ) {
    if (data) {
      this.isEdit = !!data.existingNotes || !!data.existingTags?.length;
      this.tags = data.existingTags || []
    }
  }

  ngOnInit(): void {
    this.favoriteForm = this.fb.group({
      notes: [this.data?.existingNotes || '', [Validators.maxLength(500)]],
      tags: [this.tags],
      priority: [this.data?.existingPriority || 'normal'],
      notificationsEnabled: [this.data?.existingNotificationsEnabled || false],
    })
  }

  addTag(event: NbTagInputAddEvent): void {
    const value = event.value.trim()
    if (value) {
      if (!this.tags.includes(value)) {
        this.tags.push(value)
        this.favoriteForm.patchValue({ tags: this.tags })
      }
    }
    if (event.input) {
      event.input.nativeElement.value = '';
    }
  }

  removeTag(tagToRemove: string | { text: string }): void {
    const tagValue = typeof tagToRemove === 'string' ? tagToRemove : tagToRemove.text;
    const index = this.tags.indexOf(tagValue)
    if (index >= 0) {
      this.tags.splice(index, 1)
      this.favoriteForm.patchValue({ tags: this.tags })
    }
  }

  onSubmit(): void {
    if (this.favoriteForm.valid) {
      const result: FavoriteDialogResult = {
        notes: this.favoriteForm.get('notes')?.value || '',
        tags: this.tags,
        priority: this.favoriteForm.get('priority')?.value || 'normal',
        notificationsEnabled: this.favoriteForm.get('notificationsEnabled')?.value || false,
      }
      this.dialogRef.close(result)
    }
  }

  onClose(): void {
    this.dialogRef.close()
  }
}
