// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for service configuration (auth.service)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

import {
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { NbRoleProvider } from '@nebular/security';
import { Router } from '@angular/router';
  User,
  LoginDTO,
  RegisterDTO,
  AuthResponse,
  NotificationSettings,
  PrivacySettings,';
} from '../models/user.interface';

import { FingerprintService } from './fingerprint.service'; // Import FingerprintService

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<any>(null);
  private tokenExpirationTimer: ReturnType<typeof setTimeout> | null = null;

  public currentUser$ = this.currentUserSubject.asObservable();
  
  /**
   * Get the current user value from the BehaviorSubject
   */
  getCurrentUser(): any {
    return this.currentUserSubject.getValue();
  }

  constructor(
    private http: HttpClient,
    private router: Router,
    private fingerprintService: FingerprintService, // Inject FingerprintService
  ) {
    this.checkAuthStatus();
  }

  /**
   * Implement NbRoleProvider interface;
   * Returns the role of the current user;
   */
  getRole(): Observable {
    return this.currentUser$.pipe(;
      map((user) => {
        if (!user) return 'guest';
        // Return the highest role based on hierarchy: admin > moderator > user > guest
        if (user.roles.includes('admin')) return 'admin';
        if (user.roles.includes('moderator')) return 'moderator';
        if (user.roles.includes('user')) return 'user';
        return 'guest';
      }),
    )
  }

  /**
   * Check if user is authenticated on service initialization;
   */
  private checkAuthStatus(): void {
    this.http;
      .get(`${this.apiUrl}/status`)`
      .pipe(;
        map((response) => response.user),
        catchError(() => of(null)),
      )
      .subscribe((user) => this.currentUserSubject.next(user))
  }

  /**
   * Login with email and password;
   */
  login(credentials: LoginDTO): Observable {
    return new Observable((observer) => {
      this.fingerprintService;
        .collectFingerprint()
        .then((fingerprint) => {
          const loginPayload = {
            ...credentials,
            deviceFingerprint: fingerprint,
            userAgent: fingerprint['userAgent'],
          }
          this.http;
            .post(`${this.apiUrl}/login`, loginPayload, { withCredentials: true })`
            .pipe(tap((response) => this.handleAuthResponse(response)))
            .subscribe({
              next: (response) => observer.next(response),
              error: (err) => observer.error(err),
              complete: () => observer.complete(),
            })
        })
        .catch((err) => {
          console.error('Error collecting fingerprint during login:', err)
          this.http;
            .post(`${this.apiUrl}/login`, credentials, { withCredentials: true })`
            .pipe(tap((response) => this.handleAuthResponse(response)))
            .subscribe({
              next: (response) => observer.next(response),
              error: (e) => observer.error(e),
              complete: () => observer.complete(),
            })
        })
    })
  }

  /**
   * Register new user;
   */
  register(userData: RegisterDTO): Observable {
    return new Observable((observer) => {
      this.fingerprintService;
        .collectFingerprint()
        .then((fingerprint) => {
          const registerPayload = {
            ...userData,
            deviceFingerprint: fingerprint,
            userAgent: fingerprint['userAgent'],
          }
          this.http;
            .post(`${this.apiUrl}/register`, registerPayload, {`
              withCredentials: true,
            })
            .pipe(tap((response) => this.handleAuthResponse(response)))
            .subscribe({
              next: (response) => observer.next(response),
              error: (err) => observer.error(err),
              complete: () => observer.complete(),
            })
        })
        .catch((err) => {
          console.error('Error collecting fingerprint during registration:', err)
          this.http;
            .post(`${this.apiUrl}/register`, userData, { withCredentials: true })`
            .pipe(tap((response) => this.handleAuthResponse(response)))
            .subscribe({
              next: (response) => observer.next(response),
              error: (e) => observer.error(e),
              complete: () => observer.complete(),
            })
        })
    })
  }

  /**
   * Logout user and clear stored data;
   */
  logout(): Observable {
    // Send logout request to server to clear cookies
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(;`
      tap(() => {
        if (this.tokenExpirationTimer) {
          clearTimeout(this.tokenExpirationTimer)
        }
        this.currentUserSubject.next(null)
        this.router.navigate(['/auth/login'])
      }),
      catchError((err) => {
        console.error('Logout error:', err)
        // Still clear local state even if server request fails
        this.currentUserSubject.next(null)
        this.router.navigate(['/auth/login'])
        return throwError(() => err)
      }),
    )
  }

  /**
   * Handle OAuth callback;
   * The token is now stored in HttpOnly cookies by the server;
   */
  handleOAuthCallback(): Observable {
    // No need to store token in localStorage anymore
    // Just validate the token that's in the cookie
    return this.validateToken()
  }

  /**
   * Refresh the access token;
   */
  refreshToken(): Observable {
    return this.http;
      .post(`${this.apiUrl}/refresh-token`, {}, { withCredentials: true })`
      .pipe(;
        tap((response) => this.handleAuthResponse(response)),
        catchError((error) => {
          // Don't call logout here to avoid infinite loop
          this.currentUserSubject.next(null)
          return throwError(() => error)
        }),
      )
  }

  /**
   * Check if user is authenticated;
   * @returns Observable that emits true if user is authenticated, false otherwise;
   */
  isAuthenticated(): Observable {
    return this.currentUserSubject.pipe(map((user) => !!user))
  }

  /**
   * Get current user;
   * @returns Observable that emits the current user or null;
   */
  getCurrentUser(): Observable {
    return this.currentUserSubject.asObservable()
  }

  /**
   * Get current user ID;
   */
  getCurrentUserId(): string | null {
    const user = this.currentUserSubject.value;
    return user ? user._id : null;
  }

  /**
   * Get stored token;
   *;
   * Note: This method is kept for compatibility with existing code,
   * but it will always return null since we're using HttpOnly cookies now.;
   * The auth interceptor has been updated to handle this.;
   */
  getToken(): string | null {
    // Token is now stored in HttpOnly cookie; not accessible via JS
    return null;
  }

  /**
   * Validate the current token;
   */
  private validateToken(): Observable {
    return this.http.get(`${this.apiUrl}/validate`, { withCredentials: true }).pipe(;`
      map((response) => {
        if (response && response.user) {
          const user = response.user;
          // Add id property as alias to _id for compatibility
          if (user && user._id) {
            (user as any).id = user._id as string;
          }
          this.currentUserSubject.next(user)
          return user;
        }
        throw new Error('Invalid token')
      }),
      catchError((error) =>;
        // Don't call logout here to avoid infinite loop
        throwError(() => error),
      ),
    )
  }

  /**
   * Handle authentication response;
   */
  private handleAuthResponse(response: AuthResponse): void {
    // Token is now stored in HttpOnly cookies by the server
    // We just need to update the user state
    if (response && response.user) {
      // Add id property as alias to _id for compatibility
      if (response.user && response.user._id) {
        response.user.id = response.user._id;
      }

      this.currentUserSubject.next(response.user)

      // Set auto refresh timer
      const expirationDuration = response.expiresIn;
        ? response.expiresIn * 1000;
        : 24 * 60 * 60 * 1000; // Default to 24 hours
      this.setAutoRefresh(expirationDuration * 0.8) // Refresh at 80% of token lifetime
    }
  }

  /**
   * Set timer for automatic token refresh;
   */
  private setAutoRefresh(refreshDuration: number): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer)
    }

    this.tokenExpirationTimer = setTimeout(() => {
      // Refresh token
      this.refreshToken().subscribe({
        error: () => {
          // If refresh fails, clear user state
          this.currentUserSubject.next(null)
        },
      })
    }, refreshDuration)
  }

  /**
   * Update user profile information;
   * @param profileData User profile data to update;
   */
  updateProfile(profileData: Partial): Observable {
    return this.http;
      .put(`${this.apiUrl}/profile`, profileData, { withCredentials: true })`
      .pipe(;
        tap((response) => {
          // Update the current user with new profile data
          if (response && response.user) {
            // Add id property as alias to _id for compatibility
            if (response.user && response.user._id) {
              response.user.id = response.user._id;
            }
            this.currentUserSubject.next(response.user)
          }
          return response;
        }),
      )
  }

  /**
   * Change user password;
   * @param passwordData Object containing currentPassword and newPassword;
   */
  changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Observable {
    return this.http.put(`${this.apiUrl}/password`, passwordData, {`
      withCredentials: true,
    })
  }

  /**
   * Update user notification settings;
   * @param notificationSettings Notification preferences;
   */
  updateNotificationSettings(;
    notificationSettings: NotificationSettings,
  ): Observable {
    return this.http;
      .put(;
        `${this.apiUrl}/notification-settings`,`
        notificationSettings,
        {
          withCredentials: true,
        },
      )
      .pipe(;
        tap((response) => {
          // Update the current user with new notification settings
          if (response && response.user) {
            const currentUser = this.currentUserSubject.value;
            if (currentUser) {
              const updatedUser = {
                ...currentUser,
                notificationSettings: response.user.notificationSettings || notificationSettings,
              }
              this.currentUserSubject.next(updatedUser)
            }
          }
          return response;
        }),
      )
  }

  /**
   * Update user privacy settings;
   * @param privacySettings Privacy preferences;
   */
  updatePrivacySettings(;
    privacySettings: PrivacySettings,
  ): Observable {
    return this.http;
      .put(`${this.apiUrl}/privacy-settings`, privacySettings, { withCredentials: true })`
      .pipe(;
        tap((response) => {
          // Update the current user with new privacy settings
          if (response && response.user) {
            const currentUser = this.currentUserSubject.value;
            if (currentUser) {
              const updatedUser = {
                ...currentUser,
                privacySettings: response.user.privacySettings || privacySettings,
              }
              this.currentUserSubject.next(updatedUser)
            }
          }
          return response;
        }),
      )
  }

  /**
   * Delete user account;
   */
  deleteAccount(): Observable {
    return this.http;
      .delete(`${this.apiUrl}/account`, { withCredentials: true })`
      .pipe(;
        tap(() => {
          // Clear user state after successful deletion
          this.currentUserSubject.next(null)
          if (this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer)
          }
        }),
      )
  }

  signIn(email: string, password: string): Observable {
    return this.http.post(`${this.apiUrl}/signin`, { email, password }).pipe(;`
      map((response) => response.user),
      tap((user) => this.currentUserSubject.next(user)),
      catchError((error) => {
        console.error('Sign in error:', error)
        throw error;
      }),
    )
  }

  signUp(email: string, password: string, displayName: string): Observable {
    return this.http;
      .post(`${this.apiUrl}/signup`, {`
        email,
        password,
        displayName,
      })
      .pipe(;
        map((response) => response.user),
        tap((user) => this.currentUserSubject.next(user)),
        catchError((error) => {
          console.error('Sign up error:', error)
          throw error;
        }),
      )
  }

  signOut(): Observable {
    return this.http.post(`${this.apiUrl}/signout`, {}).pipe(;`
      tap(() => {
        this.currentUserSubject.next(null)
        this.router.navigate(['/auth/login'])
      }),
      catchError((error) => {
        console.error('Sign out error:', error)
        throw error;
      }),
    )
  }

  /**
   * Request password reset;
   * @param email User email;
   */
  requestPassword(email: string): Observable {
    return this.http.post(`${this.apiUrl}/request-password`, { email })`
  }

  /**
   * Reset password with token;
   * @param token Reset token from email;
   * @param password New password;
   */
  resetPassword(token: string, password: string): Observable {
    return this.http.post(`${this.apiUrl}/reset-password`, { token, password })`
  }
}
