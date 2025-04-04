const { User } = require('../users');
const { authenticateToken } = require('../../middleware/authenticateToken');

module.exports = function(io) {
  // Track online users
  const onlineUsers = new Map();
  
  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    
    // Reuse JWT verification logic
    const verifyJWT = (token) => {
      try {
        const jwt = require('jsonwebtoken');
        return jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return null;
      }
    };
    
    const user = verifyJWT(token);
    if (!user) {
      return next(new Error('Invalid token'));
    }
    
    socket.user = user;
    next();
  });
  
  io.on('connection', async (socket) => {
    const userId = socket.user._id;
    
    // Update user online status
    try {
      await User.findByIdAndUpdate(userId, { online: true, lastActive: new Date() });
      
      // Add to online users map
      onlineUsers.set(userId.toString(), socket.id);
      
      // Join a room with their user ID for direct messaging
      socket.join(userId.toString());
      
      // Broadcast online status
      io.emit('user_status', { userId: userId.toString(), online: true });
    } catch (err) {
      console.error('Error updating user status:', err);
    }
    
    // Handle client disconnect
    socket.on('disconnect', async () => {
      try {
        await User.findByIdAndUpdate(userId, { online: false, lastActive: new Date() });
        
        // Remove from online users map
        onlineUsers.delete(userId.toString());
        
        // Broadcast offline status
        io.emit('user_status', { userId: userId.toString(), online: false });
      } catch (err) {
        console.error('Error updating user status on disconnect:', err);
      }
    });
  });
  
  return io;
};
