const express = require('express');
const router = express.Router();

const adRoutes = require('../components/ads/ad.routes');
const authRoutes = require('../components/auth/auth.routes');
const chatRoutes = require('../components/chat/chat.routes');
const userRoutes = require('../components/users/user.routes');

router.use('/ads', adRoutes);
router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/users', userRoutes);

module.exports = router;
