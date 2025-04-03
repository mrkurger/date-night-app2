const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const RedditStrategy = require('passport-reddit').Strategy;
const AppleStrategy = require('passport-apple');
const { User } = require('../models');
const config = require('../config/oauth');
const jwt = require('jsonwebtoken');
const { normalizeProfile, createUniqueUsername } = require('./helpers');

function generateJWT(user) {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
}

async function findOrCreateUser(profile, provider) {
  try {
    const query = { [`socialProfiles.${provider}.id`]: profile.id };
    let user = await User.findOne(query);
    
    if (!user) {
      const normalizedProfile = await normalizeProfile(profile, provider);
      const username = await createUniqueUsername(normalizedProfile.username);
      
      user = await User.create({
        username,
        role: 'user',
        email: normalizedProfile.email,
        socialProfiles: {
          [provider]: { 
            id: profile.id,
            email: normalizedProfile.email
          }
        }
      });
    }
    
    // Update last active
    user.lastActive = new Date();
    user.online = true;
    await user.save();
    
    return user;
  } catch (error) {
    console.error('Error in findOrCreateUser:', error);
    throw error;
  }
}

passport.use(new GitHubStrategy(config.github,
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await findOrCreateUser(profile, 'github');
      return done(null, user);
    } catch (err) {
      console.error('Error in GitHubStrategy:', err);
      return done(err, null);
    }
  }
));

passport.use(new GoogleStrategy(config.google,
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await findOrCreateUser(profile, 'google');
      return done(null, user);
    } catch (err) {
      console.error('Error in GoogleStrategy:', err);
      return done(err, null);
    }
  }
));

passport.use(new RedditStrategy(config.reddit,
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await findOrCreateUser(profile, 'reddit');
      return done(null, user);
    } catch (err) {
      console.error('Error in RedditStrategy:', err);
      return done(err, null);
    }
  }
));

passport.use(new AppleStrategy(config.apple,
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      const user = await findOrCreateUser(profile, 'apple');
      return done(null, user);
    } catch (err) {
      console.error('Error in AppleStrategy:', err);
      return done(err, null);
    }
  }
));

module.exports = { passport, generateJWT };
