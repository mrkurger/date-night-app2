// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (chat.socket)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import { User } from '../../models/user.model.js';

export default io => {
  // Store user socket mappings
  const userSockets = {};

  io.on('connection', socket => {
    console.log('New client connected');

    // User authentication via token
    socket.on('authenticate', async data => {
      try {
        const { userId } = data;

        // Store user socket mapping
        userSockets[userId] = socket.id;

        // Join room with user ID
        socket.join(userId);

        // Update user status to online
        await User.findByIdAndUpdate(userId, { online: true, lastActive: new Date() });

        // Notify others that user is online
        socket.broadcast.emit('user_status_change', { userId, online: true });

        console.log(`User ${userId} authenticated`);
      } catch (err) {
        console.error('Socket authentication error:', err);
      }
    });

    // Handle user disconnect
    socket.on('disconnect', async () => {
      try {
        // Find user ID by socket ID
        const userId = Object.keys(userSockets).find(key => userSockets[key] === socket.id);

        if (userId) {
          // Remove from socket mapping
          delete userSockets[userId];

          // Update user status to offline
          await User.findByIdAndUpdate(userId, { online: false, lastActive: new Date() });

          // Notify others that user is offline
          socket.broadcast.emit('user_status_change', { userId, online: false });

          console.log(`User ${userId} disconnected`);
        }
      } catch (err) {
        console.error('Socket disconnect error:', err);
      }
    });

    // Handle chat message
    socket.on('send_message', async data => {
      try {
        const { recipientId, message } = data;

        // If recipient is online, emit event to them
        if (userSockets[recipientId]) {
          io.to(recipientId).emit('new_message', message);
        }
      } catch (err) {
        console.error('Socket message error:', err);
      }
    });

    // Handle typing indicator
    socket.on('typing', data => {
      const { recipientId } = data;
      if (userSockets[recipientId]) {
        io.to(recipientId).emit('typing', data);
      }
    });

    // Handle stop typing indicator
    socket.on('stop_typing', data => {
      const { recipientId } = data;
      if (userSockets[recipientId]) {
        io.to(recipientId).emit('stop_typing', data);
      }
    });
  });
};
