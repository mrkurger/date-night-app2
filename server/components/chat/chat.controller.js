const { ChatMessage } = require('../');
const { User } = require('../users');

exports.getMessages = async (req, res) => {
  try {
    const { recipientId } = req.params;
    const senderId = req.user._id;
    
    // Fetch messages between the two users
    const messages = await ChatMessage.find({
      $or: [
        { sender: senderId, recipient: recipientId },
        { sender: recipientId, recipient: senderId }
      ]
    }).sort({ timestamp: 1 });
    
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, message } = req.body;
    const senderId = req.user._id;
    
    // Validate recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    
    // Create and save message
    const chatMessage = new ChatMessage({
      sender: senderId,
      recipient: recipientId,
      message,
      timestamp: new Date(),
      read: false
    });
    
    await chatMessage.save();
    
    // Emit socket event (handled by chat.socket.js)
    req.app.get('io').to(recipientId.toString()).emit('new_message', chatMessage);
    
    res.status(201).json(chatMessage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;
    
    const message = await ChatMessage.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Verify user is the recipient
    if (message.recipient.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to mark this message as read' });
    }
    
    message.read = true;
    await message.save();
    
    res.json({ message: 'Message marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const count = await ChatMessage.countDocuments({
      recipient: userId,
      read: false
    });
    
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteOldChats = function() {
  // Scheduled task for 24hr auto-deletion of chats
  // ...existing code...
};
