// Import and re-export all models from component folders
const { Ad } = require('./ads');
const { User } = require('./users');
const { ChatMessage } = require('./chat');

module.exports = {
  // Models
  Ad,
  User,
  ChatMessage,
  
  // Components (for potential future controllers/services exports)
  ads: require('./ads'),
  users: require('./users'),
  chat: require('./chat')
};
