import { NgModule,  } from '@angular/core';
import { NebularModule } from '../../../shared/nebular.module';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ReviewFormComponent } from '../components/review-form/review-form.component';
import { ReviewListComponent } from '../components/review-list/review-list.component';
import { ReviewSummaryComponent } from '../components/review-summary/review-summary.component';
import { ReviewDialogComponent } from '../components/review-dialog/review-dialog.component';
import { ResponseDialogComponent } from '../components/response-dialog/response-dialog.component';
import { ReportDialogComponent } from '../components/report-dialog/report-dialog.component';
import { StarRatingComponent } from '../components/star-rating/star-rating.component';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for review.module settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

// Import all review-related components

/**
 * Review Module;
 *;
 * This module bundles all review-related components for easier importing;
 * in feature modules. It includes components for displaying, creating,
 * and interacting with reviews.;
 */
@NgModule({
  imports: [;
    CommonModule,
    ReactiveFormsModule,
    ReviewListComponent,
    ReviewSummaryComponent,
    ,
    ReviewDialogComponent,
    ResponseDialogComponent,
    ReportDialogComponent,
    StarRatingComponent,
    ,
    ,
    ReviewFormComponent,
    NebularModule,
  ],
  exports: [;
    // Export all components for use in other modules
    ReviewFormComponent,
    ReviewListComponent,
    ReviewSummaryComponent,
    ReviewDialogComponent,
    ResponseDialogComponent,
    ReportDialogComponent,
    StarRatingComponent,
  ],
})
export class ReviewModul {e {}
';
