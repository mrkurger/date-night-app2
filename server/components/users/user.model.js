// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (user.model)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
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
    apple: { id: String },
  },
  travelPlan: { type: [String], default: [] }, // Field for advertisers' travel plans
});

module.exports = mongoose.model('User', userSchema);
