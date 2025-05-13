import { NbIconModule } from '@nebular/theme';
import { NbFormFieldModule } from '@nebular/theme';
import { NbTagModule } from '@nebular/theme';
import { NbCardModule } from '@nebular/theme';
import { Inject } from '@angular/core';
import { Input } from '@angular/core';
import { Component } from '@angular/core';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (tags-dialog.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import {
  NbDialogRef,
  NbDialogModule,
  NbCardModule,
  NbInputModule,
  NbButtonModule,
  NbIconModule,
  NbTagModule,
  NbFormFieldModule,
  NB_DIALOG_CONFIG,
} from '@nebular/theme';

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
    FormsModule,
    ReactiveFormsModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbFormFieldModule,
    NbInputModule,
    NbTagModule,
  ],
  template: `
    <nb-card>
      <nb-card-header class="dialog-header">
        <h2>{{ data.title }}</h2>
        <button nbButton ghost size="small" (click)="onClose()">
          <nb-icon icon="close-outline"></nb-icon>
        </button>
      </nb-card-header>

      <nb-card-body>
        <nb-form-field>
          <div class="tags-container">
            <nb-tag
              *ngFor="let tag of tags"
              [text]="tag"
              removable
              (remove)="removeTag(tag)"
            ></nb-tag>
            <input nbInput placeholder="Add tags..." (keydown)="onTagAdd($event)" />
          </div>
          <span class="hint-text">Press Enter or Space to add a tag. {{ maxTagsMessage }}</span>
        </nb-form-field>

        <div class="suggested-tags" *ngIf="data.suggestedTags && data.suggestedTags.length > 0">
          <h3>Suggested Tags</h3>
          <div class="suggested-tags-list">
            <nb-tag
              *ngFor="let tag of data.suggestedTags"
              [text]="tag"
              [status]="tags.includes(tag) ? 'basic' : 'primary'"
              (click)="addSuggestedTag(tag)"
              [class.disabled]="tags.includes(tag) || (data.maxTags && tags.length >= data.maxTags)"
            ></nb-tag>
          </div>
        </div>
      </nb-card-body>

      <nb-card-footer>
        <div class="form-actions">
          <button nbButton status="basic" (click)="onClose()">Cancel</button>
          <button nbButton status="primary" (click)="onSave()">Save</button>
        </div>
      </nb-card-footer>
    </nb-card>
  `,
  styles: [
    `
      :host {
        display: block;
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
        font-size: 1.25rem;
        font-weight: 500;
      }

      nb-form-field {
        width: 100%;
        margin-bottom: 1.5rem;
      }

      .tags-container {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }

      .hint-text {
        display: block;
        font-size: 0.875rem;
        color: var(--text-hint-color);
        margin-top: 0.5rem;
      }

      .suggested-tags {
        margin-bottom: 1.5rem;
      }

      .suggested-tags h3 {
        font-size: 1rem;
        margin-bottom: 0.5rem;
        color: var(--text-hint-color);
      }

      .suggested-tags-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;

        nb-tag {
          cursor: pointer;

          &.disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.625rem;
      }
    `,
  ],
})
export class TagsDialogComponent {
  tags: string[] = [];
  inputValue = '';

  constructor(
    public dialogRef: NbDialogRef<TagsDialogComponent>,
    @Inject(NB_DIALOG_CONFIG) public data: TagsDialogData,
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
   */
  onTagAdd(event: KeyboardEvent): void {
    // Only handle Enter and Space keys
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    const input = event.target as HTMLInputElement;
    const value = input.value.trim();

    // Prevent default behavior for space key
    if (event.key === ' ') {
      event.preventDefault();
    }

    if (!value) return;

    if (this.data.maxTags && this.tags.length >= this.data.maxTags) {
      return;
    }

    if (!this.tags.includes(value)) {
      this.tags.push(value);
      input.value = '';
    }
  }

  /**
   * Remove a tag
   */
  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  /**
   * Add a suggested tag
   */
  addSuggestedTag(tag: string): void {
    if (!this.tags.includes(tag) && (!this.data.maxTags || this.tags.length < this.data.maxTags)) {
      this.tags.push(tag);
    }
  }

  /**
   * Save changes and close dialog
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
