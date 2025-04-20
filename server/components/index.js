// Import all models from the models directory
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (index)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import User from '../models/user.model';
import Ad from '../models/ad.model';
import ChatMessage from '../models/chat-message.model';

// TODO: Add model validation schemas
// TODO: Add model lifecycle hooks
// TODO: Add model access control
// TODO: Add model caching layer

export default {
  // Models (imported from models directory)
  User,
  Ad,
  ChatMessage,

  // Feature components
  ads: require('./ads'),
  users: require('./users'),
  chat: require('./chat'),
};
