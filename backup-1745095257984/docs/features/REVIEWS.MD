# Review System

## Overview

The Review System allows users to rate and review advertisers, providing valuable feedback for the community. It supports detailed ratings across multiple categories, moderation workflows, helpful votes, and advertiser responses. This feature helps build trust in the platform by enabling transparent feedback and accountability.

## User Experience

Users interact with the Review System through several interfaces:

- **Review Creation**: Form for submitting detailed reviews with ratings and category scores
- **Review Display**: Shows reviews on advertiser profiles with helpful metrics
- **Review Management**: Allows users to edit or delete their own reviews
- **Review Interaction**: Enables marking reviews as helpful or reporting inappropriate content
- **Advertiser Response**: Allows advertisers to respond to reviews of their services

## Architecture

### Client-Side Components

| Component                 | Path                                                                                    | Description                        |
| ------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------- |
| `ReviewListComponent`     | `/client-angular/src/app/features/reviews/review-list/review-list.component.ts`         | Displays list of reviews           |
| `ReviewItemComponent`     | `/client-angular/src/app/features/reviews/review-item/review-item.component.ts`         | Displays individual review         |
| `ReviewFormComponent`     | `/client-angular/src/app/features/reviews/review-form/review-form.component.ts`         | Form for creating/editing reviews  |
| `ReviewDialogComponent`   | `/client-angular/src/app/shared/components/review-dialog/review-dialog.component.ts`    | Dialog for submitting reviews      |
| `ReviewResponseComponent` | `/client-angular/src/app/features/reviews/review-response/review-response.component.ts` | Component for advertiser responses |
| `ReviewStatsComponent`    | `/client-angular/src/app/features/reviews/review-stats/review-stats.component.ts`       | Displays review statistics         |
| `ReviewFilterComponent`   | `/client-angular/src/app/features/reviews/review-filter/review-filter.component.ts`     | Filters for review list            |

### Client-Side Services

| Service         | Path                                                      | Description                        |
| --------------- | --------------------------------------------------------- | ---------------------------------- |
| `ReviewService` | `/client-angular/src/app/core/services/review.service.ts` | Manages review data and operations |
| `DialogService` | `/client-angular/src/app/core/services/dialog.service.ts` | Handles review dialogs             |

### Server-Side Controllers

| Controller         | Path                                       | Description                          |
| ------------------ | ------------------------------------------ | ------------------------------------ |
| `ReviewController` | `/server/controllers/review.controller.js` | Handles review-related HTTP requests |

### Server-Side Models

| Model    | Path                             | Description                 |
| -------- | -------------------------------- | --------------------------- |
| `Review` | `/server/models/review.model.js` | Mongoose schema for reviews |

## API Endpoints

| Endpoint                             | Method | Description                     | Request Body        | Response                     |
| ------------------------------------ | ------ | ------------------------------- | ------------------- | ---------------------------- |
| `/api/reviews`                       | POST   | Create a new review             | Review data         | Created review               |
| `/api/reviews/advertiser/:id`        | GET    | Get reviews for an advertiser   | N/A                 | Array of reviews             |
| `/api/reviews/ad/:id`                | GET    | Get reviews for an ad           | N/A                 | Array of reviews             |
| `/api/reviews/:id`                   | GET    | Get a specific review           | N/A                 | Review object                |
| `/api/reviews/:id`                   | PUT    | Update a review                 | Updated review data | Updated review               |
| `/api/reviews/:id`                   | DELETE | Delete a review                 | N/A                 | Success message              |
| `/api/reviews/:id/helpful`           | POST   | Mark a review as helpful        | N/A                 | Updated helpful count        |
| `/api/reviews/:id/report`            | POST   | Report a review                 | `{reason}`          | Updated report count         |
| `/api/reviews/:id/respond`           | POST   | Respond to a review             | `{content}`         | Updated review with response |
| `/api/reviews/stats/:id`             | GET    | Get review stats for advertiser | N/A                 | Review statistics            |
| `/api/reviews/top-rated/advertisers` | GET    | Get top-rated advertisers       | N/A                 | Array of top advertisers     |
| `/api/reviews/admin/pending`         | GET    | Get pending reviews (admin)     | N/A                 | Array of pending reviews     |
| `/api/reviews/admin/approve/:id`     | POST   | Approve a review (admin)        | N/A                 | Updated review               |
| `/api/reviews/admin/reject/:id`      | POST   | Reject a review (admin)         | `{moderationNotes}` | Updated review               |

## Data Flow

The review system follows these data flows:

1. **Creating a Review**:

   - User clicks "Write a Review" on an advertiser profile
   - ReviewDialogComponent opens with a form
   - User enters rating, title, content, and category ratings
   - ReviewService.createReview() sends a POST request to the server
   - Server validates the review and saves it with "pending" status
   - UI displays a success message and updates the review list

2. **Viewing Reviews**:

   - User navigates to an advertiser profile
   - ReviewListComponent calls ReviewService.getAdvertiserReviews()
   - Server returns approved reviews for the advertiser
   - ReviewStatsComponent displays aggregate statistics
   - ReviewListComponent renders the reviews with pagination

3. **Interacting with Reviews**:

   - User can mark a review as helpful (ReviewService.markReviewHelpful())
   - User can report inappropriate reviews (ReviewService.reportReview())
   - Advertisers can respond to reviews (ReviewService.respondToReview())
   - Review owners can edit or delete their reviews

4. **Moderation Flow**:
   - New reviews start with "pending" status
   - Admins review pending reviews through admin interface
   - Admins can approve or reject reviews with moderation notes
   - Approved reviews become visible to all users
   - Rejected reviews are only visible to their authors

## State Management

The review system uses a combination of service-based state management:

- **ReviewService**: Manages review data and operations
- **Component-level state**: Manages UI state for individual components
- **Query parameters**: Maintains filter and pagination state in the URL

## Data Model

The Review model includes:

```typescript
interface Review {
  _id: string;
  reviewer: {
    _id: string;
    username: string;
    profileImage?: string;
  };
  advertiser: {
    _id: string;
    username: string;
    profileImage?: string;
  };
  ad?: string;
  rating: number;
  title: string;
  content: string;
  categories?: {
    communication?: number;
    appearance?: number;
    location?: number;
    value?: number;
  };
  status: 'pending' | 'approved' | 'rejected';
  moderationNotes?: string;
  isVerifiedMeeting?: boolean;
  meetingDate?: Date;
  advertiserResponse?: {
    content: string;
    date: Date;
  };
  helpfulVotes: number;
  reportCount: number;
  reports?: Array<{
    userId: string;
    reason: string;
    date: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
```

## Key Features

1. **Multi-Category Ratings**:

   - Overall star rating (1-5)
   - Category-specific ratings (communication, appearance, location, value)
   - Aggregate statistics for advertisers

2. **Moderation System**:

   - All reviews start as "pending"
   - Admin approval workflow
   - Rejection with moderation notes
   - Report system for community moderation

3. **Advertiser Responses**:

   - Advertisers can respond to reviews once
   - Responses are displayed with the review
   - Timestamps show when responses were added

4. **Helpful Votes**:

   - Users can mark reviews as helpful
   - Helpful count influences review sorting
   - Helps surface the most valuable reviews

5. **Verified Meetings**:
   - Option to indicate if the review is based on a verified meeting
   - Meeting date tracking
   - Adds credibility to reviews

## Security Considerations

1. **Access Control**:

   - Users can only create one review per advertiser
   - Users can only edit/delete their own reviews
   - Only advertisers can respond to their own reviews
   - Only admins can approve/reject reviews

2. **Content Moderation**:

   - All reviews are moderated before being published
   - Community reporting system for inappropriate content
   - Automatic re-moderation when report threshold is reached

3. **Rate Limiting**:
   - Limits on review submission frequency
   - Limits on helpful votes and reports

## Testing

### Unit Tests

| Test File                       | Path                                                                                 | Description                     |
| ------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------- |
| `review.service.spec.ts`        | `/client-angular/src/app/core/services/review.service.spec.ts`                       | Tests for review service        |
| `review-form.component.spec.ts` | `/client-angular/src/app/features/reviews/review-form/review-form.component.spec.ts` | Tests for review form component |
| `review-list.component.spec.ts` | `/client-angular/src/app/features/reviews/review-list/review-list.component.spec.ts` | Tests for review list component |

### Integration Tests

| Test File                   | Path                                                         | Description           |
| --------------------------- | ------------------------------------------------------------ | --------------------- |
| `review.controller.test.js` | `/server/tests/integration/review/review.controller.test.js` | API integration tests |
| `review.model.test.js`      | `/server/tests/integration/review/review.model.test.js`      | Database model tests  |

## Performance Considerations

1. **Pagination**:

   - Reviews are paginated to limit data transfer
   - Default limit of 10 reviews per page
   - Sorting options to help users find relevant reviews

2. **Caching**:

   - Review statistics are cached for performance
   - Cache invalidation on new reviews or updates

3. **Indexing**:
   - MongoDB indexes for efficient queries
   - Compound index on reviewer and advertiser for uniqueness
   - Indexes for finding reviews by advertiser, ad, and status

## Future Enhancements

1. **Review Analytics**:

   - Sentiment analysis of review content
   - Trend analysis for advertisers
   - Word clouds and key phrase extraction

2. **Enhanced Verification**:

   - Blockchain-based verification of reviews
   - Integration with meeting verification system
   - Proof of transaction for verified reviews

3. **Review Rewards**:

   - Incentives for high-quality reviews
   - Reviewer reputation system
   - Badges for top reviewers

4. **AI-Assisted Moderation**:
   - Automated content screening
   - Spam and fake review detection
   - Suggested moderation actions
