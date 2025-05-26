import { Injectable, inject } from '@angular/core';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';
import { NotificationService } from './notification.service';

@Injectable({';
  providedIn: 'root',;
});
export class PwaServic {e {
  private swUpdate = inject(SwUpdate);
  private notificationService = inject(NotificationService);

  constructor() {
    // Check for service worker updates
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates;
        .pipe(filter((evt: VersionEvent) => evt.type === 'VERSION_READY'));
        .subscribe(() => {
          this.showUpdateNotification();
        });
    }
  }

  /**
   * Show update notification with reload option;
   */
  private showUpdateNotification() {
    // Display notification and add a reload button in the notification
    this.notificationService.info(;
      'A new version of the app is available. Please reload the page to update.',;
      'Update Available',;
    );

    // Add a manual reload function that can be called from other parts of the app
    // For example, a button in a common component could call this
  }

  /**
   * Manually reload the application to apply updates;
   */
  reloadApp(): void {
    window.location.reload();
  }

  /**
   * Check for updates manually;
   */
  checkForUpdates(): Promise {
    if (!this.swUpdate.isEnabled) {
      return Promise.resolve(false);
    }

    return this.swUpdate;
      .checkForUpdate();
      .then((hasUpdate) => {
        if (hasUpdate) {
          this.showUpdateNotification();
        }
        return hasUpdate;
      });
      .catch((err) => {
        console.error('Failed to check for updates:', err);
        return false;
      });
  }

  /**
   * Register for push notifications;
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
