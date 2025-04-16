/**
 * Chat Encryption Controller
 *
 * Handles the server-side operations for end-to-end encryption in the chat system.
 * This controller manages public key registration, room key distribution, and other
 * encryption-related operations.
 *
 * Note: The server never has access to the actual decryption keys or plaintext messages.
 * It only stores and distributes encrypted keys and messages.
 */

const mongoose = require('mongoose');
const User = require('../../models/user.model');
const ChatRoom = require('../../models/chat-room.model');
const ChatMessage = require('../../models/chat-message.model');
const logger = require('../../utils/logger');
const { validateObjectId } = require('../../utils/validation');
const { errorResponse, successResponse } = require('../../utils/response');

/**
 * Register a user's public key
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.registerPublicKey = async (req, res) => {
  try {
    const { publicKey } = req.body;
    const userId = req.user.id;

    if (!publicKey) {
      return errorResponse(res, 'Public key is required', 400);
    }

    // Update the user's public key
    await User.findByIdAndUpdate(userId, {
      'encryption.publicKey': publicKey,
      'encryption.keyRegisteredAt': new Date(),
    });

    logger.info(`User ${userId} registered a public key`);
    return successResponse(res, { success: true });
  } catch (error) {
    logger.error('Error registering public key:', error);
    return errorResponse(res, 'Failed to register public key', 500);
  }
};

/**
 * Set up encryption for a chat room
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.setupRoomEncryption = async (req, res) => {
  try {
    const { roomId } = req.body;
    const userId = req.user.id;

    if (!validateObjectId(roomId)) {
      return errorResponse(res, 'Invalid room ID', 400);
    }

    // Get the chat room
    const chatRoom = await ChatRoom.findById(roomId);
    if (!chatRoom) {
      return errorResponse(res, 'Chat room not found', 404);
    }

    // Check if the user is a participant in the room
    if (!chatRoom.participants.includes(userId)) {
      return errorResponse(res, 'You are not a participant in this chat room', 403);
    }

    // Update the room's encryption settings
    chatRoom.encryption = {
      enabled: true,
      enabledBy: userId,
      enabledAt: new Date(),
    };

    await chatRoom.save();

    logger.info(`User ${userId} enabled encryption for room ${roomId}`);
    return successResponse(res, { success: true });
  } catch (error) {
    logger.error('Error setting up room encryption:', error);
    return errorResponse(res, 'Failed to set up room encryption', 500);
  }
};

/**
 * Disable encryption for a chat room
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.disableRoomEncryption = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    if (!validateObjectId(roomId)) {
      return errorResponse(res, 'Invalid room ID', 400);
    }

    // Get the chat room
    const chatRoom = await ChatRoom.findById(roomId);
    if (!chatRoom) {
      return errorResponse(res, 'Chat room not found', 404);
    }

    // Check if the user is a participant in the room
    if (!chatRoom.participants.includes(userId)) {
      return errorResponse(res, 'You are not a participant in this chat room', 403);
    }

    // Update the room's encryption settings
    chatRoom.encryption = {
      enabled: false,
      disabledBy: userId,
      disabledAt: new Date(),
    };

    await chatRoom.save();

    logger.info(`User ${userId} disabled encryption for room ${roomId}`);
    return successResponse(res, { success: true });
  } catch (error) {
    logger.error('Error disabling room encryption:', error);
    return errorResponse(res, 'Failed to disable room encryption', 500);
  }
};

/**
 * Store an encrypted room key for a participant
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.storeRoomKey = async (req, res) => {
  try {
    const { roomId, participantId, encryptedKey } = req.body;
    const userId = req.user.id;

    if (!validateObjectId(roomId) || !validateObjectId(participantId)) {
      return errorResponse(res, 'Invalid room ID or participant ID', 400);
    }

    if (!encryptedKey) {
      return errorResponse(res, 'Encrypted key is required', 400);
    }

    // Get the chat room
    const chatRoom = await ChatRoom.findById(roomId);
    if (!chatRoom) {
      return errorResponse(res, 'Chat room not found', 404);
    }

    // Check if the user is a participant in the room
    if (!chatRoom.participants.includes(userId)) {
      return errorResponse(res, 'You are not a participant in this chat room', 403);
    }

    // Check if the target user is a participant in the room
    if (!chatRoom.participants.includes(participantId)) {
      return errorResponse(res, 'Target user is not a participant in this chat room', 403);
    }

    // Store the encrypted key
    // First, check if we already have a key entry for this participant
    const keyIndex = chatRoom.encryptedKeys.findIndex(
      key => key.participantId.toString() === participantId
    );

    if (keyIndex >= 0) {
      // Update existing key
      chatRoom.encryptedKeys[keyIndex].encryptedKey = encryptedKey;
      chatRoom.encryptedKeys[keyIndex].updatedAt = new Date();
    } else {
      // Add new key
      chatRoom.encryptedKeys.push({
        participantId,
        encryptedKey,
        createdBy: userId,
        createdAt: new Date(),
      });
    }

    await chatRoom.save();

    logger.info(
      `User ${userId} stored an encrypted key for participant ${participantId} in room ${roomId}`
    );
    return successResponse(res, { success: true });
  } catch (error) {
    logger.error('Error storing room key:', error);
    return errorResponse(res, 'Failed to store room key', 500);
  }
};

/**
 * Get the encrypted room key for the current user
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRoomKey = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    if (!validateObjectId(roomId)) {
      return errorResponse(res, 'Invalid room ID', 400);
    }

    // Get the chat room
    const chatRoom = await ChatRoom.findById(roomId);
    if (!chatRoom) {
      return errorResponse(res, 'Chat room not found', 404);
    }

    // Check if the user is a participant in the room
    if (!chatRoom.participants.includes(userId)) {
      return errorResponse(res, 'You are not a participant in this chat room', 403);
    }

    // Check if encryption is enabled for this room
    if (!chatRoom.encryption || !chatRoom.encryption.enabled) {
      return errorResponse(res, 'Encryption is not enabled for this chat room', 400);
    }

    // Find the encrypted key for this user
    const keyEntry = chatRoom.encryptedKeys.find(key => key.participantId.toString() === userId);

    if (!keyEntry) {
      return errorResponse(res, 'No encryption key found for this user', 404);
    }

    logger.info(`User ${userId} retrieved their encrypted key for room ${roomId}`);
    return successResponse(res, { encryptedKey: keyEntry.encryptedKey });
  } catch (error) {
    logger.error('Error getting room key:', error);
    return errorResponse(res, 'Failed to get room key', 500);
  }
};

/**
 * Get the public keys of all participants in a room
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRoomParticipantKeys = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    if (!validateObjectId(roomId)) {
      return errorResponse(res, 'Invalid room ID', 400);
    }

    // Get the chat room
    const chatRoom = await ChatRoom.findById(roomId);
    if (!chatRoom) {
      return errorResponse(res, 'Chat room not found', 404);
    }

    // Check if the user is a participant in the room
    if (!chatRoom.participants.includes(userId)) {
      return errorResponse(res, 'You are not a participant in this chat room', 403);
    }

    // Get the public keys of all participants
    const participants = await User.find(
      { _id: { $in: chatRoom.participants } },
      'encryption.publicKey'
    );

    // Format the response
    const participantKeys = {};
    participants.forEach(participant => {
      if (participant.encryption && participant.encryption.publicKey) {
        participantKeys[participant._id.toString()] = participant.encryption.publicKey;
      }
    });

    logger.info(`User ${userId} retrieved participant keys for room ${roomId}`);
    return successResponse(res, { participantKeys });
  } catch (error) {
    logger.error('Error getting participant keys:', error);
    return errorResponse(res, 'Failed to get participant keys', 500);
  }
};

/**
 * Get the encryption status of a room
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRoomEncryptionStatus = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    if (!validateObjectId(roomId)) {
      return errorResponse(res, 'Invalid room ID', 400);
    }

    // Get the chat room
    const chatRoom = await ChatRoom.findById(roomId);
    if (!chatRoom) {
      return errorResponse(res, 'Chat room not found', 404);
    }

    // Check if the user is a participant in the room
    if (!chatRoom.participants.includes(userId)) {
      return errorResponse(res, 'You are not a participant in this chat room', 403);
    }

    // Get the encryption status
    const encryptionEnabled = chatRoom.encryption && chatRoom.encryption.enabled;

    // Check if all participants have public keys
    const participants = await User.find(
      { _id: { $in: chatRoom.participants } },
      'encryption.publicKey'
    );

    const allParticipantsHaveKeys = participants.every(
      participant => participant.encryption && participant.encryption.publicKey
    );

    // Check if the current user has a key for this room
    const hasRoomKey = chatRoom.encryptedKeys.some(key => key.participantId.toString() === userId);

    logger.info(`User ${userId} checked encryption status for room ${roomId}`);
    return successResponse(res, {
      encryptionEnabled,
      allParticipantsHaveKeys,
      hasRoomKey,
    });
  } catch (error) {
    logger.error('Error getting encryption status:', error);
    return errorResponse(res, 'Failed to get encryption status', 500);
  }
};
