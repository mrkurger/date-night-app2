// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for configuration settings (index)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
const environment = require('./environment');
const database = require('./database');

// Export environment directly to maintain compatibility with existing code
module.exports = environment;
