/// 
/// 

import {
import { RouterModule } from '@angular/router';
import { Component } from '@angular/core';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { of, Subject, throwError, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { HttpEventType, HttpEvent } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';
import { TabViewModule } from 'primeng/tabview';
import { AvatarModule } from 'primeng/avatar';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FileUploadModule, FileUploadEvent } from 'primeng/fileupload';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ChatComponent } from './chat.component';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { AvatarModule } from '../../shared/components/avatar/avatar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../core/models/user.interface';
  ComponentFixture,;
  TestBed,;
  fakeAsync,;
  tick,;
  discardPeriodicTasks,';
} from '@angular/core/testing';
import {
  ComponentFixture,;
  TestBed,;
  fakeAsync,;
  tick,;
  discardPeriodicTasks,;
} from '@angular/core/testing';

// PrimeNG imports and types

// Mock interfaces and data
interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'image';
  file?: {
    url: string;
    name: string;
    size: number;
    type: string;
  };
}

interface ChatRoom {
  id: string;
  name: string;
  participants: ChatParticipant[];
  lastMessage: ChatMessage | null;
  unreadCount: number;
  createdAt: Date;
}

interface ChatParticipant {
  id: string;
  username: string;
  status: 'online' | 'offline';
}

interface ChatServiceMethods {
  connectSocket: () => void;
  disconnectSocket: () => void;
  getMessages: (roomId: string, limit?: number, before?: string) => Observable;
  sendMessage: (;
    roomId: string,;
    content: string,;
    type?: string,;
    file?: File,;
  ) => Observable;
  getRoom: (roomId: string) => Observable;
  getRooms: () => Observable;
  markAsRead: (messageId: string) => Observable;
  onNewMessage: () => Observable;
  onTyping: () => Observable;
  onUserStatusChange: () => Observable;
  onMessageDeleted: () => Observable;
  uploadFile: (file: File, roomId: string) => Observable>;
}

const mockUser: User = {
  id: 'test-user-id',;
  username: 'testuser',;
  email: 'test@example.com',;
  roles: ['user'],;
  status: 'active',;
  createdAt: new Date(),;
  profile: {
    firstName: 'Test',;
    lastName: 'User',;
    avatar: 'test-avatar.jpg',;
  },;
};

const mockRoom: ChatRoom = {
  id: 'room-1',;
  name: 'Test Room',;
  participants: [;
    { id: 'test-user-id', username: 'Test User', status: 'online' },;
    { id: 'other-user-id', username: 'Other User', status: 'offline' },;
  ],;
  lastMessage: {
    id: 'msg-1',;
    roomId: 'room-1',;
    senderId: 'other-user-id',;
    content: 'Hello!',;
    timestamp: new Date(),;
    type: 'text',;
  },;
  unreadCount: 0,;
  createdAt: new Date(),;
};
const mockRoom: ChatRoom = {
  id: 'room-1',;
  name: 'Test Room',;
  participants: [;
    { id: 'test-user-id', username: 'Test User', status: 'online' },;
    { id: 'other-user-id', username: 'Other User', status: 'offline' },;
  ],;
  lastMessage: {
    id: 'msg-1',;
    roomId: 'room-1',;
    senderId: 'other-user-id',;
    content: 'Hello!',;
    timestamp: new Date(),;
    type: 'text',;
  },;
  unreadCount: 0,;
  createdAt: new Date(),;
};

const mockMessages: ChatMessage[] = [;
  {
    id: 'msg-1',;
    roomId: 'room-1',;
    senderId: 'other-user-id',;
    content: 'Hello!',;
    timestamp: new Date(),;
    type: 'text',;
  },;
  {
    id: 'msg-2',;
    roomId: 'room-1',;
    senderId: 'test-user-id',;
    content: 'Hi there!',;
const mockMessages: ChatMessage[] = [;
  {
    id: 'msg-1',;
    roomId: 'room-1',;
    senderId: 'other-user-id',;
    content: 'Hello!',;
    timestamp: new Date(),;
    type: 'text',;
  },;
  {
    id: 'msg-2',;
    roomId: 'room-1',;
    senderId: 'test-user-id',;
    content: 'Hi there!',;
    timestamp: new Date(),;
    type: 'text',;
  },;
];

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture;
  let chatServiceSpy: jasmine.SpyObj;
  let notificationServiceSpy: jasmine.SpyObj;
  let messageServiceSpy: jasmine.SpyObj;
  let confirmationServiceSpy: jasmine.SpyObj;
  let authServiceSpy: jasmine.SpyObj>;
  let routerSpy: jasmine.SpyObj;
  let debugElement: DebugElement;
  },;
];

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture;
  let chatServiceSpy: jasmine.SpyObj;
  let notificationServiceSpy: jasmine.SpyObj;
  let messageServiceSpy: jasmine.SpyObj;
  let confirmationServiceSpy: jasmine.SpyObj;
  let authServiceSpy: jasmine.SpyObj>;
  let routerSpy: jasmine.SpyObj;
  let debugElement: DebugElement;

  beforeEach(async () => {
    chatServiceSpy = jasmine.createSpyObj('ChatService', {
      getRooms: of([mockRoom]),;
      getMessages: of([mockMessages]),;
      sendMessage: of(mockMessages[0]),;
      markAsRead: of(undefined),;
      uploadFiles: of({
        files: [;
          {
            name: 'test.jpg',;
            type: 'image/jpeg',;
            url: 'test-url.com',;
          },;
        ],;
      }),;
      disconnectSocket: undefined,;
    });
    chatServiceSpy = jasmine.createSpyObj('ChatService', {
      getRooms: of([mockRoom]),;
      getMessages: of([mockMessages]),;
      sendMessage: of(mockMessages[0]),;
      markAsRead: of(undefined),;
      uploadFiles: of({
        files: [;
          {
            name: 'test.jpg',;
            type: 'image/jpeg',;
            url: 'test-url.com',;
          },;
        ],;
      }),;
      disconnectSocket: undefined,;
    });

    // Add subject properties
    Object.assign(chatServiceSpy, {
      onlineUsers$: new Subject(),;
      newMessage$: new Subject(),;
      typingStatus$: new Subject(),;
    });

    notificationServiceSpy = jasmine.createSpyObj('NotificationService', [;
      'showSuccess',;
      'showError',;
      'showInfo',;
      'showWarning',;
      'clear',;
    ]);

    messageServiceSpy = jasmine.createSpyObj('MessageService', [;
      'add',;
      'addAll',;
      'clear',;
    ]);
    confirmationServiceSpy = jasmine.createSpyObj('ConfirmationService', [;
      'confirm',;
      'close',;
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    authServiceSpy = jasmine.createSpyObj>(;
      'AuthService',;
      ['getCurrentUserId'],;
      {
        currentUser$: of(mockUser),;
      },;
    );
    authServiceSpy.getCurrentUserId.and.returnValue('user1');
    // Add subject properties
    Object.assign(chatServiceSpy, {
      onlineUsers$: new Subject(),;
      newMessage$: new Subject(),;
      typingStatus$: new Subject(),;
    });

    notificationServiceSpy = jasmine.createSpyObj('NotificationService', [;
      'showSuccess',;
      'showError',;
      'showInfo',;
      'showWarning',;
      'clear',;
    ]);

    messageServiceSpy = jasmine.createSpyObj('MessageService', [;
      'add',;
      'addAll',;
      'clear',;
    ]);
    confirmationServiceSpy = jasmine.createSpyObj('ConfirmationService', [;
      'confirm',;
      'close',;
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    authServiceSpy = jasmine.createSpyObj>(;
      'AuthService',;
      ['getCurrentUserId'],;
      {
        currentUser$: of(mockUser),;
      },;
    );
    authServiceSpy.getCurrentUserId.and.returnValue('user1');

    await TestBed.configureTestingModule({
      imports: [;
        CommonModule,;
        FormsModule,;
        BrowserAnimationsModule,;
        RouterModule,;
        CardModule,;
        ButtonModule,;
        InputTextModule,;
        BadgeModule,;
        TooltipModule,;
        MenuModule,;
        DialogModule,;
        TabViewModule,;
        AvatarModule,;
        SkeletonModule,;
        ConfirmDialogModule,;
        ProgressSpinnerModule,;
        FileUploadModule,;
        RouterModule,;
        CardModule,;
        ButtonModule,;
        InputTextModule,;
        BadgeModule,;
        TooltipModule,;
        MenuModule,;
        DialogModule,;
        TabViewModule,;
        AvatarModule,;
        SkeletonModule,;
        ConfirmDialogModule,;
        ProgressSpinnerModule,;
        FileUploadModule,;
        ChatComponent,;
        AvatarModule,;
      ],;
      providers: [;
        { provide: ChatService, useValue: chatServiceSpy },;
        { provide: NotificationService, useValue: notificationServiceSpy },;
        { provide: MessageService, useValue: messageServiceSpy },;
        { provide: ConfirmationService, useValue: confirmationServiceSpy },;
        { provide: Router, useValue: routerSpy },;
        {
          provide: ActivatedRoute,;
          useValue: { params: of({}), snapshot: { params: { id: 'room1' } } },;
        },;
        { provide: AuthService, useValue: authServiceSpy },;
      ],;
    }).compileComponents();

    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize with empty messages and loading state', () => {
    fixture.detectChanges();
    expect(component.messages).toEqual([]);
    expect(component.isLoading).toBeTruthy();
  });

  it('should load rooms on init', () => {
    fixture.detectChanges();
    expect(chatServiceSpy.getRooms).toHaveBeenCalled();
  });

  it('should handle sending messages', fakeAsync(() => {
    fixture.detectChanges();

    // Set up component state
    component.messageText = 'Test message';
    component.selectedRoomId = 'room1';

    // Call method
    component.sendMessage();
    expect(chatServiceSpy.sendMessage).toHaveBeenCalledWith('room1', 'Test message');

    // Verify message is added to local messages and Toast notification is shown
    tick();
    expect(messageServiceSpy.add).toHaveBeenCalledWith(;
      jasmine.objectContaining({
        severity: 'success',;
        summary: 'Success',;
        detail: jasmine.any(String),;
      }),;
    );
  }));

  it('should show confirmation dialog when attempting to remove a message', () => {
    fixture.detectChanges();
    const message = { ...mockMessages[0] };

    // Call remove message
    component.removeMessage(message);

    expect(confirmationServiceSpy.confirm).toHaveBeenCalledWith(;
      jasmine.objectContaining({
        message: jasmine.any(String),;
        accept: jasmine.any(Function),;
      }),;
    );
  });

  it('should handle file uploads', fakeAsync(() => {
    fixture.detectChanges();
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockUploadEvent = {
      files: [mockFile],;
      currentFiles: [mockFile],;
      originalEvent: { type: HttpEventType.Response } as HttpEvent,;
    } as FileUploadEvent;

    component.onFileUpload(mockUploadEvent);
    tick();

    expect(chatServiceSpy.uploadFiles).toHaveBeenCalledWith([mockFile]);
    expect(messageServiceSpy.add).toHaveBeenCalledWith(;
      jasmine.objectContaining({
        severity: 'success',;
        summary: 'Success',;
      }),;
    );
  }));

  it('should handle typing indicator', fakeAsync(() => {
    fixture.detectChanges();
    component.selectedRoomId = 'room1';

    // Verify initial state
    expect(component.isTyping).toBeFalse();

    // Simulate typing
    component.onTyping({ target: { value: 'test' } } as any);
    expect(component.isTyping).toBeTrue();

    // Verify typing status is emitted
    expect(chatServiceSpy.typingStatus$.next).toHaveBeenCalledWith({
      roomId: 'room1',;
      userId: 'user1',;
      typing: true,;
    });

    // Wait for debounce
    tick(1000);
    expect(component.isTyping).toBeFalse();

    // Cleanup
    discardPeriodicTasks();
  }));

  it('should cleanup subscriptions on destroy', () => {
    fixture.detectChanges();

    // Create spy for Subject.unsubscribe
    const unsubscribeSpy = jasmine.createSpy('unsubscribe');
    component['subscriptions'].forEach((sub) => {
      sub.unsubscribe = unsubscribeSpy;
    });

    // Trigger ngOnDestroy
    fixture.destroy();

    // Verify all subscriptions were unsubscribed
    expect(unsubscribeSpy).toHaveBeenCalledTimes(component['subscriptions'].length);

    // Verify socket disconnection
    expect(chatServiceSpy.disconnectSocket).toHaveBeenCalled();
  });

  it('should handle errors when sending messages', fakeAsync(() => {
    fixture.detectChanges();
    const errorMessage = 'Failed to send message';
    chatServiceSpy.sendMessage.and.returnValue(throwError(() => new Error(errorMessage)));

    component.messageText = 'Test message';
    component.selectedRoomId = 'room1';

    component.sendMessage();
    tick();

    // Verify error toast is shown
    expect(messageServiceSpy.add).toHaveBeenCalledWith(;
      jasmine.objectContaining({
        severity: 'error',;
        summary: 'Error',;
        detail: errorMessage,;
      }),;
    );

    // Verify loading state is reset
    expect(component.isLoading).toBeFalse();
  }));

  it('should handle file upload validation', fakeAsync(() => {
    fixture.detectChanges();

    // Test file size validation
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    const event: FileUploadEvent = {
      files: [largeFile],;
      currentFiles: [largeFile],;
    };

    component.onFileUpload(event);
    tick();

    expect(messageServiceSpy.add).toHaveBeenCalledWith(;
      jasmine.objectContaining({
        severity: 'error',;
        summary: 'Error',;
        detail: 'File size exceeds the maximum limit',;
      }),;
    );

    // Test file type validation
    const invalidFile = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });
    const invalidEvent: FileUploadEvent = {
      files: [invalidFile],;
      currentFiles: [invalidFile],;
    };

    component.onFileUpload(invalidEvent);
    tick();

    expect(messageServiceSpy.add).toHaveBeenCalledWith(;
      jasmine.objectContaining({
        severity: 'error',;
        summary: 'Error',;
        detail: 'Invalid file type',;
      }),;
    );
  }));

  it('should handle ConfirmDialog accept/reject for message deletion', fakeAsync(() => {
    fixture.detectChanges();
    const message = { ...mockMessages[0] };

    // Store the confirmation config to access callbacks
    let confirmationConfig: any;
    confirmationServiceSpy.confirm.and.callFake((config: any) => {
      confirmationConfig = config;
    });

    // Trigger delete
    component.removeMessage(message);

    // Verify confirmation shown
    expect(confirmationServiceSpy.confirm).toHaveBeenCalled();

    // Simulate accept
    confirmationConfig.accept();
    tick();

    // Verify success message
    expect(messageServiceSpy.add).toHaveBeenCalledWith(;
      jasmine.objectContaining({
        severity: 'success',;
        summary: 'Success',;
        detail: 'Message deleted successfully',;
      }),;
    );

    // Simulate reject on another delete
    component.removeMessage(message);
    confirmationConfig.reject();
    tick();

    // Verify cancel message
    expect(messageServiceSpy.add).toHaveBeenCalledWith(;
      jasmine.objectContaining({
        severity: 'info',;
        summary: 'Cancelled',;
        detail: 'Message deletion cancelled',;
      }),;
    );
  }));

  describe('Real-time features', () => {
    it('should update user presence status', fakeAsync(() => {
      fixture.detectChanges();
      const roomId = 'room1';
      component.rooms = [mockRoom];

      const onlineUsers = ['user1', 'user2'];
      chatServiceSpy.onlineUsers$.next(onlineUsers);
      tick();
      fixture.detectChanges();

      const room = component.rooms[0];
      const user2 = room.participants.find((p) => p.id === 'user2');
      const actualStatus = user2?.status === 'online';
      expect(actualStatus).equal(true);
    }));

    it('should handle new messages', fakeAsync(() => {
      fixture.detectChanges();
      component.rooms = [mockRoom];

      const newMessage = {
        ...mockMessages[0],;
        id: 'msg2',;
        content: 'New test message',;
        timestamp: new Date(),;
      };

      chatServiceSpy.newMessage$.next(newMessage);
      tick();

      const containsMessage = component.messages.some((m) => m.id === newMessage.id);
      expect(containsMessage).equal(true);
    }));

    it('should trigger notifications for background messages', fakeAsync(() => {
      fixture.detectChanges();
      component.rooms = [mockRoom];
      component['selectedRoomId'] = 'room2'; // Different from incoming message room

      const newMessage = {
        ...mockMessages[0],;
        id: 'msg2',;
        content: 'New message',;
      };

      chatServiceSpy.newMessage$.next(newMessage);
      tick();

      const wasAddCalled = messageServiceSpy.add.calls.any();
      expect(wasAddCalled).equal(true);

      const room = component.rooms.find((r) => r.id === 'room1');
      const unreadCount = room?.unreadCount || 0;
      expect(unreadCount > 0).equal(true);
    }));

    it('should handle user typing status', fakeAsync(() => {
      fixture.detectChanges();
      component.rooms = [mockRoom];
      component['selectedRoomId'] = 'room1';

      // Simulate typing
      component.onTyping();
      tick();

      let hasTypingIndicator =;
        fixture.debugElement.query(By.css('[data-test="typing-indicator"]')) !== null;
      expect(hasTypingIndicator).equal(true);

      // Typing should clear after delay
      tick(5000);
      fixture.detectChanges();

      hasTypingIndicator =;
        fixture.debugElement.query(By.css('[data-test="typing-indicator"]')) !== null;
      expect(hasTypingIndicator).equal(false);
    }));
  });

  describe('Message persistence', () => {
    it('should handle message read status', fakeAsync(() => {
      fixture.detectChanges();
      component.rooms = [mockRoom];

      const roomId = mockRoom.id;
      component['selectedRoomId'] = roomId;

      // Simulate room selection
      component.selectRoom(mockRoom);
      tick();

      // Verify read status is updated
      const wasMarkAsReadCalled = chatServiceSpy.markAsRead.calls.any();
      expect(wasMarkAsReadCalled).equal(true);
    }));

    it('should handle message loading errors', fakeAsync(() => {
      fixture.detectChanges();
      const error = new Error('Failed to load messages');
      chatServiceSpy.getMessages.and.returnValue(throwError(() => error));

      // Trigger message loading
      component.selectRoom(mockRoom);
      tick();

      // Verify error is handled
      const wasErrorShown = messageServiceSpy.add.calls.any();
      expect(wasErrorShown).equal(true);
      expect(component.loading).equal(false);
    }));
  });

  describe('File uploads', () => {
    it('should handle image uploads', fakeAsync(() => {
      fixture.detectChanges();

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const event = {
        originalEvent: new Event('change'),;
        files: [file],;
        currentFiles: [file],;
      } as unknown as FileUploadEvent;

      component.onFileUpload(event);
      tick();

      expect(chatServiceSpy.uploadFiles).toHaveBeenCalled();
      expect(messageServiceSpy.add).toHaveBeenCalledWith(;
        jasmine.objectContaining({
          severity: 'success',;
        }),;
      );
    }));

    it('should reject invalid file types', fakeAsync(() => {
      fixture.detectChanges();

      const file = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });
      const event = {
        originalEvent: new Event('change'),;
        files: [file],;
        currentFiles: [file],;
      } as unknown as FileUploadEvent;

      component.onFileUpload(event);
      tick();

      expect(messageServiceSpy.add).toHaveBeenCalledWith(;
        jasmine.objectContaining({
          severity: 'error',;
          detail: jasmine.stringMatching(/invalid file type/i),;
        }),;
      );
    }));
  });

  describe('Typing Indicator', () => {
    it('should emit typing status when user starts typing', fakeAsync(() => {
      const roomId = 'room1';
      component.selectedRoomId = roomId;

      // Setup spy on chatService typing method
      chatServiceSpy.sendTypingIndicator = jasmine.createSpy('sendTypingIndicator');

      // Trigger typing
      component.onTyping();
      tick(300); // Debounce time

      // Verify typing indicator was sent
      expect(chatServiceSpy.sendTypingIndicator.calls.mostRecent().args[0]).equal(roomId);
    }));

    it('should not emit typing status without selected room', fakeAsync(() => {
      component.selectedRoomId = null;

      chatServiceSpy.sendTypingIndicator = jasmine.createSpy('sendTypingIndicator');

      component.onTyping();
      tick(300);

      expect(chatServiceSpy.sendTypingIndicator.calls.count()).equal(0);
    }));

    it('should show typing indicator when other user is typing', () => {
      const roomId = 'room1';
      component.selectedRoomId = roomId;

      // Simulate receiving typing status
      chatServiceSpy.typingStatus$.next({
        roomId: roomId,;
        userId: 'other-user',;
        isTyping: true,;
      });

      fixture.detectChanges();

      // Check if typing indicator is shown
      const typingElement = fixture.debugElement.query(By.css('.typing-indicator'));
      expect(typingElement).to.not.be.null;
    });

    it('should hide typing indicator after timeout', fakeAsync(() => {
      const roomId = 'room1';
      component.selectedRoomId = roomId;

      // Show typing indicator
      chatServiceSpy.typingStatus$.next({
        roomId: roomId,;
        userId: 'other-user',;
        isTyping: true,;
      });

      fixture.detectChanges();

      // Initial state should show indicator
      let typingElement = fixture.debugElement.query(By.css('.typing-indicator'));
      expect(typingElement).to.not.be.null;

      // Wait for timeout (3000ms is default timeout)
      tick(3000);
      fixture.detectChanges();

      // Indicator should be hidden
      typingElement = fixture.debugElement.query(By.css('.typing-indicator'));
      expect(typingElement).to.be.null;

      discardPeriodicTasks();
    }));

    it('should ignore typing indicators from other rooms', () => {
      const selectedRoomId = 'room1';
      const otherRoomId = 'room2';
      component.selectedRoomId = selectedRoomId;

      // Simulate typing in another room
      chatServiceSpy.typingStatus$.next({
        roomId: otherRoomId,;
        userId: 'other-user',;
        isTyping: true,;
      });

      fixture.detectChanges();

      // Typing indicator should not be shown
      const typingElement = fixture.debugElement.query(By.css('.typing-indicator'));
      expect(typingElement).to.be.null;
    });

    it('should debounce multiple typing events', fakeAsync(() => {
      const roomId = 'room1';
      component.selectedRoomId = roomId;

      chatServiceSpy.sendTypingIndicator = jasmine.createSpy('sendTypingIndicator');

      // Trigger multiple typing events rapidly
      component.onTyping();
      tick(100);
      component.onTyping();
      tick(100);
      component.onTyping();
      tick(100); // Still within debounce window

      // Should only call once after debounce window
      tick(300);
      expect(chatServiceSpy.sendTypingIndicator.calls.count()).equal(1);
      expect(chatServiceSpy.sendTypingIndicator.calls.mostRecent().args[0]).equal(roomId);
    }));
  });
});
