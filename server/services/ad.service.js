// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for service configuration (ad.service)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
const Ad = require('../models/ad.model');

class AdService {
  // TODO: Add caching layer for performance
  // TODO: Implement search functionality with filters
  // TODO: Add recommendation engine based on user preferences
  // TODO: Add analytics tracking for ad performance
  // TODO: Implement ad moderation workflow
  async getAllAds(filters = {}) {
    try {
      return await Ad.find(filters).populate('advertiser', 'username');
    } catch (error) {
      throw new Error('Error fetching ads: ' + error.message);
    }
  }

  async getAdById(adId) {
    try {
      const ad = await Ad.findById(adId).populate('advertiser', 'username');
      if (!ad) throw new Error('Ad not found');
      return ad;
    } catch (error) {
      throw new Error('Error fetching ad: ' + error.message);
    }
  }

  async createAd(adData, userId) {
    try {
      const ad = new Ad({
        ...adData,
        advertiser: userId,
        createdAt: new Date(),
      });
      return await ad.save();
    } catch (error) {
      throw new Error('Error creating ad: ' + error.message);
    }
  }

  async getRandomAds(limit) {
    try {
      return await Ad.aggregate([
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
    } catch (error) {
      throw new Error('Error fetching random ads: ' + error.message);
    }
  }

  async getCategories() {
    return ['Escort', 'Striptease', 'Massage'];
  }

  async getAdsByCategory(category) {
    try {
      return await Ad.find({ category }).populate('advertiser', 'username').sort('-createdAt');
    } catch (error) {
      throw new Error('Error fetching category ads: ' + error.message);
    }
  }

  /**
   * Record a user's swipe action on an ad
   * @param {Object} swipeData - Data about the swipe action
   * @returns {boolean} Success indicator
   */
  async recordSwipe(swipeData) {
    // This is a stub implementation for testing
    // In a real implementation, we would save the swipe data to the database

    // Log the swipe data for debugging purposes
    console.log('Recording swipe:', swipeData);

    // Return success after processing
    return true;
  }

  /**
   * Update an ad
   * @param {string} adId - Ad ID
   * @param {string} userId - User ID (must be the ad owner)
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated ad
   */
  async updateAd(adId, userId, updateData) {
    try {
      const updatedAd = await Ad.findOneAndUpdate(
        { _id: adId, userId: userId },
        { $set: updateData },
        { new: true }
      );

      if (!updatedAd) return null;
      return updatedAd.toObject();
    } catch (error) {
      throw new Error('Error updating ad: ' + error.message);
    }
  }

  /**
   * Delete an ad
   * @param {string} adId - Ad ID
   * @param {string} userId - User ID (must be the ad owner)
   * @returns {Promise<boolean>} True if deleted, false if not found or not owner
   */
  async deleteAd(adId, userId) {
    try {
      const result = await Ad.findOneAndDelete({
        _id: adId,
        userId: userId,
      });

      return !!result;
    } catch (error) {
      throw new Error('Error deleting ad: ' + error.message);
    }
  }

  /**
   * Get all ads for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of ads
   */
  async getUserAds(userId) {
    try {
      const query = Ad.find({ userId: userId });
      return await query.exec();
    } catch (error) {
      throw new Error('Error fetching user ads: ' + error.message);
    }
  }

  /**
   * Search ads with filters
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} Object containing ads and pagination info
   */
  async searchAds(searchParams) {
    try {
      const query = {};
      const page = searchParams.page || 1;
      const limit = searchParams.limit || 10;
      const skip = (page - 1) * limit;

      // Apply search filters
      if (searchParams.title) {
        query.title = { $regex: searchParams.title, $options: 'i' };
      }

      if (searchParams.category) {
        query.category = searchParams.category;
      }

      if (searchParams.location) {
        query.location = { $regex: searchParams.location, $options: 'i' };
      }

      if (searchParams.minPrice) {
        query.price = { ...query.price, $gte: searchParams.minPrice };
      }

      if (searchParams.maxPrice) {
        query.price = { ...query.price, $lte: searchParams.maxPrice };
      }

      if (searchParams.active !== undefined) {
        query.active = searchParams.active;
      }

      // Execute query
      const adsQuery = Ad.find(query)
        .sort(searchParams.sort || { createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Get total count for pagination
      const total = await Ad.countDocuments(query);
      const ads = await adsQuery.exec();

      return {
        ads,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new Error('Error searching ads: ' + error.message);
    }
  }

  /**
   * Toggle ad status (active/inactive)
   * @param {string} adId - Ad ID
   * @param {string} userId - User ID (must be the ad owner)
   * @returns {Promise<Object>} Updated ad
   */
  async toggleAdStatus(adId, userId) {
    try {
      const ad = await Ad.findOne({ _id: adId, userId: userId });

      if (!ad) return null;

      ad.active = !ad.active;
      await ad.save();

      return ad.toObject();
    } catch (error) {
      throw new Error('Error toggling ad status: ' + error.message);
    }
  }
}

module.exports = new AdService();
