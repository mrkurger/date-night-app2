// Import all models from the models directory
const User = require('../models/user.model');
const Ad = require('../models/ad.model');
const ChatMessage = require('../models/chat-message.model');

module.exports = {
  // Models (imported from models directory)
  User,
  Ad,
  ChatMessage,
  
  // Feature components
  ads: require('./ads'),
  users: require('./users'),
  chat: require('./chat')
};
