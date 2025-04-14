// Load environment variables based on NODE_ENV
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for environment configuration
// 
// COMMON CUSTOMIZATIONS:
// - port: Server port number (default: 3000 for development, 3001 for test)
//   Related to: server/server.js:app.listen
// - mongoUri: MongoDB connection string (default: mongodb://localhost:27017/datenight_dev for development)
//   Related to: server/config/database.js:mongoose.connect
// - jwtSecret: Secret for JWT token generation (default: dev_jwt_secret for development)
//   Related to: server/services/auth.service.js:jwt.sign
// - sessionSecret: Secret for session management (default: dev_session_secret for development)
//   Related to: server/middleware/session.js
// - clientUrl: URL for client application (default: http://localhost:4200)
//   Related to: server/config/cors.js:origin
// ===================================================
const environment = process.env.NODE_ENV || 'development';

const config = {
  development: {
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/datenight_dev',
    jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret',
    sessionSecret: process.env.SESSION_SECRET || 'dev_session_secret',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:4200' // Updated default Angular port
  },
  test: {
    port: process.env.PORT || 3001,
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/datenight_test',
    jwtSecret: process.env.JWT_SECRET || 'test_jwt_secret',
    sessionSecret: process.env.SESSION_SECRET || 'test_session_secret',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:4200'
  },
  production: {
    port: process.env.PORT,
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    sessionSecret: process.env.SESSION_SECRET,
    clientUrl: process.env.CLIENT_URL
  }
};

module.exports = config[environment];
