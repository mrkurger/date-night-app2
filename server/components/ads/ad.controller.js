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
}

module.exports = new AdController();
