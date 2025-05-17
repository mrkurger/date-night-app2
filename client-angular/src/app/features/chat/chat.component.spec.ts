/// <reference types="jasmine" />
/// <reference types="@types/jasmine" />

// Extend the global Matchers interface
declare global {
  namespace jasmine {
    interface CustomMatcherFactories {
      [name: string]: (...args: any[]) => jasmine.CustomMatcher;
    }

    interface CustomMatcher {
      compare<T>(actual: T, ...expected: any[]): CustomMatcherResult;
      negativeCompare?<T>(actual: T, ...expected: any[]): CustomMatcherResult;
    }

    interface CustomMatcherResult {
      pass: boolean;
      message?: string;
    }

    interface Matchers<T> {
      toBeTruthy(): boolean;
      toBeDefined(): boolean;
      toBe(expected: any): boolean;
      toEqual(expected: any): boolean;
      toHaveBeenCalled(): boolean;
      toHaveBeenCalledWith(...params: any[]): boolean;
      toContain(expected: any): boolean;
      toBeNull(): boolean;
      toBeUndefined(): boolean;
      toBeNaN(): boolean;
      toBeTrue(): boolean;
      toBeFalse(): boolean;
      toBeFalsy(): boolean;
      toMatch(expected: string | RegExp): boolean;
      toThrow(expected?: any): boolean;
      toThrowError(expected?: any, message?: string): boolean;
      toBeGreaterThan(expected: number): boolean;
      toBeLessThan(expected: number): boolean;
    }
  }
}

import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import {
  NbCardModule,
  NbButtonModule,
  NbInputModule,
  NbFormFieldModule,
  NbIconModule,
  NbSpinnerModule,
  NbAlertModule,
  NbTooltipModule,
  NbLayoutModule,
  NbBadgeModule,
  NbTagModule,
  NbSelectModule
} from '@nebular/theme';

import { ChatComponent } from './chat.component';
import {
  ChatService,
  ChatMessage,
  Contact,
  TypingIndicator,
} from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import {
  NbDialogRef,
  NbDialogService,
  
} from '@nebular/theme';
import { customMatchers } from '../../testing/custom-matchers';
import { User } from '../../core/models/user.interface';

interface DialogResult {
  success: boolean;
  data?: any;
}

const mockDialogRef = {
  close: () => {},
  onClose: of({ success: true }),
  overlayRef: null,
  onClose$: of({ success: true }),
  componentRef: null,
  onBackdropClick: of(null),
} as unknown as NbDialogRef<DialogResult>;

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;
  let chatServiceSpy: jasmine.SpyObj<ChatService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let dialogServiceSpy: jasmine.SpyObj<NbDialogService>;
  let messageListEl: DebugElement;
  let messageInputEl: DebugElement;
  let sendButtonEl: DebugElement;
  let newMessageSubject: Subject<ChatMessage>;
  let messageReadSubject: Subject<{ messageId: string; userId: string }>;
  let typingIndicatorSubject: Subject<TypingIndicator>;

  const mockUser: User = {
    _id: 'user1',
    username: 'testuser',
    email: 'test@example.com',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    jasmine.addMatchers(customMatchers);

    newMessageSubject = new Subject<ChatMessage>();
    messageReadSubject = new Subject<{ messageId: string; userId: string }>();
    typingIndicatorSubject = new Subject<TypingIndicator>();

    chatServiceSpy = jasmine.createSpyObj('ChatService', [
      'getContacts',
      'getMessages',
      'sendMessage',
      'markAsRead',
      'onNewMessage',
      'onMessageRead',
      'onTypingIndicator',
      'getMessageAutoDeletionSettings',
      'convertHoursToMilliseconds',
      'sendTypingIndicator',
      'updateMessageAutoDeletionSettings',
    ]);

    chatServiceSpy.getContacts.and.returnValue(
      of([
        {
          id: 'contact1',
          name: 'John Doe',
          unreadCount: 2,
          lastMessage: 'Hello',
          lastMessageTime: new Date(),
          online: true,
        },
        {
          id: 'contact2',
          name: 'Jane Smith',
          unreadCount: 0,
          lastMessage: 'Hi',
          lastMessageTime: new Date(),
          online: false,
        },
      ] as Contact[]),
    );

    chatServiceSpy.getMessages.and.returnValue(
      of([
        {
          _id: 'msg1',
          roomId: 'room1',
          sender: { id: 'contact2', username: 'Jane' },
          message: 'Hi there',
          timestamp: new Date(),
          read: true,
          type: 'text',
        },
        {
          _id: 'msg2',
          roomId: 'room1',
          sender: { id: 'user1', username: 'Me' },
          message: 'Hello',
          timestamp: new Date(),
          read: true,
          type: 'text',
        },
      ] as ChatMessage[]),
    );

    chatServiceSpy.markAsRead.and.returnValue(of(void 0));

    chatServiceSpy.onNewMessage.and.callFake((callback) => {
      const subscription = newMessageSubject.subscribe(() => {
        callback({
          _id: 'new-msg',
          roomId: 'room1',
          sender: { id: 'contact2', username: 'Jane' },
          message: 'New message',
          timestamp: new Date(),
          read: false,
          type: 'text',
        } as ChatMessage);
      });
      return () => subscription.unsubscribe();
    });

    chatServiceSpy.onMessageRead.and.callFake((callback) => {
      const subscription = messageReadSubject.subscribe((data) => {
        callback(data);
      });
      return () => subscription.unsubscribe();
    });

    chatServiceSpy.onTypingIndicator.and.callFake((callback) => {
      const subscription = typingIndicatorSubject.subscribe(() => {
        callback({
          roomId: 'room1',
          userId: 'contact2',
          typing: true,
          timestamp: new Date(),
        } as TypingIndicator);
      });
      return () => subscription.unsubscribe();
    });

    chatServiceSpy.getMessageAutoDeletionSettings.and.returnValue({
      enabled: true,
      ttl: 7 * 24 * 60 * 60 * 1000,
    });

    chatServiceSpy.convertHoursToMilliseconds.and.callFake((hours) => hours * 60 * 60 * 1000);

    authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    authServiceSpy.getCurrentUser.and.returnValue(mockUser);

    notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'success',
      'error',
      'info',
    ]);

    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);

    dialogServiceSpy = jasmine.createSpyObj('NbDialogService', ['open']);
    dialogServiceSpy.open.and.returnValue(mockDialogRef);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        BrowserAnimationsModule,
        NbDialogModule.forRoot(),
        NbIconModule,
        NbButtonModule,
        NbFormFieldModule,
        NbInputModule,
        NbMenuModule,
        NbTooltipModule,
        NbTabsetModule,
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
            params: of({ userId: 'contact2' }),
          },
        },
        { provide: NbDialogService, useValue: dialogServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load contacts on init', () => {
      expect(chatServiceSpy.getContacts).toHaveBeenCalled();
      expect(component.contacts.length).toBe(2);
      expect(component.filteredContacts.length).toBe(2);
    });

    it('should load messages for the selected contact from route params', () => {
      expect(chatServiceSpy.getMessages).toHaveBeenCalledWith('contact2');
      expect(component.selectedContactId).toBe('contact2');
      expect(component.messages.length).toBe(2);
    });

    it('should set up socket listeners', () => {
      expect(chatServiceSpy.onNewMessage).toHaveBeenCalled();
      expect(chatServiceSpy.onMessageRead).toHaveBeenCalled();
      expect(chatServiceSpy.onTypingIndicator).toHaveBeenCalled();
    });

    it('should load message auto-deletion settings', () => {
      expect(chatServiceSpy.getMessageAutoDeletionSettings).toHaveBeenCalledWith('contact2');
      expect(component.messageAutoDeletionEnabled).toBe(true);
      expect(component.messageExpiryTime).toBe(7 * 24 * 60 * 60 * 1000);
    });
  });

  describe('Message Handling', () => {
    it('should send a message', fakeAsync(() => {
      component.newMessage = 'Hello, this is a test message';
      component.sendMessage();
      tick();

      expect(chatServiceSpy.sendMessage).toHaveBeenCalledWith(
        'contact2',
        'Hello, this is a test message',
        expect.any(Object),
      );
      expect(component.newMessage).toBe('');
    }));

    it('should not send empty messages', fakeAsync(() => {
      component.newMessage = '   ';
      component.sendMessage();
      tick();

      expect(chatServiceSpy.sendMessage).not.toHaveBeenCalled();
    }));

    it('should handle new incoming messages', fakeAsync(() => {
      const initialMessageCount = component.messages.length;

      // Simulate a new message from the socket
      const newMessage = {
        _id: 'new-msg-id',
        sender: { id: 'contact2', username: 'Jane Smith' },
        message: 'This is a new message',
        timestamp: new Date(),
        read: false,
      };

      newMessageSubject.next(newMessage);
      tick();
      fixture.detectChanges();

      expect(component.messages.length).toBe(initialMessageCount + 1);
      expect(component.messages[component.messages.length - 1].message).toBe(
        'This is a new message',
      );
    }));

    it('should mark messages as read when selecting a contact', fakeAsync(() => {
      // Select a different contact first
      component.selectContact('contact1');
      tick();

      // Then select the original contact again
      chatServiceSpy.markAsRead.calls.reset();
      component.selectContact('contact2');
      tick();

      expect(chatServiceSpy.markAsRead).toHaveBeenCalledWith('contact2');
    }));

    it('should handle typing indicators', fakeAsync(() => {
      // Simulate typing indicator from contact
      typingIndicatorSubject.next({ userId: 'contact2' });
      tick();
      fixture.detectChanges();

      expect(component.isContactTyping).toBeTrue();

      // Typing indicator should disappear after delay
      tick(5000);
      expect(component.isContactTyping).toBeFalse();
    }));

    it('should send typing indicator when user types', fakeAsync(() => {
      component.onMessageInput('Hello');
      tick(500); // Debounce time

      expect(chatServiceSpy.sendTypingIndicator).toHaveBeenCalledWith('contact2');
    }));
  });

  describe('Contact Management', () => {
    it('should filter contacts based on search term', () => {
      component.searchTerm = 'john';
      component.filterContacts();

      expect(component.filteredContacts.length).toBe(1);
      expect(component.filteredContacts[0].name).toBe('John Doe');

      component.searchTerm = '';
      component.filterContacts();

      expect(component.filteredContacts.length).toBe(2);
    });

    it('should filter contacts by unread messages', () => {
      component.currentFilter = 'unread';
      component.filterContacts();

      expect(component.filteredContacts.length).toBe(1);
      expect(component.filteredContacts[0].id).toBe('contact1');
      expect(component.filteredContacts[0].unreadCount).toBe(2);
    });

    it('should select a contact and load messages', fakeAsync(() => {
      chatServiceSpy.getMessages.calls.reset();
      component.selectContact('contact1');
      tick();

      expect(component.selectedContactId).toBe('contact1');
      expect(chatServiceSpy.getMessages).toHaveBeenCalledWith('contact1');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/chat', 'contact1']);
    }));
  });

  describe('UI Interactions', () => {
    it('should toggle emoji picker', () => {
      expect(component.showEmojiPicker).toBeFalse();

      component.toggleEmojiPicker();
      expect(component.showEmojiPicker).toBeTrue();

      component.toggleEmojiPicker();
      expect(component.showEmojiPicker).toBeFalse();
    });

    it('should add emoji to message', () => {
      component.newMessage = 'Hello ';
      component.addEmoji('😊');

      expect(component.newMessage).toBe('Hello 😊');
      expect(component.showEmojiPicker).toBeFalse();
    });

    it('should open new message dialog', () => {
      component.openNewMessageDialog();

      expect(dialogServiceSpy.open).toHaveBeenCalled();
      const dialogConfig = dialogServiceSpy.open.calls.first().args[1];
      expect(dialogConfig).toBeTruthy();
      expect(dialogConfig.context).toBeTruthy();
    });

    it('should toggle message auto-deletion', () => {
      const initialState = component.messageAutoDeletionEnabled;

      component.toggleMessageAutoDeletion();

      expect(component.messageAutoDeletionEnabled).toBe(!initialState);
      expect(chatServiceSpy.updateMessageAutoDeletionSettings).toHaveBeenCalledWith(
        'contact2',
        !initialState,
        component.messageExpiryTime,
      );
    });
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
      expect(component.messages.find((m) => m._id === 'msg2')).toBeUndefined();
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
      const aboutToExpireMsg = component.messages.find((m) => m._id === 'msg4');
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

  describe('Message Organization', () => {
    it('should group messages by date', () => {
      // Call the method to group messages
      component.groupMessagesByDate();

      // Should have at least one group
      expect(component.messageGroups.length).toBeGreaterThan(0);

      // Each group should have a date and messages array
      component.messageGroups.forEach((group) => {
        expect(group.date).toBeDefined();
        expect(Array.isArray(group.messages)).toBeTrue();
        expect(group.messages.length).toBeGreaterThan(0);
      });
    });

    it('should extract media from messages', () => {
      // Add a message with attachments
      component.messages.push({
        _id: 'msg-with-image',
        sender: { id: 'user1', username: 'testuser' },
        message: 'Check out this image',
        timestamp: new Date(),
        read: true,
        attachments: [
          {
            id: 'att1',
            name: 'image.jpg',
            type: 'image/jpeg',
            size: 1024,
            url: 'https://example.com/image.jpg',
            timestamp: new Date(),
          },
        ],
      });

      // Extract media
      component.extractMediaFromMessages();

      // Should have the image in the gallery
      expect(component.galleryImages.length).toBe(1);
      expect(component.galleryImages[0].name).toBe('image.jpg');
    });
  });

  describe('Error Handling', () => {
    it('should handle errors when loading contacts', fakeAsync(() => {
      // Reset the component
      fixture = TestBed.createComponent(ChatComponent);
      component = fixture.componentInstance;

      // Make the getContacts method throw an error
      chatServiceSpy.getContacts.and.returnValue(
        throwError(() => new Error('Failed to load contacts')),
      );

      // Initialize the component
      component.ngOnInit();
      tick();

      // Should fall back to mock contacts
      expect(chatServiceSpy.getMockContacts).toHaveBeenCalled();
      expect(component.contacts.length).toBeGreaterThan(0);
    }));

    it('should handle errors when loading messages', fakeAsync(() => {
      // Reset the component
      fixture = TestBed.createComponent(ChatComponent);
      component = fixture.componentInstance;
      component.currentUserId = 'user1';
      component.selectedContactId = 'contact2';

      // Make the getMessages method throw an error
      chatServiceSpy.getMessages.and.returnValue(
        throwError(() => new Error('Failed to load messages')),
      );

      // Load messages
      component.loadMessages();
      tick();

      // Should create dummy messages
      spyOn(component, 'createDummyMessages');
      component.loadMessages();
      tick();

      expect(component.createDummyMessages).toHaveBeenCalled();
    }));
  });
});
