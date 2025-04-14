
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for chat-room.model settings
// 
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
const mongoose = require('mongoose');

// Check if model already exists before defining
if (mongoose.models.ChatRoom) {
  module.exports = mongoose.model('ChatRoom');
} else {
  const chatRoomSchema = new mongoose.Schema({
    name: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['direct', 'group', 'ad'],
      default: 'direct'
    },
    participants: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      role: {
        type: String,
        enum: ['admin', 'member'],
        default: 'member'
      },
      joinedAt: {
        type: Date,
        default: Date.now
      },
      lastRead: {
        type: Date
      },
      // For E2E encryption
      publicKey: {
        type: String
      },
      encryptedRoomKey: {
        type: String
      }
    }],
    // Encryption settings
    encryptionEnabled: {
      type: Boolean,
      default: true
    },
    encryptionVersion: {
      type: Number,
      default: 1
    },
    // For message auto-deletion
    messageExpiryEnabled: {
      type: Boolean,
      default: false
    },
    messageExpiryTime: {
      type: Number, // in hours
      default: 24
    },
    ad: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ad'
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatMessage'
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }, {
    timestamps: true
  });

  // Indexes for efficient queries
  chatRoomSchema.index({ 'participants.user': 1 });
  chatRoomSchema.index({ ad: 1 });
  chatRoomSchema.index({ lastActivity: -1 });
  chatRoomSchema.index({ type: 1, isActive: 1 });

  // Virtual for checking if room is direct message
  chatRoomSchema.virtual('isDirect').get(function() {
    return this.type === 'direct';
  });

  // Virtual for checking if room is group chat
  chatRoomSchema.virtual('isGroup').get(function() {
    return this.type === 'group';
  });

  // Virtual for checking if room is ad-related
  chatRoomSchema.virtual('isAdChat').get(function() {
    return this.type === 'ad';
  });

  // Method to add participant to room
  chatRoomSchema.methods.addParticipant = async function(userId, role = 'member') {
    // Check if user is already a participant
    const isParticipant = this.participants.some(p => 
      p.user.toString() === userId.toString()
    );

    if (!isParticipant) {
      this.participants.push({
        user: userId,
        role,
        joinedAt: new Date()
      });

      await this.save();
    }

    return this;
  };

  // Method to remove participant from room
  chatRoomSchema.methods.removeParticipant = async function(userId) {
    this.participants = this.participants.filter(p => 
      p.user.toString() !== userId.toString()
    );

    await this.save();
    return this;
  };

  // Method to update last read timestamp for a participant
  chatRoomSchema.methods.updateLastRead = async function(userId) {
    const participant = this.participants.find(p => 
      p.user.toString() === userId.toString()
    );

    if (participant) {
      participant.lastRead = new Date();
      await this.save();
    }

    return this;
  };

  // Method to update last activity timestamp
  chatRoomSchema.methods.updateLastActivity = async function() {
    this.lastActivity = new Date();
    await this.save();
    return this;
  };

  // Method to update last message
  chatRoomSchema.methods.updateLastMessage = async function(messageId) {
    this.lastMessage = messageId;
    this.lastActivity = new Date();
    await this.save();
    return this;
  };

  // Static method to find or create direct message room
  chatRoomSchema.statics.findOrCreateDirectRoom = async function(user1Id, user2Id) {
    // Try to find existing direct room
    let room = await this.findOne({
      type: 'direct',
      'participants.user': { $all: [user1Id, user2Id] },
      isActive: true
    });

    // If room doesn't exist, create it
    if (!room) {
      room = new this({
        type: 'direct',
        participants: [
          { user: user1Id },
          { user: user2Id }
        ],
        createdBy: user1Id
      });

      await room.save();
    }

    return room;
  };

  // Static method to find or create ad chat room
  chatRoomSchema.statics.findOrCreateAdRoom = async function(userId, adId, advertiserId) {
    // Try to find existing ad room
    let room = await this.findOne({
      type: 'ad',
      ad: adId,
      'participants.user': { $all: [userId, advertiserId] },
      isActive: true
    });

    // If room doesn't exist, create it
    if (!room) {
      room = new this({
        type: 'ad',
        ad: adId,
        participants: [
          { user: userId },
          { user: advertiserId, role: 'admin' }
        ],
        createdBy: userId
      });

      await room.save();
    }

    return room;
  };

  // Static method to get rooms for a user
  chatRoomSchema.statics.getRoomsForUser = async function(userId) {
    return this.find({
      'participants.user': userId,
      isActive: true
    })
    .sort({ lastActivity: -1 })
    .populate('participants.user', 'username profileImage online lastActive')
    .populate('lastMessage')
    .populate('ad', 'title profileImage');
  };

  module.exports = mongoose.model('ChatRoom', chatRoomSchema);
}