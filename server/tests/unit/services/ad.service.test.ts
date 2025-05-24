import type { jest } from '@jest/globals';
/**
 * Ad Service Unit Tests
 *
 * Tests the functionality of the ad service, which handles ad creation, retrieval,
 * updating, and deletion, as well as search and filtering operations.
 */

import { jest } from '@jest/globals';
import adService from '../../../services/ad.service.js'; // Already ESM

// Mock the models
jest.mock('../../../models/ad.model.js', () => {
  // Convert to ESM compatible mock
  const mockSave = jest.fn();
  const MockAd = jest.fn().mockImplementation(data => {
    return {
      ...data,
      save: mockSave,
    };
  });

  // Assign static methods directly to the constructor function
  MockAd.find = jest.fn();
  MockAd.findById = jest.fn();
  MockAd.findByIdAndUpdate = jest.fn();
  MockAd.findByIdAndDelete = jest.fn();
  MockAd.findOneAndUpdate = jest.fn(); // Added based on service usage
  MockAd.findOneAndDelete = jest.fn(); // Added based on service usage
  MockAd.aggregate = jest.fn();
  MockAd.countDocuments = jest.fn();
  MockAd.prototype.save = mockSave;

  // Return the constructor with static methods attached as default export for ESM
  return {
    __esModule: true,
    default: MockAd,
  };
});

jest.mock('../../../models/user.model.js', () => {
  // Convert to ESM compatible mock
  return {
    __esModule: true,
    default: {
      findById: jest.fn(),
      findOne: jest.fn(),
    },
  };
});

// Import mocked modules using ESM syntax
import Ad from '../../../models/ad.model.js'; // Added .js
import User from '../../../models/user.model.js'; // Added .js

// Get references to mocked functions (no change needed here)
const mockAdModel = Ad;
const mockUser = User; // User mock might need adjustment if static methods are used directly

describe('Ad Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllAds', () => {
    it('should return all ads', async () => {
      const mockAdsData = [{ _id: '1', title: 'Test Ad' }];
      const populateMock = jest.fn().mockResolvedValue(mockAdsData);
      mockAdModel.find.mockReturnValue({ populate: populateMock });

      const result = await adService.getAllAds();
      expect(result).toEqual(mockAdsData);
      expect(mockAdModel.find).toHaveBeenCalledWith({}); // Ensure called with default empty filter
      expect(populateMock).toHaveBeenCalledWith('advertiser', 'username');
    });

    it('should handle errors', async () => {
      // Adjust mock to simulate error in the chained call
      const populateErrorMock = jest.fn().mockRejectedValue(new Error('Database error'));
      mockAdModel.find.mockReturnValue({ populate: populateErrorMock });

      await expect(adService.getAllAds()).rejects.toThrow('Error fetching ads: Database error');
    });
  });

  describe('getAdById', () => {
    it('should return an ad by id', async () => {
      const mockAdData = { _id: '1', title: 'Test Ad' };
      const populateMock = jest.fn().mockResolvedValue(mockAdData);
      mockAdModel.findById.mockReturnValue({ populate: populateMock });

      const result = await adService.getAdById('1');
      expect(result).toEqual(mockAdData);
      expect(mockAdModel.findById).toHaveBeenCalledWith('1');
      expect(populateMock).toHaveBeenCalledWith('advertiser', 'username');
    });

    it('should throw error if ad not found', async () => {
      const populateNotFoundMock = jest.fn().mockResolvedValue(null);
      mockAdModel.findById.mockReturnValue({ populate: populateNotFoundMock });

      // The service throws 'Ad not found' *within* the try block, which becomes the cause of the final error message
      await expect(adService.getAdById('1')).rejects.toThrow('Error fetching ad: Ad not found');
    });

    it('should handle database errors', async () => {
      const populateErrorMock = jest.fn().mockRejectedValue(new Error('DB lookup failed'));
      mockAdModel.findById.mockReturnValue({ populate: populateErrorMock });

      await expect(adService.getAdById('1')).rejects.toThrow('Error fetching ad: DB lookup failed');
    });
  });

  describe('createAd', () => {
    it('should create a new ad', async () => {
      const mockAdData = { title: 'New Ad' };
      const userId = 'user1';
      const expectedAd = {
        _id: '1',
        ...mockAdData,
        advertiser: userId,
        createdAt: expect.any(Date),
      };

      mockAdModel.prototype.save.mockResolvedValue(expectedAd);

      const result = await adService.createAd(mockAdData, userId);
      expect(result).toEqual(expectedAd);
      // Check that the Ad constructor was called with the correct data
      expect(Ad).toHaveBeenCalledWith({
        ...mockAdData,
        advertiser: userId,
        createdAt: expect.any(Date),
      });
      expect(mockAdModel.prototype.save).toHaveBeenCalled();
    });

    it('should handle errors during creation', async () => {
      const mockAdData = { title: 'New Ad' };
      const userId = 'user1';

      // Mock the save method on the prototype to throw an error
      mockAdModel.prototype.save.mockRejectedValue(new Error('Database error'));

      await expect(adService.createAd(mockAdData, userId)).rejects.toThrow(
        'Error creating ad: Database error'
      );
      expect(Ad).toHaveBeenCalledWith(expect.any(Object)); // Ensure constructor was still called
    });
  });

  // Add tests for other methods like updateAd, deleteAd, getUserAds, searchAds (object params), toggleAdStatus, getAdsByUser etc.

  describe('updateAd', () => {
    it('should update an ad successfully', async () => {
      const adId = 'ad1';
      const userId = 'user1';
      const updateData = { title: 'Updated Title' };
      const mockUpdatedAd = {
        _id: adId,
        userId: userId,
        title: 'Updated Title',
        toObject: jest.fn().mockReturnThis(),
      };
      mockAdModel.findOneAndUpdate.mockResolvedValue(mockUpdatedAd);

      const result = await adService.updateAd(adId, userId, updateData);

      expect(mockAdModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: adId, userId: userId }, // Query uses userId, not advertiser
        { $set: updateData },
        { new: true }
      );
      expect(result).toEqual(mockUpdatedAd);
      expect(mockUpdatedAd.toObject).toHaveBeenCalled();
    });

    it('should return null if ad not found or user is not owner', async () => {
      mockAdModel.findOneAndUpdate.mockResolvedValue(null);
      const result = await adService.updateAd('ad1', 'user1', { title: 'Update' });
      expect(result).toBeNull();
    });

    it('should handle errors during update', async () => {
      mockAdModel.findOneAndUpdate.mockRejectedValue(new Error('DB update failed'));
      await expect(adService.updateAd('ad1', 'user1', { title: 'Update' })).rejects.toThrow(
        'Error updating ad: DB update failed'
      );
    });
  });

  describe('deleteAd', () => {
    it('should delete an ad successfully', async () => {
      const adId = 'ad1';
      const userId = 'user1';
      mockAdModel.findOneAndDelete.mockResolvedValue({ _id: adId }); // Simulate successful deletion

      const result = await adService.deleteAd(adId, userId);

      expect(mockAdModel.findOneAndDelete).toHaveBeenCalledWith({ _id: adId, userId: userId }); // Query uses userId
      expect(result).toBe(true);
    });

    it('should return false if ad not found or user is not owner', async () => {
      mockAdModel.findOneAndDelete.mockResolvedValue(null);
      const result = await adService.deleteAd('ad1', 'user1');
      expect(result).toBe(false);
    });

    it('should handle errors during deletion', async () => {
      mockAdModel.findOneAndDelete.mockRejectedValue(new Error('DB delete failed'));
      await expect(adService.deleteAd('ad1', 'user1')).rejects.toThrow(
        'Error deleting ad: DB delete failed'
      );
    });
  });

  describe('getUserAds', () => {
    it('should get ads for a specific user', async () => {
      const userId = 'user1';
      const mockAds = [
        { _id: 'ad1', userId: userId },
        { _id: 'ad2', userId: userId },
      ];
      const execMock = jest.fn().mockResolvedValue(mockAds);
      mockAdModel.find.mockReturnValue({ exec: execMock });

      const result = await adService.getUserAds(userId);

      expect(mockAdModel.find).toHaveBeenCalledWith({ userId: userId }); // Query uses userId
      expect(execMock).toHaveBeenCalled();
      expect(result).toEqual(mockAds);
    });

    it('should handle errors fetching user ads', async () => {
      const execErrorMock = jest.fn().mockRejectedValue(new Error('DB find failed'));
      mockAdModel.find.mockReturnValue({ exec: execErrorMock });

      await expect(adService.getUserAds('user1')).rejects.toThrow(
        'Error fetching user ads: DB find failed'
      );
    });
  });

  describe('searchAds', () => {
    it('should search ads with string query', async () => {
      const mockAdsData = [{ _id: '1', title: 'Test Ad' }];
      const populateMock = jest.fn().mockReturnThis(); // Mock populate to be chainable
      const sortMock = jest.fn().mockResolvedValue(mockAdsData);
      populateMock.mockReturnValue({ sort: sortMock }); // Chain sort after populate
      mockAdModel.find.mockReturnValue({ populate: populateMock }); // find returns object with populate

      const result = await adService.searchAds('Test');

      expect(mockAdModel.find).toHaveBeenCalledWith({
        $or: [
          { title: { $regex: 'Test', $options: 'i' } },
          { description: { $regex: 'Test', $options: 'i' } },
          { tags: { $in: [new RegExp('Test', 'i')] } }, // Be more specific with regex
        ],
      });
      expect(populateMock).toHaveBeenCalledWith('advertiser', 'username');
      expect(sortMock).toHaveBeenCalledWith('-createdAt');
      expect(result).toEqual(mockAdsData);
    });

    it('should search ads with object parameters and pagination', async () => {
      const searchParams = { category: 'Escort', page: 2, limit: 5 };
      const mockAdsData = [{ _id: 'ad3', category: 'Escort' }];
      const totalCount = 12;

      const execMock = jest.fn().mockResolvedValue(mockAdsData);
      const limitMock = jest.fn().mockReturnValue({ exec: execMock });
      const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
      const sortMock = jest.fn().mockReturnValue({ skip: skipMock });
      mockAdModel.find.mockReturnValue({ sort: sortMock });
      mockAdModel.countDocuments.mockResolvedValue(totalCount);

      const result = await adService.searchAds(searchParams);

      expect(mockAdModel.find).toHaveBeenCalledWith({ category: 'Escort' });
      expect(mockAdModel.countDocuments).toHaveBeenCalledWith({ category: 'Escort' });
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 }); // Default sort
      expect(skipMock).toHaveBeenCalledWith(5); // (page 2 - 1) * limit 5
      expect(limitMock).toHaveBeenCalledWith(5);
      expect(execMock).toHaveBeenCalled();
      expect(result).toEqual({
        ads: mockAdsData,
        total: totalCount,
        page: searchParams.page,
        limit: searchParams.limit,
        totalPages: 3, // Math.ceil(12 / 5)
      });
    });

    it('should handle errors during search', async () => {
      mockAdModel.find.mockImplementation(() => {
        throw new Error('Search failed');
      });
      await expect(adService.searchAds('Test')).rejects.toThrow(
        'Error searching ads: Search failed'
      );
    });
  });

  // Add tests for getCategories, getAdsByCategory, recordSwipe, toggleAdStatus, getAdsByUser

  describe('getAdStats', () => {
    it('should return ad statistics', async () => {
      const mockStatsData = { total: 5, active: 3, verified: 2 };
      mockAdModel.countDocuments.mockImplementation((query = {}) => {
        if (Object.keys(query).length === 0) return Promise.resolve(mockStatsData.total);
        if (query.active === true) return Promise.resolve(mockStatsData.active);
        if (query.verified === true) return Promise.resolve(mockStatsData.verified);
        return Promise.resolve(0);
      });

      const result = await adService.getAdStats();
      expect(result).toEqual(mockStatsData);
      expect(mockAdModel.countDocuments).toHaveBeenCalledTimes(3);
    });

    it('should handle errors', async () => {
      mockAdModel.countDocuments.mockRejectedValue(new Error('Database error'));

      await expect(adService.getAdStats()).rejects.toThrow(
        'Error fetching ad stats: Database error'
      );
    });
  });
});
