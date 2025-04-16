// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for the chat service
//
// COMMON CUSTOMIZATIONS:
// - MAX_ATTACHMENT_SIZE: Maximum size for attachments in bytes (default: 10MB)
// - TYPING_INDICATOR_TIMEOUT: Time in ms before typing indicator disappears (default: 3000)
// - ENABLE_MESSAGE_ENCRYPTION: Enable end-to-end encryption for messages (default: false)
// ===================================================

import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { io, Socket } from 'socket.io-client';

// Constants
export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB
export const TYPING_INDICATOR_TIMEOUT = 3000; // 3 seconds

export interface ChatMessage {
  _id: string;
  roomId: string;
  sender: string | { id: string; username: string };
  recipient?: string | { id: string; username: string };
  content?: string;
  message?: string; // For compatibility with the component
  timestamp: Date;
  read: boolean;
  type?: string;
  attachments?: Attachment[];
  replyTo?: string; // ID of the message being replied to
  metadata?: any;
  isEncrypted?: boolean;
  encryptionData?: any;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  timestamp: Date;
  thumbnailUrl?: string;
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

  constructor(private http: HttpClient) {
    this.socket = io(environment.apiUrl, {
      autoConnect: false,
      withCredentials: true,
    });

    // Set up socket event listeners
    this.setupSocketListeners();
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
    return this.http.post<ChatRoom>(`${this.apiUrl}/rooms/direct`, { userId });
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
   */
  getMessages(roomId: string, limit = 50, before?: string): Observable<ChatMessage[]> {
    let url = `${this.apiUrl}/rooms/${roomId}/messages?limit=${limit}`;
    if (before) {
      url += `&before=${before}`;
    }
    return this.http.get<ChatMessage[]>(url);
  }

  /**
   * Send a message to a chat room
   */
  sendMessage(roomId: string, content: string, replyToId?: string): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.apiUrl}/rooms/${roomId}/messages`, {
      message: content,
      replyTo: replyToId,
    });
  }

  /**
   * Send a message with attachments
   */
  sendMessageWithAttachments(
    roomId: string,
    content: string,
    files: File[],
    replyToId?: string
  ): Observable<ChatMessage> {
    const formData = new FormData();
    formData.append('message', content);

    if (replyToId) {
      formData.append('replyTo', replyToId);
    }

    files.forEach((file, index) => {
      formData.append('attachments', file, file.name);
    });

    return this.http.post<ChatMessage>(
      `${this.apiUrl}/rooms/${roomId}/messages/attachments`,
      formData
    );
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
      `${this.apiUrl}/unread`
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
   */
  onNewMessage(callback: (message: ChatMessage) => void): void {
    this.socket.on('new-message', callback);
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
   * Get contacts (users with whom the current user has chatted)
   */
  getContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(`${this.apiUrl}/contacts`).pipe(
      catchError(error => {
        console.error('Error fetching contacts:', error);
        return of(this.getMockContacts());
      })
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
      `${this.apiUrl}/rooms/${roomId}/search?q=${encodeURIComponent(query)}`
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
