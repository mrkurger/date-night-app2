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
    email: 'test@example.com'
  };

  const mockCredentials = {
    email: 'test@example.com',
    password: 'Password123!'
  };

  const mockAuthResponse = {
    user: mockUser,
    token: 'mock-token'
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
    it('should send login request and store token', () => {
      service.login(mockCredentials).subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
        expect(localStorage.getItem('token')).toBe(mockAuthResponse.token);
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

      service.login({...mockCredentials, password: 'wrongpassword'}).subscribe({
        next: () => fail('should have failed with 401 error'),
        error: error => {
          expect(error.status).toBe(401);
          expect(localStorage.getItem('token')).toBeNull();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush('Invalid credentials', errorResponse);
    });
  });

  describe('logout', () => {
    it('should send logout request and clear token', () => {
      // Setup initial state
      localStorage.setItem('token', mockAuthResponse.token);
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      
      service.logout().subscribe(() => {
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('currentUser')).toBeNull();
      });
      
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
      expect(req.request.method).toBe('POST');
      req.flush({ success: true });
    });
  });

  describe('getCurrentUser', () => {
    it('should return user from localStorage', () => {
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      const user = service.getCurrentUser();
      expect(user).toEqual(mockUser);
    });

    it('should return null when no user is stored', () => {
      const user = service.getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorage.setItem('token', mockAuthResponse.token);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when token does not exist', () => {
      expect(service.isAuthenticated()).toBe(false);
    });
  });
});