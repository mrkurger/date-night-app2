const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../users');
const passport = require('passport');

exports.register = async (req, res) => {
  try {
    const { username, password, role = 'user' } = req.body;
    
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const user = new User({
      username,
      password: hashedPassword,
      role: ['user', 'advertiser'].includes(role) ? role : 'user'
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { _id: user._id, username: user.username, role: user.role }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({ token, user: { 
      _id: user._id, 
      username: user.username, 
      role: user.role 
    }});
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    passport.authenticate('local', { session: false }, (err, user, info) => {
      if (err) return res.status(500).json({ message: err.message });
      if (!user) return res.status(401).json({ message: info.message });
      
      // Generate JWT token
      const token = jwt.sign(
        { _id: user._id, username: user.username, role: user.role }, 
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Update last active status
      user.lastActive = new Date();
      user.online = true;
      user.save();
      
      res.json({ token, user: { 
        _id: user._id, 
        username: user.username, 
        role: user.role 
      }});
    })(req, res);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    // Update user status if authenticated
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        online: false,
        lastActive: new Date()
      });
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Social login handlers
exports.githubCallback = (req, res) => {
  const token = jwt.sign(
    { _id: req.user._id, username: req.user.username, role: req.user.role }, 
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  // Redirect to frontend with token
  res.redirect(`${process.env.CLIENT_URL}/auth-callback?token=${token}`);
};

exports.googleCallback = exports.githubCallback;
exports.redditCallback = exports.githubCallback;
exports.appleCallback = exports.githubCallback;
