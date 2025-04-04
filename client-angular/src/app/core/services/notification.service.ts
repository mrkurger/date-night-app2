import { Injectable } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';

export enum NotificationType {
  Success = 'success',
  Error = 'error',
  Info = 'info',
  Warning = 'warning'
}

export interface ToastNotification {
  type: NotificationType;
  message: string;
  duration?: number;
}

export interface AppNotification {
  id: string;
  type: 'chat' | 'system' | 'ad' | 'payment' | 'like';
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // Toast notifications
  private toastSubject = new Subject<ToastNotification>();
  public toasts$: Observable<ToastNotification> = this.toastSubject.asObservable();

  // App notifications (persistent)
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);

  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor() { }

  /**
   * Show a success notification
   * @param message The message to display
   * @param duration Optional duration in milliseconds (default: 3000)
   */
  success(message: string, duration: number = 3000): void {
    this.notify(NotificationType.Success, message, duration);
  }

  /**
   * Show an error notification
   * @param message The message to display
   * @param duration Optional duration in milliseconds (default: 5000)
   */
  error(message: string, duration: number = 5000): void {
    this.notify(NotificationType.Error, message, duration);
  }

  /**
   * Show an info notification
   * @param message The message to display
   * @param duration Optional duration in milliseconds (default: 3000)
   */
  info(message: string, duration: number = 3000): void {
    this.notify(NotificationType.Info, message, duration);
  }

  /**
   * Show a warning notification
   * @param message The message to display
   * @param duration Optional duration in milliseconds (default: 4000)
   */
  warning(message: string, duration: number = 4000): void {
    this.notify(NotificationType.Warning, message, duration);
  }

  /**
   * Show a toast notification
   * @param type The type of notification
   * @param message The message to display
   * @param duration Optional duration in milliseconds
   */
  private notify(type: NotificationType, message: string, duration?: number): void {
    this.toastSubject.next({ type, message, duration });
  }

  /**
   * Add a new app notification
   * @param notification Notification to add
   */
  addNotification(notification: AppNotification): void {
    const currentNotifications = this.notificationsSubject.value;

    // Check if notification already exists
    const exists = currentNotifications.some(n => n.id === notification.id);

    if (!exists) {
      const updatedNotifications = [notification, ...currentNotifications];
      this.notificationsSubject.next(updatedNotifications);
      this.updateUnreadCount();

      // Also show as toast
      this.info(notification.message);
    }
  }

  /**
   * Mark a notification as read
   * @param id Notification ID
   */
  markAsRead(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(notification => {
      if (notification.id === id) {
        return { ...notification, read: true };
      }
      return notification;
    });

    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount();
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(notification => ({
      ...notification,
      read: true
    }));

    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount();
  }

  /**
   * Remove a notification
   * @param id Notification ID
   */
  removeNotification(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.filter(
      notification => notification.id !== id
    );

    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount();
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notificationsSubject.next([]);
    this.updateUnreadCount();
  }

  /**
   * Update unread count
   */
  private updateUnreadCount(): void {
    const count = this.notificationsSubject.value.filter(n => !n.read).length;
    this.unreadCountSubject.next(count);
  }

  /**
   * Get all notifications
   */
  getNotifications(): AppNotification[] {
    return this.notificationsSubject.value;
  }

  /**
   * Get unread notifications
   */
  getUnreadNotifications(): AppNotification[] {
    return this.notificationsSubject.value.filter(n => !n.read);
  }

  /**
   * Get unread count
   */
  getUnreadCount(): number {
    return this.unreadCountSubject.value;
  }
}