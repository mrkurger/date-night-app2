const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { User } = require('../users');

exports.register = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const user = new User({
      username,
      password: hashedPassword,
      role: role || 'user'
    });
    
    await user.save();
    
    // Generate token
    const token = jwt.sign(
      { _id: user._id, username: user.username, role: user.role }, 
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({ token, user: { _id: user._id, username, role: user.role } });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    passport.authenticate('local', { session: false }, (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info.message });
      
      // Update last active
      user.lastActive = new Date();
      user.online = true;
      user.save();
      
      // Generate token
      const token = jwt.sign(
        { _id: user._id, username: user.username, role: user.role }, 
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({ token, user: { _id: user._id, username: user.username, role: user.role } });
    })(req, res, next);
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    if (req.user) {
      const user = await User.findById(req.user._id);
      if (user) {
        user.online = false;
        await user.save();
      }
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

// OAuth handlers
exports.githubCallback = (req, res) => {
  const token = jwt.sign(
    { _id: req.user._id, username: req.user.username, role: req.user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  // Redirect to frontend with token
  res.redirect(`${process.env.CLIENT_URL}/auth-callback?token=${token}`);
};

exports.googleCallback = (req, res) => {
  const token = jwt.sign(
    { _id: req.user._id, username: req.user.username, role: req.user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.redirect(`${process.env.CLIENT_URL}/auth-callback?token=${token}`);
};

exports.redditCallback = (req, res) => {
  const token = jwt.sign(
    { _id: req.user._id, username: req.user.username, role: req.user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.redirect(`${process.env.CLIENT_URL}/auth-callback?token=${token}`);
};

exports.appleCallback = (req, res) => {
  const token = jwt.sign(
    { _id: req.user._id, username: req.user.username, role: req.user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.redirect(`${process.env.CLIENT_URL}/auth-callback?token=${token}`);
};
