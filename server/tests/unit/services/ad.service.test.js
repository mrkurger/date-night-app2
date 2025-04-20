/**
 * Ad Service Unit Tests
 *
 * Tests the functionality of the ad service, which handles ad creation, retrieval,
 * updating, and deletion, as well as search and filtering operations.
 */

import { jest } from '@jest/globals';
import adService from '../../../services/ad.service.js';

// Mock the models
jest.mock('../../../models/ad.model.js', () => {
  const mockSave = jest.fn();
  const MockAd = function (data) {
    return {
      ...data,
      save: mockSave,
    };
  };
  MockAd.find = jest.fn();
  MockAd.findById = jest.fn();
  MockAd.findByIdAndUpdate = jest.fn();
  MockAd.findByIdAndDelete = jest.fn();
  MockAd.aggregate = jest.fn();
  MockAd.countDocuments = jest.fn();
  MockAd.prototype.save = mockSave;

  return {
    __esModule: true,
    default: MockAd,
  };
});

jest.mock('../../../models/user.model.js', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}));

// Import mocked modules
import Ad from '../../../models/ad.model.js';
import User from '../../../models/user.model.js';

// Get references to mocked functions
const mockAdModel = Ad;
const mockUser = User;

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
      expect(mockAdModel.find).toHaveBeenCalled();
      expect(populateMock).toHaveBeenCalledWith('advertiser', 'username');
    });

    it('should handle errors', async () => {
      mockAdModel.find.mockImplementation(() => {
        throw new Error('Database error');
      });

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
      const populateMock = jest.fn().mockResolvedValue(null);
      mockAdModel.findById.mockReturnValue({ populate: populateMock });

      await expect(adService.getAdById('1')).rejects.toThrow('Error fetching ad: Ad not found');
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
      expect(mockAdModel.prototype.save).toHaveBeenCalled();
    });

    it('should handle errors during creation', async () => {
      const mockAdData = { title: 'New Ad' };
      const userId = 'user1';

      mockAdModel.prototype.save.mockRejectedValue(new Error('Database error'));

      await expect(adService.createAd(mockAdData, userId)).rejects.toThrow(
        'Error creating ad: Database error'
      );
    });
  });

  describe('searchAds', () => {
    it('should search ads with string query', async () => {
      const mockAdsData = [{ _id: '1', title: 'Test Ad' }];
      const populateMock = jest
        .fn()
        .mockReturnValue({ sort: jest.fn().mockResolvedValue(mockAdsData) });
      mockAdModel.find.mockReturnValue({ populate: populateMock });

      const result = await adService.searchAds('Test');
      expect(result).toEqual(mockAdsData);
      expect(mockAdModel.find).toHaveBeenCalledWith({
        $or: [
          { title: { $regex: 'Test', $options: 'i' } },
          { description: { $regex: 'Test', $options: 'i' } },
          { tags: { $in: [expect.any(RegExp)] } },
        ],
      });
    });
  });

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
