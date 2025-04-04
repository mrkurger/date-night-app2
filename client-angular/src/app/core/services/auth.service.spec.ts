import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { User, LoginDTO, RegisterDTO, AuthResponse } from '../models/user.interface';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/auth`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Verify that there are no outstanding requests
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should send login request and store token', () => {
      const mockCredentials: LoginDTO = { email: 'test@example.com', password: 'password123' };
      const mockResponse: AuthResponse = {
        token: 'mock-token',
        user: {
          _id: '123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user'
        }
      };

      service.login(mockCredentials).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(localStorage.getItem('token')).toBe('mock-token');
        expect(localStorage.getItem('tokenExpiration')).toBeTruthy();
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockCredentials);
      req.flush(mockResponse);
    });
  });

  describe('register', () => {
    it('should send register request and store token', () => {
      const mockUserData: RegisterDTO = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };
      const mockResponse: AuthResponse = {
        token: 'mock-token',
        user: {
          _id: '123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user'
        }
      };

      service.register(mockUserData).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(localStorage.getItem('token')).toBe('mock-token');
        expect(localStorage.getItem('tokenExpiration')).toBeTruthy();
      });

      const req = httpMock.expectOne(`${apiUrl}/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockUserData);
      req.flush(mockResponse);
    });
  });

  describe('logout', () => {
    it('should remove token and user from storage', () => {
      // Setup: add token to localStorage
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('tokenExpiration', new Date().toISOString());

      service.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('tokenExpiration')).toBeNull();
    });
  });

  describe('handleOAuthCallback', () => {
    it('should store token and validate it', () => {
      const mockToken = 'mock-oauth-token';
      const mockUser: User = {
        _id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user'
      };

      service.handleOAuthCallback(mockToken).subscribe(user => {
        expect(user).toEqual(mockUser);
        expect(localStorage.getItem('token')).toBe(mockToken);
        expect(localStorage.getItem('tokenExpiration')).toBeTruthy();
      });

      const req = httpMock.expectOne(`${apiUrl}/validate`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });
  });

  describe('refreshToken', () => {
    it('should send refresh token request and update token', () => {
      const mockResponse: AuthResponse = {
        token: 'new-mock-token',
        user: {
          _id: '123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user'
        }
      };

      service.refreshToken().subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(localStorage.getItem('token')).toBe('new-mock-token');
        expect(localStorage.getItem('tokenExpiration')).toBeTruthy();
      });

      const req = httpMock.expectOne(`${apiUrl}/refresh-token`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no user is set', () => {
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should return true when user is set', () => {
      // Manually set the current user by calling a method that does this
      const mockResponse: AuthResponse = {
        token: 'mock-token',
        user: {
          _id: '123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user'
        }
      };

      service.login({ email: 'test@example.com', password: 'password123' }).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush(mockResponse);

      expect(service.isAuthenticated()).toBeTrue();
    });
  });

  describe('error handling', () => {
    it('should handle network errors during login', () => {
      const mockCredentials: LoginDTO = { email: 'test@example.com', password: 'password123' };
      
      service.login(mockCredentials).subscribe({
        error: (error) => {
          expect(error.status).toBe(500);
          expect(localStorage.getItem('token')).toBeNull();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.error(new ErrorEvent('Network error'), { status: 500 });
    });

    it('should handle invalid tokens', () => {
      localStorage.setItem('token', 'invalid-token');
      
      service.validateToken().subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
          expect(localStorage.getItem('token')).toBeNull();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/validate`);
      req.flush('Invalid token', { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle concurrent refresh token requests', () => {
      // Test that multiple refresh requests don't cause issues
      const requests = [
        service.refreshToken(),
        service.refreshToken(),
        service.refreshToken()
      ];

      Promise.all(requests).then(() => {
        const refreshCalls = httpMock.match(`${apiUrl}/refresh-token`);
        expect(refreshCalls.length).toBe(1); // Should only make one request
      });

      const req = httpMock.expectOne(`${apiUrl}/refresh-token`);
      req.flush({ token: 'new-token', user: { /* mock user */ } });
    });
  });
});