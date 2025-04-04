import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService, ToastNotification as Notification, NotificationType } from '../../../core/services/notification.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      <div *ngFor="let notification of activeNotifications; let i = index"
           [@notificationState]="notification.state"
           class="notification"
           [ngClass]="'notification-' + notification.type">
        <div class="notification-content">
          <div class="notification-message">{{ notification.message }}</div>
          <button class="notification-close" (click)="removeNotification(i)">×</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notifications-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 350px;
    }
    
    .notification {
      padding: 15px;
      border-radius: 4px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      opacity: 0.9;
      transition: all 0.3s ease;
    }
    
    .notification:hover {
      opacity: 1;
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    }
    
    .notification-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .notification-message {
      flex-grow: 1;
      margin-right: 10px;
    }
    
    .notification-close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.2s;
    }
    
    .notification-close:hover {
      opacity: 1;
    }
    
    .notification-success {
      background-color: #d4edda;
      color: #155724;
      border-left: 4px solid #28a745;
    }
    
    .notification-error {
      background-color: #f8d7da;
      color: #721c24;
      border-left: 4px solid #dc3545;
    }
    
    .notification-info {
      background-color: #d1ecf1;
      color: #0c5460;
      border-left: 4px solid #17a2b8;
    }
    
    .notification-warning {
      background-color: #fff3cd;
      color: #856404;
      border-left: 4px solid #ffc107;
    }
  `],
  animations: [
    trigger('notificationState', [
      state('visible', style({
        transform: 'translateX(0)',
        opacity: 1
      })),
      state('hidden', style({
        transform: 'translateX(100%)',
        opacity: 0
      })),
      transition('hidden => visible', [
        animate('300ms ease-out')
      ]),
      transition('visible => hidden', [
        animate('300ms ease-in')
      ])
    ])
  ]
})
export class NotificationComponent implements OnInit, OnDestroy {
  activeNotifications: Array<{
    type: NotificationType;
    message: string;
    state: 'visible' | 'hidden';
    timeoutId?: number;
  }> = [];
  
  private subscription: Subscription = new Subscription();

  constructor(private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.subscription.add(
      this.notificationService.toasts$.subscribe(notification => {
        this.showNotification(notification);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    // Clear any remaining timeouts
    this.activeNotifications.forEach(notification => {
      if (notification.timeoutId) {
        clearTimeout(notification.timeoutId);
      }
    });
  }

  showNotification(notification: Notification): void {
    const newNotification = {
      type: notification.type,
      message: notification.message,
      state: 'visible' as 'visible' | 'hidden'
    };
    
    this.activeNotifications.push(newNotification);
    
    // Set timeout to remove notification
    const index = this.activeNotifications.length - 1;
    const timeoutId = window.setTimeout(() => {
      this.hideNotification(index);
    }, notification.duration || 3000);
    
    this.activeNotifications[index].timeoutId = timeoutId;
  }

  hideNotification(index: number): void {
    if (index >= 0 && index < this.activeNotifications.length) {
      this.activeNotifications[index].state = 'hidden';
      
      // Remove notification after animation completes
      setTimeout(() => {
        this.removeNotification(index);
      }, 300);
    }
  }

  removeNotification(index: number): void {
    if (index >= 0 && index < this.activeNotifications.length) {
      // Clear timeout if it exists
      if (this.activeNotifications[index].timeoutId) {
        clearTimeout(this.activeNotifications[index].timeoutId);
      }
      
      // Remove notification from array
      this.activeNotifications.splice(index, 1);
    }
  }
}