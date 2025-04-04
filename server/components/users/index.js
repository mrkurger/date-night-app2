// Export the User model for easier imports
const User = require('../../models/user.model');

module.exports = {
  routes: require('./user.routes'),
  controller: require('./user.controller')
};
