# End-to-End Encryption in Date Night App

This document describes the end-to-end encryption (E2EE) implementation in the Date Night App chat system.

## Overview

The Date Night App implements end-to-end encryption for chat messages to ensure that only the intended participants can read the messages. The encryption is implemented using a hybrid approach:

1. **Asymmetric Encryption (RSA)**: Used for key exchange
2. **Symmetric Encryption (AES-GCM)**: Used for message encryption

## Key Components

### Client-Side Components

- **EncryptionService**: Angular service that handles encryption/decryption operations
- **ChatService**: Integrates with EncryptionService to send/receive encrypted messages
- **ChatMessageComponent**: Displays messages and handles decryption for rendering

### Server-Side Components

- **CryptoHelpers**: Node.js utility for cryptographic operations
- **ChatRoom Model**: Stores encryption settings and public keys
- **ChatMessage Model**: Stores encrypted messages and encryption metadata

## Encryption Flow

### Key Generation and Registration

1. When a user first uses the chat feature, the client generates an RSA key pair
2. The public key is sent to the server and stored with the user's profile
3. The private key is stored securely in the browser's localStorage

### Room Key Setup

1. When a chat room is created, a symmetric AES key is generated for that room
2. The symmetric key is encrypted with each participant's public key
3. Each participant receives their own encrypted version of the room key

### Message Encryption

1. When sending a message, the client encrypts it using the room's symmetric key
2. The encrypted message, along with the IV (Initialization Vector) and authentication tag, is sent to the server
3. The server stores the encrypted message without being able to decrypt it

### Message Decryption

1. When receiving a message, the client retrieves the room's symmetric key
2. The client uses the symmetric key to decrypt the message
3. The decrypted message is displayed to the user

## Security Considerations

### Key Storage

- Private keys are stored in the browser's localStorage
- This provides persistence across sessions but is vulnerable to XSS attacks
- In a production environment, consider using more secure storage options like the Web Crypto API's key storage

### Forward Secrecy

- The current implementation does not provide perfect forward secrecy
- Consider implementing key rotation or using protocols like Signal for enhanced security

### Metadata Protection

- While message content is encrypted, metadata (sender, recipient, timestamp) is not
- This is a limitation of the current implementation

## Implementation Details

### Encryption Algorithms

- **Asymmetric Encryption**: RSA-OAEP with 2048-bit keys and SHA-256 hash
- **Symmetric Encryption**: AES-GCM with 256-bit keys and 128-bit authentication tags

### Key Exchange

The key exchange process follows these steps:

1. User A generates a symmetric key for the chat room
2. User A encrypts this key with User B's public key
3. User A sends the encrypted key to the server
4. User B retrieves the encrypted key and decrypts it with their private key
5. Both users now have the same symmetric key for message encryption/decryption

### Message Format

Encrypted messages have the following format:

```json
{
  "message": "[encrypted message content]",
  "isEncrypted": true,
  "encryptionData": {
    "iv": "[base64-encoded initialization vector]",
    "authTag": "[base64-encoded authentication tag]"
  }
}
```

## Testing and Verification

To verify that encryption is working correctly:

1. Open the chat in two different browsers or incognito windows
2. Send messages between the two users
3. Check the network traffic to confirm that messages are encrypted
4. Verify that messages can be decrypted and displayed correctly

## Future Improvements

- Implement perfect forward secrecy with key rotation
- Add support for encrypted file attachments
- Implement secure key backup and recovery
- Add verification of encryption (similar to Signal's safety numbers)
- Support multi-device usage with key synchronization

## References

- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [AES-GCM Encryption](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt#aes-gcm)
- [RSA-OAEP Encryption](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt#rsa-oaep)
- [Signal Protocol](https://signal.org/docs/)
