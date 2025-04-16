// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for index settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
const { authenticateToken } = require('./authenticateToken');
const { errorHandler } = require('./errorHandler');

module.exports = {
  authenticateToken,
  errorHandler,
};
