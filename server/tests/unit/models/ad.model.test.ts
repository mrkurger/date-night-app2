import type { jest } from '@jest/globals';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the ad model
//
// COMMON CUSTOMIZATIONS:
// - TEST_AD_DATA: Test ad data (default: imported from helpers)
//   Related to: server/tests/helpers.js:TEST_AD_DATA
// ===================================================

import mongoose from 'mongoose';
import Ad from '../../../models/ad.model.js';
import User from '../../../models/user.model.js';
import { setupTestDB, teardownTestDB, clearDatabase } from '../../setup.js';
import { TEST_AD_DATA, createTestUser } from '../../helpers.js';

describe('Ad Model', () => {
  let testUser;

  // Setup and teardown for all tests
  beforeAll(async () => {
    await setupTestDB();
    testUser = await createTestUser();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  // Clear database between tests
  afterEach(async () => {
    await clearDatabase();
    testUser = await createTestUser();
  });

  describe('Basic Ad Creation', () => {
    it('should create a new ad successfully', async () => {
      // Create a valid ad with required fields
      const adData = {
        title: 'Test Ad',
        description: 'This is a test ad description',
        advertiser: testUser._id,
        category: 'Massage',
        county: 'Oslo',
        city: 'Oslo',
        location: {
          type: 'Point',
          coordinates: [10.7522, 59.9139], // Oslo coordinates
        },
        profileImage: '/path/to/image.jpg',
      };

      const ad = new Ad(adData);
      const savedAd = await ad.save();

      // Verify the saved ad
      expect(savedAd._id).toBeDefined();
      expect(savedAd.title).toBe(adData.title);
      expect(savedAd.description).toBe(adData.description);
      expect(savedAd.advertiser.toString()).toBe(testUser._id.toString());
      expect(savedAd.category).toBe(adData.category);
      expect(savedAd.county).toBe(adData.county);
      expect(savedAd.city).toBe(adData.city);
      expect(savedAd.location.coordinates).toEqual(adData.location.coordinates);
      expect(savedAd.profileImage).toBe(adData.profileImage);

      // Check default values
      expect(savedAd.active).toBe(true);
      expect(savedAd.featured).toBe(false);
      expect(savedAd.verified).toBe(false);
      expect(savedAd.views).toBe(0);
      expect(savedAd.clicks).toBe(0);
      expect(savedAd.likes).toBe(0);
      expect(savedAd.expiresAt).toBeDefined();
      expect(savedAd.createdAt).toBeDefined();
      expect(savedAd.updatedAt).toBeDefined();
    });

    it('should require title, description, advertiser, category, county, city, location, and profileImage', async () => {
      const ad = new Ad({});

      // Expect validation to fail
      await expect(ad.save()).rejects.toThrow();

      // Check specific validation errors
      try {
        await ad.save();
      } catch (error) {
        expect(error.errors.title).toBeDefined();
        expect(error.errors.description).toBeDefined();
        expect(error.errors.advertiser).toBeDefined();
        expect(error.errors.category).toBeDefined();
        expect(error.errors.county).toBeDefined();
        expect(error.errors.city).toBeDefined();
        expect(error.errors.location).toBeDefined();
        expect(error.errors.profileImage).toBeDefined();
      }
    });

    it('should validate category enum values', async () => {
      const adData = {
        title: 'Test Ad',
        description: 'This is a test ad description',
        advertiser: testUser._id,
        category: 'InvalidCategory', // Invalid category
        county: 'Oslo',
        city: 'Oslo',
        location: {
          type: 'Point',
          coordinates: [10.7522, 59.9139],
        },
        profileImage: '/path/to/image.jpg',
      };

      const ad = new Ad(adData);

      // Expect validation to fail
      await expect(ad.save()).rejects.toThrow();

      // Check specific validation error
      try {
        await ad.save();
      } catch (error) {
        expect(error.errors.category).toBeDefined();
      }
    });

    it('should set expiresAt to 30 days from creation if not provided', async () => {
      const adData = {
        title: 'Test Ad',
        description: 'This is a test ad description',
        advertiser: testUser._id,
        category: 'Massage',
        county: 'Oslo',
        city: 'Oslo',
        location: {
          type: 'Point',
          coordinates: [10.7522, 59.9139],
        },
        profileImage: '/path/to/image.jpg',
      };

      const ad = new Ad(adData);
      const savedAd = await ad.save();

      // Check that expiresAt is set to approximately 30 days from now
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Allow for a small difference due to test execution time
      const timeDifference = Math.abs(savedAd.expiresAt.getTime() - thirtyDaysFromNow.getTime());
      expect(timeDifference).toBeLessThan(5000); // Less than 5 seconds difference
    });
  });

  describe('Ad Methods', () => {
    let testAd;

    beforeEach(async () => {
      // Create a test ad for method testing
      const adData = {
        title: 'Test Ad',
        description: 'This is a test ad description',
        advertiser: testUser._id,
        category: 'Massage',
        county: 'Oslo',
        city: 'Oslo',
        location: {
          type: 'Point',
          coordinates: [10.7522, 59.9139],
        },
        profileImage: '/path/to/image.jpg',
        views: 10,
        clicks: 5,
        likes: 2,
      };

      testAd = new Ad(adData);
      await testAd.save();
    });

    it('should check if ad is expired', async () => {
      // Set expiresAt to a past date
      testAd.expiresAt = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
      await testAd.save();

      expect(testAd.isExpired()).toBe(true);

      // Set expiresAt to a future date
      testAd.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
      await testAd.save();

      expect(testAd.isExpired()).toBe(false);
    });

    it('should check if ad is boosted', async () => {
      // Set boosted to true and boostExpires to a future date
      testAd.boosted = true;
      testAd.boostExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
      await testAd.save();

      expect(testAd.isBoosted()).toBe(true);

      // Set boostExpires to a past date
      testAd.boostExpires = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
      await testAd.save();

      expect(testAd.isBoosted()).toBe(false);

      // Set boosted to false
      testAd.boosted = false;
      testAd.boostExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
      await testAd.save();

      expect(testAd.isBoosted()).toBe(false);
    });

    it('should increment view count', async () => {
      const initialViews = testAd.views;
      await testAd.incrementViews();

      expect(testAd.views).toBe(initialViews + 1);

      // Verify that the change was saved to the database
      const updatedAd = await Ad.findById(testAd._id);
      expect(updatedAd.views).toBe(initialViews + 1);
    });

    it('should increment click count', async () => {
      const initialClicks = testAd.clicks;
      await testAd.incrementClicks();

      expect(testAd.clicks).toBe(initialClicks + 1);

      // Verify that the change was saved to the database
      const updatedAd = await Ad.findById(testAd._id);
      expect(updatedAd.clicks).toBe(initialClicks + 1);
    });

    it('should toggle like', async () => {
      const initialLikes = testAd.likes;
      await testAd.toggleLike();

      expect(testAd.likes).toBe(initialLikes + 1);

      // Verify that the change was saved to the database
      const updatedAd = await Ad.findById(testAd._id);
      expect(updatedAd.likes).toBe(initialLikes + 1);
    });
  });

  describe('Ad Static Methods', () => {
    beforeEach(async () => {
      // Create multiple test ads for static method testing
      const ads = [
        {
          title: 'Active Ad',
          description: 'This is an active ad',
          advertiser: testUser._id,
          category: 'Massage',
          county: 'Oslo',
          city: 'Oslo',
          location: {
            type: 'Point',
            coordinates: [10.7522, 59.9139], // Oslo
          },
          profileImage: '/path/to/image1.jpg',
          active: true,
          featured: false,
          expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        },
        {
          title: 'Featured Ad',
          description: 'This is a featured ad',
          advertiser: testUser._id,
          category: 'Escort',
          county: 'Oslo',
          city: 'Oslo',
          location: {
            type: 'Point',
            coordinates: [10.7522, 59.9139], // Oslo
          },
          profileImage: '/path/to/image2.jpg',
          active: true,
          featured: true,
          expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        },
        {
          title: 'Inactive Ad',
          description: 'This is an inactive ad',
          advertiser: testUser._id,
          category: 'Massage',
          county: 'Bergen',
          city: 'Bergen',
          location: {
            type: 'Point',
            coordinates: [5.3221, 60.3913], // Bergen
          },
          profileImage: '/path/to/image3.jpg',
          active: false,
          featured: false,
          expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        },
        {
          title: 'Expired Ad',
          description: 'This is an expired ad',
          advertiser: testUser._id,
          category: 'Striptease',
          county: 'Trondheim',
          city: 'Trondheim',
          location: {
            type: 'Point',
            coordinates: [10.3951, 63.4305], // Trondheim
          },
          profileImage: '/path/to/image4.jpg',
          active: true,
          featured: false,
          expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        },
        {
          title: 'Touring Ad',
          description: 'This is a touring ad',
          advertiser: testUser._id,
          category: 'Escort',
          county: 'Oslo',
          city: 'Oslo',
          location: {
            type: 'Point',
            coordinates: [10.7522, 59.9139], // Oslo
          },
          profileImage: '/path/to/image5.jpg',
          active: true,
          featured: false,
          isTouring: true,
          currentLocation: {
            type: 'Point',
            coordinates: [10.3951, 63.4305], // Trondheim
          },
          expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
          travelItinerary: [
            {
              destination: {
                city: 'Bergen',
                county: 'Vestland',
                country: 'Norway',
                location: {
                  type: 'Point',
                  coordinates: [5.3221, 60.3913], // Bergen
                },
              },
              arrivalDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
              departureDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
              status: 'planned',
            },
          ],
        },
      ];

      // Save all ads
      for (const adData of ads) {
        const ad = new Ad(adData);
        await ad.save();
      }
    });

    it('should find active ads', async () => {
      const activeAds = await Ad.findActive();

      // Should find 3 active ads (Active Ad, Featured Ad, Touring Ad)
      expect(activeAds.length).toBe(3);

      // Verify that all returned ads are active and not expired
      for (const ad of activeAds) {
        expect(ad.active).toBe(true);
        expect(ad.expiresAt.getTime()).toBeGreaterThan(new Date().getTime());
      }
    });

    it('should find featured ads', async () => {
      const featuredAds = await Ad.findFeatured();

      // Should find 1 featured ad (Featured Ad)
      expect(featuredAds.length).toBe(1);

      // Verify that all returned ads are active, featured, and not expired
      for (const ad of featuredAds) {
        expect(ad.active).toBe(true);
        expect(ad.featured).toBe(true);
        expect(ad.expiresAt.getTime()).toBeGreaterThan(new Date().getTime());
      }
    });

    it('should find touring ads', async () => {
      const touringAds = await Ad.findTouring();

      // Should find 1 touring ad (Touring Ad)
      expect(touringAds.length).toBe(1);

      // Verify that all returned ads are active, touring, and not expired
      for (const ad of touringAds) {
        expect(ad.active).toBe(true);
        expect(ad.isTouring).toBe(true);
        expect(ad.expiresAt.getTime()).toBeGreaterThan(new Date().getTime());
      }
    });

    it('should find upcoming tours', async () => {
      const upcomingTours = await Ad.findUpcomingTours();

      // Should find 1 upcoming tour (Touring Ad)
      expect(upcomingTours.length).toBe(1);

      // Verify that all returned ads have planned travel itineraries
      for (const ad of upcomingTours) {
        expect(ad.active).toBe(true);
        expect(ad.isTouring).toBe(true);
        expect(ad.travelItinerary.length).toBeGreaterThan(0);

        // At least one itinerary should be planned
        const hasPlannedItinerary = ad.travelItinerary.some(
          itinerary => itinerary.status === 'planned'
        );
        expect(hasPlannedItinerary).toBe(true);
      }
    });

    it('should find upcoming tours for a specific city', async () => {
      const upcomingToursBergen = await Ad.findUpcomingTours('Bergen');

      // Should find 1 upcoming tour for Bergen (Touring Ad)
      expect(upcomingToursBergen.length).toBe(1);

      // Verify that all returned ads have planned travel itineraries for Bergen
      for (const ad of upcomingToursBergen) {
        expect(ad.active).toBe(true);
        expect(ad.isTouring).toBe(true);

        // At least one itinerary should be for Bergen
        const hasBergenItinerary = ad.travelItinerary.some(
          itinerary => itinerary.destination.city === 'Bergen'
        );
        expect(hasBergenItinerary).toBe(true);
      }

      // Should find 0 upcoming tours for Stavanger
      const upcomingToursStavanger = await Ad.findUpcomingTours('Stavanger');
      expect(upcomingToursStavanger.length).toBe(0);
    });
  });

  describe('Travel Itinerary Methods', () => {
    let testAd;

    beforeEach(async () => {
      // Create a test ad for travel itinerary testing
      const adData = {
        title: 'Travel Test Ad',
        description: 'This is a test ad for travel itinerary',
        advertiser: testUser._id,
        category: 'Escort',
        county: 'Oslo',
        city: 'Oslo',
        location: {
          type: 'Point',
          coordinates: [10.7522, 59.9139], // Oslo
        },
        profileImage: '/path/to/image.jpg',
        isTouring: false,
      };

      testAd = new Ad(adData);
      await testAd.save();
    });

    it('should add a travel itinerary', async () => {
      const itineraryData = {
        destination: {
          city: 'Bergen',
          county: 'Vestland',
          country: 'Norway',
          location: {
            type: 'Point',
            coordinates: [5.3221, 60.3913], // Bergen
          },
        },
        arrivalDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        departureDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        status: 'planned',
      };

      await testAd.addTravelItinerary(itineraryData);

      // Verify that the itinerary was added
      expect(testAd.travelItinerary.length).toBe(1);
      expect(testAd.isTouring).toBe(true);

      // Verify the itinerary data
      const itinerary = testAd.travelItinerary[0];
      expect(itinerary.destination.city).toBe(itineraryData.destination.city);
      expect(itinerary.destination.county).toBe(itineraryData.destination.county);
      expect(itinerary.destination.country).toBe(itineraryData.destination.country);
      expect(itinerary.destination.location.coordinates).toEqual(
        itineraryData.destination.location.coordinates
      );
      expect(itinerary.arrivalDate).toEqual(itineraryData.arrivalDate);
      expect(itinerary.departureDate).toEqual(itineraryData.departureDate);
      expect(itinerary.status).toBe(itineraryData.status);

      // Verify that the changes were saved to the database
      const updatedAd = await Ad.findById(testAd._id);
      expect(updatedAd.travelItinerary.length).toBe(1);
      expect(updatedAd.isTouring).toBe(true);
    });

    it('should update a travel itinerary', async () => {
      // First, add a travel itinerary
      const itineraryData = {
        destination: {
          city: 'Bergen',
          county: 'Vestland',
          country: 'Norway',
          location: {
            type: 'Point',
            coordinates: [5.3221, 60.3913], // Bergen
          },
        },
        arrivalDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        departureDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        status: 'planned',
      };

      await testAd.addTravelItinerary(itineraryData);

      // Get the itinerary ID
      const itineraryId = testAd.travelItinerary[0]._id;

      // Update the itinerary
      const updates = {
        destination: {
          city: 'Trondheim',
          county: 'Trøndelag',
          country: 'Norway',
          location: {
            type: 'Point',
            coordinates: [10.3951, 63.4305], // Trondheim
          },
        },
        arrivalDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        departureDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        status: 'planned',
      };

      await testAd.updateTravelItinerary(itineraryId, updates);

      // Verify that the itinerary was updated
      const updatedItinerary = testAd.travelItinerary.id(itineraryId);
      expect(updatedItinerary.destination.city).toBe(updates.destination.city);
      expect(updatedItinerary.destination.county).toBe(updates.destination.county);
      expect(updatedItinerary.destination.country).toBe(updates.destination.country);
      expect(updatedItinerary.destination.location.coordinates).toEqual(
        updates.destination.location.coordinates
      );
      expect(updatedItinerary.arrivalDate).toEqual(updates.arrivalDate);
      expect(updatedItinerary.departureDate).toEqual(updates.departureDate);
      expect(updatedItinerary.status).toBe(updates.status);

      // Verify that the changes were saved to the database
      const updatedAd = await Ad.findById(testAd._id);
      const dbItinerary = updatedAd.travelItinerary.id(itineraryId);
      expect(dbItinerary.destination.city).toBe(updates.destination.city);
    });

    it('should cancel a travel itinerary', async () => {
      // First, add a travel itinerary
      const itineraryData = {
        destination: {
          city: 'Bergen',
          county: 'Vestland',
          country: 'Norway',
          location: {
            type: 'Point',
            coordinates: [5.3221, 60.3913], // Bergen
          },
        },
        arrivalDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        departureDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        status: 'planned',
      };

      await testAd.addTravelItinerary(itineraryData);

      // Get the itinerary ID
      const itineraryId = testAd.travelItinerary[0]._id;

      // Cancel the itinerary
      await testAd.cancelTravelItinerary(itineraryId);

      // Verify that the itinerary was cancelled
      const cancelledItinerary = testAd.travelItinerary.id(itineraryId);
      expect(cancelledItinerary.status).toBe('cancelled');

      // Since this was the only itinerary, isTouring should be false
      expect(testAd.isTouring).toBe(false);

      // Verify that the changes were saved to the database
      const updatedAd = await Ad.findById(testAd._id);
      const dbItinerary = updatedAd.travelItinerary.id(itineraryId);
      expect(dbItinerary.status).toBe('cancelled');
      expect(updatedAd.isTouring).toBe(false);
    });

    it('should throw an error when updating a non-existent itinerary', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const updates = {
        destination: {
          city: 'Trondheim',
          county: 'Trøndelag',
        },
      };

      await expect(testAd.updateTravelItinerary(nonExistentId, updates)).rejects.toThrow(
        'Itinerary not found'
      );
    });

    it('should throw an error when cancelling a non-existent itinerary', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      await expect(testAd.cancelTravelItinerary(nonExistentId)).rejects.toThrow(
        'Itinerary not found'
      );
    });
  });
});
