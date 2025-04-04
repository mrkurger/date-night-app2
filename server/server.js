require('dotenv').config();
const express = require('express');
const helmet = require('helmet'); // Added for security
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Ad, User, ChatMessage } = require('./models');
const { passport, generateJWT } = require('./auth/passport');

// Validate required environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'REDDIT_CLIENT_ID',
  'REDDIT_CLIENT_SECRET'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Update JWT_SECRET to use environment variable
const JWT_SECRET = process.env.JWT_SECRET;

// initialize express app
const app = express();

// Use Helmet to set secure HTTP headers
app.use(helmet());

// Enhance CORS configuration (review origin per deployment)
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:8080',
  credentials: true
}));

app.use(bodyParser.json());

// Verify static file serving
app.use(express.static(path.join(__dirname, 'client')));

// Add a test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// MongoDB connection with error handling
mongoose.connect('mongodb://127.0.0.1:27017/travelling_fortune_tellers', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

// Initialize Passport
app.use(passport.initialize());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Enhanced registration endpoint
app.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      password: hashedPassword,
      role
    });
    
    await user.save();
    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, username: user.username, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protect ad creation
app.post('/ads', authenticateToken, async (req, res) => {
  try {
    const ad = new Ad(req.body);
    await ad.save();
    res.status(201).json(ad);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Endpoint to get all ads
app.get('/ads', async (req, res) => {
  try {
    const ads = await Ad.find();
    res.json(ads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// New endpoint for proximity search
app.get('/ads/nearby', async (req, res) => {
  try {
    const { longitude, latitude } = req.query;
    const coords = [parseFloat(longitude), parseFloat(latitude)];

    // Get online users
    const onlineUsers = await User.find({ 
      online: true, 
      lastActive: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Active in last 5 minutes
    });

    // Find ads sorted by distance
    const ads = await Ad.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: coords },
          distanceField: 'distance',
          spherical: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'advertiser',
          foreignField: '_id',
          as: 'advertiserInfo'
        }
      },
      {
        $addFields: {
          advertiserOnline: {
            $in: ['$advertiser', onlineUsers.map(u => u._id)]
          }
        }
      },
      {
        $sort: {
          advertiserOnline: -1,
          distance: 1
        }
      }
    ]);

    res.json(ads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user's online status
app.post('/users/status', authenticateToken, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      lastActive: new Date(),
      online: req.body.online
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// New endpoint to save travel plan for advertisers
app.post('/users/travelPlan', authenticateToken, async (req, res) => {
  if (req.user.role !== 'advertiser') {
    return res.status(403).json({ error: 'Only advertisers can save travel plan' });
  }
  const { travelPlan } = req.body; // expected an array of county names
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { travelPlan },
      { new: true }
    );
    res.json({ success: true, travelPlan: updatedUser.travelPlan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Chat endpoints
app.get('/chat/:userId', authenticateToken, async (req, res) => {
  try {
    const messages = await ChatMessage.find({
      $or: [
        { sender: req.user.id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user.id }
      ]
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/chat/:userId', authenticateToken, async (req, res) => {
  try {
    const message = new ChatMessage({
      sender: req.user.id,
      recipient: req.params.userId,
      message: req.body.message
    });
    await message.save();
    res.json(message);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get unread message count
app.get('/chat/unread', authenticateToken, async (req, res) => {
  try {
    const count = await ChatMessage.countDocuments({
      recipient: req.user.id,
      read: false
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark messages as read
app.post('/chat/:userId/read', authenticateToken, async (req, res) => {
  try {
    await ChatMessage.updateMany(
      { 
        sender: req.params.userId,
        recipient: req.user.id,
        read: false
      },
      { read: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get chat preview list
app.get('/chat/previews', authenticateToken, async (req, res) => {
  try {
    const chats = await ChatMessage.aggregate([
      {
        $match: {
          $or: [
            { sender: mongoose.Types.ObjectId(req.user.id) },
            { recipient: mongoose.Types.ObjectId(req.user.id) }
          ]
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', mongoose.Types.ObjectId(req.user.id)] },
              '$recipient',
              '$sender'
            ]
          },
          lastMessage: { $first: '$message' },
          timestamp: { $first: '$timestamp' },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ['$recipient', mongoose.Types.ObjectId(req.user.id)] },
                    { $eq: ['$read', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      }
    ]);
    
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// OAuth Routes
function handleOAuthCallback(req, res) {
  const token = generateJWT(req.user);
  res.redirect(`/?token=${token}`);
}

// GitHub
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
app.get('/auth/github/callback',
  passport.authenticate('github', { session: false }),
  handleOAuthCallback
);

// Google
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
app.get('/auth/google/callback',
  passport.authenticate('google', { session: false }),
  handleOAuthCallback
);

// Reddit
app.get('/auth/reddit',
  passport.authenticate('reddit', { scope: ['identity'] })
);
app.get('/auth/reddit/callback',
  passport.authenticate('reddit', { session: false }),
  handleOAuthCallback
);

// Apple
app.get('/auth/apple',
  passport.authenticate('apple', { scope: ['email', 'name'] })
);
app.get('/auth/apple/callback',
  passport.authenticate('apple', { session: false }),
  handleOAuthCallback
);

// Global error handler to avoid leaking sensitive error details
app.use((err, req, res, next) => {
  console.error('Internal error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start the server with port fallback
const startServer = (port) => {
  try {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is busy, trying ${port + 1}...`);
        startServer(port + 1);
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

// Cleanup on exit
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  mongoose.connection.close();
  process.exit(0);
});

// Replace the existing server start code with this:
const PORT = process.env.PORT || 3000;
startServer(PORT);
