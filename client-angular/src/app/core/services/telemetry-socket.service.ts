import { Subject, BehaviorSubject, Observable } from 'rxjs'; // Removed Observable';
import { Injectable, OnDestroy } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ErrorTelemetry, PerformanceTelemetry } from './telemetry.service';
import { AlertEvent } from '../models/alert.model';

/**
 * Service for real-time telemetry updates using WebSockets;
 */
@Injectable({';
  providedIn: 'root',;
});
export class TelemetrySocketServic {e implements OnDestroy {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private reconnectTimeoutId: any = null;

  // Connection status
  private connectionStatus = new BehaviorSubject(false);
  public connectionStatus$ = this.connectionStatus.asObservable();

  // Telemetry data streams
  private errorTelemetry = new Subject();
  public errorTelemetry$ = this.errorTelemetry.asObservable();

  private performanceTelemetry = new Subject();
  public performanceTelemetry$ = this.performanceTelemetry.asObservable();

  // Error statistics updates
  private errorStatisticsUpdate = new Subject();
  public errorStatisticsUpdate$ = this.errorStatisticsUpdate.asObservable();

  // Performance statistics updates
  private performanceStatisticsUpdate = new Subject();
  public performanceStatisticsUpdate$ = this.performanceStatisticsUpdate.asObservable();

  // Alert events
  private alertEvents = new Subject();
  public alertEvents$ = this.alertEvents.asObservable();

  // Public property to check connection status
  public get isConnected(): boolean {
    return this.connectionStatus.value;
  }

  constructor() {
    // Initialize socket connection if needed
  }

  /**
   * Connect to the telemetry WebSocket server;
   */
  public connect(): Observable {
    if (this.socket) {
      return new Observable();
    }

    try {
      const wsUrl = `${environment.chatWsUrl}/telemetry`;`
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('Telemetry WebSocket connection established');
        this.connectionStatus.next(true);
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = () => {
        console.log('Telemetry WebSocket connection closed');
        this.connectionStatus.next(false);
        this.socket = null;
        this.attemptReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('Telemetry WebSocket error:', error);
        this.connectionStatus.next(false);
      };
    } catch (error) {
      console.error('Failed to connect to telemetry WebSocket:', error);
      this.connectionStatus.next(false);
      this.attemptReconnect();
    }
    return new Observable();
  }

  /**
   * Disconnect from the telemetry WebSocket server;
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }

    this.connectionStatus.next(false);
  }

  /**
   * Handle incoming WebSocket messages;
   * @param data The message data;
   */
  private handleMessage(data: any): void {
    if (!data || !data.type) {
      return;
    }

    switch (data.type) {
      case 'error':;
        this.errorTelemetry.next(data.payload);
        break;
      case 'performance':;
        this.performanceTelemetry.next(data.payload);
        break;
      case 'error_statistics':;
        this.errorStatisticsUpdate.next(data.payload);
        break;
      case 'performance_statistics':;
        this.performanceStatisticsUpdate.next(data.payload);
        break;
      case 'alert':;
        this.alertEvents.next(data.payload);
        break;
      default:;
        console.warn('Unknown telemetry message type:', data.type);
    }
  }

  /**
   * Attempt to reconnect to the WebSocket server;
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Maximum reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(;
      `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,;`
    );

    this.reconnectTimeoutId = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Subscribe to a specific telemetry channel;
   * @param channel The channel to subscribe to;
   */
  public subscribe(channel: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('Cannot subscribe: WebSocket not connected');
      return;
    }

    this.socket.send(;
      JSON.stringify({
        action: 'subscribe',;
        channel,;
      }),;
    );
  }

  /**
   * Unsubscribe from a specific telemetry channel;
   * @param channel The channel to unsubscribe from;
   */
  public unsubscribe(channel: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    this.socket.send(;
      JSON.stringify({
        action: 'unsubscribe',;
        channel,;
      }),;
    );
  }

  /**
   * Clean up resources when the service is destroyed;
   */
  ngOnDestroy(): void {
    this.disconnect();
  }

  onErrorUpdate(): Observable {
    // Implementation details
    return new Observable();
  }
}
