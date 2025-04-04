const { Ad } = require('../');
const { User } = require('../users');

exports.getAllAds = async (req, res) => {
  try {
    const ads = await Ad.find();
    res.json(ads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAdById = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ message: 'Ad not found' });
    res.json(ad);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createAd = async (req, res) => {
  try {
    const ad = new Ad({
      ...req.body,
      advertiser: req.user._id
    });
    const newAd = await ad.save();
    res.status(201).json(newAd);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ message: 'Ad not found' });
    
    // Check ownership
    if (ad.advertiser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    Object.assign(ad, req.body);
    const updatedAd = await ad.save();
    res.json(updatedAd);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ message: 'Ad not found' });
    
    // Check ownership
    if (ad.advertiser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await Ad.deleteOne({ _id: req.params.id });
    res.json({ message: 'Ad deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.searchNearby = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 10000 } = req.query;
    
    const ads = await Ad.find({
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    });
    
    res.json(ads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.filterByCounty = async (req, res) => {
  try {
    const { county } = req.params;
    const ads = await Ad.find({ county: county });
    res.json(ads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
