// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the favorite model
//
// COMMON CUSTOMIZATIONS:
// - TEST_FAVORITE_DATA: Test favorite data
//   Related to: server/models/favorite.model.js
// ===================================================

import mongoose from 'mongoose';
import Favorite from '../../../models/favorite.model.js';
import { setupTestDB, teardownTestDB, clearDatabase } from '../../setup.ts.js';

describe('Favorite Model', () => {
  // Setup test data
  const testUserId = new mongoose.Types.ObjectId();
  const testAdId = new mongoose.Types.ObjectId();
  const testAdvertiserId = new mongoose.Types.ObjectId();

  const TEST_FAVORITE_DATA = {
    user: testUserId,
    ad: testAdId,
    notes: 'Test notes',
    notificationsEnabled: true,
    tags: ['tag1', 'tag2'],
    priority: 'normal',
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
    it('should create a new favorite successfully', async () => {
      const favorite = new Favorite(TEST_FAVORITE_DATA);
      const savedFavorite = await favorite.save();

      // Verify the saved favorite
      expect(savedFavorite._id).toBeDefined();
      expect(savedFavorite.user.toString()).toBe(testUserId.toString());
      expect(savedFavorite.ad.toString()).toBe(testAdId.toString());
      expect(savedFavorite.notes).toBe(TEST_FAVORITE_DATA.notes);
      expect(savedFavorite.notificationsEnabled).toBe(TEST_FAVORITE_DATA.notificationsEnabled);
      expect(savedFavorite.tags).toEqual(TEST_FAVORITE_DATA.tags);
      expect(savedFavorite.priority).toBe(TEST_FAVORITE_DATA.priority);
      expect(savedFavorite.createdAt).toBeDefined();
      expect(savedFavorite.updatedAt).toBeDefined();
    });

    it('should require user and ad fields', async () => {
      const favoriteWithoutRequiredFields = new Favorite({
        notes: 'Test notes',
      });

      // Expect validation to fail
      await expect(favoriteWithoutRequiredFields.save()).rejects.toThrow();
    });

    it('should enforce tag length validation', async () => {
      const favoriteWithLongTag = new Favorite({
        ...TEST_FAVORITE_DATA,
        tags: ['tag1', 'a'.repeat(31)], // Tag exceeds 30 character limit
      });

      // Expect validation to fail
      await expect(favoriteWithLongTag.save()).rejects.toThrow();
    });

    it('should enforce priority enum validation', async () => {
      const favoriteWithInvalidPriority = new Favorite({
        ...TEST_FAVORITE_DATA,
        priority: 'invalid-priority', // Not in enum: ['low', 'normal', 'high']
      });

      // Expect validation to fail
      await expect(favoriteWithInvalidPriority.save()).rejects.toThrow();
    });

    it('should enforce notes maxlength validation', async () => {
      const favoriteWithLongNotes = new Favorite({
        ...TEST_FAVORITE_DATA,
        notes: 'a'.repeat(501), // Exceeds 500 character limit
      });

      // Expect validation to fail
      await expect(favoriteWithLongNotes.save()).rejects.toThrow();
    });

    it('should prevent duplicate favorites for the same user and ad', async () => {
      // Ensure indexes are created
      await Favorite.createIndexes();

      // Create first favorite
      const favorite1 = new Favorite(TEST_FAVORITE_DATA);
      await favorite1.save();

      // Try to create second favorite with same user and ad
      const favorite2 = new Favorite(TEST_FAVORITE_DATA);

      // Expect duplicate to throw error due to unique index
      await expect(favorite2.save()).rejects.toThrow();
    });
  });

  describe('Static Methods', () => {
    // Setup for static method tests
    const setupFavorites = async (): Promise<void> => {
      const testUser2Id = new mongoose.Types.ObjectId();
      const testAd2Id = new mongoose.Types.ObjectId();
      const testAd3Id = new mongoose.Types.ObjectId();

      // Create multiple favorites for testing
      await Favorite.create([
        {
          user: testUserId,
          ad: testAdId,
          notes: 'First favorite',
          tags: ['tag1', 'important'],
          priority: 'high',
          createdAt: new Date('2023-01-01'),
        },
        {
          user: testUserId,
          ad: testAd2Id,
          notes: 'Second favorite',
          tags: ['tag2'],
          priority: 'normal',
          createdAt: new Date('2023-01-02'),
        },
        {
          user: testUserId,
          ad: testAd3Id,
          notes: 'Third favorite',
          tags: ['tag1', 'tag3'],
          priority: 'low',
          createdAt: new Date('2023-01-03'),
        },
        {
          user: testUser2Id, // Different user
          ad: testAdId,
          notes: 'Other user favorite',
          tags: ['tag1'],
          priority: 'normal',
          createdAt: new Date('2023-01-04'),
        },
      ]);

      return { testUser2Id, testAd2Id, testAd3Id };
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

    describe('findByUser', () => {
      it('should find all favorites for a user with default sorting', async () => {
        await setupFavorites();

        const favorites = await Favorite.findByUser(testUserId);

        expect(favorites).toHaveLength(3);
        // Default sort is by createdAt descending, so newest first
        expect(favorites[0].notes).toBe('Third favorite');
        expect(favorites[1].notes).toBe('Second favorite');
        expect(favorites[2].notes).toBe('First favorite');
      });

      it('should apply custom sorting', async () => {
        await setupFavorites();

        const favorites = await Favorite.findByUser(testUserId, {
          sort: { priority: 1 }, // Sort by priority ascending (low to high)
        });

        expect(favorites).toHaveLength(3);
        expect(favorites[0].priority).toBe('low');
        expect(favorites[1].priority).toBe('normal');
        expect(favorites[2].priority).toBe('high');
      });

      it('should apply filters', async () => {
        await setupFavorites();

        const favorites = await Favorite.findByUser(testUserId, {
          filters: { tags: 'tag1' },
        });

        expect(favorites).toHaveLength(2);
        expect(favorites[0].tags).toContain('tag1');
        expect(favorites[1].tags).toContain('tag1');
      });
    });

    describe('isFavorite', () => {
      it('should return true when ad is favorited by user', async () => {
        await setupFavorites();

        const isFavorite = await Favorite.isFavorite(testUserId, testAdId);
        expect(isFavorite).toBe(true);
      });

      it('should return false when ad is not favorited by user', async () => {
        await setupFavorites();
        const nonExistentAdId = new mongoose.Types.ObjectId();

        const isFavorite = await Favorite.isFavorite(testUserId, nonExistentAdId);
        expect(isFavorite).toBe(false);
      });
    });

    describe('toggleFavorite', () => {
      it('should add a favorite when it does not exist', async () => {
        const result = await Favorite.toggleFavorite(testUserId, testAdId);
        expect(result.isFavorite).toBe(true);

        const isFavorite = await Favorite.isFavorite(testUserId, testAdId);
        expect(isFavorite).toBe(true);
      });

      it('should remove a favorite when it exists', async () => {
        // First create the favorite
        await Favorite.create(TEST_FAVORITE_DATA);

        // Then toggle it off
        const result = await Favorite.toggleFavorite(testUserId, testAdId);
        expect(result.isFavorite).toBe(false);

        const isFavorite = await Favorite.isFavorite(testUserId, testAdId);
        expect(isFavorite).toBe(false);
      });
    });

    describe('getFavoriteIds', () => {
      it('should return array of ad IDs favorited by user', async () => {
        const { testAd2Id, testAd3Id } = await setupFavorites();

        const favoriteIds = await Favorite.getFavoriteIds(testUserId);
        expect(favoriteIds).toHaveLength(3);
        expect(favoriteIds).toContain(testAdId.toString());
        expect(favoriteIds).toContain(testAd2Id.toString());
        expect(favoriteIds).toContain(testAd3Id.toString());
      });

      it('should return empty array when user has no favorites', async () => {
        const nonExistentUserId = new mongoose.Types.ObjectId();
        const favoriteIds = await Favorite.getFavoriteIds(nonExistentUserId);
        expect(favoriteIds).toHaveLength(0);
      });
    });

    describe('updateLastViewed', () => {
      it('should update the lastViewed timestamp', async () => {
        // Create a favorite
        await Favorite.create(TEST_FAVORITE_DATA);

        // Update lastViewed
        await Favorite.updateLastViewed(testUserId, testAdId);

        // Verify update
        const favorite = await Favorite.findOne({ user: testUserId, ad: testAdId });
        expect(favorite.lastViewed).toBeDefined();
        expect(favorite.lastViewed instanceof Date).toBe(true);
      });
    });

    describe('updateLastNotified', () => {
      it('should update the lastNotified timestamp', async () => {
        // Create a favorite
        await Favorite.create(TEST_FAVORITE_DATA);

        // Update lastNotified
        await Favorite.updateLastNotified(testUserId, testAdId);

        // Verify update
        const favorite = await Favorite.findOne({ user: testUserId, ad: testAdId });
        expect(favorite.lastNotified).toBeDefined();
        expect(favorite.lastNotified instanceof Date).toBe(true);
      });
    });

    describe('findByTag', () => {
      it('should find favorites with a specific tag', async () => {
        await setupFavorites();

        const favorites = await Favorite.findByTag(testUserId, 'tag1');
        expect(favorites).toHaveLength(2);
        favorites.forEach(favorite => {
          expect(favorite.tags).toContain('tag1');
        });
      });

      it('should return empty array when no favorites have the tag', async () => {
        await setupFavorites();

        const favorites = await Favorite.findByTag(testUserId, 'nonexistent-tag');
        expect(favorites).toHaveLength(0);
      });
    });

    describe('findByPriority', () => {
      it('should find favorites with a specific priority', async () => {
        await setupFavorites();

        const favorites = await Favorite.findByPriority(testUserId, 'high');
        expect(favorites).toHaveLength(1);
        expect(favorites[0].priority).toBe('high');
      });

      it('should return empty array when no favorites have the priority', async () => {
        await setupFavorites();

        // User has no favorites with 'medium' priority (not in enum)
        const favorites = await Favorite.findByPriority(testUserId, 'medium');
        expect(favorites).toHaveLength(0);
      });
    });
  });

  describe('Indexes', () => {
    it('should have the expected indexes', async () => {
      const indexes = await Favorite.collection.indexes();

      // Check for unique compound index on user and ad
      const userAdIndex = indexes.find(
        index => index.key.user === 1 && index.key.ad === 1 && index.unique === true
      );
      expect(userAdIndex).toBeDefined();

      // Check for user and createdAt compound index
      const userCreatedAtIndex = indexes.find(
        index => index.key.user === 1 && index.key.createdAt === -1
      );
      expect(userCreatedAtIndex).toBeDefined();

      // Check for user and tags compound index
      const userTagsIndex = indexes.find(index => index.key.user === 1 && index.key.tags === 1);
      expect(userTagsIndex).toBeDefined();

      // Check for user and priority compound index
      const userPriorityIndex = indexes.find(
        index => index.key.user === 1 && index.key.priority === 1
      );
      expect(userPriorityIndex).toBeDefined();

      // Check for user and lastViewed compound index
      const userLastViewedIndex = indexes.find(
        index => index.key.user === 1 && index.key.lastViewed === -1
      );
      expect(userLastViewedIndex).toBeDefined();
    });
  });
});
