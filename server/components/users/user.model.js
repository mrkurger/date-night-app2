const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Optional for OAuth
  role: { type: String, enum: ['user', 'advertiser'], required: true },
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
  online: { type: Boolean, default: false },
  socialProfiles: {
    github: { id: String },
    google: { id: String },
    reddit: { id: String },
    apple: { id: String }
  },
  travelPlan: { type: [String], default: [] } // Field for advertisers' travel plans
});

module.exports = mongoose.model('User', userSchema);
