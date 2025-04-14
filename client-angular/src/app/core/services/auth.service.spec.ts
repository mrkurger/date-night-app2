// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the auth service
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
import { environment } from '../../../environments/environment';
import { User, LoginDTO, RegisterDTO, AuthResponse } from '../models/user.interface';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/auth`;

  // Mock user data that matches the User interface
  const mockUser: User = {
    _id: '123',
    id: '123', // Alias for _id
    username: 'testuser',
    email: 'test@example.com',
    role: 'user'
  };

  // Mock auth response that matches the AuthResponse interface
  const mockAuthResponse: AuthResponse = {
    token: 'mock-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 86400, // 24 hours in seconds
    user: mockUser
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [AuthService]
    });
    
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Prevent the initial validateToken call from interfering with tests
    httpMock.expectOne(`${apiUrl}/validate`).flush(
      { success: false },
      { status: 401, statusText: 'Unauthorized' }
    );
  });

  afterEach(() => {
    // Verify that there are no outstanding requests
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should send login request and update user state', () => {
      const mockCredentials: LoginDTO = { 
        email: 'test@example.com', 
        password: 'password123' 
      };

      service.login(mockCredentials).subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
        expect(service.getCurrentUser()).toEqual(mockUser);
        expect(service.isAuthenticated()).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockCredentials);
      expect(req.request.withCredentials).toBeTrue(); // Should send with credentials for cookies
      
      req.flush(mockAuthResponse);
    });
  });

  describe('register', () => {
    it('should send register request and update user state', () => {
      const mockUserData: RegisterDTO = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        role: 'user',
        acceptTerms: true
      };

      service.register(mockUserData).subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
        expect(service.getCurrentUser()).toEqual(mockUser);
        expect(service.isAuthenticated()).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockUserData);
      expect(req.request.withCredentials).toBeTrue();
      
      req.flush(mockAuthResponse);
    });
  });

  describe('logout', () => {
    it('should send logout request and clear user state', () => {
      // First login to set the user state
      service.login({ email: 'test@example.com', password: 'password123' }).subscribe();
      
      const loginReq = httpMock.expectOne(`${apiUrl}/login`);
      loginReq.flush(mockAuthResponse);
      
      // Verify user is authenticated
      expect(service.isAuthenticated()).toBeTrue();
      
      // Call logout
      service.logout();
      
      // Verify logout request was sent
      const logoutReq = httpMock.expectOne(`${apiUrl}/logout`);
      expect(logoutReq.request.method).toBe('POST');
      expect(logoutReq.request.withCredentials).toBeTrue();
      
      // Simulate successful logout response
      logoutReq.flush({ success: true });
      
      // Verify user is no longer authenticated
      expect(service.isAuthenticated()).toBeFalse();
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  describe('handleOAuthCallback', () => {
    it('should validate token and update user state', () => {
      service.handleOAuthCallback().subscribe(user => {
        expect(user).toEqual(mockUser);
        expect(service.isAuthenticated()).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/validate`);
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBeTrue();
      
      req.flush({ success: true, user: mockUser });
    });
  });

  describe('refreshToken', () => {
    it('should send refresh token request and update user state', () => {
      service.refreshToken().subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
        expect(service.getCurrentUser()).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${apiUrl}/refresh-token`);
      expect(req.request.method).toBe('POST');
      expect(req.request.withCredentials).toBeTrue();
      
      req.flush(mockAuthResponse);
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no user is set', () => {
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should return true when user is set', () => {
      // Login to set the user state
      service.login({ email: 'test@example.com', password: 'password123' }).subscribe();
      
      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush(mockAuthResponse);
      
      expect(service.isAuthenticated()).toBeTrue();
    });
  });

  describe('updateProfile', () => {
    it('should update user profile and update user state', () => {
      const profileData = {
        name: 'Updated Name',
        bio: 'New bio information'
      };
      
      const updatedUser = {
        ...mockUser,
        name: 'Updated Name',
        bio: 'New bio information'
      };
      
      service.updateProfile(profileData).subscribe(response => {
        expect(response.user).toEqual(updatedUser);
        expect(service.getCurrentUser()).toEqual(updatedUser);
      });
      
      const req = httpMock.expectOne(`${apiUrl}/profile`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(profileData);
      expect(req.request.withCredentials).toBeTrue();
      
      req.flush({ success: true, user: updatedUser });
    });
  });

  describe('error handling', () => {
    it('should handle network errors during login', () => {
      const mockCredentials: LoginDTO = { 
        email: 'test@example.com', 
        password: 'password123' 
      };
      
      service.login(mockCredentials).subscribe({
        next: () => fail('Should have failed with network error'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(service.isAuthenticated()).toBeFalse();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.error(new ErrorEvent('Network error'), { status: 500 });
    });

    it('should handle refresh token errors', () => {
      service.refreshToken().subscribe({
        next: () => fail('Should have failed with token error'),
        error: (error) => {
          expect(error.status).toBe(401);
          expect(service.isAuthenticated()).toBeFalse();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/refresh-token`);
      req.flush('Invalid token', { status: 401, statusText: 'Unauthorized' });
    });
  });
});