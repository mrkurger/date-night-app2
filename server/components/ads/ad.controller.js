const adService = require('../../services/ad.service');

class AdController {
  async getAllAds(req, res) {
    try {
      const ads = await adService.getAllAds(req.query);
      res.json(ads);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAdById(req, res) {
    try {
      const ad = await adService.getAdById(req.params.adId);
      res.json(ad);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async createAd(req, res) {
    try {
      const ad = await adService.createAd(req.body, req.user.id);
      res.status(201).json(ad);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getSwipeAds(req, res) {
    try {
      const ads = await adService.getRandomAds(10); // Get 10 random ads
      res.json(ads);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCategories(req, res) {
    try {
      const categories = await adService.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAdsByCategory(req, res) {
    try {
      const ads = await adService.getAdsByCategory(req.params.category);
      res.json(ads);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async recordSwipe(req, res) {
    try {
      await adService.recordSwipe(req.body);
      res.status(201).json({ message: 'Swipe recorded' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new AdController();
