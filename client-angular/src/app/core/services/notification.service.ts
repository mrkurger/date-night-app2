import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export enum NotificationType {
  Success = 'success',
  Error = 'error',
  Info = 'info',
  Warning = 'warning'
}

export interface Notification {
  type: NotificationType;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<Notification>();
  public notifications$: Observable<Notification> = this.notificationSubject.asObservable();

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
   * Show a notification
   * @param type The type of notification
   * @param message The message to display
   * @param duration Optional duration in milliseconds
   */
  private notify(type: NotificationType, message: string, duration?: number): void {
    this.notificationSubject.next({ type, message, duration });
  }
}