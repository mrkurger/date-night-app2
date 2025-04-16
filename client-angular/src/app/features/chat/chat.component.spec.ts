import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ChatComponent } from './chat.component';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;
  let chatServiceSpy: jasmine.SpyObj<ChatService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Create spies for all required services
    chatServiceSpy = jasmine.createSpyObj('ChatService', [
      'getContacts',
      'getMessages',
      'sendMessage',
      'markAsRead',
      'setupSocketListeners',
      'onNewMessage',
      'onMessageRead',
      'onTypingIndicator',
      'sendTypingIndicator',
      'convertHoursToMilliseconds',
    ]);

    authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'info',
      'error',
      'success',
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    // Set up mock return values
    chatServiceSpy.getContacts.and.returnValue(of([]));
    chatServiceSpy.getMessages.and.returnValue(of([]));
    chatServiceSpy.sendMessage.and.returnValue(of({ _id: '123', timestamp: new Date() }));
    chatServiceSpy.convertHoursToMilliseconds.and.callFake(hours => hours * 60 * 60 * 1000);

    authServiceSpy.getCurrentUser.and.returnValue(of({ id: 'user1', username: 'testuser' }));

    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        CommonModule,
        MatDialogModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatTooltipModule,
        MatTabsModule,
        BrowserAnimationsModule,
      ],
      declarations: [ChatComponent],
      providers: [
        { provide: ChatService, useValue: chatServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;

    // Set up component properties
    component.currentUserId = 'user1';
    component.messages = [];
    component.contacts = [];

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Temporary Messages', () => {
    it('should toggle temporary message mode', () => {
      // Initial state should be false
      expect(component.temporaryMessageMode).toBeFalse();

      // Toggle on
      component.toggleTemporaryMessageMode();
      expect(component.temporaryMessageMode).toBeTrue();

      // Toggle off
      component.toggleTemporaryMessageMode();
      expect(component.temporaryMessageMode).toBeFalse();
    });

    it('should set temporary message TTL', () => {
      // Default TTL should be 24 hours
      expect(component.temporaryMessageTTL).toBe(24);

      // Set to 1 hour
      component.setTemporaryMessageTTL(1);
      expect(component.temporaryMessageTTL).toBe(1);

      // Set to 7 days (168 hours)
      component.setTemporaryMessageTTL(168);
      expect(component.temporaryMessageTTL).toBe(168);
    });

    it('should format TTL correctly', () => {
      expect(component.formatTTL(1)).toBe('1 hour');
      expect(component.formatTTL(2)).toBe('2 hours');
      expect(component.formatTTL(24)).toBe('24 hours');
    });

    it('should calculate remaining time correctly', () => {
      const now = new Date();

      // Test expired message
      const expiredDate = new Date(now.getTime() - 1000); // 1 second ago
      expect(component.getRemainingTime(expiredDate)).toBe('Expired');

      // Test message expiring in 30 seconds
      const seconds30 = new Date(now.getTime() + 30 * 1000);
      expect(component.getRemainingTime(seconds30)).toContain('s remaining');

      // Test message expiring in 5 minutes
      const minutes5 = new Date(now.getTime() + 5 * 60 * 1000);
      expect(component.getRemainingTime(minutes5)).toContain('m remaining');

      // Test message expiring in 2 hours
      const hours2 = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      expect(component.getRemainingTime(hours2)).toContain('h remaining');

      // Test message expiring in 3 days
      const days3 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      expect(component.getRemainingTime(days3)).toContain('d remaining');
    });

    it('should send temporary message with TTL', fakeAsync(() => {
      // Set up component for sending a message
      component.selectedContactId = 'contact1';
      component.newMessage = 'This is a temporary message';
      component.temporaryMessageMode = true;
      component.temporaryMessageTTL = 4; // 4 hours

      // Send the message
      component.sendMessage();
      tick();

      // Verify the message was sent with the correct TTL
      expect(chatServiceSpy.convertHoursToMilliseconds).toHaveBeenCalledWith(4);
      expect(chatServiceSpy.sendMessage).toHaveBeenCalled();

      // Temporary message mode should be reset after sending
      expect(component.temporaryMessageMode).toBeFalse();
    }));

    it('should check for expired messages', () => {
      const now = new Date().getTime();

      // Set up messages with different expiration times
      component.messages = [
        {
          _id: 'msg1',
          sender: { id: 'user1', username: 'User 1' },
          message: 'Message 1 - not expired',
          timestamp: new Date(),
          read: false,
          expiresAt: new Date(now + 1000 * 60 * 60), // 1 hour from now
        },
        {
          _id: 'msg2',
          sender: { id: 'user1', username: 'User 1' },
          message: 'Message 2 - expired',
          timestamp: new Date(),
          read: false,
          expiresAt: new Date(now - 1000), // 1 second ago
        },
        {
          _id: 'msg3',
          sender: { id: 'user2', username: 'User 2' },
          message: 'Message 3 - no expiration',
          timestamp: new Date(),
          read: false,
        },
      ];

      // Mock the groupMessagesByDate method
      spyOn(component, 'groupMessagesByDate');

      // Check for expired messages
      component.checkExpiredMessages();

      // Verify that the expired message was removed
      expect(component.messages.length).toBe(2);
      expect(component.messages.find(m => m._id === 'msg2')).toBeUndefined();
      expect(component.groupMessagesByDate).toHaveBeenCalled();
    });

    it('should clean up interval on component destruction', () => {
      // Set up a spy on clearInterval
      spyOn(window, 'clearInterval');

      // Set a fake interval ID
      component.expiryCheckInterval = 123;

      // Destroy the component
      component.ngOnDestroy();

      // Verify clearInterval was called with the correct ID
      expect(window.clearInterval).toHaveBeenCalledWith(123);
    });

    it('should check for messages about to expire and show warnings', () => {
      const now = new Date().getTime();

      // Set up messages with different expiration times
      component.messages = [
        {
          _id: 'msg1',
          sender: { id: 'user1', username: 'User 1' },
          message: 'Message 1 - not expired',
          timestamp: new Date(),
          read: false,
          expiresAt: new Date(now + 1000 * 60 * 60), // 1 hour from now
        },
        {
          _id: 'msg4',
          sender: { id: 'user2', username: 'User 2' },
          message: 'Message 4 - about to expire',
          timestamp: new Date(),
          read: false,
          expiresAt: new Date(now + 1000 * 60 * 3), // 3 minutes from now
        },
      ];

      // Check for expired messages
      component.checkExpiredMessages();

      // Verify that notifications were shown
      expect(notificationServiceSpy.info).toHaveBeenCalledWith('A message will expire soon');

      // Verify that the about-to-expire message was marked
      const aboutToExpireMsg = component.messages.find(m => m._id === 'msg4');
      expect(aboutToExpireMsg.expiryWarningShown).toBeTrue();
    });

    it('should detect messages about to expire', () => {
      const now = new Date().getTime();

      // Test with various expiration times
      expect(component.isAboutToExpire(new Date(now + 1000 * 60 * 2))).toBeTrue(); // 2 minutes from now
      expect(component.isAboutToExpire(new Date(now + 1000 * 60 * 10))).toBeFalse(); // 10 minutes from now
      expect(component.isAboutToExpire(new Date(now - 1000))).toBeFalse(); // Already expired
      expect(component.isAboutToExpire(null)).toBeFalse(); // No expiration
    });
  });
});
