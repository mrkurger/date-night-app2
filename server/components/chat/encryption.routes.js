/**
 * Chat Encryption Routes
 *
 * Routes for handling end-to-end encryption in the chat system.
 */

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (encryption.routes)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import express from 'express';
const router = express.Router();
import encryptionController from './encryption.controller';
import { protect } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { body, param } from 'express-validator';

// Debug log to check if the controller is properly imported
console.log('Encryption controller methods:', Object.keys(encryptionController));

/**
 * @route POST /api/chat/encryption/register-key
 * @desc Register a user's public key
 * @access Private
 */
router.post(
  '/register-key',
  protect,
  validate([
    body('publicKey')
      .notEmpty()
      .withMessage('Public key is required')
      .isString()
      .withMessage('Public key must be a string'),
  ]),
  encryptionController.registerPublicKey
);

/**
 * @route POST /api/chat/encryption/setup-room
 * @desc Set up encryption for a chat room
 * @access Private
 */
router.post(
  '/setup-room',
  protect,
  validate([
    body('roomId')
      .notEmpty()
      .withMessage('Room ID is required')
      .isMongoId()
      .withMessage('Invalid room ID format'),
  ]),
  encryptionController.setupRoomEncryption
);

/**
 * @route DELETE /api/chat/encryption/room/:roomId
 * @desc Disable encryption for a chat room
 * @access Private
 */
router.delete(
  '/room/:roomId',
  protect,
  validate([
    param('roomId')
      .notEmpty()
      .withMessage('Room ID is required')
      .isMongoId()
      .withMessage('Invalid room ID format'),
  ]),
  encryptionController.disableRoomEncryption
);

/**
 * @route POST /api/chat/encryption/store-key
 * @desc Store an encrypted room key for a participant
 * @access Private
 */
router.post(
  '/store-key',
  protect,
  validate([
    body('roomId')
      .notEmpty()
      .withMessage('Room ID is required')
      .isMongoId()
      .withMessage('Invalid room ID format'),
    body('participantId')
      .notEmpty()
      .withMessage('Participant ID is required')
      .isMongoId()
      .withMessage('Invalid participant ID format'),
    body('encryptedKey')
      .notEmpty()
      .withMessage('Encrypted key is required')
      .isString()
      .withMessage('Encrypted key must be a string'),
  ]),
  encryptionController.storeRoomKey
);

/**
 * @route GET /api/chat/encryption/room-key/:roomId
 * @desc Get the encrypted room key for the current user
 * @access Private
 */
router.get(
  '/room-key/:roomId',
  protect,
  validate([
    param('roomId')
      .notEmpty()
      .withMessage('Room ID is required')
      .isMongoId()
      .withMessage('Invalid room ID format'),
  ]),
  encryptionController.getRoomKey
);

/**
 * @route GET /api/chat/encryption/participant-keys/:roomId
 * @desc Get the public keys of all participants in a room
 * @access Private
 */
router.get(
  '/participant-keys/:roomId',
  protect,
  validate([
    param('roomId')
      .notEmpty()
      .withMessage('Room ID is required')
      .isMongoId()
      .withMessage('Invalid room ID format'),
  ]),
  encryptionController.getRoomParticipantKeys
);

/**
 * @route GET /api/chat/encryption/status/:roomId
 * @desc Get the encryption status of a room
 * @access Private
 */
router.get(
  '/status/:roomId',
  protect,
  validate([
    param('roomId')
      .notEmpty()
      .withMessage('Room ID is required')
      .isMongoId()
      .withMessage('Invalid room ID format'),
  ]),
  encryptionController.getRoomEncryptionStatus
);

module.exports = router;
