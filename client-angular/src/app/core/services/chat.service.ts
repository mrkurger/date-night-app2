import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Socket } from 'ngx-socket-io';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chat`;

  constructor(
    private http: HttpClient,
    private socket: Socket
  ) {}

  getMessages(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/messages/${userId}`);
  }

  sendMessage(userId: string, message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/messages`, { userId, message });
  }

  onNewMessage(): Observable<any> {
    return this.socket.fromEvent<any>('new_message');
  }
}
