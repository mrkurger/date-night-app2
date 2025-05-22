// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for MongoDB connection service
//
// COMMON CUSTOMIZATIONS:
// - DEFAULT_CONFIG: Default configuration for MongoDB connection
//   Related to: environment.ts:mongoDbUri
// - RETRY_STRATEGY: Customize retry delay strategy
//   Related to: server/config/database.js:connectDB
// ===================================================
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, timer } from 'rxjs';
import { catchError, retry, tap, timeout, retryWhen, concatMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoggingService } from './logging.service';
import { 
  ConnectionEvent, 
  ConnectionOptions, 
  ConnectionStatus, 
  MongoDBConfig, 
  MongoDBErrorType 
} from './models/mongodb-connection.model';

/**
 * Default MongoDB connection configuration
 */
const DEFAULT_CONFIG: MongoDBConfig = {
  uri: environment.mongoDbUri || 'mongodb://localhost:27017/datenight_dev',
  dbName: 'datenight_dev',
  maxRetries: 5,
  retryDelay: 5000,
  connectionTimeout: 10000,
  socketTimeout: 45000,
  maxPoolSize: 10
};

/**
 * Service for MongoDB connection management
 *
 * This service provides methods for connecting to MongoDB:
 * - Manages connection state
 * - Implements connection pooling
 * - Provides error handling and retry mechanisms
 * - Monitors connection status
 * 
 * The service is designed to be used as a client-side wrapper for
 * server-side MongoDB operations, providing a consistent interface
 * for making database requests.
 */
@Injectable({
  providedIn: 'root'
})
export class MongoDBConnectionService {
  /** Current connection status */
  private connectionStatus = new BehaviorSubject<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  
  /** Connection status observable */
  public status$: Observable<ConnectionStatus> = this.connectionStatus.asObservable();
  
  /** Connection events history */
  private eventsSubject = new BehaviorSubject<ConnectionEvent[]>([]);
  
  /** Connection events observable */
  public events$: Observable<ConnectionEvent[]> = this.eventsSubject.asObservable();
  
  /** Current configuration */
  private config: MongoDBConfig = DEFAULT_CONFIG;
  
  /** Connection pool health check interval */
  private healthCheckInterval: any = null;
  
  /** Connection attempts counter */
  private connectionAttempts = 0;
  
  /** Flag indicating an active connection */
  private isConnected = false;

  /**
   * Constructor
   * @param http - HttpClient for API communication
   * @param loggingService - Service for logging
   */
  constructor(
    private http: HttpClient,
    private loggingService: LoggingService
  ) {}

  /**
   * Initialize the MongoDB connection service
   * @param config - Connection configuration
   * @returns Observable that completes when connection is established
   */
  public initialize(config?: Partial<MongoDBConfig>): Observable<boolean> {
    // Update configuration if provided
    if (config) {
      this.config = { ...DEFAULT_CONFIG, ...config };
    }

    // Log initialization
    this.loggingService.logInfo('MongoDBConnectionService', 'Initializing MongoDB connection service');
    
    // Reset connection attempts counter
    this.connectionAttempts = 0;
    
    // Add initialization event
    this.addEvent({
      timestamp: new Date(),
      status: ConnectionStatus.DISCONNECTED,
      message: 'MongoDB connection service initialized'
    });
    
    // Initialize connection
    return this.connect();
  }

  /**
   * Connect to MongoDB
   * @returns Observable that completes when connection is established
   */
  public connect(): Observable<boolean> {
    // If already connected, return success
    if (this.isConnected) {
      return new Observable<boolean>(observer => {
        observer.next(true);
        observer.complete();
      });
    }
    
    // Update status to connecting
    this.updateStatus(ConnectionStatus.CONNECTING);
    
    // Increment connection attempts counter
    this.connectionAttempts++;
    
    // Log connection attempt
    this.loggingService.logInfo('MongoDBConnectionService', `Connection attempt ${this.connectionAttempts}/${this.config.maxRetries}`);

    // Construct connection options
    const connectionOptions: ConnectionOptions = {
      connectionTimeoutMS: this.config.connectionTimeout,
      socketTimeoutMS: this.config.socketTimeout,
      maxPoolSize: this.config.maxPoolSize,
      serverSelectionTimeoutMS: 10000,
      family: 4 // Use IPv4, skip trying IPv6
    };

    // Connect to MongoDB via API endpoint
    return this.http.post<boolean>(`${environment.apiUrl}/db/connect`, { 
      uri: this.config.uri,
      options: connectionOptions
    }).pipe(
      timeout(this.config.connectionTimeout),
      tap(connected => {
        if (connected) {
          this.connectionEstablished();
        }
      }),
      retryWhen(errors => this.retryStrategy(errors)),
      catchError(error => this.handleConnectionError(error))
    );
  }

  /**
   * Disconnect from MongoDB
   * @returns Observable that completes when disconnection is complete
   */
  public disconnect(): Observable<boolean> {
    // Update status to disconnecting
    this.updateStatus(ConnectionStatus.DISCONNECTED);
    
    // Log disconnection
    this.loggingService.logInfo('MongoDBConnectionService', 'Disconnecting from MongoDB');
    
    // Clear health check interval
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    // Disconnect from MongoDB via API endpoint
    return this.http.post<boolean>(`${environment.apiUrl}/db/disconnect`, {}).pipe(
      tap(() => {
        this.isConnected = false;
        this.addEvent({
          timestamp: new Date(),
          status: ConnectionStatus.DISCONNECTED,
          message: 'Disconnected from MongoDB'
        });
      }),
      catchError(error => {
        this.loggingService.logError('MongoDBConnectionService', 'Error disconnecting from MongoDB', error);
        return throwError(() => new Error('Error disconnecting from MongoDB'));
      })
    );
  }

  /**
   * Check connection status
   * @returns Observable with connection status
   */
  public checkConnection(): Observable<boolean> {
    return this.http.get<boolean>(`${environment.apiUrl}/db/status`).pipe(
      tap(isConnected => {
        if (isConnected !== this.isConnected) {
          this.isConnected = isConnected;
          this.updateStatus(isConnected ? ConnectionStatus.CONNECTED : ConnectionStatus.DISCONNECTED);
        }
      }),
      catchError(error => {
        this.loggingService.logError('MongoDBConnectionService', 'Error checking connection status', error);
        this.isConnected = false;
        this.updateStatus(ConnectionStatus.FAILED);
        return throwError(() => new Error('Error checking connection status'));
      })
    );
  }

  /**
   * Get current connection status
   * @returns Current connection status
   */
  public getCurrentStatus(): ConnectionStatus {
    return this.connectionStatus.getValue();
  }

  /**
   * Get connection events history
   * @returns Array of connection events
   */
  public getConnectionEvents(): ConnectionEvent[] {
    return this.eventsSubject.getValue();
  }

  /**
   * Update connection status
   * @param status - New connection status
   */
  private updateStatus(status: ConnectionStatus): void {
    this.connectionStatus.next(status);
    
    // Add status change event
    this.addEvent({
      timestamp: new Date(),
      status,
      message: `Connection status changed to ${status}`
    });
    
    // Log status change
    this.loggingService.logInfo('MongoDBConnectionService', `Connection status changed to ${status}`);
  }

  /**
   * Handle successful connection
   */
  private connectionEstablished(): void {
    this.isConnected = true;
    this.updateStatus(ConnectionStatus.CONNECTED);
    this.connectionAttempts = 0;
    
    // Start health check interval
    this.startHealthCheck();
    
    // Log successful connection
    this.loggingService.logInfo('MongoDBConnectionService', 'Connected to MongoDB');
    
    // Add connection event
    this.addEvent({
      timestamp: new Date(),
      status: ConnectionStatus.CONNECTED,
      message: 'Connected to MongoDB'
    });
  }

  /**
   * Start health check interval
   */
  private startHealthCheck(): void {
    // Clear existing interval if any
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    // Start new interval
    this.healthCheckInterval = setInterval(() => {
      this.checkConnection().subscribe();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Handle connection error
   * @param error - Connection error
   * @returns Observable with error
   */
  private handleConnectionError(error: any): Observable<never> {
    let errorType = MongoDBErrorType.UNKNOWN_ERROR;
    let errorMessage = 'Unknown connection error';
    
    if (error instanceof HttpErrorResponse) {
      // HTTP error response (API error)
      if (error.status === 0) {
        errorType = MongoDBErrorType.NETWORK_ERROR;
        errorMessage = 'Network error';
      } else if (error.status === 401 || error.status === 403) {
        errorType = MongoDBErrorType.AUTHENTICATION_ERROR;
        errorMessage = 'Authentication error';
      } else if (error.status === 408 || error.error?.type === 'timeout') {
        errorType = MongoDBErrorType.TIMEOUT_ERROR;
        errorMessage = 'Connection timeout';
      } else {
        errorType = MongoDBErrorType.CONNECTION_ERROR;
        errorMessage = error.message || 'Connection error';
      }
    } else if (error.name === 'TimeoutError') {
      // RxJS timeout error
      errorType = MongoDBErrorType.TIMEOUT_ERROR;
      errorMessage = 'Connection timeout';
    }
    
    // Update status to failed
    this.updateStatus(ConnectionStatus.FAILED);
    
    // Log error
    this.loggingService.logError('MongoDBConnectionService', errorType, {
      message: errorMessage,
      details: error
    });
    
    // Add error event
    this.addEvent({
      timestamp: new Date(),
      status: ConnectionStatus.FAILED,
      message: errorMessage,
      error: {
        type: errorType,
        details: error
      }
    });
    
    // Return error observable
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Add connection event to history
   * @param event - Connection event to add
   */
  private addEvent(event: ConnectionEvent): void {
    const currentEvents = this.eventsSubject.getValue();
    const updatedEvents = [...currentEvents, event];
    
    // Limit history to last 100 events
    if (updatedEvents.length > 100) {
      updatedEvents.shift();
    }
    
    this.eventsSubject.next(updatedEvents);
  }

  /**
   * Retry strategy for connection errors
   * @param errors - Observable of errors
   * @returns Observable with retry logic
   */
  private retryStrategy(errors: Observable<any>): Observable<any> {
    return errors.pipe(
      concatMap((error, index) => {
        const retryAttempt = index + 1;
        
        // If max retries reached, throw error
        if (retryAttempt > this.config.maxRetries) {
          return throwError(() => new Error('Connection failed after maximum retry attempts'));
        }
        
        // Calculate exponential backoff delay
        const delay = Math.min(
          this.config.retryDelay * Math.pow(2, retryAttempt - 1),
          30000 // Max 30 seconds
        );
        
        // Log retry attempt
        this.loggingService.logInfo('MongoDBConnectionService', 
          `Retrying connection (${retryAttempt}/${this.config.maxRetries}) after ${delay}ms`);
        
        // Update status to reconnecting
        this.updateStatus(ConnectionStatus.RECONNECTING);
        
        // Add retry event
        this.addEvent({
          timestamp: new Date(),
          status: ConnectionStatus.RECONNECTING,
          message: `Retrying connection (${retryAttempt}/${this.config.maxRetries}) after ${delay}ms`
        });
        
        // Return timer for delay before next attempt
        return timer(delay);
      })
    );
  }
}