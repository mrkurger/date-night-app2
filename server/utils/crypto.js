/**
 * Crypto Utilities
 *
 * Utility functions for cryptographic operations.
 * Note: The server does not perform actual encryption/decryption of user messages,
 * as that would defeat the purpose of end-to-end encryption. These utilities are
 * primarily for key management and validation.
 */

const crypto = require('crypto');

/**
 * Generate a random key
 *
 * @param {number} length - Length of the key in bytes
 * @returns {string} - Base64-encoded random key
 */
exports.generateRandomKey = (length = 32) => {
  const buffer = crypto.randomBytes(length);
  return buffer.toString('base64');
};

/**
 * Generate a random initialization vector (IV)
 *
 * @param {number} length - Length of the IV in bytes
 * @returns {string} - Base64-encoded random IV
 */
exports.generateIV = (length = 12) => {
  const buffer = crypto.randomBytes(length);
  return buffer.toString('base64');
};

/**
 * Validate a base64-encoded string
 *
 * @param {string} str - The string to validate
 * @returns {boolean} - True if the string is valid base64
 */
exports.isValidBase64 = str => {
  if (typeof str !== 'string') {
    return false;
  }

  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  return base64Regex.test(str);
};

/**
 * Validate encryption data
 *
 * @param {Object} encryptionData - The encryption data to validate
 * @param {string} encryptionData.iv - The initialization vector
 * @param {string} encryptionData.authTag - The authentication tag
 * @returns {boolean} - True if the encryption data is valid
 */
exports.isValidEncryptionData = encryptionData => {
  if (!encryptionData || typeof encryptionData !== 'object') {
    return false;
  }

  if (!encryptionData.iv || !this.isValidBase64(encryptionData.iv)) {
    return false;
  }

  if (encryptionData.authTag && !this.isValidBase64(encryptionData.authTag)) {
    return false;
  }

  return true;
};

/**
 * Generate a secure hash of a string
 *
 * @param {string} str - The string to hash
 * @returns {string} - The hashed string
 */
exports.hash = str => {
  return crypto.createHash('sha256').update(str).digest('hex');
};

/**
 * Generate a secure HMAC of a string
 *
 * @param {string} str - The string to sign
 * @param {string} key - The key to use for signing
 * @returns {string} - The HMAC signature
 */
exports.hmac = (str, key) => {
  return crypto.createHmac('sha256', key).update(str).digest('hex');
};

/**
 * Encrypt data with a symmetric key (for server-side encryption, not E2EE)
 *
 * @param {string} data - The data to encrypt
 * @param {string} key - The encryption key
 * @returns {Object} - The encrypted data
 */
exports.encrypt = (data, key) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'base64'), iv);

  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag().toString('base64');

  return {
    ciphertext: encrypted,
    iv: iv.toString('base64'),
    authTag,
  };
};

/**
 * Decrypt data with a symmetric key (for server-side encryption, not E2EE)
 *
 * @param {Object} encryptedData - The encrypted data
 * @param {string} encryptedData.ciphertext - The encrypted content
 * @param {string} encryptedData.iv - The initialization vector
 * @param {string} encryptedData.authTag - The authentication tag
 * @param {string} key - The decryption key
 * @returns {string} - The decrypted data
 */
exports.decrypt = (encryptedData, key) => {
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(key, 'base64'),
    Buffer.from(encryptedData.iv, 'base64')
  );

  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'base64'));

  let decrypted = decipher.update(encryptedData.ciphertext, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};
