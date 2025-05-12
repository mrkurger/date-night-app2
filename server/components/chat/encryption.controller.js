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
