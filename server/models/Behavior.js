const mongoose = require('mongoose');

const BehaviorSchema = new mongoose.Schema({
  deviceFingerprint: {
    visitorId: String,
    components: Object,
  },
  behaviorData: [
    {
      type: String,
      x: Number,
      y: Number,
      url: String,
      timestamp: Date,
    },
  ],
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Behavior', BehaviorSchema);
