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
    const token = localStorage.getItem('token');
    const expirationTime = localStorage.getItem('tokenExpiration');

    if (!token || !expirationTime) {
      return;
    }

    const expirationDate = new Date(expirationTime);
    const now = new Date();

    if (expirationDate <= now) {
      // Token expired, try to refresh
      this.refreshToken().subscribe({
        error: () => this.logout()
      });
    } else {
      // Token still valid
      this.validateToken().subscribe();
      this.setAutoLogout(expirationDate.getTime() - now.getTime());
    }
  }

  /**
   * Login with email and password
   */
  login(credentials: LoginDTO): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(tap(response => this.handleAuthResponse(response)));
  }

  /**
   * Register new user
   */
  register(userData: RegisterDTO): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(tap(response => this.handleAuthResponse(response)));
  }

  /**
   * Logout user and clear stored data
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('refreshToken');

    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Handle OAuth callback with token
   */
  handleOAuthCallback(token: string): Observable<User> {
    localStorage.setItem('token', token);

    // Set token expiration (assuming 15 minutes from now)
    const expirationDate = new Date(new Date().getTime() + 15 * 60 * 1000);
    localStorage.setItem('tokenExpiration', expirationDate.toISOString());

    this.setAutoLogout(15 * 60 * 1000);

    return this.validateToken();
  }

  /**
   * Refresh the access token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh-token`, { refreshToken })
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(error => {
          this.logout();
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
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Validate the current token
   */
  private validateToken(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/validate`)
      .pipe(
        tap(user => this.currentUserSubject.next(user)),
        catchError(error => {
          this.logout();
          return throwError(() => error);
        })
      );
  }

  /**
   * Handle authentication response
   */
  private handleAuthResponse(response: AuthResponse): void {
    const { token, refreshToken, expiresIn } = response;

    if (token) {
      localStorage.setItem('token', token);

      // Calculate expiration time
      const expirationDuration = expiresIn ? expiresIn * 1000 : 15 * 60 * 1000; // Default to 15 minutes
      const expirationDate = new Date(new Date().getTime() + expirationDuration);

      localStorage.setItem('tokenExpiration', expirationDate.toISOString());

      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      this.currentUserSubject.next(response.user);
      this.setAutoLogout(expirationDuration);
    }
  }

  /**
   * Set timer for automatic logout when token expires
   */
  private setAutoLogout(expirationDuration: number): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    this.tokenExpirationTimer = setTimeout(() => {
      // Try to refresh token first
      this.refreshToken().subscribe({
        error: () => this.logout()
      });
    }, expirationDuration);
  }
}
