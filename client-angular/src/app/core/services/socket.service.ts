import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private connected = false;

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.connect();
      } else {
        this.disconnect();
      }
    });
  }

  /**
   * Connect to the WebSocket server
   */
  private connect(): void {
    if (this.connected) {
      return;
    }

    const token = this.authService.getToken();

    if (!token) {
      console.error('Cannot connect to socket: No authentication token');
      return;
    }

    this.socket = io(environment.apiUrl, {
      auth: {
        token
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.connected = false;
    });
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.connected && !!this.socket;
  }

  /**
   * Listen for events from the server
   * @param eventName Event name
   * @returns Observable that emits when the event occurs
   */
  on<T>(eventName: string): Observable<T> {
    return new Observable<T>(observer => {
      if (!this.socket) {
        observer.error('Socket not connected');
        return;
      }

      this.socket.on(eventName, (data: T) => {
        observer.next(data);
      });

      return () => {
        if (this.socket) {
          this.socket.off(eventName);
        }
      };
    });
  }

  /**
   * Emit an event to the server
   * @param eventName Event name
   * @param data Event data
   */
  emit(eventName: string, data?: any): void {
    if (!this.socket) {
      console.error('Cannot emit event: Socket not connected');
      return;
    }

    this.socket.emit(eventName, data);
  }

  /**
   * Join a chat room
   * @param roomId Room ID
   */
  joinChatRoom(roomId: string): void {
    this.emit('chat:join', roomId);
  }

  /**
   * Leave a chat room
   * @param roomId Room ID
   */
  leaveChatRoom(roomId: string): void {
    this.emit('chat:leave', roomId);
  }

  /**
   * Send a chat message
   * @param roomId Room ID
   * @param message Message text
   * @param recipientId Optional recipient ID
   */
  sendChatMessage(roomId: string, message: string, recipientId?: string): void {
    this.emit('chat:message', {
      roomId,
      message,
      recipientId
    });
  }

  /**
   * Send typing indicator
   * @param roomId Room ID
   * @param isTyping Whether the user is typing
   */
  sendTypingIndicator(roomId: string, isTyping: boolean): void {
    this.emit('chat:typing', {
      roomId,
      isTyping
    });
  }

  /**
   * Mark a notification as read
   * @param notificationId Notification ID
   */
  markNotificationRead(notificationId: string): void {
    this.emit('notification:read', notificationId);
  }

  /**
   * Handle a specific event
   * @param event Event name
   * @returns Observable that emits when the event occurs
   */
  private handleEvent(event: string): Observable<any> {
    return new Observable(observer => {
      if (!this.socket) {
        observer.error('Socket not connected');
        return; // Add proper return value
      }
      // Additional event handling logic can be added here
    });
  }
}