// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for MongoDB connection service
//
// COMMON CUSTOMIZATIONS:
// - CONNECTION_TEST_SCENARIOS: Define additional test scenarios
//   Related to: mongodb-connection.service.ts:MongoDBConnectionService
// ===================================================
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MongoDBConnectionService } from './mongodb-connection.service';
import { LoggingService } from './logging.service';
import { environment } from '../../../environments/environment';
import { ConnectionStatus, MongoDBErrorType } from './models/mongodb-connection.model';
import { of, throwError } from 'rxjs';

describe('MongoDBConnectionService', () => {
  let service: MongoDBConnectionService;
  let httpMock: HttpTestingController;
  let loggingServiceSpy: jasmine.SpyObj<LoggingService>;

  beforeEach(() => {
    const loggingSpy = jasmine.createSpyObj('LoggingService', [
      'logDebug', 
      'logInfo', 
      'logWarning', 
      'logError', 
      'logPerformance'
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        MongoDBConnectionService,
        { provide: LoggingService, useValue: loggingSpy }
      ]
    });

    service = TestBed.inject(MongoDBConnectionService);
    httpMock = TestBed.inject(HttpTestingController);
    loggingServiceSpy = TestBed.inject(LoggingService) as jasmine.SpyObj<LoggingService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialize', () => {
    it('should initialize with default config when no config provided', () => {
      service.initialize().subscribe(result => {
        expect(result).toBeTrue();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/db/connect`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.uri).toBe(environment.mongoDbUri);
      
      req.flush(true);
    });

    it('should initialize with custom config when provided', () => {
      const customConfig = {
        uri: 'mongodb://custom:27017/custom_db',
        dbName: 'custom_db',
        maxRetries: 3
      };

      service.initialize(customConfig).subscribe(result => {
        expect(result).toBeTrue();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/db/connect`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.uri).toBe(customConfig.uri);
      
      req.flush(true);
    });
  });

  describe('connect', () => {
    it('should connect successfully', () => {
      service.connect().subscribe(result => {
        expect(result).toBeTrue();
        expect(service.getCurrentStatus()).toBe(ConnectionStatus.CONNECTED);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/db/connect`);
      expect(req.request.method).toBe('POST');
      
      req.flush(true);
    });

    it('should handle connection error', () => {
      service.connect().subscribe(
        () => fail('Expected error, got success'),
        error => {
          expect(error).toBeTruthy();
          expect(service.getCurrentStatus()).toBe(ConnectionStatus.FAILED);
        }
      );

      const req = httpMock.expectOne(`${environment.apiUrl}/db/connect`);
      req.flush('Connection error', { status: 500, statusText: 'Server Error' });
    });

    it('should retry connection on failure', () => {
      // Set up spy on private method using any to access private method
      spyOn<any>(service, 'retryStrategy').and.callThrough();

      service.connect().subscribe(
        () => fail('Expected error, got success'),
        error => {
          expect(error).toBeTruthy();
          expect(service.getCurrentStatus()).toBe(ConnectionStatus.FAILED);
          expect(service['retryStrategy']).toHaveBeenCalled();
        }
      );

      const req = httpMock.expectOne(`${environment.apiUrl}/db/connect`);
      req.error(new ErrorEvent('network error'));
    });
  });

  describe('disconnect', () => {
    it('should disconnect successfully', () => {
      service.disconnect().subscribe(result => {
        expect(result).toBeTrue();
        expect(service.getCurrentStatus()).toBe(ConnectionStatus.DISCONNECTED);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/db/disconnect`);
      expect(req.request.method).toBe('POST');
      
      req.flush(true);
    });

    it('should handle disconnect error', () => {
      service.disconnect().subscribe(
        () => fail('Expected error, got success'),
        error => {
          expect(error).toBeTruthy();
          expect(error.message).toBe('Error disconnecting from MongoDB');
        }
      );

      const req = httpMock.expectOne(`${environment.apiUrl}/db/disconnect`);
      req.flush('Disconnect error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('checkConnection', () => {
    it('should return connection status', () => {
      service.checkConnection().subscribe(result => {
        expect(result).toBeTrue();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/db/status`);
      expect(req.request.method).toBe('GET');
      
      req.flush(true);
    });

    it('should handle connection status check error', () => {
      service.checkConnection().subscribe(
        () => fail('Expected error, got success'),
        error => {
          expect(error).toBeTruthy();
          expect(error.message).toBe('Error checking connection status');
          expect(service.getCurrentStatus()).toBe(ConnectionStatus.FAILED);
        }
      );

      const req = httpMock.expectOne(`${environment.apiUrl}/db/status`);
      req.flush('Status check error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('connection status monitoring', () => {
    it('should emit connection status changes', (done) => {
      const statuses: ConnectionStatus[] = [];

      service.status$.subscribe(status => {
        statuses.push(status);
        if (statuses.length === 2) {
          expect(statuses).toEqual([ConnectionStatus.DISCONNECTED, ConnectionStatus.CONNECTING]);
          done();
        }
      });

      service.connect().subscribe();
      httpMock.expectOne(`${environment.apiUrl}/db/connect`).flush(true);
    });

    it('should maintain connection events history', () => {
      service.connect().subscribe();
      httpMock.expectOne(`${environment.apiUrl}/db/connect`).flush(true);
      
      const events = service.getConnectionEvents();
      expect(events.length).toBeGreaterThan(0);
      expect(events[events.length - 1].status).toBe(ConnectionStatus.CONNECTED);
    });
  });

  describe('error handling', () => {
    it('should classify network errors correctly', () => {
      service.connect().subscribe(
        () => fail('Expected error, got success'),
        error => {
          expect(error).toBeTruthy();
          
          const events = service.getConnectionEvents();
          const errorEvent = events.find(e => e.error?.type === MongoDBErrorType.NETWORK_ERROR);
          expect(errorEvent).toBeTruthy();
        }
      );

      const req = httpMock.expectOne(`${environment.apiUrl}/db/connect`);
      req.error(new ErrorEvent('network error'));
    });

    it('should classify authentication errors correctly', () => {
      service.connect().subscribe(
        () => fail('Expected error, got success'),
        error => {
          expect(error).toBeTruthy();
          
          const events = service.getConnectionEvents();
          const errorEvent = events.find(e => e.error?.type === MongoDBErrorType.AUTHENTICATION_ERROR);
          expect(errorEvent).toBeTruthy();
        }
      );

      const req = httpMock.expectOne(`${environment.apiUrl}/db/connect`);
      req.flush('Authentication failed', { status: 401, statusText: 'Unauthorized' });
    });

    it('should classify timeout errors correctly', () => {
      service.connect().subscribe(
        () => fail('Expected error, got success'),
        error => {
          expect(error).toBeTruthy();
          
          const events = service.getConnectionEvents();
          const errorEvent = events.find(e => e.error?.type === MongoDBErrorType.TIMEOUT_ERROR);
          expect(errorEvent).toBeTruthy();
        }
      );

      const req = httpMock.expectOne(`${environment.apiUrl}/db/connect`);
      req.flush({ type: 'timeout', message: 'Connection timed out' }, { status: 408, statusText: 'Request Timeout' });
    });
  });
});