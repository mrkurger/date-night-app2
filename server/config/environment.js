// Load environment variables based on NODE_ENV
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
