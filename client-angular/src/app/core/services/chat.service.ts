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
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChatMessage {
  id: string;
  roomId: string;
  sender: string;
  receiver: string;
  content: string;
  message?: string; // Legacy support
  timestamp: Date;
  read: boolean;
  isEncrypted?: boolean;
  createdAt?: Date;
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }>;
}

export interface ChatParticipant {
  id: string;
  username: string;
  avatar?: string;
}

export interface ChatRoom {
  id: string;
  name?: string;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  pinned?: boolean;
  encryptionEnabled?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket: WebSocket | null = null;
  private readonly apiUrl = `${environment.apiUrl}/chat`;
  private readonly wsUrl = environment.chatWsUrl;

  // Observables for real-time updates
  private newMessageSubject = new Subject<ChatMessage>();
  private messageReadSubject = new Subject<string>();
  private typingStatusSubject = new BehaviorSubject<boolean>(false);

  // Online users observable
  private onlineUsersSubject = new BehaviorSubject<string[]>([]);
  public onlineUsers$ = this.onlineUsersSubject.asObservable();

  // Public observables
  public newMessage$ = this.newMessageSubject.asObservable();
  public messageRead$ = this.messageReadSubject.asObservable();
  public typingStatus$ = this.typingStatusSubject.asObservable();

  constructor(private http: HttpClient) {}

  connectSocket(): void {
    if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
      this.socket = new WebSocket(this.wsUrl);
      this.setupSocketListeners();
    }
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'message':
          this.newMessageSubject.next(data.message);
          break;
        case 'messageRead':
          this.messageReadSubject.next(data.messageId);
          break;
        case 'typing':
          this.typingStatusSubject.next(data.isTyping);
          break;
      }
    };
  }

  getRooms(): Observable<ChatRoom[]> {
    return this.http.get<ChatRoom[]>(`${this.apiUrl}/rooms`);
  }

  getMessages(roomId: string, limit = 50, beforeId?: string | null): Observable<ChatMessage[]> {
    let url = `${this.apiUrl}/rooms/${roomId}/messages?limit=${limit}`;
    if (beforeId) {
      url += `&beforeId=${beforeId}`;
    }
    return this.http.get<ChatMessage[]>(url);
  }

  sendMessage(message: ChatMessage): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.apiUrl}/messages`, message);
  }

  markMessagesAsRead(roomId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/rooms/${roomId}/read`, {});
  }

  markMessageAsRead(messageId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/messages/${messageId}/read`, {});
  }

  sendTypingIndicator(roomId: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          type: 'typing',
          roomId,
        }),
      );
    }
  }

  sendMessageWithAttachments(roomId: string, content: string, files: File[]): Promise<ChatMessage> {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('roomId', roomId);
    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    return this.http.post<ChatMessage>(`${this.apiUrl}/messages/attachments`, formData).toPromise();
  }

  /**
   * Create a chat room for an ad
   * @param adId The ID of the ad to create a chat room for
   * @returns Observable<ChatRoom>
   */
  createAdRoom(adId: string): Observable<ChatRoom> {
    return this.http.post<ChatRoom>(`${this.apiUrl}/rooms/ad`, { adId });
  }

  disconnectSocket(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  archiveRoom(roomId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/rooms/${roomId}/archive`, {});
  }
}
