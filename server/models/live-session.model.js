import mongoose from 'mongoose';

/**
 * Live Session Schema for paid live streaming sessions
 */
const liveSessionSchema = new mongoose.Schema(
  {
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    pricePerMinute: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'BTC', 'ETH'],
    },
    status: {
      type: String,
      required: true,
      enum: ['scheduled', 'live', 'ended', 'cancelled'],
      default: 'scheduled',
    },
    scheduledStartTime: {
      type: Date,
      required: true,
    },
    actualStartTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    maxViewers: {
      type: Number,
      default: 100,
      min: 1,
    },
    currentViewers: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    viewers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        leftAt: {
          type: Date,
        },
        totalPaid: {
          type: Number,
          default: 0,
          min: 0,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    category: {
      type: String,
      enum: ['entertainment', 'education', 'fitness', 'music', 'gaming', 'lifestyle', 'other'],
      default: 'entertainment',
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    recordingEnabled: {
      type: Boolean,
      default: false,
    },
    recordingUrl: {
      type: String,
    },
    streamKey: {
      type: String,
      unique: true,
    },
    rtmpUrl: {
      type: String,
    },
    playbackUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
liveSessionSchema.index({ hostId: 1, status: 1 });
liveSessionSchema.index({ scheduledStartTime: 1 });
liveSessionSchema.index({ status: 1, scheduledStartTime: 1 });
liveSessionSchema.index({ 'viewers.userId': 1 });

// Virtual for session duration
liveSessionSchema.virtual('duration').get(function () {
  if (this.actualStartTime && this.endTime) {
    return Math.floor((this.endTime - this.actualStartTime) / 1000 / 60); // in minutes
  }
  return 0;
});

// Virtual for average viewers
liveSessionSchema.virtual('averageViewers').get(function () {
  if (this.viewers.length === 0) return 0;
  return Math.round(this.viewers.length / 2); // Simplified calculation
});

// Methods
liveSessionSchema.methods.addViewer = function (userId) {
  const existingViewer = this.viewers.find(v => v.userId.toString() === userId.toString());
  if (!existingViewer) {
    this.viewers.push({ userId, joinedAt: new Date(), isActive: true });
    this.currentViewers += 1;
  } else if (!existingViewer.isActive) {
    existingViewer.isActive = true;
    existingViewer.joinedAt = new Date();
    this.currentViewers += 1;
  }
  return this.save();
};

liveSessionSchema.methods.removeViewer = function (userId) {
  const viewer = this.viewers.find(v => v.userId.toString() === userId.toString());
  if (viewer && viewer.isActive) {
    viewer.isActive = false;
    viewer.leftAt = new Date();
    this.currentViewers = Math.max(0, this.currentViewers - 1);
  }
  return this.save();
};

liveSessionSchema.methods.startSession = function () {
  this.status = 'live';
  this.actualStartTime = new Date();
  return this.save();
};

liveSessionSchema.methods.endSession = function () {
  this.status = 'ended';
  this.endTime = new Date();
  this.currentViewers = 0;
  // Mark all active viewers as inactive
  this.viewers.forEach(viewer => {
    if (viewer.isActive) {
      viewer.isActive = false;
      viewer.leftAt = new Date();
    }
  });
  return this.save();
};

const LiveSession = mongoose.model('LiveSession', liveSessionSchema);

export default LiveSession;
