import crypto from 'crypto';

/**
 * Encrypt sensitive data using AES-256-GCM
 * @param {string} data - Data to encrypt
 * @returns {Object} Encrypted data with iv and tag
 */
export function encrypt(data) {
  // Use a master key from environment variables
  const masterKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  
  // Generate a random initialization vector
  const iv = crypto.randomBytes(16);
  
  // Create cipher
  const cipher = crypto.createCipheriv('aes-256-gcm', masterKey, iv);
  
  // Encrypt the data
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Get the authentication tag
  const tag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex')
  };
}

/**
 * Decrypt data encrypted with AES-256-GCM
 * @param {Object} encryptedData - Object containing encrypted data, iv, and tag
 * @returns {string} Decrypted data
 */
export function decrypt(encryptedData) {
  const { encrypted, iv, tag } = encryptedData;
  
  // Use a master key from environment variables
  const masterKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  
  // Create decipher
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm', 
    masterKey, 
    Buffer.from(iv, 'hex')
  );
  
  // Set authentication tag
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  
  // Decrypt the data
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}