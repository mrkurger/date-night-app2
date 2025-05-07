// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for cryptoHelpers settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import crypto from 'crypto';

/**
 * Crypto utilities for end-to-end encryption
 */
class CryptoHelpers {
  /**
   * Generate a random encryption key
   * @param {number} length - Key length in bytes
   * @returns {string} Base64 encoded key
   */
  generateEncryptionKey(length = 32) {
    return crypto.randomBytes(length).toString('base64');
  }

  /**
   * Generate a key pair for asymmetric encryption
   * @returns {Object} Object containing public and private keys
   */
  generateKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    return { publicKey, privateKey };
  }

  /**
   * Encrypt a message with a public key
   * @param {string} message - Message to encrypt
   * @param {string} publicKey - Public key in PEM format
   * @returns {string} Base64 encoded encrypted message
   */
  encryptWithPublicKey(message, publicKey) {
    const buffer = Buffer.from(message, 'utf8');
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      buffer
    );
    return encrypted.toString('base64');
  }

  /**
   * Decrypt a message with a private key
   * @param {string} encryptedMessage - Base64 encoded encrypted message
   * @param {string} privateKey - Private key in PEM format
   * @returns {string} Decrypted message
   */
  decryptWithPrivateKey(encryptedMessage, privateKey) {
    const buffer = Buffer.from(encryptedMessage, 'base64');
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      buffer
    );
    return decrypted.toString('utf8');
  }

  /**
   * Encrypt a message with a symmetric key
   * @param {string} message - Message to encrypt
   * @param {string} key - Base64 encoded key
   * @returns {Object} Object containing iv and encrypted message
   */
  encryptWithSymmetricKey(message, key) {
    const iv = crypto.randomBytes(16);
    const keyBuffer = Buffer.from(key, 'base64');
    const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);

    let encrypted = cipher.update(message, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const authTag = cipher.getAuthTag().toString('base64');

    return {
      iv: iv.toString('base64'),
      encrypted,
      authTag,
    };
  }

  /**
   * Decrypt a message with a symmetric key
   * @param {Object} encryptedData - Object containing iv, encrypted message, and authTag
   * @param {string} key - Base64 encoded key
   * @returns {string} Decrypted message
   */
  decryptWithSymmetricKey(encryptedData, key) {
    const { iv, encrypted, authTag } = encryptedData;
    const keyBuffer = Buffer.from(key, 'base64');
    const ivBuffer = Buffer.from(iv, 'base64');
    const authTagBuffer = Buffer.from(authTag, 'base64');

    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, ivBuffer);
    decipher.setAuthTag(authTagBuffer);

    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Generate a hash of a message
   * @param {string} message - Message to hash
   * @returns {string} Hash of the message
   */
  generateHash(message) {
    return crypto.createHash('sha256').update(message).digest('hex');
  }

  /**
   * Sign a message with a private key
   * @param {string} message - Message to sign
   * @param {string} privateKey - Private key in PEM format
   * @returns {string} Base64 encoded signature
   */
  signMessage(message, privateKey) {
    const sign = crypto.createSign('SHA256');
    sign.update(message);
    sign.end();
    return sign.sign(privateKey, 'base64');
  }

  /**
   * Verify a signature with a public key
   * @param {string} message - Original message
   * @param {string} signature - Base64 encoded signature
   * @param {string} publicKey - Public key in PEM format
   * @returns {boolean} Whether the signature is valid
   */
  verifySignature(message, signature, publicKey) {
    const verify = crypto.createVerify('SHA256');
    verify.update(message);
    verify.end();
    return verify.verify(publicKey, signature, 'base64');
  }
}

const cryptoHelpers = new CryptoHelpers();
export { cryptoHelpers };
