const ChatMessage = require('../models/chat-message.model');
const User = require('../models/user.model');

class ChatService {
  constructor(io) {
    this.io = io;
  }

  async getMessages(userId, recipientId, limit = 50) {
    try {
      return await ChatMessage.find({
        $or: [
          { sender: userId, recipient: recipientId },
          { sender: recipientId, recipient: userId }
        ]
      })
      .sort('-createdAt')
      .limit(limit)
      .populate('sender recipient', 'username');
    } catch (error) {
      throw new Error('Error fetching messages: ' + error.message);
    }
  }

  async sendMessage(senderId, recipientId, content) {
    try {
      const message = new ChatMessage({
        sender: senderId,
        recipient: recipientId,
        content,
        createdAt: new Date()
      });
      await message.save();
      
      this.io.to(recipientId).emit('new_message', message);
      return message;
    } catch (error) {
      throw new Error('Error sending message: ' + error.message);
    }
  }
}

module.exports = ChatService;
