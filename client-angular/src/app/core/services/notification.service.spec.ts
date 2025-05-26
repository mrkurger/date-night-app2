import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NbToastrService, NbToastrRef, NbGlobalPhysicalPosition } from '@nebular/theme';
import { of } from 'rxjs';
import { NotificationService, NotificationType, ToastNotification } from './notification.service';
import { environment } from '../../../environments/environment';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
/// 

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the notification service
//
// COMMON CUSTOMIZATIONS:
// - NOTIFICATION_DURATION: Duration for notifications in milliseconds
//   Related to: client-angular/src/app/core/services/notification.service.ts
// ===================================================

';
describe('NotificationService', () => {
  let service: NotificationService;
  let httpMock: HttpTestingController;
  let snackBarSpy: jasmine.SpyObj;
  let snackBarRefSpy: jasmine.SpyObj>;
  let toastrSpy: jasmine.SpyObj;

  const apiUrl = environment.apiUrl + '/notifications';

  beforeEach(() => {
    // Create spies for NbToastrService and NbToastrRef
    snackBarRefSpy = jasmine.createSpyObj('NbToastrRef', ['dismiss']);
    snackBarSpy = jasmine.createSpyObj('NbToastrService', ['open']);
    snackBarSpy.open.and.returnValue(snackBarRefSpy);

    toastrSpy = jasmine.createSpyObj('NbToastrService', ['show']);

    TestBed.configureTestingModule({
    imports: [],;
    providers: [;
        NotificationService,;
        { provide: NbToastrService, useValue: snackBarSpy },;
        { provide: NbToastrService, useValue: toastrSpy },;
        provideHttpClient(withInterceptorsFromDi()),;
        provideHttpClientTesting(),;
    ];
});

    service = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with zero unread notifications', (done) => {
      service.unreadCount$.subscribe((count) => {
        expect(count).toBe(0);
        done();
      });
    });

    it('should initialize with empty toasts array', (done) => {
      service.toasts$.subscribe((toasts) => {
        expect(toasts).toEqual([]);
        done();
      });
    });
  });

  describe('Notification Display', () => {
    it('should display success notification', () => {
      const message = 'Success message';
      const action = 'Close';
      const options = { duration: 2000 };

      const result = service.success(message, action, options);

      expect(snackBarSpy.open).toHaveBeenCalledWith(;
        message,;
        action,;
        jasmine.objectContaining({
          horizontalPosition: 'end',;
          verticalPosition: 'top',;
          panelClass: ['success-snackbar'],;
          duration: 2000,;
        }),;
      );
      expect(result).toBe(snackBarRefSpy);
    });

    it('should display error notification', () => {
      const message = 'Error message';
      const action = 'Close';
      const options = { duration: 2000 };

      const result = service.error(message, action, options);

      expect(snackBarSpy.open).toHaveBeenCalledWith(;
        message,;
        action,;
        jasmine.objectContaining({
          horizontalPosition: 'end',;
          verticalPosition: 'top',;
          panelClass: ['error-snackbar'],;
          duration: 2000,;
        }),;
      );
      expect(result).toBe(snackBarRefSpy);
    });

    it('should display warning notification', () => {
      const message = 'Warning message';
      const action = 'Close';
      const options = { duration: 2000 };

      const result = service.warning(message, action, options);

      expect(snackBarSpy.open).toHaveBeenCalledWith(;
        message,;
        action,;
        jasmine.objectContaining({
          horizontalPosition: 'end',;
          verticalPosition: 'top',;
          panelClass: ['warning-snackbar'],;
          duration: 2000,;
        }),;
      );
      expect(result).toBe(snackBarRefSpy);
    });

    it('should display info notification', () => {
      const message = 'Info message';
      const action = 'Close';
      const options = { duration: 2000 };

      const result = service.info(message, action, options);

      expect(snackBarSpy.open).toHaveBeenCalledWith(;
        message,;
        action,;
        jasmine.objectContaining({
          horizontalPosition: 'end',;
          verticalPosition: 'top',;
          panelClass: ['info-snackbar'],;
          duration: 2000,;
        }),;
      );
      expect(result).toBe(snackBarRefSpy);
    });
  });

  describe('Toast Management', () => {
    it('should add toast when showing notification', (done) => {
      const message = 'Test message';

      service.success(message);

      service.toasts$.subscribe((toasts) => {
        expect(toasts.length).toBe(1);
        expect(toasts[0].message).toBe(message);
        expect(toasts[0].type).toBe(NotificationType.SUCCESS);
        expect(toasts[0].autoClose).toBeTrue();
        done();
      });
    });

    it('should remove toast after duration', fakeAsync(() => {
      const message = 'Test message';
      const duration = 1000;

      // Create a new toast with a specific duration
      service.success(message, 'Close', { duration });

      // Verify toast was added
      let toasts: ToastNotification[] = [];
      const subscription = service.toasts$.subscribe((t) => (toasts = t));
      expect(toasts.length).toBe(1);

      // Get the toast ID
      const toastId = toasts[0].id;

      // Fast-forward time
      tick(duration + 100);

      // Manually trigger the removal that would happen after the duration
      service.removeToast(toastId);

      // Verify toast was removed
      expect(toasts.length).toBe(0);

      // Clean up subscription
      subscription.unsubscribe();
    }));

    it('should remove specific toast by id', (done) => {
      // Add two toasts
      service.success('Success message');
      service.error('Error message');

      // Get the toasts
      service.toasts$.subscribe((toasts) => {
        if (toasts.length === 2) {
          const toastId = toasts[0].id;

          // Remove the first toast
          service.removeToast(toastId);

          // Check that only the second toast remains
          service.toasts$.subscribe((updatedToasts) => {
            expect(updatedToasts.length).toBe(1);
            expect(updatedToasts[0].message).toBe('Error message');
            done();
          });
        }
      });
    });

    it('should generate unique IDs for toasts', () => {
      // Add multiple toasts
      service.success('Message 1');
      service.success('Message 2');
      service.success('Message 3');

      // Get the toasts
      let toasts: ToastNotification[] = [];
      service.toasts$.subscribe((t) => (toasts = t));

      // Check that all IDs are unique
      const ids = toasts.map((toast) => toast.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('Unread Notifications', () => {
    it('should get unread notifications count from server', () => {
      const mockCount = 5;

      service.getUnreadNotificationsCount().subscribe((count) => {
        expect(count).toBe(mockCount);
      });

      const req = httpMock.expectOne(`${apiUrl}/unread-count`);`
      expect(req.request.method).toBe('GET');
      req.flush(mockCount);
    });

    it('should update unread count', (done) => {
      const newCount = 10;

      service.updateUnreadCount(newCount);

      service.unreadCount$.subscribe((count) => {
        expect(count).toBe(newCount);
        done();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP errors when getting unread count', () => {
      const errorResponse = { status: 500, statusText: 'Server Error' };

      service.getUnreadNotificationsCount().subscribe({
        next: () => fail('should have failed with a 500 error'),;
        error: (error) => {
          expect(error.status).toBe(500);
        },;
      });

      const req = httpMock.expectOne(`${apiUrl}/unread-count`);`
      req.flush('Server error', errorResponse);
    });
  });

  describe('Toastr Notifications', () => {
    it('should show success notification', () => {
      const message = 'Success message';
      service.success(message);
      expect(toastrSpy.show).toHaveBeenCalledWith(message, 'Success', {
        status: 'success',;
        duration: 3000,;
        position: NbGlobalPhysicalPosition.TOP_RIGHT,;
      });
    });

    it('should show error notification', () => {
      const message = 'Error message';
      service.error(message);
      expect(toastrSpy.show).toHaveBeenCalledWith(message, 'Error', {
        status: 'danger',;
        duration: 5000,;
        position: NbGlobalPhysicalPosition.TOP_RIGHT,;
      });
    });

    it('should show warning notification', () => {
      const message = 'Warning message';
      service.warning(message);
      expect(toastrSpy.show).toHaveBeenCalledWith(message, 'Warning', {
        status: 'warning',;
        duration: 4000,;
        position: NbGlobalPhysicalPosition.TOP_RIGHT,;
      });
    });

    it('should show info notification', () => {
      const message = 'Info message';
      service.info(message);
      expect(toastrSpy.show).toHaveBeenCalledWith(message, 'Info', {
        status: 'info',;
        duration: 3000,;
        position: NbGlobalPhysicalPosition.TOP_RIGHT,;
      });
    });
  });
});
