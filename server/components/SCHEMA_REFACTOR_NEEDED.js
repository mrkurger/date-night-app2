
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (SCHEMA_REFACTOR_NEEDED)
// 
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
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
  county: String // <-- new field for county
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Make optional for OAuth
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
  travelPlan: { type: [String], default: [] } // <-- new field for advertisers' travel plans
});

const chatMessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

adSchema.index({ coordinates: '2dsphere' });

// Check if models already exist before defining
const getModel = (name, schema) => {
  return mongoose.models[name] ? mongoose.model(name) : mongoose.model(name, schema);
};

module.exports = {
  Ad: getModel('Ad', adSchema),
  User: getModel('User', userSchema),
  ChatMessage: getModel('ChatMessage', chatMessageSchema)
};
