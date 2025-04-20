// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for service configuration (notification.service)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

export interface ToastNotification {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
  autoClose?: boolean;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly apiUrl = environment.apiUrl + '/notifications';

  // Add unreadCount$ BehaviorSubject
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  // Add toasts$ BehaviorSubject for notification component
  private toastsSubject = new BehaviorSubject<ToastNotification[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  private toasts: ToastNotification[] = [];

  constructor(
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {
    // Initialize with 0 unread notifications
    this.unreadCountSubject.next(0);
  }

  success(message: string, action = 'Close', options = {}) {
    const snackBarRef = this.snackBar.open(message, action, {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar'],
      ...options,
    });

    // Also add to toasts
    this.addToast({
      id: this.generateId(),
      message,
      type: NotificationType.SUCCESS,
      timestamp: new Date(),
      autoClose: true,
      duration: 3000,
    });

    return snackBarRef;
  }

  error(message: string, action = 'Close', options = {}) {
    const snackBarRef = this.snackBar.open(message, action, {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
      ...options,
    });

    // Also add to toasts
    this.addToast({
      id: this.generateId(),
      message,
      type: NotificationType.ERROR,
      timestamp: new Date(),
      autoClose: true,
      duration: 5000,
    });

    return snackBarRef;
  }

  warning(message: string, action = 'Close', options = {}) {
    const snackBarRef = this.snackBar.open(message, action, {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['warning-snackbar'],
      ...options,
    });

    // Also add to toasts
    this.addToast({
      id: this.generateId(),
      message,
      type: NotificationType.WARNING,
      timestamp: new Date(),
      autoClose: true,
      duration: 4000,
    });

    return snackBarRef;
  }

  info(message: string, action = 'Close', options = {}) {
    const snackBarRef = this.snackBar.open(message, action, {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['info-snackbar'],
      ...options,
    });

    // Also add to toasts
    this.addToast({
      id: this.generateId(),
      message,
      type: NotificationType.INFO,
      timestamp: new Date(),
      autoClose: true,
      duration: 3000,
    });

    return snackBarRef;
  }

  // Add a toast notification
  private addToast(toast: ToastNotification): void {
    this.toasts.push(toast);
    this.toastsSubject.next([...this.toasts]);

    if (toast.autoClose) {
      setTimeout(() => {
        this.removeToast(toast.id);
      }, toast.duration || 3000);
    }
  }

  // Remove a toast notification
  removeToast(id: string): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.toastsSubject.next([...this.toasts]);
  }

  // Generate a unique ID for toasts
  private generateId(): string {
    return (
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
  }

  // Get unread notifications count from the server
  getUnreadNotificationsCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/unread-count`);
  }

  // Update the unread count
  updateUnreadCount(count: number): void {
    this.unreadCountSubject.next(count);
  }
}
