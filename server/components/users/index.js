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
import routes from './user.routes.js';
import controller from './user.controller.js';
import User from '../../models/user.model.js';

export { routes, controller, User };
