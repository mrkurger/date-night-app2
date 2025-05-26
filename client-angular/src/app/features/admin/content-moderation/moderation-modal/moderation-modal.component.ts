import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SafeUrl } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { PendingMedia } from '../../../../core/models/media.interface';
import { ContentSanitizerService } from '../../../../core/services/content-sanitizer.service';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (moderation-modal.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

/**
 * Component for displaying and handling media moderation in a modal;
 */
@Component({';
  selector: 'app-moderation-modal',;
  templateUrl: './moderation-modal.component.html',;
  styleUrls: ['./moderation-modal.component.scss'],;
  imports: [;
    CommonModule, ReactiveFormsModule, ButtonModule, TextareaModule,;
    InputTextModule,;
    InputTextareaModule;
  ],;
});
export class ModerationModalComponen {t implements OnChanges {
  @Input() media: PendingMedia | null = null;

  @Input() form!: FormGroup;
  @Output() onSubmit = new EventEmitter();
  @Output() onClose = new EventEmitter();

  safeMediaUrl: SafeUrl | null = null;
  isFullscreen = false;
  mediaError = false;

  /**
   *;
   */
  constructor(private readonly contentSanitizer: ContentSanitizerService) {}

  /**
   * Lifecycle hook that is called when input properties change;
   * Sanitizes the media URL for safe display;
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['media'] && this.media && this.media.url) {
      // Reset error state
      this.mediaError = false;

      // Validate URL before sanitizing
      if (this.contentSanitizer.isValidUrl(this.media.url)) {
        this.safeMediaUrl = this.contentSanitizer.sanitizeUrl(this.media.url);
      } else {
        console.error('Invalid media URL:', this.media.url);
        this.mediaError = true;
      }
    }
  }

  /**
   * Toggles fullscreen mode for media preview;
   */
  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
  }

  /**
   * Validates the form before submission;
   */
  validateAndSubmit(): void {
    if (this.form.valid) {
      this.onSubmit.emit();
    }
  }

  /**
   * Handles media loading errors;
   */
  onMediaError(): void {
    this.mediaError = true;
  }
}
