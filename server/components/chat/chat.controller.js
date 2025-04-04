const ChatService = require('../../services/chat.service');
const { asyncHandler } = require('../../middleware/asyncHandler');

class ChatController {
  // TODO: Implement file upload functionality
  // TODO: Add message persistence for offline users
  // TODO: Add user presence tracking

  constructor() {
    // Bind methods to ensure proper 'this' context
    this.getRooms = this.getRooms.bind(this);
    this.getRoom = this.getRoom.bind(this);
    this.getMessages = this.getMessages.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.createDirectRoom = this.createDirectRoom.bind(this);
    this.createAdRoom = this.createAdRoom.bind(this);
    this.createGroupRoom = this.createGroupRoom.bind(this);
    this.markMessagesAsRead = this.markMessagesAsRead.bind(this);
    this.getUnreadCounts = this.getUnreadCounts.bind(this);
    this.leaveRoom = this.leaveRoom.bind(this);
    this.setupRoomEncryption = this.setupRoomEncryption.bind(this);
    this.updateMessageExpiry = this.updateMessageExpiry.bind(this);
  }

  /**
   * Get chat rooms for current user
   */
  getRooms = asyncHandler(async (req, res) => {
    const rooms = await ChatService.getRoomsForUser(req.user.id);
    res.status(200).json(rooms);
  });

  /**
   * Get a specific chat room
   */
  getRoom = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const room = await ChatService.getRoomById(roomId, req.user.id);
    res.status(200).json(room);
  });

  /**
   * Get messages for a chat room
   */
  getMessages = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const options = {
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
      before: req.query.before || null,
      after: req.query.after || null,
      includeSystem: req.query.includeSystem !== 'false'
    };

    const messages = await ChatService.getMessages(roomId, options);
    res.status(200).json(messages);
  });

  /**
   * Send a message to a chat room
   */
  sendMessage = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const { message, recipientId, attachments, type, metadata, isEncrypted, encryptionData } = req.body;

    const sentMessage = await ChatService.sendMessage(
      roomId,
      req.user.id,
      message,
      {
        recipientId,
        attachments,
        type,
        metadata,
        isEncrypted,
        encryptionData
      }
    );

    res.status(201).json(sentMessage);
  });

  /**
   * Create or get a direct message room
   */
  createDirectRoom = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const room = await ChatService.createDirectRoom(req.user.id, userId);
    res.status(200).json(room);
  });

  /**
   * Create or get a chat room for an ad
   */
  createAdRoom = asyncHandler(async (req, res) => {
    const { adId } = req.body;

    if (!adId) {
      return res.status(400).json({
        success: false,
        message: 'Ad ID is required'
      });
    }

    const room = await ChatService.createAdRoom(req.user.id, adId);
    res.status(200).json(room);
  });

  /**
   * Create a group chat room
   */
  createGroupRoom = asyncHandler(async (req, res) => {
    const { name, participantIds } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Group name is required'
      });
    }

    const room = await ChatService.createGroupRoom(req.user.id, name, participantIds);
    res.status(201).json(room);
  });

  /**
   * Mark messages as read in a room
   */
  markMessagesAsRead = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const result = await ChatService.markMessagesAsRead(roomId, req.user.id);
    res.status(200).json(result);
  });

  /**
   * Get unread message counts
   */
  getUnreadCounts = asyncHandler(async (req, res) => {
    const counts = await ChatService.getUnreadCounts(req.user.id);
    res.status(200).json(counts);
  });

  /**
   * Leave a group chat room
   */
  leaveRoom = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const result = await ChatService.leaveRoom(roomId, req.user.id);
    res.status(200).json(result);
  });

  /**
   * Setup room encryption
   */
  setupRoomEncryption = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const result = await ChatService.setupRoomEncryption(roomId);
    res.status(200).json(result);
  });

  /**
   * Update message expiry settings
   */
  updateMessageExpiry = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const { enabled, expiryTime } = req.body;

    if (enabled === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Enabled flag is required'
      });
    }

    const room = await ChatService.updateMessageExpiry(
      roomId,
      enabled,
      expiryTime,
      req.user.id
    );

    res.status(200).json(room);
  });
}

module.exports = new ChatController();
