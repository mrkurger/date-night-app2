import { Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NebularModule } from '../../../../app/shared/nebular.module';
import { NotificationMessage } from './notification.model';

@Component({
    selector: 'app-notification',
    imports: [CommonModule, NebularModule],
    template: `
    <div class="notifications-container">
      <nb-card
        *ngFor="let notification of notifications"
        [status]="getNotificationStatus(notification)"
        class="notification-card"
      >
        <nb-card-body>
          <div class="notification-content">
            <nb-icon [icon]="getNotificationIcon(notification)"></nb-icon>
            <span class="notification-message">{{ notification.message }}</span>
          </div>
        </nb-card-body>
      </nb-card>
    </div>
  `,
    styles: [
        `
      .notifications-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        max-width: 400px;
      }

      .notification-card {
        margin-bottom: 10px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
      }

      .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .notification-message {
        flex: 1;
      }

      nb-icon {
        font-size: 1.5rem;
      }
    `,
    ]
})
export class NotificationComponent implements OnDestroy {
  @Input() notifications: NotificationMessage[] = [];

  // This property is used in tests
  get activeNotifications(): NotificationMessage[] {
    return this.notifications;
  }

  private timeoutIds: number[] = [];

  ngOnDestroy(): void {
    // Clear any timeouts
    this.timeoutIds.forEach((id) => clearTimeout(id));
  }

  getNotificationStatus(notification: NotificationMessage): string {
    switch (notification.type) {
      case 'success':
        return 'success';
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  }

  getNotificationIcon(notification: NotificationMessage): string {
    switch (notification.type) {
      case 'success':
        return 'checkmark-circle-2-outline';
      case 'error':
        return 'alert-circle-outline';
      case 'warning':
        return 'alert-triangle-outline';
      case 'info':
      default:
        return 'info-outline';
    }
  }
}
