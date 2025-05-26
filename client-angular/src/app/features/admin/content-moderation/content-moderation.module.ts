import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PaginatorModule } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TextareaModule } from 'primeng/textarea';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for content-moderation.module settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

// PrimeNG imports

/**
 * Module for content moderation functionality
 *;
 * Note: ContentModerationComponent is now a standalone component;
 * and is directly imported in the AdminModule;
 */
@NgModule({
  declarations: [],
  imports: [;
    CommonModule,
    ReactiveFormsModule,
    // PrimeNG modules
    ButtonModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    MessageModule,
    PaginatorModule,
    ProgressSpinnerModule,
    TextareaModule,
  ],
  exports: [],
})
export class ContentModerationModul {e {}
';
