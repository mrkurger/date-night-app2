/**
 * Chat Encryption Routes
 *
 * Routes for handling end-to-end encryption in the chat system.
 */

const express = require('express');
const router = express.Router();
const encryptionController = require('./encryption.controller');
const { authenticate } = require('../../middleware/auth');
const { validateRequest } = require('../../middleware/validation');
const { body, param } = require('express-validator');

/**
 * @route POST /api/chat/encryption/register-key
 * @desc Register a user's public key
 * @access Private
 */
router.post(
  '/register-key',
  authenticate,
  [
    body('publicKey')
      .notEmpty()
      .withMessage('Public key is required')
      .isString()
      .withMessage('Public key must be a string'),
  ],
  validateRequest,
  encryptionController.registerPublicKey
);

/**
 * @route POST /api/chat/encryption/setup-room
 * @desc Set up encryption for a chat room
 * @access Private
 */
router.post(
  '/setup-room',
  authenticate,
  [
    body('roomId')
      .notEmpty()
      .withMessage('Room ID is required')
      .isMongoId()
      .withMessage('Invalid room ID format'),
  ],
  validateRequest,
  encryptionController.setupRoomEncryption
);

/**
 * @route DELETE /api/chat/encryption/room/:roomId
 * @desc Disable encryption for a chat room
 * @access Private
 */
router.delete(
  '/room/:roomId',
  authenticate,
  [
    param('roomId')
      .notEmpty()
      .withMessage('Room ID is required')
      .isMongoId()
      .withMessage('Invalid room ID format'),
  ],
  validateRequest,
  encryptionController.disableRoomEncryption
);

/**
 * @route POST /api/chat/encryption/store-key
 * @desc Store an encrypted room key for a participant
 * @access Private
 */
router.post(
  '/store-key',
  authenticate,
  [
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
  ],
  validateRequest,
  encryptionController.storeRoomKey
);

/**
 * @route GET /api/chat/encryption/room-key/:roomId
 * @desc Get the encrypted room key for the current user
 * @access Private
 */
router.get(
  '/room-key/:roomId',
  authenticate,
  [
    param('roomId')
      .notEmpty()
      .withMessage('Room ID is required')
      .isMongoId()
      .withMessage('Invalid room ID format'),
  ],
  validateRequest,
  encryptionController.getRoomKey
);

/**
 * @route GET /api/chat/encryption/participant-keys/:roomId
 * @desc Get the public keys of all participants in a room
 * @access Private
 */
router.get(
  '/participant-keys/:roomId',
  authenticate,
  [
    param('roomId')
      .notEmpty()
      .withMessage('Room ID is required')
      .isMongoId()
      .withMessage('Invalid room ID format'),
  ],
  validateRequest,
  encryptionController.getRoomParticipantKeys
);

/**
 * @route GET /api/chat/encryption/status/:roomId
 * @desc Get the encryption status of a room
 * @access Private
 */
router.get(
  '/status/:roomId',
  authenticate,
  [
    param('roomId')
      .notEmpty()
      .withMessage('Room ID is required')
      .isMongoId()
      .withMessage('Invalid room ID format'),
  ],
  validateRequest,
  encryptionController.getRoomEncryptionStatus
);

module.exports = router;
