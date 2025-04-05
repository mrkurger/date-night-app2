import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { io, Socket } from 'socket.io-client';

export interface ChatMessage {
  _id: string;
  roomId: string;
  sender: string;
  recipient?: string;
  content: string;
  message?: string; // For compatibility with the component
  timestamp: Date;
  read: boolean;
  type?: string;
  attachments?: string[];
  metadata?: any;
  isEncrypted?: boolean;
  encryptionData?: any;
}

export interface Contact {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  online: boolean;
  avatar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly apiUrl = environment.apiUrl + '/chat';
  private socket: Socket;

  // Add unreadCount$ BehaviorSubject
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.socket = io(environment.apiUrl, {
      autoConnect: false,
      withCredentials: true
    });

    // Listen for unread count updates from socket
    this.socket.on('unread-count-update', (count: number) => {
      this.unreadCountSubject.next(count);
    });
  }

  createOrGetChatRoom(advertiserId: string): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/rooms/direct`, { advertiserId });
  }

  createDirectRoom(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/rooms/direct`, { userId });
  }

  createAdRoom(adId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/rooms/ad`, { adId });
  }

  createGroupRoom(userIds: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/rooms/group`, { userIds });
  }

  getRooms(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/rooms`);
  }

  getMessages(roomId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/rooms/${roomId}/messages`);
  }

  sendMessage(roomId: string, content: string): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.apiUrl}/rooms/${roomId}/messages`, { message: content });
  }

  markMessagesAsRead(roomId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/rooms/${roomId}/read`, {});
  }

  getUnreadCounts(): Observable<{ total: number; rooms: { [roomId: string]: number } }> {
    return this.http.get<{ total: number; rooms: { [roomId: string]: number } }>(`${this.apiUrl}/unread`);
  }

  connectSocket(): void {
    this.socket.connect();
  }

  disconnectSocket(): void {
    this.socket.disconnect();
  }

  onNewMessage(callback: (message: any) => void): void {
    this.socket.on('new-message', callback);
  }

  onMessageRead(callback: (data: any) => void): void {
    this.socket.on('message-read', callback);
  }

  // Get contacts (users with whom the current user has chatted)
  getContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(`${this.apiUrl}/contacts`);
  }

  // Mark a specific message as read
  markAsRead(messageId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/messages/${messageId}/read`, {});
  }

  // For demo purposes - this method would be removed in production
  // It returns mock data when the real API endpoint is not available
  getMockContacts(): Contact[] {
    return [
      {
        id: '1',
        name: 'John Doe',
        lastMessage: 'Hey, how are you doing?',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        unreadCount: 2,
        online: true
      },
      {
        id: '2',
        name: 'Jane Smith',
        lastMessage: 'See you tomorrow!',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        unreadCount: 0,
        online: false
      },
      {
        id: '3',
        name: 'Mike Johnson',
        lastMessage: 'Thanks for the info',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        unreadCount: 0,
        online: true
      }
    ];
  }
}
