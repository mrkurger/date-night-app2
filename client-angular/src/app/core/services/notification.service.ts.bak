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
import { NbToastrService, NbGlobalPhysicalPosition } from '@nebular/theme';
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
    private toastrService: NbToastrService,
    private http: HttpClient,
  ) {
    // Initialize with 0 unread notifications
    this.unreadCountSubject.next(0);
  }

  success(message: string, title: string = 'Success'): void {
    this.toastrService.show(message, title, {
      status: 'success',
      duration: 3000,
      position: NbGlobalPhysicalPosition.TOP_RIGHT,
    });
  }

  error(message: string, title: string = 'Error'): void {
    this.toastrService.show(message, title, {
      status: 'danger',
      duration: 5000,
      position: NbGlobalPhysicalPosition.TOP_RIGHT,
    });
  }

  warning(message: string, title: string = 'Warning'): void {
    this.toastrService.show(message, title, {
      status: 'warning',
      duration: 4000,
      position: NbGlobalPhysicalPosition.TOP_RIGHT,
    });
  }

  info(message: string, title: string = 'Info'): void {
    this.toastrService.show(message, title, {
      status: 'info',
      duration: 3000,
      position: NbGlobalPhysicalPosition.TOP_RIGHT,
    });
  }

  dismiss(): void {
    // NbToastrService automatically handles dismissal
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
    this.toasts = this.toasts.filter((t) => t.id !== id);
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
