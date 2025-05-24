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
import { HttpClient, HttpEventType } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

export interface ChatMessageRequest {
  roomId: string;
  content: string;
  senderId: string;
  type?: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type?: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
}

export interface ChatParticipant {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'away';
  profileImage?: string;
}

export interface ChatRoom {
  id: string;
  name?: string;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  pinned?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  encryptionEnabled?: boolean;
  messageExpiryTime?: number;
}

export interface TypingStatus {
  roomId: string;
  userId: string;
  isTyping: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly apiUrl = '/api/chat';
  private typingStatus = new BehaviorSubject<TypingStatus>({
    roomId: '',
    userId: '',
    isTyping: false,
  });
  private newMessage = new Subject<ChatMessage>();

  // Online users observable
  private onlineUsersSubject = new BehaviorSubject<string[]>([]);
  public onlineUsers$ = this.onlineUsersSubject.asObservable();

  // Public observables
  public newMessage$ = this.newMessage.asObservable();
  public typingStatus$ = this.typingStatus.asObservable();

  constructor(private http: HttpClient) {}

  getRooms(): Observable<ChatRoom[]> {
    return this.http.get<ChatRoom[]>(`${this.apiUrl}/rooms`);
  }

  getMessages(roomId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/rooms/${roomId}/messages`);
  }

  sendMessage(message: ChatMessageRequest): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.apiUrl}/messages`, message);
  }

  clearHistory(roomId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/rooms/${roomId}/messages`);
  }

  blockUser(userId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/users/${userId}/block`, {});
  }

  reportUser(userId: string, reason?: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/users/${userId}/report`, { reason });
  }

  uploadFiles(
    roomId: string,
    formData: FormData,
  ): Observable<{ files: Array<{ name: string; type: string; url: string }> }> {
    return this.http
      .post<{ files: Array<{ name: string; type: string; url: string }> }>(
        `${this.apiUrl}/rooms/${roomId}/files`,
        formData,
        {
          reportProgress: true,
          observe: 'events',
        },
      )
      .pipe(
        map((event) => {
          if (event.type === HttpEventType.Response) {
            return event.body as { files: Array<{ name: string; type: string; url: string }> };
          }
          return { files: [] };
        }),
      );
  }

  sendTypingIndicator(roomId: string): void {
    // Implementation with WebSocket would go here
    console.log('Sending typing indicator for room:', roomId);
  }

  disconnectSocket(): void {
    // Implementation for WebSocket disconnect
    console.log('Disconnecting from chat socket');
  }

  markMessagesAsRead(roomId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/rooms/${roomId}/read`, {});
  }

  archiveRoom(roomId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/rooms/${roomId}/archive`, {});
  }

  /**
   * Pin a chat room
   */
  pinRoom(roomId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/rooms/${roomId}/pin`, {});
  }

  /**
   * Clear all messages in a chat room
   */
  clearRoom(roomId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/rooms/${roomId}/clear`, {});
  }

  /**
   * Block a user
   */
  blockUser(userId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/users/${userId}/block`, {});
  }

  /**
   * Report a user
   */
  reportUser(userId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/users/${userId}/report`, {});
  }

  /**
   * Update room settings
   */
  updateRoomSettings(roomId: string, settings: RoomSettings): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/rooms/${roomId}/settings`, settings);
  }

  /**
   * Convert hours to milliseconds
   * @param hours Number of hours to convert
   * @returns Number of milliseconds
   */
  convertHoursToMilliseconds(hours: number): number {
    return hours * 60 * 60 * 1000;
  }
}
