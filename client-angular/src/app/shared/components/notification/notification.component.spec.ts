// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the notification component
// 
// COMMON CUSTOMIZATIONS:
// - MOCK_NOTIFICATION_SERVICE: Mock notification service configuration
//   Related to: client-angular/src/app/core/services/notification.service.ts
// ===================================================

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { NotificationComponent, NotificationType, ToastNotification } from './notification.component';
import { NotificationService } from '../../../core/services/notification.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('NotificationComponent', () => {
  let component: NotificationComponent;
  let fixture: ComponentFixture<NotificationComponent>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let toastsSubject: BehaviorSubject<ToastNotification[]>;

  beforeEach(async () => {
    // Create a subject to control the toasts observable
    toastsSubject = new BehaviorSubject<ToastNotification[]>([]);
    
    // Create mock notification service
    mockNotificationService = jasmine.createSpyObj('NotificationService', 
      ['success', 'error', 'info', 'warning', 'removeToast'],
      {
        // Mock the toasts$ observable
        toasts$: toastsSubject.asObservable()
      }
    );

    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        NotificationComponent
      ],
      providers: [
        { provide: NotificationService, useValue: mockNotificationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display notifications when received from service', () => {
    // Arrange
    const testNotifications: ToastNotification[] = [
      {
        id: 'test-id-1',
        message: 'Test notification 1',
        type: NotificationType.SUCCESS,
        timestamp: new Date(),
        autoClose: true,
        duration: 3000
      }
    ];
    
    // Act
    toastsSubject.next(testNotifications);
    fixture.detectChanges();
    
    // Assert
    const notificationElements = fixture.nativeElement.querySelectorAll('.notification');
    expect(notificationElements.length).toBe(1);
    expect(notificationElements[0].textContent).toContain('Test notification 1');
    expect(notificationElements[0].classList).toContain('notification-success');
  });

  it('should remove notification when close button is clicked', () => {
    // Arrange
    const testNotifications: ToastNotification[] = [
      {
        id: 'test-id-1',
        message: 'Test notification 1',
        type: NotificationType.SUCCESS,
        timestamp: new Date(),
        autoClose: true,
        duration: 3000
      }
    ];
    
    toastsSubject.next(testNotifications);
    fixture.detectChanges();
    
    // Act
    const closeButton = fixture.nativeElement.querySelector('.notification-close');
    closeButton.click();
    fixture.detectChanges();
    
    // Assert
    expect(mockNotificationService.removeToast).toHaveBeenCalledWith('test-id-1');
    expect(component.activeNotifications.length).toBe(0);
  });

  it('should handle multiple notifications', () => {
    // Arrange
    const testNotifications: ToastNotification[] = [
      {
        id: 'test-id-1',
        message: 'Success notification',
        type: NotificationType.SUCCESS,
        timestamp: new Date(),
        autoClose: true,
        duration: 3000
      },
      {
        id: 'test-id-2',
        message: 'Error notification',
        type: NotificationType.ERROR,
        timestamp: new Date(),
        autoClose: true,
        duration: 3000
      }
    ];
    
    // Act
    toastsSubject.next(testNotifications);
    fixture.detectChanges();
    
    // Assert
    const notificationElements = fixture.nativeElement.querySelectorAll('.notification');
    expect(notificationElements.length).toBe(2);
    expect(notificationElements[0].textContent).toContain('Success notification');
    expect(notificationElements[1].textContent).toContain('Error notification');
    expect(notificationElements[0].classList).toContain('notification-success');
    expect(notificationElements[1].classList).toContain('notification-error');
  });

  it('should not add duplicate notifications with the same id', () => {
    // Arrange
    const initialNotification: ToastNotification = {
      id: 'test-id-1',
      message: 'Initial notification',
      type: NotificationType.SUCCESS,
      timestamp: new Date(),
      autoClose: true,
      duration: 3000
    };
    
    // Add initial notification
    toastsSubject.next([initialNotification]);
    fixture.detectChanges();
    
    // Act - add the same notification again plus a new one
    const duplicateNotification: ToastNotification = {
      ...initialNotification,
      message: 'Updated message' // Message changed but ID is the same
    };
    
    const newNotification: ToastNotification = {
      id: 'test-id-2',
      message: 'New notification',
      type: NotificationType.INFO,
      timestamp: new Date(),
      autoClose: true,
      duration: 3000
    };
    
    toastsSubject.next([duplicateNotification, newNotification]);
    fixture.detectChanges();
    
    // Assert - should only have the initial notification and the new one
    expect(component.activeNotifications.length).toBe(2);
    
    const notificationElements = fixture.nativeElement.querySelectorAll('.notification');
    expect(notificationElements.length).toBe(2);
    // The first notification should still have the initial message
    expect(notificationElements[0].textContent).toContain('Initial notification');
    expect(notificationElements[1].textContent).toContain('New notification');
  });

  it('should clean up timeouts on component destroy', () => {
    // Arrange
    const testNotifications: ToastNotification[] = [
      {
        id: 'test-id-1',
        message: 'Test notification',
        type: NotificationType.SUCCESS,
        timestamp: new Date(),
        autoClose: true,
        duration: 3000
      }
    ];
    
    toastsSubject.next(testNotifications);
    fixture.detectChanges();
    
    // Spy on clearTimeout
    spyOn(window, 'clearTimeout');
    
    // Act
    component.ngOnDestroy();
    
    // Assert
    expect(window.clearTimeout).toHaveBeenCalled();
  });
});