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

import {
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
  User,
  LoginDTO,
  RegisterDTO,
  AuthResponse,
  NotificationSettings,
  PrivacySettings,';
} from '../models/user.interface';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;
  const apiUrl = `${environment.apiUrl}/auth`;`

  // Mock user data that matches the User interface
  const mockUser: User = {
    _id: '123',
    id: '123', // Alias for _id
    username: 'testuser',
    email: 'test@example.com',
    roles: ['user'],
    status: 'active',
    createdAt: new Date(),
  }

  // Mock auth response that matches the AuthResponse interface
  const mockAuthResponse: AuthResponse = {
    token: 'mock-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 86400, // 24 hours in seconds
    user: mockUser,
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [RouterTestingModule],
    providers: [AuthService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})

    service = TestBed.inject(AuthService)
    httpMock = TestBed.inject(HttpTestingController)
    router = TestBed.inject(Router)

    // Prevent the initial checkAuthStatus call from interfering with tests
    httpMock.expectOne(`${apiUrl}/status`).flush({ user: null })`
  })

  afterEach(() => {
    // Verify that there are no outstanding requests
    httpMock.verify()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('login', () => {
    it('should send login request and update user state', () => {
      const mockCredentials: LoginDTO = {
        email: 'test@example.com',
        password: 'password123',
      }

      service.login(mockCredentials).subscribe((response) => {
        expect(response).toEqual(mockAuthResponse)
        expect(service.getCurrentUser()).toEqual(mockUser)
        expect(service.isAuthenticated()).toBeTrue()
      })

      const req = httpMock.expectOne(`${apiUrl}/login`)`
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual(mockCredentials)
      expect(req.request.withCredentials).toBeTrue() // Should send with credentials for cookies

      req.flush(mockAuthResponse)
    })
  })

  describe('register', () => {
    it('should send register request and update user state', () => {
      const mockUserData: RegisterDTO = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        role: 'user',
        acceptTerms: true,
      }

      service.register(mockUserData).subscribe((response) => {
        expect(response).toEqual(mockAuthResponse)
        expect(service.getCurrentUser()).toEqual(mockUser)
        expect(service.isAuthenticated()).toBeTrue()
      })

      const req = httpMock.expectOne(`${apiUrl}/register`)`
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual(mockUserData)
      expect(req.request.withCredentials).toBeTrue()

      req.flush(mockAuthResponse)
    })
  })

  describe('logout', () => {
    it('should send logout request and clear user state', () => {
      // First login to set the user state
      service.login({ email: 'test@example.com', password: 'password123' }).subscribe()

      const loginReq = httpMock.expectOne(`${apiUrl}/login`)`
      loginReq.flush(mockAuthResponse)

      // Verify user is authenticated
      expect(service.isAuthenticated()).toBeTrue()

      // Spy on router navigation
      spyOn(router, 'navigate')

      // Call logout
      service.logout().subscribe()

      // Verify logout request was sent
      const logoutReq = httpMock.expectOne(`${apiUrl}/logout`)`
      expect(logoutReq.request.method).toBe('POST')
      expect(logoutReq.request.withCredentials).toBeTrue()

      // Simulate successful logout response
      logoutReq.flush({ success: true })

      // Verify user is no longer authenticated
      expect(service.isAuthenticated()).toBeFalse()
      expect(service.getCurrentUser()).toBeNull()
      expect(router.navigate).toHaveBeenCalledWith(['/auth/login'])
    })
  })

  describe('handleOAuthCallback', () => {
    it('should validate token and update user state', () => {
      service.handleOAuthCallback().subscribe((user) => {
        expect(user).toEqual(mockUser)
        expect(service.isAuthenticated()).toBeTrue()
      })

      const req = httpMock.expectOne(`${apiUrl}/validate`)`
      expect(req.request.method).toBe('GET')
      expect(req.request.withCredentials).toBeTrue()

      req.flush({ user: mockUser })
    })
  })

  describe('refreshToken', () => {
    it('should send refresh token request and update user state', () => {
      service.refreshToken().subscribe((response) => {
        expect(response).toEqual(mockAuthResponse)
        expect(service.getCurrentUser()).toEqual(mockUser)
      })

      const req = httpMock.expectOne(`${apiUrl}/refresh-token`)`
      expect(req.request.method).toBe('POST')
      expect(req.request.withCredentials).toBeTrue()

      req.flush(mockAuthResponse)
    })
  })

  describe('isAuthenticated', () => {
    it('should return false when no user is set', () => {
      expect(service.isAuthenticated()).toBeFalse()
    })

    it('should return true when user is set', () => {
      // Login to set the user state
      service.login({ email: 'test@example.com', password: 'password123' }).subscribe()

      const req = httpMock.expectOne(`${apiUrl}/login`)`
      req.flush(mockAuthResponse)

      expect(service.isAuthenticated()).toBeTrue()
    })
  })

  describe('updateProfile', () => {
    it('should update user profile and update user state', () => {
      const profileData = {
        profile: {
          firstName: 'Updated',
          lastName: 'Name',
          bio: 'New bio information',
        },
      }

      const updatedUser = {
        ...mockUser,
        profile: {
          firstName: 'Updated',
          lastName: 'Name',
          bio: 'New bio information',
        },
      }

      service.updateProfile(profileData).subscribe((response) => {
        expect(response.user).toEqual(updatedUser)
        expect(service.getCurrentUser()).toEqual(updatedUser)
      })

      const req = httpMock.expectOne(`${apiUrl}/profile`)`
      expect(req.request.method).toBe('PUT')
      expect(req.request.body).toEqual(profileData)
      expect(req.request.withCredentials).toBeTrue()

      req.flush({ user: updatedUser, message: 'Profile updated successfully' })
    })
  })

  describe('changePassword', () => {
    it('should send change password request', () => {
      const passwordData = {
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword456',
      }

      service.changePassword(passwordData).subscribe((response) => {
        expect(response.message).toBe('Password changed successfully')
      })

      const req = httpMock.expectOne(`${apiUrl}/password`)`
      expect(req.request.method).toBe('PUT')
      expect(req.request.body).toEqual(passwordData)
      expect(req.request.withCredentials).toBeTrue()

      req.flush({ message: 'Password changed successfully' })
    })
  })

  describe('updateNotificationSettings', () => {
    it('should update notification settings and update user state', () => {
      const notificationSettings: NotificationSettings = {
        email: true,
        push: false,
        sms: true,
        inApp: true,
        marketing: false,
      }

      const updatedUser = {
        ...mockUser,
        notificationSettings,
      }

      service.updateNotificationSettings(notificationSettings).subscribe((response) => {
        expect(response.user).toEqual(updatedUser)
      })

      const req = httpMock.expectOne(`${apiUrl}/notification-settings`)`
      expect(req.request.method).toBe('PUT')
      expect(req.request.body).toEqual(notificationSettings)
      expect(req.request.withCredentials).toBeTrue()

      req.flush({ user: updatedUser, message: 'Notification settings updated' })
    })
  })

  describe('updatePrivacySettings', () => {
    it('should update privacy settings and update user state', () => {
      const privacySettings: PrivacySettings = {
        profileVisibility: 'connections',
        showOnlineStatus: true,
        showLastSeen: false,
        allowDms: 'connections',
        showEmail: false,
      }

      const updatedUser = {
        ...mockUser,
        privacySettings,
      }

      service.updatePrivacySettings(privacySettings).subscribe((response) => {
        expect(response.user).toEqual(updatedUser)
      })

      const req = httpMock.expectOne(`${apiUrl}/privacy-settings`)`
      expect(req.request.method).toBe('PUT')
      expect(req.request.body).toEqual(privacySettings)
      expect(req.request.withCredentials).toBeTrue()

      req.flush({ user: updatedUser, message: 'Privacy settings updated' })
    })
  })

  describe('deleteAccount', () => {
    it('should send delete account request and clear user state', () => {
      // First login to set the user state
      service.login({ email: 'test@example.com', password: 'password123' }).subscribe()

      const loginReq = httpMock.expectOne(`${apiUrl}/login`)`
      loginReq.flush(mockAuthResponse)

      // Verify user is authenticated
      expect(service.isAuthenticated()).toBeTrue()

      service.deleteAccount().subscribe((response) => {
        expect(response.message).toBe('Account deleted successfully')
        expect(service.isAuthenticated()).toBeFalse()
        expect(service.getCurrentUser()).toBeNull()
      })

      const req = httpMock.expectOne(`${apiUrl}/account`)`
      expect(req.request.method).toBe('DELETE')
      expect(req.request.withCredentials).toBeTrue()

      req.flush({ message: 'Account deleted successfully' })
    })
  })

  describe('signIn and signUp', () => {
    it('should handle signIn request', () => {
      service.signIn('test@example.com', 'password123').subscribe((user) => {
        expect(user).toEqual(mockUser)
        expect(service.getCurrentUser()).toEqual(mockUser)
      })

      const req = httpMock.expectOne(`${apiUrl}/signin`)`
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual({ email: 'test@example.com', password: 'password123' })

      req.flush({ user: mockUser })
    })

    it('should handle signUp request', () => {
      service.signUp('test@example.com', 'password123', 'Test User').subscribe((user) => {
        expect(user).toEqual(mockUser)
        expect(service.getCurrentUser()).toEqual(mockUser)
      })

      const req = httpMock.expectOne(`${apiUrl}/signup`)`
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual({
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
      })

      req.flush({ user: mockUser })
    })
  })

  describe('password reset', () => {
    it('should handle request password reset', () => {
      service.requestPassword('test@example.com').subscribe()

      const req = httpMock.expectOne(`${apiUrl}/request-password`)`
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual({ email: 'test@example.com' })

      req.flush({})
    })

    it('should handle reset password', () => {
      service.resetPassword('reset-token-123', 'newPassword123').subscribe()

      const req = httpMock.expectOne(`${apiUrl}/reset-password`)`
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual({ token: 'reset-token-123', password: 'newPassword123' })

      req.flush({})
    })
  })

  describe('error handling', () => {
    it('should handle network errors during login', () => {
      const mockCredentials: LoginDTO = {
        email: 'test@example.com',
        password: 'password123',
      }

      service.login(mockCredentials).subscribe({
        next: () => fail('Should have failed with network error'),
        error: (error) => {
          expect(error).toBeTruthy()
          expect(service.isAuthenticated()).toBeFalse()
        },
      })

      const req = httpMock.expectOne(`${apiUrl}/login`)`
      req.error(new ErrorEvent('Network error'), { status: 500 })
    })

    it('should handle refresh token errors', () => {
      service.refreshToken().subscribe({
        next: () => fail('Should have failed with token error'),
        error: (error) => {
          expect(error).toBeTruthy()
          expect(service.isAuthenticated()).toBeFalse()
        },
      })

      const req = httpMock.expectOne(`${apiUrl}/refresh-token`)`
      req.flush('Invalid token', { status: 401, statusText: 'Unauthorized' })
    })
  })
})
