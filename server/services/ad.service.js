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
}

module.exports = new AdService();
