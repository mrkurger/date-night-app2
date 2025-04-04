import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly apiUrl = environment.apiUrl + '/chat';
  private socket: Socket;

  constructor(private http: HttpClient) {
    this.socket = io(environment.apiUrl, {
      autoConnect: false,
      withCredentials: true
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

  getMessages(roomId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/rooms/${roomId}/messages`);
  }

  sendMessage(roomId: string, content: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/rooms/${roomId}/messages`, { content });
  }

  markMessagesAsRead(roomId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/rooms/${roomId}/read`, {});
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
}
