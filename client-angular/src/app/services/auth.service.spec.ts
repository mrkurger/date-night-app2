// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the Angular auth service
// 
// COMMON CUSTOMIZATIONS:
// - MOCK_USER_DATA: Test user data for auth service tests
// - API_ENDPOINTS: API endpoint configuration for tests
//   Related to: client-angular/src/environments/environment.ts
// ===================================================

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  // Mock user data for testing
  const mockUser = {
    _id: 'user123',
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User'
  };

  const mockCredentials = {
    username: 'testuser',
    password: 'Password123!'
  };

  const mockAuthResponse = {
    user: mockUser,
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ]
    });
    
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Verify that no unmatched requests are outstanding
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should send login request and store tokens', () => {
      service.login(mockCredentials.username, mockCredentials.password).subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
        expect(localStorage.getItem('accessToken')).toBe(mockAuthResponse.accessToken);
        expect(localStorage.getItem('refreshToken')).toBe(mockAuthResponse.refreshToken);
        expect(service.currentUser).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockCredentials);
      
      req.flush(mockAuthResponse);
    });

    it('should handle login error', () => {
      const errorResponse = {
        status: 401,
        statusText: 'Unauthorized'
      };

      service.login(mockCredentials.username, 'wrongpassword').subscribe({
        next: () => fail('should have failed with 401 error'),
        error: error => {
          expect(error.status).toBe(401);
          expect(localStorage.getItem('accessToken')).toBeNull();
          expect(localStorage.getItem('refreshToken')).toBeNull();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush('Invalid credentials', errorResponse);
    });
  });

  describe('register', () => {
    const mockRegisterData = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'Password123!',
      firstName: 'New',
      lastName: 'User'
    };

    it('should send register request and store tokens', () => {
      service.register(mockRegisterData).subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
        expect(localStorage.getItem('accessToken')).toBe(mockAuthResponse.accessToken);
        expect(localStorage.getItem('refreshToken')).toBe(mockAuthResponse.refreshToken);
        expect(service.currentUser).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRegisterData);
      
      req.flush(mockAuthResponse);
    });
  });

  describe('logout', () => {
    it('should clear tokens and user data', () => {
      // Setup initial state
      localStorage.setItem('accessToken', mockAuthResponse.accessToken);
      localStorage.setItem('refreshToken', mockAuthResponse.refreshToken);
      service.currentUser = mockUser;
      
      service.logout();
      
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(service.currentUser).toBeNull();
    });
  });

  describe('refreshToken', () => {
    it('should send refresh token request and update access token', () => {
      // Setup initial state
      localStorage.setItem('refreshToken', mockAuthResponse.refreshToken);
      
      const refreshResponse = {
        accessToken: 'new-access-token',
        user: mockUser
      };
      
      service.refreshToken().subscribe(response => {
        expect(response).toEqual(refreshResponse);
        expect(localStorage.getItem('accessToken')).toBe(refreshResponse.accessToken);
        expect(service.currentUser).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/refresh-token`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refreshToken: mockAuthResponse.refreshToken });
      
      req.flush(refreshResponse);
    });

    it('should handle refresh token error', () => {
      // Setup initial state
      localStorage.setItem('refreshToken', 'invalid-refresh-token');
      
      const errorResponse = {
        status: 401,
        statusText: 'Unauthorized'
      };

      service.refreshToken().subscribe({
        next: () => fail('should have failed with 401 error'),
        error: error => {
          expect(error.status).toBe(401);
          // Should clear tokens on refresh failure
          expect(localStorage.getItem('accessToken')).toBeNull();
          expect(localStorage.getItem('refreshToken')).toBeNull();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/refresh-token`);
      req.flush('Invalid token', errorResponse);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when access token exists', () => {
      localStorage.setItem('accessToken', mockAuthResponse.accessToken);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when access token does not exist', () => {
      expect(service.isAuthenticated()).toBe(false);
    });
  });
});