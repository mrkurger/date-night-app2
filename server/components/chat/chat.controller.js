const ChatService = require('../../services/chat.service');

class ChatController {
  // TODO: Add message encryption for privacy
  // TODO: Implement file upload functionality
  // TODO: Add message persistence for offline users
  // TODO: Add user presence tracking
  // TODO: Implement group chat functionality

  constructor() {
    // Bind methods to ensure proper 'this' context
    this.getMessages = this.getMessages.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.markAsRead = this.markAsRead.bind(this);
  }

  async getMessages(req, res) {
    try {
      const messages = await ChatService.getMessages(
        req.user.id,
        req.params.recipientId
      );
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async sendMessage(req, res) {
    try {
      const message = await ChatService.sendMessage(
        req.user.id,
        req.body.recipientId,
        req.body.content
      );
      res.json(message);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async markAsRead(req, res) {
    try {
      await ChatService.markAsRead(req.params.messageId);
      res.sendStatus(200);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new ChatController();
