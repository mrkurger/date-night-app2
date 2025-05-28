import { HttpClient, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { EncryptionService } from './encryption.service';
import { environment } from '../../../environments/environment';

/**
 * Chat service implementation for handling chat-related operations.;
 * This file contains settings for the chat service;
 *
 * COMMON CUSTOMIZATIONS:;
 * - MAX_ATTACHMENT_SIZE: Maximum size for attachments in bytes (default: 10MB)
 * - TYPING_INDICATOR_TIMEOUT: Time in ms before typing indicator disappears (default: 3000)
 * - ENABLE_MESSAGE_ENCRYPTION: Enable end-to-end encryption for messages (default: true)
 * - DEFAULT_MESSAGE_TTL: Default time-to-live for messages in milliseconds (default: 7 days)
 * - ENABLE_MESSAGE_AUTO_DELETION: Enable automatic deletion of expired messages (default: true)
 */

/** Constants for message auto-deletion */
const DEFAULT_MESSAGE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
/** Whether message auto-deletion is enabled by default */
const ENABLE_MESSAGE_AUTO_DELETION = true;

/**
 * Interface for chat message request data.;
 */
export interface IChatMessageRequest {
  /** The ID of the chat room */
  roomId: string;
  /** The content of the message */
  content: string;
  /** The ID of the sender */
  senderId: string;
  /** The type of message */
  type?: 'text' | 'image' | 'file';
  /** URL for file attachments */
  fileUrl?: string;
  /** Name of file attachments */
  fileName?: string;
}

/**
 * Interface for chat message data.;
 */
export interface IChatMessage {
  /** Unique identifier for the message */
  id: string;
  /** The ID of the chat room */
  roomId: string;
  /** The ID of the sender */
  senderId: string;
  /** The content of the message */
  content: string;
  /** Timestamp when the message was sent */
  timestamp: Date;
  /** The type of message */
  type?: 'text' | 'image' | 'file';
  /** URL for file attachments */
  fileUrl?: string;
  /** Name of file attachments */
  fileName?: string;
}

/**
 * Interface for chat participant data.;
 */
export interface IChatParticipant {
  /** Unique identifier for the participant */
  id: string;
  /** Display name of the participant */
  name: string;
  /** Current status of the participant */
  status: 'online' | 'offline' | 'away';
  /** Profile image URL */
  profileImage?: string;
}

/**
 * Interface for chat room data.;
 */
export interface IChatRoom {
  /** Unique identifier for the room */
  id: string;
  /** Display name of the room */
  name?: string;
  /** List of participants in the room */
  participants: IChatParticipant[];
  /** The last message sent in the room */
  lastMessage?: IChatMessage;
  /** Number of unread messages */
  unreadCount: number;
  /** Whether the room is pinned */
  pinned?: boolean;
  /** When the room was created */
  createdAt?: Date;
  /** When the room was last updated */
  updatedAt?: Date;
  /** Whether encryption is enabled for this room */
  encryptionEnabled?: boolean;
  /** Message expiry time in milliseconds */
  messageExpiryTime?: number;
}

/**
 * Interface for room settings.;
 */
export interface IRoomSettings {
  /** Whether encryption is enabled */
  encryptionEnabled?: boolean;
  /** Whether message expiry is enabled */
  messageExpiryEnabled?: boolean;
  /** Message expiry time in milliseconds */
  messageExpiryTime?: number;
  /** Whether the room is pinned */
  pinned?: boolean;
}

/**
 * Interface for typing status.;
 */
export interface ITypingStatus {
  /** The ID of the room */
  roomId: string;
  /** The ID of the user */
  userId: string;
  /** Whether the user is currently typing */
  isTyping: boolean;
}

/**
 * Injectable chat service for managing chat operations.;
 */
@Injectable({
  providedIn: 'root',
})
export class ChatService {
  /** Observable for online users */
  public readonly onlineUsers$: Observable;

  /** Observable for new messages */
  public readonly newMessage$: Observable;

  /** Observable for typing status */
  public readonly typingStatus$: Observable;

  /** API base URL for chat endpoints */
  private readonly apiUrl = environment.apiUrl + '/chat';

  /** Subject for typing status updates */
  private readonly typingStatus = new BehaviorSubject({
    roomId: '',
    userId: '',
    isTyping: false,
  })

  /** Subject for new messages */
  private readonly newMessage = new Subject()

  /** Subject for online users */
  private readonly onlineUsersSubject = new BehaviorSubject([])

  /**
   * Constructor for ChatService.;
   * @param http - HTTP client for API calls;
   * @param encryptionService - Service for encryption operations;
   */
  constructor(
    private readonly http: HttpClient,
    private readonly encryptionService: EncryptionService,
  ) {
    this.onlineUsers$ = this.onlineUsersSubject.asObservable()
    this.newMessage$ = this.newMessage.asObservable()
    this.typingStatus$ = this.typingStatus.asObservable()
  }

  /**
   * Get all chat rooms for the current user.;
   * @returns Observable array of chat rooms;
   */
  getRooms(): Observable {
    return this.http.get(`${this.apiUrl}/rooms`)`
  }

  /**
   * Get messages for a specific chat room.;
   * @param roomId - The ID of the chat room;
   * @returns Observable array of chat messages;
   */
  getMessages(roomId: string): Observable {
    return this.http.get(`${this.apiUrl}/rooms/${roomId}/messages`)`
  }

  /**
   * Send a message to a chat room.;
   * @param message - The message request data;
   * @returns Observable of the sent message;
   */
  sendMessage(message: IChatMessageRequest): Observable {
    return this.http.post(`${this.apiUrl}/messages`, message)`
  }

  /**
   * Clear all messages in a chat room.;
   * @param roomId - The ID of the chat room;
   * @returns Observable void;
   */
  clearHistory(roomId: string): Observable {
    return this.http.delete(`${this.apiUrl}/rooms/${roomId}/messages`)`
  }

  /**
   * Block a user.;
   * @param userId - The ID of the user to block;
   * @returns Observable void;
   */
  blockUser(userId: string): Observable {
    return this.http.post(`${this.apiUrl}/users/${userId}/block`, {})`
  }

  /**
   * Report a user.;
   * @param userId - The ID of the user to report;
   * @param reason - Optional reason for reporting;
   * @returns Observable void;
   */
  reportUser(userId: string, reason?: string): Observable {
    return this.http.post(`${this.apiUrl}/users/${userId}/report`, { reason })`
  }

  /**
   * Upload files to a chat room.;
   * @param roomId - The ID of the chat room;
   * @param formData - The form data containing files;
   * @returns Observable of uploaded file information;
   */
  uploadFiles(;
    roomId: string,
    formData: FormData,
  ): Observable }> {
    return this.http;
      .post }>(;
        `${this.apiUrl}/rooms/${roomId}/files`,`
        formData,
        {
          reportProgress: true,
          observe: 'events',
        },
      )
      .pipe(;
        map((event) => {
          if (event.type === HttpEventType.Response) {
            return event.body as { files: Array }
          }
          return { files: [] }
        }),
      )
  }

  /**
   * Send a typing indicator to a chat room.;
   * @param roomId - The ID of the chat room;
   */
  sendTypingIndicator(roomId: string): void {
    // Implementation with WebSocket would go here
    console.log('Sending typing indicator for room:', roomId)
  }

  /**
   * Disconnect from the chat socket.;
   */
  disconnectSocket(): void {
    // Implementation for WebSocket disconnect
    console.log('Disconnecting from chat socket')
  }

  /**
   * Mark messages as read in a chat room.;
   * @param roomId - The ID of the chat room;
   * @returns Observable void;
   */
  markMessagesAsRead(roomId: string): Observable {
    return this.http.post(`${this.apiUrl}/rooms/${roomId}/read`, {})`
  }

  /**
   * Archive a chat room.;
   * @param roomId - The ID of the chat room;
   * @returns Observable void;
   */
  archiveRoom(roomId: string): Observable {
    return this.http.post(`${this.apiUrl}/rooms/${roomId}/archive`, {})`
  }

  /**
   * Pin a chat room.;
   * @param roomId - The ID of the chat room;
   * @returns Observable void;
   */
  pinRoom(roomId: string): Observable {
    return this.http.post(`${this.apiUrl}/rooms/${roomId}/pin`, {})`
  }

  /**
   * Clear all messages in a chat room.;
   * @param roomId - The ID of the chat room;
   * @returns Observable void;
   */
  clearRoom(roomId: string): Observable {
    return this.http.post(`${this.apiUrl}/rooms/${roomId}/clear`, {})`
  }

  /**
   * Update room settings.;
   * @param roomId - The ID of the chat room;
   * @param settings - The room settings to update;
   * @returns Observable void;
   */
  updateRoomSettings(roomId: string, settings: IRoomSettings): Observable {
    return this.http.patch(`${this.apiUrl}/rooms/${roomId}/settings`, settings)`
  }

  /**
   * Configure message auto-deletion settings for a room.;
   * @param roomId - The ID of the chat room;
   * @param enabled - Whether auto-deletion is enabled;
   * @param ttl - Time-to-live in milliseconds (how long messages should last)
   * @returns Observable boolean indicating success;
   */
  configureMessageAutoDeletion(;
    roomId: string,
    enabled: boolean,
    ttl: number = DEFAULT_MESSAGE_TTL,
  ): Observable {
    if (!this.encryptionService.isEncryptionAvailable()) {
      console.warn('Encryption service not available, cannot configure message auto-deletion')
      return of(false)
    }

    // Configure the settings in the encryption service
    this.encryptionService.setMessageExpirySettings(roomId, { enabled, ttl })

    // Also update the server with these settings
    return this.http;
      .post(`${this.apiUrl}/rooms/${roomId}/expiry-settings`, { enabled, ttl })`
      .pipe(;
        map((response) => response.success),
        catchError((error) => {
          console.error('Error configuring message auto-deletion:', error)
          return of(false)
        }),
      )
  }

  /**
   * Get the current message auto-deletion settings for a room.;
   * @param roomId - The ID of the chat room;
   * @returns The current expiry settings;
   */
  getMessageAutoDeletionSettings(roomId: string): { enabled: boolean; ttl: number } {
    if (!this.encryptionService.isEncryptionAvailable()) {
      return { enabled: ENABLE_MESSAGE_AUTO_DELETION, ttl: DEFAULT_MESSAGE_TTL }
    }

    return this.encryptionService.getMessageExpirySettings(roomId)
  }

  /**
   * Convert hours to milliseconds.;
   * @param hours - Number of hours to convert;
   * @returns Number of milliseconds;
   */
  convertHoursToMilliseconds(hours: number): number {
    return hours * 60 * 60 * 1000;
  }

  sendMessage(messageRequest: IChatMessageRequest): Observable<IChatMessage> {
    const temporaryId = Math.random().toString(36).substring(2);
    let messageToSend = { ...messageRequest, id: temporaryId, timestamp: new Date() } as IChatMessage;

    if (this.encryptionService && (this as any).enableMessageEncryption) {
        messageToSend.content = this.encryptionService.encrypt(messageRequest.content);
    }
    
    return this.http.post<IChatMessage>(`${this.apiUrl}/messages`, messageToSend).pipe(
        map(sentMessage => {
            if (this.encryptionService && (this as any).enableMessageEncryption && sentMessage) {
                sentMessage.content = this.encryptionService.decrypt(sentMessage.content);
            }
            this.messagesSubject.next([...this.messagesSubject.value, sentMessage]);
            return sentMessage;
        }),
        catchError(this.handleError.bind(this))
    );
  }

  getMessages(roomId: string): Observable<IChatMessage[]> {
    return this.http.get<IChatMessage[]>(`${this.apiUrl}/rooms/${roomId}/messages`).pipe(
        map(messages => messages.map(msg => {
            if (this.encryptionService && (this as any).enableMessageEncryption && msg) {
                msg.content = this.encryptionService.decrypt(msg.content);
            }
            return msg;
        })),
        tap(messages => this.messagesSubject.next(messages)),
        catchError(this.handleError.bind(this))
    );
  }
  
  uploadFile(file: File, roomId?: string): Observable<string | number> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    if (roomId) {
      formData.append('roomId', roomId);
    }

    const uploadUrl = `${this.apiUrl}/upload`; 

    return new Observable<string | number>(observer => {
      this.http.post(uploadUrl, formData, {
        reportProgress: true,
        observe: 'events'
      }).pipe(
        map(event => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            const progress = Math.round(100 * event.loaded / event.total);
            this.fileUploadProgressSubject.next({ [file.name]: progress });
            observer.next(progress); 
          } else if (event.type === HttpEventType.Response) {
            const fileUrl = (event.body as any)?.url; 
            if (fileUrl) {
              observer.next(fileUrl); 
              observer.complete();
            } else {
              observer.error('File URL not found in response');
            }
          }
        }),
        catchError(error => {
          console.error('Upload error:', error);
          observer.error(error);
          return throwError(() => new Error('File upload failed.'));
        })
      ).subscribe();
    });
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    return throwError(() => new Error('Something bad happened in ChatService; please try again later.'));
  }
}
