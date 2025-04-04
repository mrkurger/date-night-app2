const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const GitHubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const RedditStrategy = require('passport-reddit').Strategy;
const AppleStrategy = require('passport-apple');
const bcrypt = require('bcrypt');
const { User } = require('../components/users');
const config = require('./environment');

// Local Strategy (username/password)
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      
      if (!user) {
        return done(null, false, { message: 'Incorrect username or password' });
      }
      
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect username or password' });
      }
      
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwtSecret
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await User.findById(payload._id);
    
    if (user) {
      return done(null, user);
    }
    
    return done(null, false);
  } catch (err) {
    return done(err, false);
  }
}));

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL || 'http://localhost:3000'}/auth/github/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ 'socialProfiles.github.id': profile.id });
        
        if (!user) {
          // Create new user
          user = new User({
            username: `gh_${profile.id}`,
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
    }
  ));
}

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL || 'http://localhost:3000'}/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ 'socialProfiles.google.id': profile.id });
        
        if (!user) {
          // Create new user
          user = new User({
            username: `g_${profile.id}`,
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
    }
  ));
}

// Reddit OAuth Strategy
if (process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET) {
  passport.use(new RedditStrategy(
    {
      clientID: process.env.REDDIT_CLIENT_ID,
      clientSecret: process.env.REDDIT_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL || 'http://localhost:3000'}/auth/reddit/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ 'socialProfiles.reddit.id': profile.id });
        
        if (!user) {
          // Create new user
          user = new User({
            username: `r_${profile.id}`,
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
    }
  ));
}

// Apple OAuth Strategy
if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID) {
  passport.use(new AppleStrategy(
    {
      clientID: process.env.APPLE_CLIENT_ID,
      teamID: process.env.APPLE_TEAM_ID,
      keyID: process.env.APPLE_KEY_ID,
      privateKeyLocation: process.env.APPLE_PRIVATE_KEY_LOCATION,
      callbackURL: `${process.env.SERVER_URL || 'http://localhost:3000'}/auth/apple/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ 'socialProfiles.apple.id': profile.id });
        
        if (!user) {
          // Create new user
          user = new User({
            username: `a_${profile.id}`,
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
    }
  ));
}

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
