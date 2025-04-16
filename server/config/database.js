// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for configuration settings (database)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/date_night',
      {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10, // Maintain up to 10 socket connections
        family: 4, // Use IPv4, skip trying IPv6
      }
    );

    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);

    // Log when MongoDB connection is disconnected
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Log when MongoDB connection is reconnected
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    // Log MongoDB connection errors
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });

    return conn;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

/**
 * Close MongoDB connection
 * @returns {Promise<void>}
 */
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    throw err;
  }
};

module.exports = { connectDB, closeDB };
