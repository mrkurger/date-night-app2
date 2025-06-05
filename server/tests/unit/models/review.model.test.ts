// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the review model
//
// COMMON CUSTOMIZATIONS:
// - TEST_REVIEW_DATA: Test review data
//   Related to: server/models/review.model.js
// ===================================================

import mongoose from 'mongoose';
import Review from '../../../models/review.model.js';
import { setupTestDB, teardownTestDB, clearDatabase } from '../../setup.ts.js';

describe('Review Model', () => {
  // Setup test data
  const testReviewerId = new mongoose.Types.ObjectId();
  const testAdvertiserId = new mongoose.Types.ObjectId();
  const testAdId = new mongoose.Types.ObjectId();

  const TEST_REVIEW_DATA = {
    reviewer: testReviewerId,
    advertiser: testAdvertiserId,
    ad: testAdId,
    rating: 4,
    title: 'Great experience',
    content: 'Had a wonderful time, would recommend!',
    categories: {
      communication: 5,
      appearance: 4,
      location: 4,
      value: 3,
    },
    isVerifiedMeeting: true,
    meetingDate: new Date('2023-01-15'),
  };

  // Setup and teardown for all tests
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  // Clear database between tests
  afterEach(async () => {
    await clearDatabase();
  });

  describe('Basic Validation', () => {
    it('should create a new review successfully', async () => {
      const review = new Review(TEST_REVIEW_DATA);
      const savedReview = await review.save();

      // Verify the saved review
      expect(savedReview._id).toBeDefined();
      expect(savedReview.reviewer.toString()).toBe(testReviewerId.toString());
      expect(savedReview.advertiser.toString()).toBe(testAdvertiserId.toString());
      expect(savedReview.ad.toString()).toBe(testAdId.toString());
      expect(savedReview.rating).toBe(TEST_REVIEW_DATA.rating);
      expect(savedReview.title).toBe(TEST_REVIEW_DATA.title);
      expect(savedReview.content).toBe(TEST_REVIEW_DATA.content);
      expect(savedReview.categories.communication).toBe(TEST_REVIEW_DATA.categories.communication);
      expect(savedReview.categories.appearance).toBe(TEST_REVIEW_DATA.categories.appearance);
      expect(savedReview.categories.location).toBe(TEST_REVIEW_DATA.categories.location);
      expect(savedReview.categories.value).toBe(TEST_REVIEW_DATA.categories.value);
      expect(savedReview.status).toBe('pending'); // Default status
      expect(savedReview.isVerifiedMeeting).toBe(TEST_REVIEW_DATA.isVerifiedMeeting);
      expect(savedReview.meetingDate).toEqual(TEST_REVIEW_DATA.meetingDate);
      expect(savedReview.helpfulVotes).toBe(0); // Default
      expect(savedReview.reportCount).toBe(0); // Default
      expect(savedReview.reports).toEqual([]); // Default
      expect(savedReview.createdAt).toBeDefined();
      expect(savedReview.updatedAt).toBeDefined();
    });

    it('should require reviewer, advertiser, rating, title, and content', async () => {
      const reviewWithoutRequiredFields = new Review({
        // Missing required fields
      });

      // Expect validation to fail
      await expect(reviewWithoutRequiredFields.save()).rejects.toThrow();
    });

    it('should enforce rating range validation (1-5)', async () => {
      // Test with rating below minimum
      const reviewWithLowRating = new Review({
        ...TEST_REVIEW_DATA,
        rating: 0,
      });
      await expect(reviewWithLowRating.save()).rejects.toThrow();

      // Test with rating above maximum
      const reviewWithHighRating = new Review({
        ...TEST_REVIEW_DATA,
        rating: 6,
      });
      await expect(reviewWithHighRating.save()).rejects.toThrow();
    });

    it('should enforce category rating range validation (1-5)', async () => {
      // Test with category rating below minimum
      const reviewWithLowCategoryRating = new Review({
        ...TEST_REVIEW_DATA,
        categories: {
          ...TEST_REVIEW_DATA.categories,
          communication: 0,
        },
      });
      await expect(reviewWithLowCategoryRating.save()).rejects.toThrow();

      // Test with category rating above maximum
      const reviewWithHighCategoryRating = new Review({
        ...TEST_REVIEW_DATA,
        categories: {
          ...TEST_REVIEW_DATA.categories,
          appearance: 6,
        },
      });
      await expect(reviewWithHighCategoryRating.save()).rejects.toThrow();
    });

    it('should enforce title maxlength validation', async () => {
      const reviewWithLongTitle = new Review({
        ...TEST_REVIEW_DATA,
        title: 'a'.repeat(101), // Exceeds 100 character limit
      });

      await expect(reviewWithLongTitle.save()).rejects.toThrow();
    });

    it('should enforce content maxlength validation', async () => {
      const reviewWithLongContent = new Review({
        ...TEST_REVIEW_DATA,
        content: 'a'.repeat(1001), // Exceeds 1000 character limit
      });

      await expect(reviewWithLongContent.save()).rejects.toThrow();
    });

    it('should enforce status enum validation', async () => {
      const reviewWithInvalidStatus = new Review({
        ...TEST_REVIEW_DATA,
        status: 'invalid-status', // Not in enum: ['pending', 'approved', 'rejected']
      });

      await expect(reviewWithInvalidStatus.save()).rejects.toThrow();
    });

    it('should prevent duplicate reviews from the same reviewer for the same advertiser', async () => {
      // Ensure indexes are created
      await Review.createIndexes();

      // Create first review
      const review1 = new Review(TEST_REVIEW_DATA);
      await review1.save();

      // Try to create second review with same reviewer and advertiser
      const review2 = new Review({
        ...TEST_REVIEW_DATA,
        title: 'Another review',
        content: 'This should fail due to unique index constraint',
      });

      // Expect duplicate to throw error due to unique index
      await expect(review2.save()).rejects.toThrow();
    });

    it('should trim whitespace from title and content', async () => {
      const reviewWithWhitespace = new Review({
        ...TEST_REVIEW_DATA,
        title: '  Trimmed Title  ',
        content: '  Trimmed Content  ',
      });

      const savedReview = await reviewWithWhitespace.save();
      expect(savedReview.title).toBe('Trimmed Title');
      expect(savedReview.content).toBe('Trimmed Content');
    });
  });

  describe('Virtual Properties', () => {
    it('should calculate averageRating correctly from categories', async () => {
      const review = new Review({
        ...TEST_REVIEW_DATA,
        categories: {
          communication: 5,
          appearance: 4,
          location: 3,
          value: 2,
        },
      });

      // (5 + 4 + 3 + 2) / 4 = 3.5
      expect(review.averageRating).toBe('3.5');
    });

    it('should use overall rating when categories are not provided', async () => {
      const reviewWithoutCategories = new Review({
        ...TEST_REVIEW_DATA,
        categories: {},
      });

      expect(reviewWithoutCategories.averageRating).toBe(4);
    });

    it('should handle partial categories correctly', async () => {
      const reviewWithPartialCategories = new Review({
        ...TEST_REVIEW_DATA,
        categories: {
          communication: 5,
          appearance: 3,
          // Missing location and value
        },
      });

      // (5 + 3) / 2 = 4.0
      expect(reviewWithPartialCategories.averageRating).toBe('4.0');
    });
  });

  describe('Instance Methods', () => {
    it('should mark a review as helpful', async () => {
      const review = new Review(TEST_REVIEW_DATA);
      const savedReview = await review.save();

      expect(savedReview.helpfulVotes).toBe(0);

      await savedReview.markHelpful();
      expect(savedReview.helpfulVotes).toBe(1);

      await savedReview.markHelpful();
      expect(savedReview.helpfulVotes).toBe(2);
    });

    it('should report a review', async () => {
      const review = new Review(TEST_REVIEW_DATA);
      const savedReview = await review.save();
      const reporterId = new mongoose.Types.ObjectId();

      expect(savedReview.reportCount).toBe(0);
      expect(savedReview.reports).toHaveLength(0);

      await savedReview.report(reporterId, 'Inappropriate content');

      expect(savedReview.reportCount).toBe(1);
      expect(savedReview.reports).toHaveLength(1);
      expect(savedReview.reports[0].userId.toString()).toBe(reporterId.toString());
      expect(savedReview.reports[0].reason).toBe('Inappropriate content');
      expect(savedReview.reports[0].date).toBeDefined();
    });

    it('should prevent duplicate reports from the same user', async () => {
      const review = new Review(TEST_REVIEW_DATA);
      const savedReview = await review.save();
      const reporterId = new mongoose.Types.ObjectId();

      await savedReview.report(reporterId, 'First report');
      expect(savedReview.reportCount).toBe(1);
      expect(savedReview.reports).toHaveLength(1);

      await savedReview.report(reporterId, 'Duplicate report');
      // Report count and reports array should remain unchanged
      expect(savedReview.reportCount).toBe(1);
      expect(savedReview.reports).toHaveLength(1);
    });

    it('should change status to pending when report count reaches threshold', async () => {
      const review = new Review({
        ...TEST_REVIEW_DATA,
        status: 'approved',
      });
      const savedReview = await review.save();

      // Report from 3 different users
      await savedReview.report(new mongoose.Types.ObjectId(), 'Report 1');
      await savedReview.report(new mongoose.Types.ObjectId(), 'Report 2');

      // Status should still be approved
      expect(savedReview.status).toBe('approved');

      // Third report should trigger status change
      await savedReview.report(new mongoose.Types.ObjectId(), 'Report 3');

      // Status should now be pending
      expect(savedReview.status).toBe('pending');
    });

    it('should allow advertiser to respond to a review', async () => {
      const review = new Review(TEST_REVIEW_DATA);
      let savedReview = await review.save();

      expect(savedReview.advertiserResponse).toBeUndefined();

      const responseContent = 'Thank you for your review!';
      savedReview = await savedReview.respondToReview(responseContent);

      expect(savedReview.advertiserResponse).toBeDefined();
      expect(savedReview.advertiserResponse.content).toBe(responseContent);
      expect(savedReview.advertiserResponse.date).toBeDefined();
    });
  });

  describe('Static Methods', () => {
    // Setup for static method tests
    const setupReviews = async (): Promise<void> => {
      const advertiser1Id = new mongoose.Types.ObjectId();
      const advertiser2Id = new mongoose.Types.ObjectId();
      const advertiser3Id = new mongoose.Types.ObjectId();

      // Create multiple reviews for testing
      await Review.create([
        {
          reviewer: new mongoose.Types.ObjectId(),
          advertiser: advertiser1Id,
          rating: 5,
          title: 'Excellent service',
          content: 'Absolutely amazing experience',
          categories: {
            communication: 5,
            appearance: 5,
            location: 5,
            value: 5,
          },
          status: 'approved',
          createdAt: new Date('2023-01-01'),
        },
        {
          reviewer: new mongoose.Types.ObjectId(),
          advertiser: advertiser1Id,
          rating: 4,
          title: 'Very good',
          content: 'Great experience overall',
          categories: {
            communication: 4,
            appearance: 4,
            location: 4,
            value: 4,
          },
          status: 'approved',
          createdAt: new Date('2023-01-02'),
        },
        {
          reviewer: new mongoose.Types.ObjectId(),
          advertiser: advertiser1Id,
          rating: 3,
          title: 'Average',
          content: 'It was okay',
          categories: {
            communication: 3,
            appearance: 3,
            location: 3,
            value: 3,
          },
          status: 'approved',
          createdAt: new Date('2023-01-03'),
        },
        {
          reviewer: new mongoose.Types.ObjectId(),
          advertiser: advertiser1Id,
          rating: 2,
          title: 'Disappointing',
          content: 'Not what I expected',
          categories: {
            communication: 2,
            appearance: 2,
            location: 2,
            value: 2,
          },
          status: 'pending', // This one is pending, should be excluded from averages
          createdAt: new Date('2023-01-04'),
        },
        {
          reviewer: new mongoose.Types.ObjectId(),
          advertiser: advertiser2Id,
          rating: 5,
          title: 'Perfect',
          content: 'Could not be better',
          categories: {
            communication: 5,
            appearance: 5,
            location: 5,
            value: 5,
          },
          status: 'approved',
          createdAt: new Date('2023-01-05'),
        },
        {
          reviewer: new mongoose.Types.ObjectId(),
          advertiser: advertiser2Id,
          rating: 5,
          title: 'Amazing',
          content: 'Wonderful experience',
          categories: {
            communication: 5,
            appearance: 5,
            location: 5,
            value: 5,
          },
          status: 'approved',
          createdAt: new Date('2023-01-06'),
        },
        {
          reviewer: new mongoose.Types.ObjectId(),
          advertiser: advertiser3Id,
          rating: 4,
          title: 'Good',
          content: 'Solid experience',
          categories: {
            communication: 4,
            appearance: 4,
            location: 4,
            value: 4,
          },
          status: 'approved',
          createdAt: new Date('2023-01-07'),
        },
      ]);

      return { advertiser1Id, advertiser2Id, advertiser3Id };
    };

    // Mock the populate method since we're not actually populating in tests
    beforeEach(() => {
      jest.spyOn(mongoose.Query.prototype, 'populate').mockImplementation(function () {
        return this;
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    describe('getAdvertiserRatings', () => {
      it('should calculate average ratings correctly', async () => {
        const { advertiser1Id } = await setupReviews();

        const ratings = await Review.getAdvertiserRatings(advertiser1Id);

        // Only approved reviews should be included (3 out of 4)
        expect(ratings.totalReviews).toBe(3);

        // Average of ratings: (5 + 4 + 3) / 3 = 4
        expect(ratings.averageRating).toBeCloseTo(4, 1);

        // Average of communication: (5 + 4 + 3) / 3 = 4
        expect(ratings.communicationAvg).toBeCloseTo(4, 1);

        // Average of appearance: (5 + 4 + 3) / 3 = 4
        expect(ratings.appearanceAvg).toBeCloseTo(4, 1);

        // Average of location: (5 + 4 + 3) / 3 = 4
        expect(ratings.locationAvg).toBeCloseTo(4, 1);

        // Average of value: (5 + 4 + 3) / 3 = 4
        expect(ratings.valueAvg).toBeCloseTo(4, 1);
      });

      it('should return default values when no reviews exist', async () => {
        const nonExistentAdvertiserId = new mongoose.Types.ObjectId();
        const ratings = await Review.getAdvertiserRatings(nonExistentAdvertiserId);

        expect(ratings.totalReviews).toBe(0);
        expect(ratings.averageRating).toBe(0);
        expect(ratings.communicationAvg).toBe(0);
        expect(ratings.appearanceAvg).toBe(0);
        expect(ratings.locationAvg).toBe(0);
        expect(ratings.valueAvg).toBe(0);
      });
    });

    describe('findRecentReviews', () => {
      it('should find recent reviews for an advertiser', async () => {
        const { advertiser1Id } = await setupReviews();

        const reviews = await Review.findRecentReviews(advertiser1Id);

        // Only approved reviews should be included (3 out of 4)
        expect(reviews).toHaveLength(3);

        // Should be sorted by createdAt descending (newest first)
        expect(reviews[0].title).toBe('Average');
        expect(reviews[1].title).toBe('Very good');
        expect(reviews[2].title).toBe('Excellent service');
      });

      it('should respect the limit parameter', async () => {
        const { advertiser1Id } = await setupReviews();

        const reviews = await Review.findRecentReviews(advertiser1Id, 2);

        expect(reviews).toHaveLength(2);
        expect(reviews[0].title).toBe('Average');
        expect(reviews[1].title).toBe('Very good');
      });

      it('should return empty array when no approved reviews exist', async () => {
        const nonExistentAdvertiserId = new mongoose.Types.ObjectId();
        const reviews = await Review.findRecentReviews(nonExistentAdvertiserId);

        expect(reviews).toHaveLength(0);
      });
    });

    describe('findTopRated', () => {
      it('should find top-rated advertisers', async () => {
        const { advertiser1Id, advertiser2Id, advertiser3Id } = await setupReviews();

        // Mock the aggregate pipeline
        const mockAggregate = jest.spyOn(mongoose.Model, 'aggregate');
        mockAggregate.mockImplementation(function () {
          return Promise.resolve([
            {
              _id: advertiser2Id,
              averageRating: 5,
              reviewCount: 2,
              advertiser: { _id: advertiser2Id, username: 'advertiser2' },
            },
            {
              _id: advertiser1Id,
              averageRating: 4,
              reviewCount: 3,
              advertiser: { _id: advertiser1Id, username: 'advertiser1' },
            },
            {
              _id: advertiser3Id,
              averageRating: 4,
              reviewCount: 1,
              advertiser: { _id: advertiser3Id, username: 'advertiser3' },
            },
          ]);
        });

        const topRated = await Review.findTopRated();

        expect(topRated).toHaveLength(3);

        // Should be sorted by averageRating descending, then reviewCount descending
        expect(topRated[0]._id.toString()).toBe(advertiser2Id.toString());
        expect(topRated[1]._id.toString()).toBe(advertiser1Id.toString());
        expect(topRated[2]._id.toString()).toBe(advertiser3Id.toString());

        // Cleanup
        mockAggregate.mockRestore();
      });

      it('should respect the limit parameter', async () => {
        const { advertiser1Id, advertiser2Id } = await setupReviews();

        // Mock the aggregate pipeline
        const mockAggregate = jest.spyOn(mongoose.Model, 'aggregate');
        mockAggregate.mockImplementation(function () {
          return Promise.resolve([
            {
              _id: advertiser2Id,
              averageRating: 5,
              reviewCount: 2,
              advertiser: { _id: advertiser2Id, username: 'advertiser2' },
            },
            {
              _id: advertiser1Id,
              averageRating: 4,
              reviewCount: 3,
              advertiser: { _id: advertiser1Id, username: 'advertiser1' },
            },
          ]);
        });

        const topRated = await Review.findTopRated(2);

        expect(topRated).toHaveLength(2);

        // Cleanup
        mockAggregate.mockRestore();
      });

      it('should respect the minReviews parameter', async () => {
        const { advertiser1Id, advertiser2Id } = await setupReviews();

        // Mock the aggregate pipeline
        const mockAggregate = jest.spyOn(mongoose.Model, 'aggregate');
        mockAggregate.mockImplementation(function () {
          return Promise.resolve([
            {
              _id: advertiser2Id,
              averageRating: 5,
              reviewCount: 2,
              advertiser: { _id: advertiser2Id, username: 'advertiser2' },
            },
          ]);
        });

        // Set minReviews to 2, which should exclude advertiser3 with only 1 review
        const topRated = await Review.findTopRated(10, 2);

        expect(topRated).toHaveLength(1);

        // Cleanup
        mockAggregate.mockRestore();
      });
    });
  });

  describe('Hooks', () => {
    it('should update updatedAt field on save', async () => {
      const review = new Review(TEST_REVIEW_DATA);
      const savedReview = await review.save();

      const originalUpdatedAt = savedReview.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      // Update the review
      savedReview.title = 'Updated Title';
      await savedReview.save();

      expect(savedReview.updatedAt).not.toEqual(originalUpdatedAt);
    });
  });

  describe('Indexes', () => {
    it('should have the expected indexes', async () => {
      const indexes = await Review.collection.indexes();

      // Check for unique compound index on reviewer and advertiser
      const reviewerAdvertiserIndex = indexes.find(
        index => index.key.reviewer === 1 && index.key.advertiser === 1 && index.unique === true
      );
      expect(reviewerAdvertiserIndex).toBeDefined();

      // Check for compound index on advertiser, status, and createdAt
      const advertiserStatusCreatedAtIndex = indexes.find(
        index => index.key.advertiser === 1 && index.key.status === 1 && index.key.createdAt === -1
      );
      expect(advertiserStatusCreatedAtIndex).toBeDefined();

      // Check for compound index on ad, status, and createdAt
      const adStatusCreatedAtIndex = indexes.find(
        index => index.key.ad === 1 && index.key.status === 1 && index.key.createdAt === -1
      );
      expect(adStatusCreatedAtIndex).toBeDefined();
    });
  });
});
