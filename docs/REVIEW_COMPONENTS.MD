# Review Components Documentation

This document provides an overview of the review system components implemented in the Date Night App.

## Table of Contents

1. [Components Overview](#components-overview)
2. [Review Form Component](#review-form-component)
3. [Review List Component](#review-list-component)
4. [Review Summary Component](#review-summary-component)
5. [Star Rating Component](#star-rating-component)
6. [Dialog Components](#dialog-components)
7. [Review Module](#review-module)
8. [Services](#services)
9. [Usage Examples](#usage-examples)

## Components Overview

The review system consists of the following components:

- **ReviewFormComponent**: For submitting and editing reviews
- **ReviewListComponent**: For displaying a list of reviews with pagination
- **ReviewSummaryComponent**: For displaying average ratings and statistics
- **StarRatingComponent**: Reusable component for displaying and selecting star ratings
- **ReviewDialogComponent**: Dialog wrapper for the review form
- **ResponseDialogComponent**: Dialog for responding to reviews
- **ReportDialogComponent**: Dialog for reporting inappropriate content

## Review Form Component

`ReviewFormComponent` is a standalone component that provides a form for users to submit or edit reviews.

### Features

- Overall star rating selection
- Review title and content fields with validation
- Category-specific ratings (communication, appearance, location, value)
- Optional meeting date field
- Form validation with error messages
- Support for both creating new reviews and editing existing ones

### Usage

```html
<app-review-form
  [advertiserId]="advertiserId"
  [advertiserName]="advertiserName"
  [adId]="adId"
  [existingReview]="reviewToEdit"
  (submitted)="onReviewSubmitted($event)"
  (cancelled)="onCancel()"
></app-review-form>
```

## Review List Component

`ReviewListComponent` displays a paginated list of reviews with various interactive features.

### Features

- Displays reviewer information, ratings, and review content
- Shows category-specific ratings when available
- Displays advertiser responses when available
- Pagination with "Load More" functionality
- Actions for marking reviews as helpful
- Actions for reporting inappropriate reviews
- Actions for advertisers to respond to reviews
- Verified meeting badge for reviews with verified meetings

### Usage

```html
<app-review-list
  [advertiserId]="advertiserId"
  [title]="'Customer Reviews'"
  [showCategoryRatings]="true"
  [limit]="5"
></app-review-list>
```

## Review Summary Component

`ReviewSummaryComponent` displays aggregate rating information for an advertiser.

### Features

- Shows overall average rating with star visualization
- Displays total number of reviews
- Shows category-specific average ratings with progress bars
- Optional "Write a Review" button
- Loading state for asynchronous data fetching

### Usage

```html
<app-review-summary
  [advertiserId]="advertiserId"
  [title]="'Ratings & Reviews'"
  [showCategoryRatings]="true"
  [showWriteReviewButton]="true"
  (writeReviewClicked)="openReviewForm()"
></app-review-summary>
```

## Star Rating Component

`StarRatingComponent` is a reusable component for displaying and selecting star ratings.

### Features

- Interactive or read-only mode
- Support for half-star ratings
- Hover effects for selection
- Optional rating text display
- Configurable size (normal or small)
- Tooltips for rating labels

### Usage

```html
<app-star-rating
  [rating]="3.5"
  [readonly]="false"
  [small]="false"
  [showRatingText]="true"
  [allowHalfStars]="true"
  (ratingChange)="onRatingChanged($event)"
></app-star-rating>
```

## Dialog Components

### Review Dialog Component

`ReviewDialogComponent` wraps the review form in a dialog for a better user experience.

```typescript
this.dialogService
  .openReviewDialog({
    advertiserId: '123',
    advertiserName: 'John Doe',
    adId: '456', // optional
  })
  .subscribe(result => {
    if (result) {
      // Handle submitted review
    }
  });
```

### Response Dialog Component

`ResponseDialogComponent` provides a dialog for advertisers to respond to reviews.

```typescript
this.dialogService.respondToReview(reviewId, reviewTitle, reviewContent).subscribe(response => {
  if (response) {
    // Handle submitted response
  }
});
```

### Report Dialog Component

`ReportDialogComponent` provides a dialog for users to report inappropriate content.

```typescript
this.dialogService.reportReview(reviewId).subscribe(reason => {
  if (reason) {
    // Handle report submission
  }
});
```

## Review Module

`ReviewModule` bundles all review-related components for easier importing in feature modules.

```typescript
import { ReviewModule } from '../shared/modules/review.module';

@NgModule({
  imports: [
    CommonModule,
    ReviewModule,
    // other imports
  ],
  // ...
})
export class FeatureModule {}
```

## Services

### Review Service

`ReviewService` provides methods for interacting with the review API.

```typescript
// Create a review
this.reviewService.createReview(reviewData).subscribe(response => {
  // Handle response
});

// Get reviews for an advertiser
this.reviewService.getReviewsByAdvertiser(advertiserId, page, limit, sort).subscribe(response => {
  // Handle response
});

// Respond to a review
this.reviewService.respondToReview(reviewId, responseText).subscribe(response => {
  // Handle response
});
```

### Dialog Service

`DialogService` provides methods for opening review-related dialogs.

```typescript
// Open review dialog
this.dialogService.openReviewDialog(data).subscribe(result => {
  // Handle result
});

// Open report dialog
this.dialogService.reportReview(reviewId).subscribe(reason => {
  // Handle reason
});

// Open response dialog
this.dialogService.respondToReview(reviewId, title, content).subscribe(response => {
  // Handle response
});
```

## Usage Examples

### Adding Reviews to a Profile Page

```typescript
@Component({
  selector: 'app-profile-page',
  template: `
    <div class="profile-container">
      <!-- Profile information -->

      <!-- Review summary -->
      <app-review-summary
        [advertiserId]="profileId"
        [showWriteReviewButton]="true"
        (writeReviewClicked)="openReviewDialog()"
      ></app-review-summary>

      <!-- Review list -->
      <app-review-list [advertiserId]="profileId" [title]="'Reviews'"></app-review-list>
    </div>
  `,
})
export class ProfilePageComponent {
  profileId: string;

  constructor(private dialogService: DialogService) {}

  openReviewDialog(): void {
    this.dialogService
      .openReviewDialog({
        advertiserId: this.profileId,
        advertiserName: this.profileName,
      })
      .subscribe(result => {
        if (result) {
          // Refresh reviews
        }
      });
  }
}
```

### Implementing Review Moderation

```typescript
@Component({
  selector: 'app-review-moderation',
  template: `
    <div class="moderation-container">
      <h2>Review Moderation</h2>

      <div *ngFor="let review of pendingReviews" class="review-card">
        <h3>{{ review.title }}</h3>
        <p>{{ review.content }}</p>
        <div class="actions">
          <button (click)="approveReview(review._id)">Approve</button>
          <button (click)="openRejectDialog(review._id)">Reject</button>
        </div>
      </div>
    </div>
  `,
})
export class ReviewModerationComponent {
  pendingReviews: any[] = [];

  constructor(
    private reviewService: ReviewService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.loadPendingReviews();
  }

  loadPendingReviews(): void {
    this.reviewService.getPendingReviews().subscribe(response => {
      this.pendingReviews = response.data;
    });
  }

  approveReview(reviewId: string): void {
    this.reviewService.approveReview(reviewId).subscribe(() => {
      this.loadPendingReviews();
    });
  }

  openRejectDialog(reviewId: string): void {
    this.dialogService
      .openResponseDialog({
        title: 'Reject Review',
        reviewTitle: 'Provide Rejection Reason',
      })
      .subscribe(reason => {
        if (reason) {
          this.reviewService.rejectReview(reviewId, reason).subscribe(() => {
            this.loadPendingReviews();
          });
        }
      });
  }
}
```
