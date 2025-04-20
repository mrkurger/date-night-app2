// Export user component parts for easier imports
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (index)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================

module.exports = {
  routes: require('./user.routes'),
  controller: require('./user.controller'),
  model: require('../../models/user.model'), // Export the model directly if needed
};
