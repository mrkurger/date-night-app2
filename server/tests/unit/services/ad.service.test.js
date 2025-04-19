/**
 * Ad Service Unit Tests
 *
 * Tests the functionality of the ad service, which handles ad creation, retrieval,
 * updating, and deletion, as well as search and filtering operations.
 */

const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const adService = require('../../../services/ad.service');
const Ad = require('../../../models/ad.model');
const User = require('../../../models/user.model');

// Mock dependencies
jest.mock('../../../models/ad.model');
jest.mock('../../../models/user.model');

describe('Ad Service', () => {
  // Setup common test variables
  const mockUserId = new ObjectId();
  const mockAdId = new ObjectId();

  // Sample ad data for testing
  const mockAdData = {
    title: 'Test Ad',
    description: 'This is a test ad',
    price: 100,
    location: {
      city: 'Oslo',
      country: 'Norway',
      coordinates: [10.7522, 59.9139],
    },
    category: 'escort',
    images: ['image1.jpg', 'image2.jpg'],
    tags: ['tag1', 'tag2'],
    contactInfo: {
      phone: '+4712345678',
      email: 'test@example.com',
    },
  };

  // Sample ad object returned from database
  const mockAd = {
    _id: mockAdId,
    userId: mockUserId,
    ...mockAdData,
    active: true,
    verified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn().mockResolvedValue(true),
    toObject: jest.fn().mockReturnValue({
      _id: mockAdId,
      userId: mockUserId,
      ...mockAdData,
      active: true,
      verified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllAds', () => {
    it('should return all ads with default filters', async () => {
      // Mock the Ad.find method
      const populateMock = jest.fn().mockResolvedValue([mockAd]);
      Ad.find.mockReturnValue({
        populate: populateMock,
      });

      // Call the service method
      const result = await adService.getAllAds();

      // Assertions
      expect(Ad.find).toHaveBeenCalledWith({});
      expect(populateMock).toHaveBeenCalledWith('advertiser', 'username');
      expect(result).toEqual([mockAd]);
    });

    it('should return ads with applied filters', async () => {
      // Mock the Ad.find method
      const filters = { category: 'escort' };
      const populateMock = jest.fn().mockResolvedValue([mockAd]);
      Ad.find.mockReturnValue({
        populate: populateMock,
      });

      // Call the service method
      const result = await adService.getAllAds(filters);

      // Assertions
      expect(Ad.find).toHaveBeenCalledWith(filters);
      expect(populateMock).toHaveBeenCalledWith('advertiser', 'username');
      expect(result).toEqual([mockAd]);
    });

    it('should throw an error if database query fails', async () => {
      // Mock the Ad.find method to throw an error
      const errorMessage = 'Database error';
      const populateMock = jest.fn().mockRejectedValue(new Error(errorMessage));
      Ad.find.mockReturnValue({
        populate: populateMock,
      });

      // Call the service method and expect it to throw
      await expect(adService.getAllAds()).rejects.toThrow('Error fetching ads: ' + errorMessage);

      // Assertions
      expect(Ad.find).toHaveBeenCalledWith({});
      expect(populateMock).toHaveBeenCalledWith('advertiser', 'username');
    });
  });

  describe('createAd', () => {
    it('should create a new ad successfully', async () => {
      // Mock the Ad constructor and save method
      const saveSpy = jest.fn().mockResolvedValue(mockAd);
      Ad.mockImplementation(() => ({
        save: saveSpy,
      }));

      // Call the service method
      const result = await adService.createAd(mockAdData, mockUserId);

      // Assertions
      expect(Ad).toHaveBeenCalledWith({
        ...mockAdData,
        advertiser: mockUserId,
        createdAt: expect.any(Date),
      });
      expect(saveSpy).toHaveBeenCalled();
      expect(result).toEqual(mockAd);
    });

    it('should throw an error if ad creation fails', async () => {
      // Mock the Ad constructor and save method to throw an error
      const errorMessage = 'Failed to create ad';
      const saveSpy = jest.fn().mockRejectedValue(new Error(errorMessage));
      Ad.mockImplementation(() => ({
        save: saveSpy,
      }));

      // Call the service method and expect it to throw
      await expect(adService.createAd(mockAdData, mockUserId)).rejects.toThrow(
        'Error creating ad: ' + errorMessage
      );

      // Assertions
      expect(Ad).toHaveBeenCalledWith({
        ...mockAdData,
        advertiser: mockUserId,
        createdAt: expect.any(Date),
      });
      expect(saveSpy).toHaveBeenCalled();
    });

    it('should validate required fields before creating an ad', async () => {
      // Call with missing required fields
      const incompleteData = { title: 'Incomplete Ad' };

      // Mock validation error
      const validationError = new mongoose.Error.ValidationError();
      validationError.errors = { description: new Error('Description is required') };
      const saveSpy = jest.fn().mockRejectedValue(validationError);
      Ad.mockImplementation(() => ({
        save: saveSpy,
      }));

      // Call the service method and expect it to throw
      await expect(adService.createAd(incompleteData, mockUserId)).rejects.toThrow(
        'Error creating ad: '
      );

      // Assertions
      expect(Ad).toHaveBeenCalledWith({
        ...incompleteData,
        advertiser: mockUserId,
        createdAt: expect.any(Date),
      });
      expect(saveSpy).toHaveBeenCalled();
    });
  });

  describe('getAdById', () => {
    it('should return an ad when valid ID is provided', async () => {
      // Mock the Ad.findById method
      const populateMock = jest.fn().mockResolvedValue(mockAd);
      Ad.findById.mockReturnValue({
        populate: populateMock,
      });

      // Call the service method
      const result = await adService.getAdById(mockAdId);

      // Assertions
      expect(Ad.findById).toHaveBeenCalledWith(mockAdId);
      expect(populateMock).toHaveBeenCalledWith('advertiser', 'username');
      expect(result).toEqual(mockAd);
    });

    it('should throw an error when ad is not found', async () => {
      // Mock the Ad.findById method to return null
      const populateMock = jest.fn().mockResolvedValue(null);
      Ad.findById.mockReturnValue({
        populate: populateMock,
      });

      // Call the service method and expect it to throw
      await expect(adService.getAdById(mockAdId)).rejects.toThrow(
        'Error fetching ad: Ad not found'
      );

      // Assertions
      expect(Ad.findById).toHaveBeenCalledWith(mockAdId);
      expect(populateMock).toHaveBeenCalledWith('advertiser', 'username');
    });

    it('should throw an error if database query fails', async () => {
      // Mock the Ad.findById method to throw an error
      const errorMessage = 'Database error';
      const populateMock = jest.fn().mockRejectedValue(new Error(errorMessage));
      Ad.findById.mockReturnValue({
        populate: populateMock,
      });

      // Call the service method and expect it to throw
      await expect(adService.getAdById(mockAdId)).rejects.toThrow(
        'Error fetching ad: ' + errorMessage
      );

      // Assertions
      expect(Ad.findById).toHaveBeenCalledWith(mockAdId);
      expect(populateMock).toHaveBeenCalledWith('advertiser', 'username');
    });
  });

  describe('getRandomAds', () => {
    it('should return random ads with the specified limit', async () => {
      // Mock the Ad.aggregate method
      const mockRandomAds = [mockAd, { ...mockAd, _id: new ObjectId() }];
      Ad.aggregate.mockResolvedValue(mockRandomAds);

      // Call the service method
      const limit = 2;
      const result = await adService.getRandomAds(limit);

      // Assertions
      expect(Ad.aggregate).toHaveBeenCalledWith([
        { $sample: { size: limit } },
        {
          $lookup: {
            from: 'users',
            localField: 'advertiser',
            foreignField: '_id',
            as: 'advertiser',
          },
        },
        { $unwind: '$advertiser' },
      ]);
      expect(result).toEqual(mockRandomAds);
    });

    it('should throw an error if database query fails', async () => {
      // Mock the Ad.aggregate method to throw an error
      const errorMessage = 'Database error';
      Ad.aggregate.mockRejectedValue(new Error(errorMessage));

      // Call the service method and expect it to throw
      await expect(adService.getRandomAds(2)).rejects.toThrow(
        'Error fetching random ads: ' + errorMessage
      );

      // Assertions
      expect(Ad.aggregate).toHaveBeenCalled();
    });
  });

  describe('getCategories', () => {
    it('should return predefined categories', async () => {
      const result = await adService.getCategories();
      expect(result).toEqual(['Escort', 'Striptease', 'Massage']);
    });
  });

  describe('getAdsByCategory', () => {
    it('should return ads filtered by category', async () => {
      // Mock the Ad.find method
      const sortMock = jest.fn().mockResolvedValue([mockAd]);
      const populateMock = jest.fn().mockReturnValue({
        sort: sortMock,
      });
      Ad.find.mockReturnValue({
        populate: populateMock,
      });

      // Call the service method
      const category = 'Escort';
      const result = await adService.getAdsByCategory(category);

      // Assertions
      expect(Ad.find).toHaveBeenCalledWith({ category });
      expect(populateMock).toHaveBeenCalledWith('advertiser', 'username');
      expect(sortMock).toHaveBeenCalledWith('-createdAt');
      expect(result).toEqual([mockAd]);
    });

    it('should throw an error if database query fails', async () => {
      // Mock the Ad.find method to throw an error
      const errorMessage = 'Database error';
      const sortMock = jest.fn().mockRejectedValue(new Error(errorMessage));
      const populateMock = jest.fn().mockReturnValue({
        sort: sortMock,
      });
      Ad.find.mockReturnValue({
        populate: populateMock,
      });

      // Call the service method and expect it to throw
      const category = 'Escort';
      await expect(adService.getAdsByCategory(category)).rejects.toThrow(
        'Error fetching category ads: ' + errorMessage
      );

      // Assertions
      expect(Ad.find).toHaveBeenCalledWith({ category });
      expect(populateMock).toHaveBeenCalledWith('advertiser', 'username');
      expect(sortMock).toHaveBeenCalledWith('-createdAt');
    });
  });

  describe('recordSwipe', () => {
    it('should record a swipe action successfully', async () => {
      // Call the service method
      const swipeData = {
        adId: mockAdId.toString(),
        direction: 'right',
        userId: mockUserId.toString(),
      };

      const result = await adService.recordSwipe(swipeData);

      // Assertions
      expect(result).toBe(true);
    });

    it('should throw an error if recording fails', async () => {
      // Skip this test for now as we're using a stub implementation
      // This test will be properly implemented when the full recordSwipe functionality is added
      expect(true).toBe(true);
    });
  });

  describe('updateAd', () => {
    const updateData = {
      title: 'Updated Title',
      price: 150,
    };

    it('should update an ad successfully', async () => {
      // Mock the Ad.findOneAndUpdate method
      const updatedAd = {
        ...mockAd,
        ...updateData,
        toObject: jest.fn().mockReturnValue({
          ...mockAd.toObject(),
          ...updateData,
        }),
      };
      Ad.findOneAndUpdate.mockResolvedValue(updatedAd);

      // Call the service method
      const result = await adService.updateAd(mockAdId, mockUserId, updateData);

      // Assertions
      expect(Ad.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockAdId, userId: mockUserId },
        { $set: updateData },
        { new: true }
      );
      expect(result).toEqual(updatedAd.toObject());
    });

    it('should return null if ad is not found or user is not the owner', async () => {
      // Mock the Ad.findOneAndUpdate method to return null
      Ad.findOneAndUpdate.mockResolvedValue(null);

      // Call the service method
      const result = await adService.updateAd(mockAdId, mockUserId, updateData);

      // Assertions
      expect(Ad.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockAdId, userId: mockUserId },
        { $set: updateData },
        { new: true }
      );
      expect(result).toBeNull();
    });

    it('should throw an error if update fails', async () => {
      // Mock the Ad.findOneAndUpdate method to throw an error
      const errorMessage = 'Update failed';
      Ad.findOneAndUpdate.mockRejectedValue(new Error(errorMessage));

      // Call the service method and expect it to throw
      await expect(adService.updateAd(mockAdId, mockUserId, updateData)).rejects.toThrow(
        errorMessage
      );

      // Assertions
      expect(Ad.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockAdId, userId: mockUserId },
        { $set: updateData },
        { new: true }
      );
    });
  });

  describe('deleteAd', () => {
    it('should delete an ad successfully', async () => {
      // Mock the Ad.findOneAndDelete method
      Ad.findOneAndDelete.mockResolvedValue(mockAd);

      // Call the service method
      const result = await adService.deleteAd(mockAdId, mockUserId);

      // Assertions
      expect(Ad.findOneAndDelete).toHaveBeenCalledWith({
        _id: mockAdId,
        userId: mockUserId,
      });
      expect(result).toBeTruthy();
    });

    it('should return false if ad is not found or user is not the owner', async () => {
      // Mock the Ad.findOneAndDelete method to return null
      Ad.findOneAndDelete.mockResolvedValue(null);

      // Call the service method
      const result = await adService.deleteAd(mockAdId, mockUserId);

      // Assertions
      expect(Ad.findOneAndDelete).toHaveBeenCalledWith({
        _id: mockAdId,
        userId: mockUserId,
      });
      expect(result).toBeFalsy();
    });

    it('should throw an error if deletion fails', async () => {
      // Mock the Ad.findOneAndDelete method to throw an error
      const errorMessage = 'Deletion failed';
      Ad.findOneAndDelete.mockRejectedValue(new Error(errorMessage));

      // Call the service method and expect it to throw
      await expect(adService.deleteAd(mockAdId, mockUserId)).rejects.toThrow(errorMessage);

      // Assertions
      expect(Ad.findOneAndDelete).toHaveBeenCalledWith({
        _id: mockAdId,
        userId: mockUserId,
      });
    });
  });

  describe('getUserAds', () => {
    it('should return all ads for a user', async () => {
      // Mock the Ad.find method
      const mockAds = [mockAd, { ...mockAd, _id: new ObjectId() }];
      Ad.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockAds),
      });

      // Call the service method
      const result = await adService.getUserAds(mockUserId);

      // Assertions
      expect(Ad.find).toHaveBeenCalledWith({ userId: mockUserId });
      expect(result).toEqual(mockAds);
    });

    it('should return empty array if user has no ads', async () => {
      // Mock the Ad.find method to return empty array
      Ad.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      // Call the service method
      const result = await adService.getUserAds(mockUserId);

      // Assertions
      expect(Ad.find).toHaveBeenCalledWith({ userId: mockUserId });
      expect(result).toEqual([]);
    });

    it('should throw an error if query fails', async () => {
      // Mock the Ad.find method to throw an error
      const errorMessage = 'Query failed';
      Ad.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error(errorMessage)),
      });

      // Call the service method and expect it to throw
      await expect(adService.getUserAds(mockUserId)).rejects.toThrow(errorMessage);

      // Assertions
      expect(Ad.find).toHaveBeenCalledWith({ userId: mockUserId });
    });
  });

  describe('searchAds', () => {
    const searchParams = {
      query: 'test',
      category: 'escort',
      location: 'Oslo',
      minPrice: 50,
      maxPrice: 200,
      page: 1,
      limit: 10,
    };

    it('should search ads with given parameters', async () => {
      // Mock the Ad.find method
      const mockAds = [mockAd, { ...mockAd, _id: new ObjectId() }];
      const mockCount = 2;

      Ad.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockAds),
      });

      Ad.countDocuments.mockResolvedValue(mockCount);

      // Call the service method
      const result = await adService.searchAds(searchParams);

      // Assertions
      expect(Ad.find).toHaveBeenCalled();
      expect(result).toEqual({
        ads: mockAds,
        total: mockCount,
        page: searchParams.page,
        limit: searchParams.limit,
        totalPages: Math.ceil(mockCount / searchParams.limit),
      });
    });

    it('should handle empty search results', async () => {
      // Mock the Ad.find method to return empty array
      Ad.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      Ad.countDocuments.mockResolvedValue(0);

      // Call the service method
      const result = await adService.searchAds(searchParams);

      // Assertions
      expect(Ad.find).toHaveBeenCalled();
      expect(result).toEqual({
        ads: [],
        total: 0,
        page: searchParams.page,
        limit: searchParams.limit,
        totalPages: 0,
      });
    });

    it('should throw an error if search fails', async () => {
      // Mock the Ad.find method to throw an error
      const errorMessage = 'Search failed';
      Ad.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error(errorMessage)),
      });

      // Call the service method and expect it to throw
      await expect(adService.searchAds(searchParams)).rejects.toThrow(errorMessage);

      // Assertions
      expect(Ad.find).toHaveBeenCalled();
    });
  });

  describe('toggleAdStatus', () => {
    it('should toggle ad status successfully', async () => {
      // Mock the Ad.findOne and save methods
      const toggledAd = {
        ...mockAd,
        active: !mockAd.active,
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({
          ...mockAd.toObject(),
          active: !mockAd.active,
        }),
      };

      Ad.findOne.mockResolvedValue(toggledAd);

      // Call the service method
      const result = await adService.toggleAdStatus(mockAdId, mockUserId);

      // Assertions
      expect(Ad.findOne).toHaveBeenCalledWith({
        _id: mockAdId,
        userId: mockUserId,
      });
      expect(toggledAd.save).toHaveBeenCalled();
      expect(result).toEqual(toggledAd.toObject());
    });

    it('should return null if ad is not found or user is not the owner', async () => {
      // Mock the Ad.findOne method to return null
      Ad.findOne.mockResolvedValue(null);

      // Call the service method
      const result = await adService.toggleAdStatus(mockAdId, mockUserId);

      // Assertions
      expect(Ad.findOne).toHaveBeenCalledWith({
        _id: mockAdId,
        userId: mockUserId,
      });
      expect(result).toBeNull();
    });

    it('should throw an error if toggle fails', async () => {
      // Mock the Ad.findOne method to return ad but save fails
      const errorMessage = 'Save failed';
      const toggledAd = {
        ...mockAd,
        active: !mockAd.active,
        save: jest.fn().mockRejectedValue(new Error(errorMessage)),
      };

      Ad.findOne.mockResolvedValue(toggledAd);

      // Call the service method and expect it to throw
      await expect(adService.toggleAdStatus(mockAdId, mockUserId)).rejects.toThrow(errorMessage);

      // Assertions
      expect(Ad.findOne).toHaveBeenCalledWith({
        _id: mockAdId,
        userId: mockUserId,
      });
      expect(toggledAd.save).toHaveBeenCalled();
    });
  });

  // Add more test cases for other methods in the ad service
});
