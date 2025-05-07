// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for safety-checkin.model settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import mongoose from 'mongoose';

// Define the safety check-in schema
const safetyCheckinSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    meetingWith: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    clientName: {
      type: String,
      trim: true,
    },
    clientContact: {
      type: String,
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: String,
      locationName: String,
      city: String,
      county: String,
    },
    startTime: {
      type: Date,
      required: true,
    },
    expectedEndTime: {
      type: Date,
      required: true,
    },
    actualEndTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['scheduled', 'active', 'completed', 'missed', 'emergency'],
      default: 'scheduled',
    },
    checkInReminders: [
      {
        scheduledTime: Date,
        sent: {
          type: Boolean,
          default: false,
        },
        sentAt: Date,
      },
    ],
    emergencyContacts: [
      {
        name: String,
        phone: String,
        email: String,
        relationship: String,
        notified: {
          type: Boolean,
          default: false,
        },
        notifiedAt: Date,
      },
    ],
    safetyNotes: {
      type: String,
      maxlength: 1000,
    },
    safetyCode: {
      type: String,
      select: false, // Extra security to not return this in normal queries
    },
    distressCode: {
      type: String,
      select: false, // Extra security to not return this in normal queries
    },
    checkInMethod: {
      type: String,
      enum: ['app', 'sms', 'email'],
      default: 'app',
    },
    checkInResponses: [
      {
        time: Date,
        response: {
          type: String,
          enum: ['safe', 'need_more_time', 'distress'],
        },
        location: {
          type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
          },
          coordinates: [Number], // [longitude, latitude]
        },
      },
    ],
    autoCheckInSettings: {
      enabled: {
        type: Boolean,
        default: false,
      },
      intervalMinutes: {
        type: Number,
        default: 30,
      },
      missedCheckInsBeforeAlert: {
        type: Number,
        default: 2,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Add geospatial index for location-based queries
safetyCheckinSchema.index({ location: '2dsphere' });

// Add index for finding check-ins by user
safetyCheckinSchema.index({ user: 1, status: 1, startTime: 1 });

// Add index for finding active check-ins
safetyCheckinSchema.index({ status: 1, expectedEndTime: 1 });

// Pre-save middleware to update the updatedAt field
safetyCheckinSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Method to start a check-in
safetyCheckinSchema.methods.startCheckin = async function () {
  if (this.status !== 'scheduled') {
    throw new Error('Check-in must be in scheduled status to start');
  }

  this.status = 'active';

  // Schedule check-in reminders
  const now = new Date();
  const duration = this.expectedEndTime - now;

  // Schedule reminders at 1/3 and 2/3 of the meeting duration
  if (duration > 30 * 60 * 1000) {
    // If meeting is longer than 30 minutes
    this.checkInReminders = [
      {
        scheduledTime: new Date(now.getTime() + duration / 3),
        sent: false,
      },
      {
        scheduledTime: new Date(now.getTime() + (duration * 2) / 3),
        sent: false,
      },
    ];
  } else {
    // For shorter meetings, just one reminder halfway through
    this.checkInReminders = [
      {
        scheduledTime: new Date(now.getTime() + duration / 2),
        sent: false,
      },
    ];
  }

  return this.save();
};

// Method to complete a check-in
safetyCheckinSchema.methods.completeCheckin = async function () {
  if (this.status !== 'active' && this.status !== 'scheduled') {
    throw new Error('Check-in must be in active or scheduled status to complete');
  }

  this.status = 'completed';
  this.actualEndTime = new Date();

  return this.save();
};

// Method to record a check-in response
safetyCheckinSchema.methods.recordResponse = async function (response, coordinates = null) {
  if (this.status !== 'active') {
    throw new Error('Check-in must be in active status to record a response');
  }

  const checkInResponse = {
    time: new Date(),
    response,
  };

  if (coordinates) {
    checkInResponse.location = {
      type: 'Point',
      coordinates,
    };
  }

  this.checkInResponses.push(checkInResponse);

  // If distress signal, update status
  if (response === 'distress') {
    this.status = 'emergency';
  } else if (response === 'need_more_time') {
    // Extend expected end time by 30 minutes
    this.expectedEndTime = new Date(this.expectedEndTime.getTime() + 30 * 60 * 1000);

    // Add another reminder
    this.checkInReminders.push({
      scheduledTime: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
      sent: false,
    });
  }

  return this.save();
};

// Method to mark a check-in as missed
safetyCheckinSchema.methods.markAsMissed = async function () {
  if (this.status !== 'active') {
    throw new Error('Check-in must be in active status to mark as missed');
  }

  this.status = 'missed';

  return this.save();
};

// Method to trigger emergency protocol
safetyCheckinSchema.methods.triggerEmergency = async function () {
  this.status = 'emergency';

  return this.save();
};

// Method to notify emergency contacts
safetyCheckinSchema.methods.notifyEmergencyContacts = async function () {
  if (this.status !== 'emergency' && this.status !== 'missed') {
    throw new Error('Check-in must be in emergency or missed status to notify contacts');
  }

  const now = new Date();

  // Update all emergency contacts as notified
  this.emergencyContacts.forEach(contact => {
    contact.notified = true;
    contact.notifiedAt = now;
  });

  return this.save();
};

// Method to add an emergency contact
safetyCheckinSchema.methods.addEmergencyContact = async function (contactData) {
  this.emergencyContacts.push(contactData);

  return this.save();
};

// Method to remove an emergency contact
safetyCheckinSchema.methods.removeEmergencyContact = async function (contactId) {
  this.emergencyContacts = this.emergencyContacts.filter(
    contact => contact._id.toString() !== contactId.toString()
  );

  return this.save();
};

// Method to update check-in details
safetyCheckinSchema.methods.updateDetails = async function (updates) {
  if (this.status !== 'scheduled') {
    throw new Error('Only scheduled check-ins can be updated');
  }

  // Update fields if provided
  if (updates.meetingWith) this.meetingWith = updates.meetingWith;
  if (updates.clientName) this.clientName = updates.clientName;
  if (updates.clientContact) this.clientContact = updates.clientContact;
  if (updates.location) this.location = updates.location;
  if (updates.startTime) this.startTime = updates.startTime;
  if (updates.expectedEndTime) this.expectedEndTime = updates.expectedEndTime;
  if (updates.safetyNotes) this.safetyNotes = updates.safetyNotes;
  if (updates.checkInMethod) this.checkInMethod = updates.checkInMethod;
  if (updates.autoCheckInSettings) this.autoCheckInSettings = updates.autoCheckInSettings;

  return this.save();
};

// Static method to find active check-ins
safetyCheckinSchema.statics.findActiveCheckins = function () {
  return this.find({
    status: 'active',
  }).populate('user', 'username email phone');
};

// Static method to find check-ins requiring attention
safetyCheckinSchema.statics.findCheckinsRequiringAttention = function () {
  const now = new Date();

  return this.find({
    $or: [
      // Active check-ins that have passed their expected end time
      {
        status: 'active',
        expectedEndTime: { $lt: now },
      },
      // Check-ins in emergency status
      {
        status: 'emergency',
      },
      // Missed check-ins
      {
        status: 'missed',
      },
    ],
  }).populate('user', 'username email phone');
};

// Static method to find upcoming check-ins for a user
safetyCheckinSchema.statics.findUpcomingCheckins = function (userId) {
  const now = new Date();

  return this.find({
    user: userId,
    status: 'scheduled',
    startTime: { $gt: now },
  }).sort({ startTime: 1 });
};

// Static method to find check-ins with pending reminders
safetyCheckinSchema.statics.findCheckinsWithPendingReminders = function () {
  const now = new Date();

  return this.find({
    status: 'active',
    'checkInReminders.scheduledTime': { $lt: now },
    'checkInReminders.sent': false,
  });
};

const SafetyCheckin = mongoose.model('SafetyCheckin', safetyCheckinSchema);
export default SafetyCheckin;
