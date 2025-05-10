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
import User from '../models/user.model.js';
import Ad from '../models/ad.model.js';
import ChatMessage from '../models/chat-message.model.js';

// TODO: Add model validation schemas
// TODO: Add model lifecycle hooks
// TODO: Add model access control
// TODO: Add model caching layer

import ads from './ads/index.js';
import users from './users/index.js';
import chat from './chat/index.js';

export default {
  // Models (imported from models directory)
  User,
  Ad,
  ChatMessage,

  // Feature components
  ads,
  users,
  chat,
};
