# Chat System

## Overview

The Chat System is a core feature of DateNight.io that enables real-time communication between users. It supports one-on-one conversations, message history, read receipts, typing indicators, and end-to-end encryption for secure communication.

## User Experience

Users interact with the Chat System through several interfaces:

- **Chat List**: Displays all conversations with preview of the latest message
- **Conversation View**: Shows the full message history with a specific user
- **Message Composer**: Allows users to type and send messages
- **Notifications**: Alerts users of new messages via in-app and push notifications
- **Chat Settings**: Allows users to manage notification preferences, block users, and clear history

## Architecture

### Client-Side Components

| Component                   | Path                                                                                                | Description                          |
| --------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `ChatModule`                | `/client-angular/src/app/features/chat/chat.module.ts`                                              | Main module for chat feature         |
| `ChatListComponent`         | `/client-angular/src/app/features/chat/components/chat-list/chat-list.component.ts`                 | Displays list of conversations       |
| `ConversationComponent`     | `/client-angular/src/app/features/chat/components/conversation/conversation.component.ts`           | Displays message history with a user |
| `MessageComponent`          | `/client-angular/src/app/features/chat/components/message/message.component.ts`                     | Renders individual message           |
| `ComposerComponent`         | `/client-angular/src/app/features/chat/components/composer/composer.component.ts`                   | Message input and sending interface  |
| `ChatSettingsComponent`     | `/client-angular/src/app/features/chat/components/chat-settings/chat-settings.component.ts`         | Chat preferences and settings        |
| `TypingIndicatorComponent`  | `/client-angular/src/app/features/chat/components/typing-indicator/typing-indicator.component.ts`   | Shows when someone is typing         |
| `ChatNotificationComponent` | `/client-angular/src/app/features/chat/components/chat-notification/chat-notification.component.ts` | In-app notification for new messages |

### Client-Side Services

| Service               | Path                                                            | Description                      |
| --------------------- | --------------------------------------------------------------- | -------------------------------- |
| `ChatService`         | `/client-angular/src/app/core/services/chat.service.ts`         | Manages chat data and operations |
| `SocketService`       | `/client-angular/src/app/core/services/socket.service.ts`       | Handles WebSocket connections    |
| `MessageService`      | `/client-angular/src/app/core/services/message.service.ts`      | Handles message operations       |
| `EncryptionService`   | `/client-angular/src/app/core/services/encryption.service.ts`   | Handles E2E encryption           |
| `NotificationService` | `/client-angular/src/app/core/services/notification.service.ts` | Manages chat notifications       |

### Server-Side Controllers

| Controller          | Path                                               | Description                           |
| ------------------- | -------------------------------------------------- | ------------------------------------- |
| `ChatController`    | `/server/components/chat/chat.controller.js`       | Handles chat-related HTTP requests    |
| `MessageController` | `/server/components/message/message.controller.js` | Handles message-related HTTP requests |
| `SocketController`  | `/server/components/socket/socket.controller.js`   | Handles WebSocket events              |

### Server-Side Services

| Service               | Path                                       | Description                              |
| --------------------- | ------------------------------------------ | ---------------------------------------- |
| `ChatService`         | `/server/services/chat.service.js`         | Implements chat business logic           |
| `MessageService`      | `/server/services/message.service.js`      | Implements message business logic        |
| `SocketService`       | `/server/services/socket.service.js`       | Manages WebSocket connections and events |
| `NotificationService` | `/server/services/notification.service.js` | Sends push notifications                 |

### Models

| Model         | Path                                               | Description                             |
| ------------- | -------------------------------------------------- | --------------------------------------- |
| `Chat`        | `/server/components/chat/chat.model.js`            | Mongoose schema for chat conversations  |
| `Message`     | `/server/components/message/message.model.js`      | Mongoose schema for individual messages |
| `ReadReceipt` | `/server/components/message/read-receipt.model.js` | Mongoose schema for read receipts       |

## API Endpoints

| Endpoint                      | Method | Description                     | Request Body             | Response                  |
| ----------------------------- | ------ | ------------------------------- | ------------------------ | ------------------------- |
| `/api/chats`                  | GET    | Get all user conversations      | N/A                      | Array of chat objects     |
| `/api/chats/:chatId`          | GET    | Get a specific conversation     | N/A                      | Chat object with messages |
| `/api/chats`                  | POST   | Create a new conversation       | `{recipientId}`          | Created chat object       |
| `/api/chats/:chatId/messages` | GET    | Get messages for a conversation | N/A                      | Array of message objects  |
| `/api/chats/:chatId/messages` | POST   | Send a message                  | `{content, attachments}` | Created message object    |
| `/api/chats/:chatId/typing`   | POST   | Send typing indicator           | `{isTyping}`             | Success message           |
| `/api/chats/:chatId/read`     | POST   | Mark messages as read           | `{lastReadMessageId}`    | Updated read receipt      |
| `/api/chats/:chatId/settings` | GET    | Get chat settings               | N/A                      | Chat settings object      |
| `/api/chats/:chatId/settings` | PUT    | Update chat settings            | Settings object          | Updated settings object   |
| `/api/chats/:chatId`          | DELETE | Delete a conversation           | N/A                      | Success message           |
| `/api/messages/:messageId`    | PUT    | Edit a message                  | `{content}`              | Updated message object    |
| `/api/messages/:messageId`    | DELETE | Delete a message                | N/A                      | Success message           |
| `/api/users/:userId/block`    | POST   | Block a user from chatting      | N/A                      | Success message           |
| `/api/users/:userId/unblock`  | POST   | Unblock a user                  | N/A                      | Success message           |

## WebSocket Events

| Event               | Direction       | Description                        | Payload                    |
| ------------------- | --------------- | ---------------------------------- | -------------------------- |
| `join_chat`         | Client → Server | Join a chat room                   | `{chatId}`                 |
| `leave_chat`        | Client → Server | Leave a chat room                  | `{chatId}`                 |
| `new_message`       | Server → Client | New message received               | Message object             |
| `message_sent`      | Server → Client | Confirmation message was sent      | `{messageId, status}`      |
| `message_delivered` | Server → Client | Message was delivered to recipient | `{messageId, deliveredAt}` |
| `message_read`      | Server → Client | Message was read by recipient      | `{messageId, readAt}`      |
| `typing_start`      | Both ways       | User started typing                | `{chatId, userId}`         |
| `typing_stop`       | Both ways       | User stopped typing                | `{chatId, userId}`         |
| `user_online`       | Server → Client | User came online                   | `{userId, lastSeen}`       |
| `user_offline`      | Server → Client | User went offline                  | `{userId, lastSeen}`       |
| `message_edited`    | Server → Client | Message was edited                 | Updated message object     |
| `message_deleted`   | Server → Client | Message was deleted                | `{messageId, chatId}`      |

## Data Flow

The chat system follows these data flows:

1. **Conversation Initialization**:

   - User navigates to chat list or initiates chat with another user
   - ChatService loads existing conversations from the server
   - SocketService establishes WebSocket connection
   - User joins individual chat rooms for active conversations
   - Chat list is displayed with conversation previews

2. **Sending a Message**:

   - User types message in ComposerComponent
   - Typing indicator is sent via WebSocket
   - User sends message
   - Message is encrypted client-side if E2E is enabled
   - ChatService sends message to server via HTTP POST
   - Server stores message in database
   - Server broadcasts message to recipient via WebSocket
   - UI updates to show sent message with pending status

3. **Receiving a Message**:

   - Server sends message to recipient via WebSocket
   - SocketService receives the message event
   - Message is decrypted if E2E is enabled
   - ChatService adds message to conversation
   - UI updates to show new message
   - Read receipt is sent if conversation is currently open
   - Notification is shown if conversation is not active

4. **Read Receipts**:
   - When user opens a conversation, ChatService sends read receipt
   - Server updates read status for all messages
   - Server broadcasts read receipt to sender via WebSocket
   - Sender's UI updates to show messages as read

## State Management

The chat system uses a combination of service-based state management and WebSocket events:

- **ChatService**: Maintains the current state of all conversations and messages
- **SocketService**: Handles real-time updates via WebSocket
- **LocalStorage**: Caches recent conversations and messages for offline access
- **IndexedDB**: Stores message history and encryption keys for E2E encryption

## Key Algorithms and Logic

1. **Message Synchronization**:

   - Optimistic UI updates with local message storage
   - Server reconciliation for conflict resolution
   - Pagination with cursor-based approach for message history
   - Background sync for offline messages

2. **End-to-End Encryption**:

   - Key generation using the Web Crypto API
   - Key exchange using RSA for initial handshake
   - Message encryption using AES-GCM for performance
   - Key rotation policies for enhanced security

3. **Presence Detection**:

   - Heartbeat mechanism for online status
   - Debounced typing indicators to reduce network traffic
   - Last seen timestamp updates with privacy controls
   - Connection state management with reconnection logic

4. **Notification Management**:
   - Priority-based notification filtering
   - User preference-based delivery (push, in-app, email)
   - Batching for high-volume conversations
   - Silent notifications for background sync

## Security Considerations

1. **Message Security**:

   - End-to-end encryption for all messages
   - Perfect forward secrecy with key rotation
   - Secure key storage in IndexedDB
   - Message expiration options for sensitive content

2. **Authentication & Authorization**:

   - JWT-based authentication for API requests
   - Socket authentication with secure tokens
   - Per-conversation access control
   - Rate limiting to prevent abuse

3. **Privacy Protection**:
   - Configurable read receipts and typing indicators
   - User blocking capabilities
   - Message retention policies
   - Data minimization in transit and storage

## Testing

### Unit Tests

| Test File                        | Path                                                                                           | Description                      |
| -------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------- |
| `chat.service.spec.ts`           | `/client-angular/src/app/core/services/chat.service.spec.ts`                                   | Tests for chat service           |
| `socket.service.spec.ts`         | `/client-angular/src/app/core/services/socket.service.spec.ts`                                 | Tests for socket service         |
| `conversation.component.spec.ts` | `/client-angular/src/app/features/chat/components/conversation/conversation.component.spec.ts` | Tests for conversation component |

### Integration Tests

| Test File                 | Path                                                     | Description                 |
| ------------------------- | -------------------------------------------------------- | --------------------------- |
| `chat.controller.test.js` | `/server/tests/integration/chat/chat.controller.test.js` | API integration tests       |
| `socket.service.test.js`  | `/server/tests/integration/chat/socket.service.test.js`  | WebSocket integration tests |

## Configuration Options

The chat system supports several configuration options:

- **SOCKET_URL**: WebSocket server URL
- **MESSAGE_PAGE_SIZE**: Number of messages to load per page (default: 50)
- **TYPING_INDICATOR_TIMEOUT**: Time in ms before typing indicator disappears (default: 5000)
- **MESSAGE_RETENTION_DAYS**: Number of days to retain messages (default: 365)
- **E2E_ENCRYPTION_ENABLED**: Whether E2E encryption is enabled (default: true)
- **KEY_ROTATION_INTERVAL**: Interval for encryption key rotation (default: 7d)
- **OFFLINE_STORAGE_LIMIT**: Maximum number of messages to store offline (default: 1000)

## Known Limitations

1. **Offline Support**:

   - Limited offline message composition
   - Sync conflicts may occur with extended offline use
   - Attachments require online connection

2. **Group Chats**:

   - Currently limited to one-on-one conversations
   - Group chat functionality is planned for future release

3. **Media Sharing**:
   - File size limitations (10MB per file)
   - Limited preview capabilities for certain file types
   - No built-in media editing tools

## Future Enhancements

1. **Advanced Messaging**:

   - Implement group chat functionality
   - Add message reactions and replies
   - Implement message search capabilities
   - Add voice and video messaging

2. **Media Enhancements**:

   - Improve media sharing with compression
   - Add in-chat photo/video viewer
   - Implement ephemeral media messages
   - Add file preview capabilities

3. **User Experience**:

   - Implement message translation
   - Add chat themes and customization
   - Improve notification management
   - Add chat archiving functionality

4. **Performance**:
   - Implement progressive loading for large conversations
   - Optimize WebSocket connection management
   - Improve offline capabilities
   - Enhance encryption performance

## Related Documentation

- [END_TO_END_ENCRYPTION.MD](/docs/END_TO_END_ENCRYPTION.MD)
- [SOCKET_ARCHITECTURE.MD](/docs/SOCKET_ARCHITECTURE.MD)
- [NOTIFICATION_SYSTEM.MD](/docs/NOTIFICATION_SYSTEM.MD)
- [API_DOCUMENTATION.MD](/docs/API_DOCUMENTATION.MD)
