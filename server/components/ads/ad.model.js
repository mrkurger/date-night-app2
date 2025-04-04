const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  title: String,
  description: String,
  contact: String,
  location: String,
  datePosted: { type: Date, default: Date.now },
  coordinates: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  advertiser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  profileImage: { type: String, default: '/assets/images/default-profile.jpg' },
  county: String // <-- field for county
});

// Create spatial index for location-based queries
adSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Ad', adSchema);
