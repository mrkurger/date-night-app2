// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for the chat attachment schema
//
// COMMON CUSTOMIZATIONS:
// - MAX_FILE_SIZE: Maximum file size in bytes (default: 10MB)
// - ALLOWED_FILE_TYPES: Array of allowed MIME types
// ===================================================

import mongoose from 'mongoose';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/zip',
];

const chatAttachmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
      enum: ALLOWED_FILE_TYPES,
    },
    size: {
      type: Number,
      required: true,
      max: MAX_FILE_SIZE,
    },
    url: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatRoom',
      required: true,
    },
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatMessage',
      required: true,
    },
    isEncrypted: {
      type: Boolean,
      default: false,
    },
    encryptionData: {
      iv: String,
      authTag: String,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: new Map(),
    },
    thumbnailUrl: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Add validation for encryption data
chatAttachmentSchema.path('encryptionData').validate(function (value) {
  if (this.isEncrypted) {
    return value && value.iv && value.authTag;
  }
  return true;
}, 'Encryption data is required when attachment is encrypted');

// Add method to validate file size
chatAttachmentSchema.methods.validateFileSize = function () {
  return this.size <= MAX_FILE_SIZE;
};

// Add method to validate file type
chatAttachmentSchema.methods.validateFileType = function () {
  return ALLOWED_FILE_TYPES.includes(this.mimeType);
};

// Automatically delete file when attachment is deleted
chatAttachmentSchema.pre('remove', async function (next) {
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), this.url);

    // Delete file if it exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete thumbnail if it exists
    if (this.thumbnailUrl) {
      const thumbPath = path.join(process.cwd(), this.thumbnailUrl);
      if (fs.existsSync(thumbPath)) {
        fs.unlinkSync(thumbPath);
      }
    }

    next();
  } catch (error) {
    console.error('Error deleting attachment file:', error);
    next(error);
  }
});

// Virtual populate messages that use this attachment
chatAttachmentSchema.virtual('messages', {
  ref: 'ChatMessage',
  localField: '_id',
  foreignField: 'attachments',
});

// Create indexes
chatAttachmentSchema.index({ roomId: 1, createdAt: -1 });
chatAttachmentSchema.index({ messageId: 1 });
chatAttachmentSchema.index({ uploadedBy: 1 });

const ChatAttachment = mongoose.model('ChatAttachment', chatAttachmentSchema);

export default ChatAttachment;
