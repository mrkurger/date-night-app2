const Ad = require('../models/ad.model');

class AdService {
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
        createdAt: new Date()
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
        { $lookup: {
          from: 'users',
          localField: 'advertiser',
          foreignField: '_id',
          as: 'advertiser'
        }},
        { $unwind: '$advertiser' }
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
      return await Ad.find({ category })
        .populate('advertiser', 'username')
        .sort('-createdAt');
    } catch (error) {
      throw new Error('Error fetching category ads: ' + error.message);
    }
  }

  async recordSwipe(swipeData) {
    try {
      const { adId, direction, userId } = swipeData;
      return true;
    } catch (error) {
      throw new Error('Error recording swipe: ' + error.message);
    }
  }
}

module.exports = new AdService();
