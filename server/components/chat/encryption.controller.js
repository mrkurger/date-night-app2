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

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (encryption.controller)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import User from '../../models/user.model.js';
import ChatRoom from '../../models/chat-room.model.js';
import { logger } from '../../utils/logger.js';
import { validateObjectId } from '../../utils/validation.js';
import { errorResponse, successResponse } from '../../utils/response.js';

/**
 * Sends a success response
 * @param {Object} res - Express response object
 * @param {any} payload - Data to include in the response
 */
export function sendSuccess(res, payload) {
  res.status(200).json({ success: true, data: payload });
}

/**
 * Sends an error response
 * @param {Object} res - Express response object
 * @param {Error|string} err - Error details
 * @param {number} code - HTTP status code (default: 500)
 */
export function sendError(res, err, code = 500) {
  console.error('Error:', err.message || err);
  res.status(code).json({ success: false, error: err.message || 'Internal Error' });
}

/**
 * Registers a user's public key for end-to-end encryption
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function registerPublicKey(req, res) {
  try {
    const { userId, publicKey } = req.body;

    if (!userId || !publicKey) {
      return sendError(res, 'Missing required fields', 400);
    }

    if (!validateObjectId(userId)) {
      return sendError(res, 'Invalid user ID format', 400);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { 'encryption.publicKey': publicKey } },
      { new: true }
    );

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    logger.info(`Public key registered for user ${userId}`);
    return sendSuccess(res, { message: 'Public key registered successfully' });
  } catch (err) {
    logger.error('Error registering public key:', err);
    return sendError(res, err);
  }
}

/**
 * Sets up encryption for a chat room
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function setupRoomEncryption(req, res) {
  try {
    const { roomId } = req.body;

    if (!roomId) {
      return sendError(res, 'Room ID is required', 400);
    }

    if (!validateObjectId(roomId)) {
      return sendError(res, 'Invalid room ID format', 400);
    }

    const room = await ChatRoom.findByIdAndUpdate(
      roomId,
      { $set: { 'encryption.enabled': true } },
      { new: true }
    );

    if (!room) {
      return sendError(res, 'Chat room not found', 404);
    }

    logger.info(`Encryption enabled for room ${roomId}`);
    return sendSuccess(res, { message: 'Room encryption enabled' });
  } catch (err) {
    logger.error('Error setting up room encryption:', err);
    return sendError(res, err);
  }
}

/**
 * Disables encryption for a chat room
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function disableRoomEncryption(req, res) {
  try {
    const { roomId } = req.body;

    if (!roomId) {
      return sendError(res, 'Room ID is required', 400);
    }

    if (!validateObjectId(roomId)) {
      return sendError(res, 'Invalid room ID format', 400);
    }

    const room = await ChatRoom.findByIdAndUpdate(
      roomId,
      {
        $set: { 'encryption.enabled': false },
        $unset: { 'encryption.roomKey': '' },
      },
      { new: true }
    );

    if (!room) {
      return sendError(res, 'Chat room not found', 404);
    }

    logger.info(`Encryption disabled for room ${roomId}`);
    return sendSuccess(res, { message: 'Room encryption disabled' });
  } catch (err) {
    logger.error('Error disabling room encryption:', err);
    return sendError(res, err);
  }
}

/**
 * Stores an encrypted room key
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function storeRoomKey(req, res) {
  try {
    const { roomId, encryptedKey } = req.body;

    if (!roomId || !encryptedKey) {
      return sendError(res, 'Missing required fields', 400);
    }

    if (!validateObjectId(roomId)) {
      return sendError(res, 'Invalid room ID format', 400);
    }

    const room = await ChatRoom.findByIdAndUpdate(
      roomId,
      { $set: { 'encryption.roomKey': encryptedKey } },
      { new: true }
    );

    if (!room) {
      return sendError(res, 'Chat room not found', 404);
    }

    logger.info(`Room key stored for room ${roomId}`);
    return sendSuccess(res, { message: 'Room key stored successfully' });
  } catch (err) {
    logger.error('Error storing room key:', err);
    return sendError(res, err);
  }
}

/**
 * Retrieves an encrypted room key
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function getRoomKey(req, res) {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      return sendError(res, 'Room ID is required', 400);
    }

    if (!validateObjectId(roomId)) {
      return sendError(res, 'Invalid room ID format', 400);
    }

    const room = await ChatRoom.findById(roomId);

    if (!room) {
      return sendError(res, 'Chat room not found', 404);
    }

    if (!room.encryption?.roomKey) {
      return sendError(res, 'Room key not found', 404);
    }

    return sendSuccess(res, { roomKey: room.encryption.roomKey });
  } catch (err) {
    logger.error('Error retrieving room key:', err);
    return sendError(res, err);
  }
}

/**
 * Gets public keys of all room participants
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function getRoomParticipantKeys(req, res) {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      return sendError(res, 'Room ID is required', 400);
    }

    if (!validateObjectId(roomId)) {
      return sendError(res, 'Invalid room ID format', 400);
    }

    const room = await ChatRoom.findById(roomId).populate('participants', 'encryption.publicKey');

    if (!room) {
      return sendError(res, 'Chat room not found', 404);
    }

    const participantKeys = room.participants
      .filter(p => p.encryption?.publicKey)
      .map(p => ({
        userId: p._id,
        publicKey: p.encryption.publicKey,
      }));

    return sendSuccess(res, { participantKeys });
  } catch (err) {
    logger.error('Error retrieving participant keys:', err);
    return sendError(res, err);
  }
}

/**
 * Gets the encryption status of a room
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function getRoomEncryptionStatus(req, res) {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      return sendError(res, 'Room ID is required', 400);
    }

    if (!validateObjectId(roomId)) {
      return sendError(res, 'Invalid room ID format', 400);
    }

    const room = await ChatRoom.findById(roomId);

    if (!room) {
      return sendError(res, 'Chat room not found', 404);
    }

    return sendSuccess(res, {
      isEncrypted: room.encryption?.enabled || false,
      hasRoomKey: !!room.encryption?.roomKey,
    });
  } catch (err) {
    logger.error('Error retrieving encryption status:', err);
    return sendError(res, err);
  }
}

// Add these named exports so other modules can import { successResponse, errorResponse }
export { successResponse, errorResponse };

export default {
  registerPublicKey,
  setupRoomEncryption,
  disableRoomEncryption,
  storeRoomKey,
  getRoomKey,
  getRoomParticipantKeys,
  getRoomEncryptionStatus,
  sendSuccess,
  sendError,
};
