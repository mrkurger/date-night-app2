import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

interface IWebSocketMessage {
  type: string;
  payload: Record<string, unknown>;
}

/**
 * Service that provides WebSocket functionality with automatic reconnection
 * and fallback mechanisms.
 */
@Injectable({
  providedIn: 'root',
})
export class WebSocketFallbackService {
  private readonly reconnectDelay = 5000; // 5 seconds
  private readonly maxReconnectAttempts = 5;
  private reconnectAttempts = 0;
  private ws: WebSocket | null = null;
  private readonly messageSubject = new Subject<IWebSocketMessage>();

  /**
   * Creates a WebSocket connection to the specified URL
   *
   * @param url - The WebSocket endpoint URL
   * @returns Observable of WebSocket messages
   */
  public connect(url: string): Observable<IWebSocketMessage> {
    this.initWebSocket(url);
    return this.messageSubject.asObservable();
  }

  private initWebSocket(url: string): void {
    if (this.ws) {
      this.ws.close();
    }

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      console.log('WebSocket connection established');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as IWebSocketMessage;
        this.messageSubject.next(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.messageSubject.error(error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
      this.attemptReconnect(url);
    };
  }

  private attemptReconnect(url: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
      );
      setTimeout(() => this.initWebSocket(url), this.reconnectDelay);
    } else {
      console.error('Max reconnection attempts reached');
      this.messageSubject.error(new Error('WebSocket connection failed'));
    }
  }

  /**
   * Sends data through the WebSocket connection
   *
   * @param data - The message to send
   */
  public send(data: IWebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  /**
   * Closes the WebSocket connection
   */
  public close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
