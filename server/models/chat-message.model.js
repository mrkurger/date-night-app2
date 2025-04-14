
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for chat-message.model settings
// 
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
const mongoose = require('mongoose');

// Check if model already exists before defining
if (mongoose.models.ChatMessage) {
  module.exports = mongoose.model('ChatMessage');
} else {
  const chatMessageSchema = new mongoose.Schema({
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    roomId: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000 // Increased to accommodate encrypted content
    },
    isEncrypted: {
      type: Boolean,
      default: false
    },
    encryptionData: {
      iv: String,
      authTag: String
    },
    attachments: [{
      type: {
        type: String,
        enum: ['image', 'video', 'file'],
      },
      url: String,
      name: String,
      size: Number,
      mimeType: String,
      isEncrypted: {
        type: Boolean,
        default: false
      },
      encryptionData: {
        iv: String,
        authTag: String
      }
    }],
    read: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    },
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'file', 'system'],
      default: 'text'
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    },
    expiresAt: {
      type: Date
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
  chatMessageSchema.index({ roomId: 1, createdAt: -1 });
  chatMessageSchema.index({ sender: 1, recipient: 1 });
  chatMessageSchema.index({ recipient: 1, read: 1 });
  chatMessageSchema.index({ createdAt: -1 });

  // Virtual for checking if message is from system
  chatMessageSchema.virtual('isSystem').get(function() {
    return this.type === 'system';
  });

  // Virtual for checking if message has attachments
  chatMessageSchema.virtual('hasAttachments').get(function() {
    return this.attachments && this.attachments.length > 0;
  });

  // Method to mark message as read
  chatMessageSchema.methods.markAsRead = async function() {
    if (!this.read) {
      this.read = true;
      this.readAt = new Date();
      await this.save();
    }
    return this;
  };

  // Static method to get unread messages count for a user
  chatMessageSchema.statics.getUnreadCount = async function(userId) {
    return this.countDocuments({
      recipient: userId,
      read: false
    });
  };

  // Static method to get unread messages count by room
  chatMessageSchema.statics.getUnreadCountByRoom = async function(userId, roomId) {
    return this.countDocuments({
      recipient: userId,
      roomId,
      read: false
    });
  };

  // Static method to get recent conversations
  chatMessageSchema.statics.getRecentConversations = async function(userId) {
    // Get distinct room IDs where user is involved
    const rooms = await this.distinct('roomId', {
      $or: [
        { sender: userId },
        { recipient: userId }
      ]
    });

    // For each room, get the latest message
    const conversations = await Promise.all(rooms.map(async (roomId) => {
      const latestMessage = await this.findOne({
        roomId
      }).sort({ createdAt: -1 }).populate('sender', 'username profileImage');

      const unreadCount = await this.countDocuments({
        roomId,
        recipient: userId,
        read: false
      });

      return {
        roomId,
        latestMessage,
        unreadCount
      };
    }));

    // Sort by latest message date
    return conversations.sort((a, b) =>
      b.latestMessage.createdAt - a.latestMessage.createdAt
    );
  };

  module.exports = mongoose.model('ChatMessage', chatMessageSchema);
}
