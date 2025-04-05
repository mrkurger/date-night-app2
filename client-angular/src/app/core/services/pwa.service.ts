import { Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  constructor(
    private swUpdate: SwUpdate,
    private notificationService: NotificationService
  ) {
    // Check for service worker updates
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(() => {
          this.notificationService.info(
            'A new version of the app is available. Reload the page to update.',
            'Update Available',
            {
              duration: 10000,
              action: 'Reload'
            }
          ).onAction().subscribe(() => {
            window.location.reload();
          });
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
    
    return this.swUpdate.checkForUpdate()
      .then(hasUpdate => {
        if (hasUpdate) {
          this.notificationService.info(
            'A new version of the app is available. Reload the page to update.',
            'Update Available',
            {
              duration: 10000,
              action: 'Reload'
            }
          ).onAction().subscribe(() => {
            window.location.reload();
          });
        }
        return hasUpdate;
      })
      .catch(err => {
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
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.notificationService.success('Push notifications enabled!');
          // Here you would register the push subscription with your server
        }
      });
    }
  }
}