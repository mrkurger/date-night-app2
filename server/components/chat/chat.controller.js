const { ChatMessage } = require('./');
const { User } = require('../users');

exports.getMessages = async (req, res, next) => {
  try {
    const { recipientId } = req.params;
    
    // Get messages between current user and specified recipient
    const messages = await ChatMessage.find({
      $or: [
        { sender: req.user._id, recipient: recipientId },
        { sender: recipientId, recipient: req.user._id }
      ]
    }).sort({ timestamp: 1 });
    
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { recipientId, message } = req.body;
    
    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    
    // Create and save the message
    const chatMessage = new ChatMessage({
      sender: req.user._id,
      recipient: recipientId,
      message
    });
    
    await chatMessage.save();
    
    // Emit socket event (handled by chat.socket.js)
    req.app.get('io').to(recipientId.toString()).emit('new_message', chatMessage);
    
    res.status(201).json(chatMessage);
  } catch (err) {
    next(err);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    
    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Only recipient can mark as read
    if (message.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    message.read = true;
    await message.save();
    
    res.json({ message: 'Message marked as read' });
  } catch (err) {
    next(err);
  }
};
