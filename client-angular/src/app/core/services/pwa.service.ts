import { Injectable, inject } from '@angular/core';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class PwaService {
  private swUpdate = inject(SwUpdate);
  private notificationService = inject(NotificationService);

  constructor() {
    // Check for service worker updates
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(filter((evt: VersionEvent) => evt.type === 'VERSION_READY'))
        .subscribe(() => {
          this.showUpdateNotification();
        });
    }
  }

  /**
   * Show update notification with reload option
   */
  private showUpdateNotification() {
    const notification = this.notificationService.info(
      'A new version of the app is available. Reload the page to update.',
    );

    // If the notification service supports actions, subscribe to them
    if (notification && typeof notification.onAction === 'function') {
      notification.onAction().subscribe(() => {
        window.location.reload();
      });
    }
  }

  /**
   * Check for updates manually
   */
  checkForUpdates(): Promise<boolean> {
    if (!this.swUpdate.isEnabled) {
      return Promise.resolve(false);
    }

    return this.swUpdate
      .checkForUpdate()
      .then((hasUpdate) => {
        if (hasUpdate) {
          this.showUpdateNotification();
        }
        return hasUpdate;
      })
      .catch((err) => {
        console.error('Failed to check for updates:', err);
        return false;
      });
  }

  /**
   * Register for push notifications
   */
  registerForPush() {
    // This is a placeholder for push notification registration
    // Implementation will depend on your backend push notification service
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          this.notificationService.success('Push notifications enabled!');
          // Here you would register the push subscription with your server
        }
      });
    }
  }
}
