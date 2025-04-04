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
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    read: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });

  chatMessageSchema.index({ sender: 1, recipient: 1 });
  chatMessageSchema.index({ createdAt: -1 });

  module.exports = mongoose.model('ChatMessage', chatMessageSchema);
}
