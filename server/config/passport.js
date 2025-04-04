const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const GitHubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const RedditStrategy = require('passport-reddit').Strategy;
const AppleStrategy = require('passport-apple').Strategy;
const bcrypt = require('bcrypt');
const { User } = require('../components/users');

// Local Strategy (username/password)
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      // Find the user
      const user = await User.findOne({ username });
      if (!user) {
        return done(null, false, { message: 'Invalid username or password' });
      }
      
      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Invalid username or password' });
      }
      
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// JWT Strategy
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}, async (payload, done) => {
  try {
    const user = await User.findById(payload._id);
    if (!user) {
      return done(null, false);
    }
    return done(null, user);
  } catch (err) {
    return done(err, false);
  }
}));

// GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.SERVER_URL + '/auth/github/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists
    let user = await User.findOne({ 'socialProfiles.github.id': profile.id });
    
    if (!user) {
      // Create new user
      user = new User({
        username: `github_${profile.id}`,
        role: 'user',
        socialProfiles: {
          github: { id: profile.id }
        }
      });
      await user.save();
    }
    
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.SERVER_URL + '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists
    let user = await User.findOne({ 'socialProfiles.google.id': profile.id });
    
    if (!user) {
      // Create new user
      user = new User({
        username: `google_${profile.id}`,
        role: 'user',
        socialProfiles: {
          google: { id: profile.id }
        }
      });
      await user.save();
    }
    
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// Reddit Strategy
passport.use(new RedditStrategy({
  clientID: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  callbackURL: process.env.SERVER_URL + '/auth/reddit/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists
    let user = await User.findOne({ 'socialProfiles.reddit.id': profile.id });
    
    if (!user) {
      // Create new user
      user = new User({
        username: `reddit_${profile.id}`,
        role: 'user',
        socialProfiles: {
          reddit: { id: profile.id }
        }
      });
      await user.save();
    }
    
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// Apple Strategy
passport.use(new AppleStrategy({
  clientID: process.env.APPLE_CLIENT_ID,
  teamID: process.env.APPLE_TEAM_ID,
  callbackURL: process.env.SERVER_URL + '/auth/apple/callback',
  keyID: process.env.APPLE_KEY_ID,
  privateKeyLocation: process.env.APPLE_PRIVATE_KEY_LOCATION
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists
    let user = await User.findOne({ 'socialProfiles.apple.id': profile.id });
    
    if (!user) {
      // Create new user
      user = new User({
        username: `apple_${profile.id}`,
        role: 'user',
        socialProfiles: {
          apple: { id: profile.id }
        }
      });
      await user.save();
    }
    
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
