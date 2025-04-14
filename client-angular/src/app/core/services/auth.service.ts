
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for service configuration (auth.service)
// 
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, LoginDTO, RegisterDTO, AuthResponse } from '../models/user.interface';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenExpirationTimer: any;

  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkAuthStatus();
  }

  /**
   * Check if user is authenticated on service initialization
   */
  private checkAuthStatus(): void {
    // With HttpOnly cookies, we need to validate with the server
    // We don't have access to the token expiration time client-side
    this.validateToken().subscribe({
      next: (user) => {
        // Set auto refresh token timer (every 12 hours)
        this.setAutoRefresh(12 * 60 * 60 * 1000);
      },
      error: () => {
        // Try to refresh the token if validation fails
        this.refreshToken().subscribe({
          error: () => {
            // Clear user state if refresh fails
            this.currentUserSubject.next(null);
          }
        });
      }
    });
  }

  /**
   * Login with email and password
   */
  login(credentials: LoginDTO): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials, { withCredentials: true })
      .pipe(tap(response => this.handleAuthResponse(response)));
  }

  /**
   * Register new user
   */
  register(userData: RegisterDTO): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData, { withCredentials: true })
      .pipe(tap(response => this.handleAuthResponse(response)));
  }

  /**
   * Logout user and clear stored data
   */
  logout(): void {
    // Send logout request to server to clear cookies
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .subscribe({
        next: () => {
          if (this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
          }

          this.currentUserSubject.next(null);
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          console.error('Logout error:', err);
          // Still clear local state even if server request fails
          this.currentUserSubject.next(null);
          this.router.navigate(['/auth/login']);
        }
      });
  }

  /**
   * Handle OAuth callback
   * The token is now stored in HttpOnly cookies by the server
   */
  handleOAuthCallback(): Observable<User> {
    // No need to store token in localStorage anymore
    // Just validate the token that's in the cookie
    return this.validateToken();
  }

  /**
   * Refresh the access token
   */
  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh-token`, {}, { withCredentials: true })
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(error => {
          // Don't call logout here to avoid infinite loop
          this.currentUserSubject.next(null);
          return throwError(() => error);
        })
      );
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get stored token
   *
   * Note: This method is kept for compatibility with existing code,
   * but it will always return null since we're using HttpOnly cookies now.
   * The auth interceptor has been updated to handle this.
   */
  getToken(): string | null {
    return null; // Token is in HttpOnly cookie, not accessible via JS
  }

  /**
   * Validate the current token
   */
  private validateToken(): Observable<User> {
    return this.http.get<any>(`${this.apiUrl}/validate`, { withCredentials: true })
      .pipe(
        tap(response => {
          if (response && response.user) {
            const user = response.user;
            // Add id property as alias to _id for compatibility
            if (user && user._id) {
              user.id = user._id;
            }
            this.currentUserSubject.next(user);
            return user;
          }
          return response;
        }),
        catchError(error => {
          // Don't call logout here to avoid infinite loop
          return throwError(() => error);
        })
      );
  }

  /**
   * Handle authentication response
   */
  private handleAuthResponse(response: AuthResponse): void {
    // Token is now stored in HttpOnly cookies by the server
    // We just need to update the user state
    if (response && response.user) {
      // Add id property as alias to _id for compatibility
      if (response.user && response.user._id) {
        response.user.id = response.user._id;
      }

      this.currentUserSubject.next(response.user);

      // Set auto refresh timer
      const expirationDuration = response.expiresIn ? response.expiresIn * 1000 : 24 * 60 * 60 * 1000; // Default to 24 hours
      this.setAutoRefresh(expirationDuration * 0.8); // Refresh at 80% of token lifetime
    }
  }

  /**
   * Set timer for automatic token refresh
   */
  private setAutoRefresh(refreshDuration: number): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    this.tokenExpirationTimer = setTimeout(() => {
      // Refresh token
      this.refreshToken().subscribe({
        error: () => {
          // If refresh fails, clear user state
          this.currentUserSubject.next(null);
        }
      });
    }, refreshDuration);
  }

  /**
   * Update user profile information
   * @param profileData User profile data to update
   */
  updateProfile(profileData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/profile`, profileData, { withCredentials: true })
      .pipe(
        tap(response => {
          // Update the current user with new profile data
          if (response && response.user) {
            // Add id property as alias to _id for compatibility
            if (response.user && response.user._id) {
              response.user.id = response.user._id;
            }
            this.currentUserSubject.next(response.user);
          }
          return response;
        })
      );
  }

  /**
   * Change user password
   * @param passwordData Object containing currentPassword and newPassword
   */
  changePassword(passwordData: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/password`, passwordData, { withCredentials: true });
  }

  /**
   * Update user notification settings
   * @param notificationSettings Notification preferences
   */
  updateNotificationSettings(notificationSettings: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/notification-settings`, notificationSettings, { withCredentials: true })
      .pipe(
        tap(response => {
          // Update the current user with new notification settings
          if (response && response.user) {
            const currentUser = this.currentUserSubject.value;
            if (currentUser) {
              const updatedUser = {
                ...currentUser,
                notificationSettings: response.user.notificationSettings || notificationSettings
              };
              this.currentUserSubject.next(updatedUser);
            }
          }
          return response;
        })
      );
  }

  /**
   * Update user privacy settings
   * @param privacySettings Privacy preferences
   */
  updatePrivacySettings(privacySettings: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/privacy-settings`, privacySettings, { withCredentials: true })
      .pipe(
        tap(response => {
          // Update the current user with new privacy settings
          if (response && response.user) {
            const currentUser = this.currentUserSubject.value;
            if (currentUser) {
              const updatedUser = {
                ...currentUser,
                privacySettings: response.user.privacySettings || privacySettings
              };
              this.currentUserSubject.next(updatedUser);
            }
          }
          return response;
        })
      );
  }

  /**
   * Delete user account
   */
  deleteAccount(): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/account`, { withCredentials: true })
      .pipe(
        tap(() => {
          // Clear user state after successful deletion
          this.currentUserSubject.next(null);
          if (this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
          }
        })
      );
  }
}
