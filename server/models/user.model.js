const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Check if model already exists before defining
if (mongoose.models.User) {
  module.exports = mongoose.model('User');
} else {
  const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['user', 'advertiser'],
      default: 'user'
    },
    album: [String],
    online: {
      type: Boolean,
      default: false
    },
    lastActive: {
      type: Date,
      default: Date.now
    },
    travelPlan: [String],
    socialProfiles: {
      github: { id: String },
      google: { id: String },
      reddit: { id: String },
      apple: { id: String }
    }
  });

  userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  });

  module.exports = mongoose.model('User', userSchema);
}
