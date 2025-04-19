import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; // Removed map
import { environment } from '../../../environments/environment';
import { User, UserProfile, PublicProfile } from '../models/user.interface';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: 'user' | 'advertiser';
}

export interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = environment.apiUrl + '/users';
  private readonly authUrl = environment.apiUrl + '/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private authStatusSubject = new BehaviorSubject<boolean>(this.hasValidToken());

  constructor(private http: HttpClient) {
    // Initialize current user if token exists
    if (this.hasValidToken()) {
      this.getCurrentUser().subscribe();
    }
  }

  /**
   * Get the current authentication status as an observable
   */
  get authStatus$(): Observable<boolean> {
    return this.authStatusSubject.asObservable();
  }

  /**
   * Get the current user as an observable
   */
  get currentUser$(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  /**
   * Get the current user value
   */
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  /**
   * Login user with email and password
   * @param credentials User login credentials
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/login`, credentials).pipe(
      tap(response => this.handleAuthentication(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Register a new user
   * @param userData User registration data
   */
  register(userData: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/register`, userData).pipe(
      tap(response => this.handleAuthentication(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Logout the current user
   */
  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.authStatusSubject.next(false);
  }

  /**
   * Get user profile by ID
   * @param userId User ID
   */
  getUserProfile(userId: string): Observable<UserProfile> {
    return this.http
      .get<UserProfile>(`${this.apiUrl}/${userId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update user profile with form data (supports file uploads)
   * @param formData Form data with profile updates
   */
  updateProfile(formData: FormData): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/profile`, formData).pipe(
      tap(user => {
        // Update current user if it's the logged-in user
        if (this.currentUser && this.currentUser._id === user._id) {
          this.currentUserSubject.next(user);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update user profile by ID (admin function)
   * @param userId User ID
   * @param userData Updated user data
   */
  updateUserProfile(userId: string, userData: Partial<UserProfile>): Observable<UserProfile> {
    return this.http
      .put<UserProfile>(`${this.apiUrl}/${userId}`, userData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get public profile information for a user
   * @param userId User ID
   */
  getPublicProfile(userId: string): Observable<PublicProfile> {
    return this.http
      .get<PublicProfile>(`${this.apiUrl}/${userId}/public`)
      .pipe(catchError(this.handleError));
  }

  checkFavorite(adId: string): Observable<boolean> {
    return this.http
      .get<boolean>(`${this.apiUrl}/favorites/check/${adId}`)
      .pipe(catchError(this.handleError));
  }

  addFavorite(adId: string): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrl}/favorites/${adId}`, {})
      .pipe(catchError(this.handleError));
  }

  removeFavorite(adId: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/favorites/${adId}`)
      .pipe(catchError(this.handleError));
  }

  getFavorites(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/favorites`).pipe(catchError(this.handleError));
  }

  /**
   * Search users by username or email
   * @param query Search query
   * @returns Observable of search results
   */
  searchUsers(query: string): Observable<User[]> {
    return this.http
      .get<User[]>(`${this.apiUrl}/search`, {
        params: { q: query },
      })
      .pipe(catchError(this.handleError));
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  private loadUserFromToken(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.currentUserSubject.next(payload.user);
      this.authStatusSubject.next(true);
    }
  }

  private handleAuthentication(response: AuthResponse): void {
    const { token, user } = response;
    localStorage.setItem('token', token);
    this.currentUserSubject.next(user);
    this.authStatusSubject.next(true);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Get the current user profile
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap(user => this.currentUserSubject.next(user)),
      catchError(this.handleError)
    );
  }
}
