// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for the chat service
//
// COMMON CUSTOMIZATIONS:
// - MAX_ATTACHMENT_SIZE: Maximum size for attachments in bytes (default: 10MB)
// - TYPING_INDICATOR_TIMEOUT: Time in ms before typing indicator disappears (default: 3000)
// - ENABLE_MESSAGE_ENCRYPTION: Enable end-to-end encryption for messages (default: true)
// ===================================================

import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http'; // Removed HttpEventType
import { BehaviorSubject, Observable, of, from } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators'; // Removed tap
import { environment } from '../../../environments/environment';
import { io, Socket } from 'socket.io-client';
import { EncryptionService, EncryptedData, EncryptedAttachmentData } from './encryption.service';

// Constants
export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB
export const TYPING_INDICATOR_TIMEOUT = 3000; // 3 seconds
export const ENABLE_MESSAGE_ENCRYPTION = true; // Enable end-to-end encryption for messages
export const ENABLE_MESSAGE_AUTO_DELETION = true; // Enable automatic message deletion
export const DEFAULT_MESSAGE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Constants for file handling
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/zip',
];

export interface ChatMessage {
  _id: string;
  roomId: string;
  sender: string | { id: string; username: string };
  recipient?: string | { id: string; username: string };
  content?: string;
  message?: string; // For compatibility with the component
  timestamp: Date;
  createdAt?: Date; // Added for compatibility
  read: boolean;
  type?: string;
  attachments?: Attachment[];
  replyTo?: string; // ID of the message being replied to
  metadata?: any;
  isEncrypted?: boolean;
  encryptionData?: any;
  expiresAt?: number; // Timestamp when the message should expire
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  timestamp: Date;
  thumbnailUrl?: string;
  isEncrypted?: boolean;
  encryptionData?: any;
}

export interface Contact {
  id: string;
  name: string;
  imageUrl?: string;
  lastMessage: string;
  lastMessageTime: Date;
  lastSeen?: Date;
  unreadCount: number;
  online: boolean;
  typing?: boolean;
  pinned?: boolean;
  archived?: boolean;
}

export interface ChatRoom {
  _id: string;
  name?: string;
  type: 'direct' | 'group' | 'ad';
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  pinned?: boolean;
  messageExpiryEnabled?: boolean;
  messageExpiryTime?: number;
  encryptionEnabled?: boolean;
}

export interface TypingIndicator {
  roomId: string;
  userId: string;
  typing: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly apiUrl = environment.apiUrl + '/chat';
  private socket: Socket;

  // BehaviorSubjects for reactive state
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private onlineUsersSubject = new BehaviorSubject<string[]>([]);
  public onlineUsers$ = this.onlineUsersSubject.asObservable();

  private typingUsersSubject = new BehaviorSubject<{ [key: string]: boolean }>({});
  public typingUsers$ = this.typingUsersSubject.asObservable();

  constructor(
    private http: HttpClient,
    private encryptionService: EncryptionService,
  ) {
    this.socket = io(environment.apiUrl, {
      autoConnect: false,
      withCredentials: true,
    });

    // Set up socket event listeners
    this.setupSocketListeners();

    // Initialize encryption service
    this.initializeEncryption();
  }

  /**
   * Initialize the encryption service and perform key management tasks
   */
  private async initializeEncryption(): Promise<void> {
    try {
      // Initialize the encryption service
      const initialized = await this.encryptionService.initialize();

      if (initialized) {
        // Check if any room keys need rotation
        this.encryptionService.checkAndPerformKeyRotations();

        // Set up socket listener for encryption events
        this.setupEncryptionSocketListeners();

        console.log('Encryption initialized successfully');
      } else {
        console.warn('Encryption initialization failed or is disabled');
      }
    } catch (error) {
      console.error('Error initializing encryption:', error);
    }
  }

  /**
   * Set up socket listeners for encryption-related events
   */
  private setupEncryptionSocketListeners(): void {
    // Listen for key rotation requests
    this.socket.on('encryption:rotate-key', (data: { roomId: string }) => {
      console.log(`Received key rotation request for room ${data.roomId}`);
      this.encryptionService.rotateRoomKey(data.roomId).subscribe();
    });

    // Listen for new encryption keys
    this.socket.on('encryption:new-key', async (data: { roomId: string; encryptedKey: string }) => {
      console.log(`Received new encryption key for room ${data.roomId}`);

      try {
        // Get the room key using the new encrypted key
        await this.encryptionService.getRoomKey(data.roomId);
        console.log(`Successfully processed new encryption key for room ${data.roomId}`);
      } catch (error) {
        console.error(`Error processing new encryption key for room ${data.roomId}:`, error);
      }
    });
  }

  /**
   * Set up socket event listeners
   */
  private setupSocketListeners(): void {
    // Listen for unread count updates
    this.socket.on('unread-count-update', (count: number) => {
      this.unreadCountSubject.next(count);
    });

    // Listen for online users updates
    this.socket.on('online-users-update', (users: string[]) => {
      this.onlineUsersSubject.next(users);
    });

    // Listen for typing indicators
    this.socket.on('typing-indicator', (data: TypingIndicator) => {
      const typingUsers = this.typingUsersSubject.value;
      typingUsers[data.userId] = data.typing;
      this.typingUsersSubject.next({ ...typingUsers });

      // Auto-reset typing status after timeout
      if (data.typing) {
        setTimeout(() => {
          const updatedTypingUsers = this.typingUsersSubject.value;
          if (updatedTypingUsers[data.userId]) {
            updatedTypingUsers[data.userId] = false;
            this.typingUsersSubject.next({ ...updatedTypingUsers });
          }
        }, TYPING_INDICATOR_TIMEOUT);
      }
    });
  }

  /**
   * Create or get a direct chat room with another user
   */
  createOrGetChatRoom(userId: string): Observable<ChatRoom> {
    return this.http.post<ChatRoom>(`${this.apiUrl}/rooms/direct`, { userId }).pipe(
      switchMap((room) => {
        // Setup encryption for the room if available
        if (this.encryptionService.isEncryptionAvailable()) {
          return this.encryptionService.setupRoomEncryption(room._id).pipe(map(() => room));
        }
        return of(room);
      }),
    );
  }

  /**
   * Create a direct chat room with another user
   */
  createDirectRoom(userId: string): Observable<ChatRoom> {
    return this.http.post<ChatRoom>(`${this.apiUrl}/rooms/direct`, { userId });
  }

  /**
   * Create a chat room for an ad
   */
  createAdRoom(adId: string): Observable<ChatRoom> {
    return this.http.post<ChatRoom>(`${this.apiUrl}/rooms/ad`, { adId });
  }

  /**
   * Create a group chat room
   */
  createGroupRoom(userIds: string[], name?: string): Observable<ChatRoom> {
    return this.http.post<ChatRoom>(`${this.apiUrl}/rooms/group`, { userIds, name });
  }

  /**
   * Get all chat rooms for the current user
   */
  getRooms(): Observable<ChatRoom[]> {
    return this.http.get<ChatRoom[]>(`${this.apiUrl}/rooms`);
  }

  /**
   * Get messages for a specific chat room
   * This method automatically decrypts any encrypted messages
   */
  getMessages(roomId: string, limit = 50, before?: string): Observable<ChatMessage[]> {
    let url = `${this.apiUrl}/rooms/${roomId}/messages?limit=${limit}`;
    if (before) {
      url += `&before=${before}`;
    }

    return this.http.get<ChatMessage[]>(url).pipe(
      switchMap(async (messages) => {
        // Check if encryption is available
        if (!this.encryptionService.isEncryptionAvailable()) {
          return messages;
        }

        // Process each message to decrypt if needed
        const processedMessages = await Promise.all(
          messages.map(async (message) => {
            // Skip if not encrypted
            if (!message.isEncrypted || !message.encryptionData) {
              return message;
            }

            try {
              // Prepare encrypted data object
              const encryptedData: EncryptedData = {
                ciphertext: message.message || '',
                iv: message.encryptionData.iv,
                authTag: message.encryptionData.authTag,
              };

              // Decrypt the message
              const decryptedContent = await this.encryptionService.decryptMessage(
                message.roomId,
                encryptedData,
              );

              if (decryptedContent) {
                // Create a new message object with decrypted content
                return {
                  ...message,
                  message: decryptedContent,
                  content: decryptedContent, // For compatibility
                  // Keep isEncrypted true to indicate it was originally encrypted
                };
              }
            } catch (error) {
              console.error(`Error decrypting message ${message._id}:`, error);
            }

            // If decryption fails, return original with indication
            return {
              ...message,
              message: '[Encrypted message - unable to decrypt]',
              content: '[Encrypted message - unable to decrypt]',
            };
          }),
        );

        return processedMessages;
      }),
    );
  }

  /**
   * Send a message to a chat room
   * @param roomId The ID of the chat room
   * @param content The message content
   * @param replyToId Optional ID of the message being replied to
   * @param ttl Optional time-to-live in milliseconds for message auto-deletion
   */
  sendMessage(
    roomId: string,
    content: string,
    replyToId?: string,
    ttl?: number,
  ): Observable<ChatMessage> {
    // Check if encryption is available
    if (this.encryptionService.isEncryptionAvailable()) {
      return from(this.encryptionService.encryptMessage(roomId, content, ttl)).pipe(
        switchMap((encryptedData) => {
          if (!encryptedData) {
            // Fall back to unencrypted message if encryption fails
            return this.sendUnencryptedMessage(roomId, content, replyToId, ttl);
          }

          // Send encrypted message
          return this.http.post<ChatMessage>(`${this.apiUrl}/rooms/${roomId}/messages`, {
            message: encryptedData.ciphertext,
            replyTo: replyToId,
            isEncrypted: true,
            encryptionData: {
              iv: encryptedData.iv,
              authTag: encryptedData.authTag,
            },
            expiresAt: encryptedData.expiresAt || (ttl ? Date.now() + ttl : undefined),
          });
        }),
      );
    } else {
      // Send unencrypted message
      return this.sendUnencryptedMessage(roomId, content, replyToId, ttl);
    }
  }

  /**
   * Send an unencrypted message to a chat room
   * @param roomId The ID of the chat room
   * @param content The message content
   * @param replyToId Optional ID of the message being replied to
   * @param ttl Optional time-to-live in milliseconds for message auto-deletion
   */
  private sendUnencryptedMessage(
    roomId: string,
    content: string,
    replyToId?: string,
    ttl?: number,
  ): Observable<ChatMessage> {
    // Calculate expiry time if ttl is provided
    const expiresAt = ttl ? Date.now() + ttl : undefined;

    return this.http.post<ChatMessage>(`${this.apiUrl}/rooms/${roomId}/messages`, {
      message: content,
      replyTo: replyToId,
      isEncrypted: false,
      expiresAt,
    });
  }

  /**
   * Send a message with attachments (handles encryption if enabled)
   */
  async sendMessageWithAttachments(
    roomId: string,
    content: string,
    files: File[],
    replyToId?: string,
    ttl?: number,
  ): Promise<ChatMessage> {
    const formData = new FormData();

    // Validate files
    const invalidFiles = files.filter(
      (f) => f.size > MAX_FILE_SIZE || !ALLOWED_FILE_TYPES.includes(f.type),
    );
    if (invalidFiles.length > 0) {
      throw new Error(`Invalid files: ${invalidFiles.map((f) => f.name).join(', ')}`);
    }

    // Encrypt message content if encryption is available
    if (this.encryptionService.isEncryptionAvailable()) {
      const encryptedContent = await this.encryptionService.encryptMessage(roomId, content);
      if (encryptedContent) {
        formData.append('content', encryptedContent.ciphertext);
        formData.append('isEncrypted', 'true');
        formData.append(
          'encryptionData',
          JSON.stringify({
            iv: encryptedContent.iv,
            authTag: encryptedContent.authTag,
          }),
        );
      } else {
        formData.append('content', content);
      }
    } else {
      formData.append('content', content);
    }

    // Handle file encryption and metadata
    const fileMetadata: any[] = [];
    for (const file of files) {
      if (this.encryptionService.isEncryptionAvailable()) {
        // Encrypt file content
        const encryptedFile = await this.encryptionService.encryptFile(roomId, file);
        if (encryptedFile) {
          formData.append('attachments', encryptedFile.file);
          fileMetadata.push({
            originalName: file.name,
            originalType: file.type,
            size: file.size,
            isEncrypted: true,
            iv: encryptedFile.iv,
            authTag: encryptedFile.authTag,
          });
        } else {
          formData.append('attachments', file);
          fileMetadata.push({
            originalName: file.name,
            originalType: file.type,
            size: file.size,
            isEncrypted: false,
          });
        }
      } else {
        formData.append('attachments', file);
        fileMetadata.push({
          originalName: file.name,
          originalType: file.type,
          size: file.size,
          isEncrypted: false,
        });
      }
    }

    // Add metadata
    formData.append('fileMetadata', JSON.stringify(fileMetadata));

    if (replyToId) {
      formData.append('replyTo', replyToId);
    }

    // Add expiry time if ttl is provided
    if (ttl) {
      formData.append('expiresAt', (Date.now() + ttl).toString());
    }

    // Send request
    const response = await this.http
      .post<ChatMessage>(`${this.apiUrl}/rooms/${roomId}/messages/attachments`, formData)
      .toPromise();

    return response!;
  }

  /**
   * Download an attachment (handles decryption if needed)
   */
  async downloadAttachment(attachment: Attachment): Promise<Blob> {
    const response = await this.http
      .get(`${this.apiUrl}/attachments/${attachment.id}`, { responseType: 'blob' })
      .toPromise();

    if (!response) {
      throw new Error('Failed to download attachment');
    }

    // If attachment is encrypted, decrypt it
    if (attachment.isEncrypted && this.encryptionService.isEncryptionAvailable()) {
      return await this.encryptionService.decryptFile(attachment.roomId, response, {
        iv: attachment.encryptionData?.iv,
        authTag: attachment.encryptionData?.authTag,
      });
    }

    return response;
  }

  /**
   * Send a temporary message with attachments (auto-deletion)
   * @param roomId The ID of the chat room
   * @param content The message content
   * @param files Array of files to attach
   * @param ttl Time-to-live in milliseconds
   * @param replyToId Optional ID of the message being replied to
   */
  sendTemporaryMessageWithAttachments(
    roomId: string,
    content: string,
    files: File[],
    ttl: number,
    replyToId?: string,
  ): Observable<ChatMessage> {
    return from(this.sendMessageWithAttachments(roomId, content, files, replyToId, ttl));
  }

  /**
   * Send a message with encrypted attachments
   * @param roomId The ID of the chat room
   * @param content The message content
   * @param files Array of files to attach
   * @param replyToId Optional ID of the message being replied to
   * @param ttl Optional time-to-live in milliseconds
   */
  async sendMessageWithEncryptedAttachments(
    roomId: string,
    content: string,
    files: File[],
    replyToId?: string,
    ttl?: number,
  ): Promise<ChatMessage> {
    const formData = new FormData();

    // Encrypt the message content if encryption is available
    if (this.encryptionService.isEncryptionAvailable()) {
      const encryptedContent = await this.encryptionService.encryptMessage(roomId, content, ttl);
      if (encryptedContent) {
        formData.append('content', encryptedContent.ciphertext);
        formData.append('isEncrypted', 'true');
        formData.append('iv', encryptedContent.iv);
        formData.append('authTag', encryptedContent.authTag);
      } else {
        formData.append('content', content);
      }
    } else {
      formData.append('content', content);
    }

    if (replyToId) {
      formData.append('replyTo', replyToId);
    }

    // Add expiry time if ttl is provided
    if (ttl) {
      formData.append('expiresAt', (Date.now() + ttl).toString());
    }

    // Encrypt and append each file
    for (const file of files) {
      if (this.encryptionService.isEncryptionAvailable()) {
        const encryptedData = await this.encryptionService.encryptFile(roomId, file);
        if (encryptedData) {
          // Create a new form entry for the encrypted file
          formData.append('files', encryptedData.file);
          formData.append(
            'fileMetadata',
            JSON.stringify({
              originalName: encryptedData.metadata.originalName,
              originalType: encryptedData.metadata.originalType,
              size: encryptedData.metadata.size,
              iv: encryptedData.metadata.iv,
              authTag: encryptedData.metadata.authTag,
              isEncrypted: true,
            }),
          );
        } else {
          // Fall back to unencrypted if encryption fails
          formData.append('files', file);
          formData.append(
            'fileMetadata',
            JSON.stringify({
              originalName: file.name,
              originalType: file.type,
              size: file.size,
              isEncrypted: false,
            }),
          );
        }
      } else {
        // Handle unencrypted file
        formData.append('files', file);
        formData.append(
          'fileMetadata',
          JSON.stringify({
            originalName: file.name,
            originalType: file.type,
            size: file.size,
            isEncrypted: false,
          }),
        );
      }
    }

    return this.http
      .post<ChatMessage>(`${this.apiUrl}/rooms/${roomId}/messages/attachments`, formData)
      .toPromise();
  }

  /**
   * Download and decrypt an attachment
   * @param roomId The chat room ID
   * @param attachment The attachment to download
   */
  async downloadEncryptedAttachment(roomId: string, attachment: Attachment): Promise<File | null> {
    try {
      // Download the encrypted file
      const response = await this.http
        .get(attachment.url, {
          responseType: 'blob',
        })
        .toPromise();

      if (!response) {
        throw new Error('Failed to download attachment');
      }

      // If the attachment is not encrypted, return as is
      if (!attachment.isEncrypted) {
        return new File([response], attachment.name, {
          type: attachment.type,
        });
      }

      // Decrypt the file
      if (!attachment.encryptionData) {
        throw new Error('Missing encryption data for encrypted attachment');
      }

      const encryptedData: EncryptedAttachmentData = {
        file: response,
        metadata: {
          originalName: attachment.name,
          originalType: attachment.type,
          size: attachment.size,
          iv: attachment.encryptionData.iv,
          authTag: attachment.encryptionData.authTag,
        },
      };

      return this.encryptionService.decryptFile(roomId, encryptedData);
    } catch (error) {
      console.error('Error downloading encrypted attachment:', error);
      return null;
    }
  }

  /**
   * Upload an attachment with progress tracking
   */
  uploadAttachment(roomId: string, file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    const req = new HttpRequest('POST', `${this.apiUrl}/attachments/upload`, formData, {
      reportProgress: true,
    });

    return this.http.request(req);
  }

  /**
   * Mark all messages in a room as read
   */
  markMessagesAsRead(roomId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/rooms/${roomId}/read`, {});
  }

  /**
   * Get unread message counts
   */
  getUnreadCounts(): Observable<{ total: number; rooms: { [roomId: string]: number } }> {
    return this.http.get<{ total: number; rooms: { [roomId: string]: number } }>(
      `${this.apiUrl}/unread`,
    );
  }

  /**
   * Connect to the chat socket
   */
  connectSocket(): void {
    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  /**
   * Disconnect from the chat socket
   */
  disconnectSocket(): void {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }

  /**
   * Listen for new messages
   * This method automatically decrypts incoming encrypted messages
   */
  onNewMessage(callback: (message: ChatMessage) => void): void {
    this.socket.on('new-message', async (message: ChatMessage) => {
      // Check if message is encrypted and encryption is available
      if (
        message.isEncrypted &&
        message.encryptionData &&
        this.encryptionService.isEncryptionAvailable()
      ) {
        try {
          // Prepare encrypted data object
          const encryptedData: EncryptedData = {
            ciphertext: message.message || '',
            iv: message.encryptionData.iv,
            authTag: message.encryptionData.authTag,
          };

          // Decrypt the message
          const decryptedContent = await this.encryptionService.decryptMessage(
            message.roomId,
            encryptedData,
          );

          if (decryptedContent) {
            // Create a new message object with decrypted content
            const decryptedMessage = {
              ...message,
              message: decryptedContent,
              content: decryptedContent, // For compatibility
              // Keep isEncrypted true to indicate it was originally encrypted
            };

            // Call the callback with the decrypted message
            callback(decryptedMessage);
            return;
          }
        } catch (error) {
          console.error('Error decrypting incoming message:', error);
        }

        // If decryption fails, modify the message to indicate that
        const failedMessage = {
          ...message,
          message: '[Encrypted message - unable to decrypt]',
          content: '[Encrypted message - unable to decrypt]',
        };

        callback(failedMessage);
      } else {
        // Not encrypted or encryption not available, pass through
        callback(message);
      }
    });
  }

  /**
   * Listen for message read events
   */
  onMessageRead(callback: (data: { messageId: string; userId: string }) => void): void {
    this.socket.on('message-read', callback);
  }

  /**
   * Listen for typing indicator events
   */
  onTypingIndicator(callback: (data: TypingIndicator) => void): void {
    this.socket.on('typing-indicator', callback);
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(roomId: string): void {
    this.socket.emit('typing', { roomId });
  }

  /**
   * Convert hours to milliseconds for TTL
   * @param hours Number of hours
   * @returns Milliseconds
   */
  convertHoursToMilliseconds(hours: number): number {
    return hours * 60 * 60 * 1000;
  }

  /**
   * Get contacts (users with whom the current user has chatted)
   */
  getContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(`${this.apiUrl}/contacts`).pipe(
      catchError((error) => {
        console.error('Error fetching contacts:', error);
        return of(this.getMockContacts());
      }),
    );
  }

  /**
   * Mark a specific message as read
   */
  markAsRead(messageId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/messages/${messageId}/read`, {});
  }

  /**
   * Delete a message
   */
  deleteMessage(messageId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/messages/${messageId}`);
  }

  /**
   * Pin a chat room
   */
  pinRoom(roomId: string, pinned: boolean): Observable<ChatRoom> {
    return this.http.put<ChatRoom>(`${this.apiUrl}/rooms/${roomId}/pin`, { pinned });
  }

  /**
   * Configure message auto-deletion settings for a room
   * @param roomId The ID of the chat room
   * @param enabled Whether auto-deletion is enabled
   * @param ttl Time-to-live in milliseconds (how long messages should last)
   */
  configureMessageAutoDeletion(
    roomId: string,
    enabled: boolean,
    ttl: number = DEFAULT_MESSAGE_TTL,
  ): Observable<boolean> {
    if (!this.encryptionService.isEncryptionAvailable()) {
      console.warn('Encryption service not available, cannot configure message auto-deletion');
      return of(false);
    }

    // Configure the settings in the encryption service
    this.encryptionService.setMessageExpirySettings(roomId, { enabled, ttl });

    // Also update the server with these settings
    return this.http
      .post<{
        success: boolean;
      }>(`${this.apiUrl}/rooms/${roomId}/expiry-settings`, { enabled, ttl })
      .pipe(
        map((response) => response.success),
        catchError((error) => {
          console.error('Error configuring message auto-deletion:', error);
          return of(false);
        }),
      );
  }

  /**
   * Get the current message auto-deletion settings for a room
   * @param roomId The ID of the chat room
   * @returns The current expiry settings
   */
  getMessageAutoDeletionSettings(roomId: string): { enabled: boolean; ttl: number } {
    if (!this.encryptionService.isEncryptionAvailable()) {
      return { enabled: ENABLE_MESSAGE_AUTO_DELETION, ttl: DEFAULT_MESSAGE_TTL };
    }

    return this.encryptionService.getMessageExpirySettings(roomId);
  }

  /**
   * Send a message with a specific time-to-live (auto-deletion)
   * @param roomId The ID of the chat room
   * @param content The message content
   * @param ttl Time-to-live in milliseconds
   * @param replyToId Optional ID of the message being replied to
   */
  sendTemporaryMessage(
    roomId: string,
    content: string,
    ttl: number,
    replyToId?: string,
  ): Observable<ChatMessage> {
    return this.sendMessage(roomId, content, replyToId, ttl);
  }

  /**
   * Archive a chat room
   */
  archiveRoom(roomId: string, archived: boolean): Observable<ChatRoom> {
    return this.http.put<ChatRoom>(`${this.apiUrl}/rooms/${roomId}/archive`, { archived });
  }

  /**
   * Search messages in a room
   */
  searchMessages(roomId: string, query: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(
      `${this.apiUrl}/rooms/${roomId}/search?q=${encodeURIComponent(query)}`,
    );
  }

  /**
   * Get media shared in a room
   */
  getSharedMedia(roomId: string, type: 'images' | 'files' | 'links'): Observable<Attachment[]> {
    return this.http.get<Attachment[]>(`${this.apiUrl}/rooms/${roomId}/media?type=${type}`);
  }

  /**
   * For demo purposes - this method would be removed in production
   * It returns mock data when the real API endpoint is not available
   */
  getMockContacts(): Contact[] {
    return [
      {
        id: '1',
        name: 'John Doe',
        imageUrl: '/assets/img/profile1.jpg',
        lastMessage: 'Hey, how are you doing?',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        lastSeen: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
        unreadCount: 2,
        online: true,
        pinned: true,
      },
      {
        id: '2',
        name: 'Jane Smith',
        imageUrl: '/assets/img/profile2.jpg',
        lastMessage: 'See you tomorrow!',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        lastSeen: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        unreadCount: 0,
        online: false,
      },
      {
        id: '3',
        name: 'Mike Johnson',
        imageUrl: '/assets/img/profile3.jpg',
        lastMessage: 'Thanks for the info',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        lastSeen: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
        unreadCount: 0,
        online: true,
      },
      {
        id: '4',
        name: 'Sarah Williams',
        imageUrl: '/assets/img/profile4.jpg',
        lastMessage: 'I just sent you the files you requested',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        lastSeen: new Date(Date.now() - 1000 * 60 * 240), // 4 hours ago
        unreadCount: 0,
        online: false,
        archived: true,
      },
      {
        id: '5',
        name: 'David Brown',
        imageUrl: '/assets/img/default-profile.jpg',
        lastMessage: "Let me know when you're free to talk",
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
        unreadCount: 1,
        online: false,
      },
    ];
  }
}
