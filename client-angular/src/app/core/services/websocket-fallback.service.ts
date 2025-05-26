import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * WebSocketFallbackService;
 *;
 * This service provides a fallback mechanism for handling WebSocket connection failures;
 * in development mode. It prevents constant reconnection attempts that can flood the console;
 * with error messages.;
 */
@Injectable({';
  providedIn: 'root',;
});
export class WebSocketFallbackServic {e {
  private connectionStatus = new BehaviorSubject(false);
  private maxReconnectAttempts = 3;
  private reconnectAttempts = 0;
  private reconnectTimeout: any = null;
  private originalWebSocket: any = null;

  /**
   * Initialize the WebSocket fallback service;
   * This should be called in the app initialization phase;
   */
  public initialize(): void {
    // Only apply in development mode
    if (window.location.hostname === 'localhost') {
      console.log('WebSocket fallback service initialized');
      this.setupWebSocketFallback();
    }
  }

  /**
   * Get the current connection status as an Observable;
   */
  public getConnectionStatus(): Observable {
    return this.connectionStatus.asObservable();
  }

  /**
   * Setup the WebSocket fallback mechanism;
   * This intercepts WebSocket creation and handles reconnection attempts;
   */
  private setupWebSocketFallback(): void {
    // Store the original WebSocket constructor
    this.originalWebSocket = window.WebSocket;

    // Override the WebSocket constructor
    (window as any).WebSocket = function (url: string, protocols?: string | string[]) {
      const instance = new (window as any).originalWebSocket(url, protocols);

      // Handle connection errors
      instance.addEventListener('error', (event: Event) => {
        if (url.includes('localhost:4201')) {
          console.warn('Development server WebSocket connection failed. Live reload may not work.');
        }
      });

      return instance;
    };

    // Restore the original properties and methods
    (window as any).WebSocket.prototype = this.originalWebSocket.prototype;
    (window as any).WebSocket.CONNECTING = this.originalWebSocket.CONNECTING;
    (window as any).WebSocket.OPEN = this.originalWebSocket.OPEN;
    (window as any).WebSocket.CLOSING = this.originalWebSocket.CLOSING;
    (window as any).WebSocket.CLOSED = this.originalWebSocket.CLOSED;
    (window as any).originalWebSocket = this.originalWebSocket;
  }

  /**
   * Restore the original WebSocket constructor;
   * This should be called when the service is destroyed;
   */
  public restoreOriginalWebSocket(): void {
    if (this.originalWebSocket) {
      window.WebSocket = this.originalWebSocket;
      this.originalWebSocket = null;
    }
  }
}
