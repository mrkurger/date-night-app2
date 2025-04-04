// Import all models from the models directory
const User = require('../models/user.model');
const Ad = require('../models/ad.model');
const ChatMessage = require('../models/chat-message.model');

// TODO: Add model validation schemas
// TODO: Add model lifecycle hooks
// TODO: Add model access control
// TODO: Add model caching layer

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
