/// <reference types="jasmine" />
/// <reference types="@types/jasmine" />

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import {
  NbThemeModule,
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
  NbSelectModule,
  NbMenuModule,
  NbTabsetModule,
  NbDialogModule,
  NbDialogRef,
  NbDialogService,
  NbContextMenuModule,
} from '@nebular/theme';

import { ChatComponent } from './chat.component';
import { ChatService, ChatMessage, ChatRoom } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DebugElement } from '@angular/core';
import { User } from '../../core/models/user.model';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;
  let chatServiceSpy: jasmine.SpyObj<ChatService>;

  const mockUser = {
    id: 'user1',
    _id: 'user1',
    username: 'testuser',
    email: 'test@example.com',
    roles: ['user'],
    status: 'active',
    createdAt: new Date(),
  };

  const mockChatRoom: ChatRoom = {
    id: 'room1',
    name: 'Test Room',
    participants: [
      {
        id: 'user1',
        username: 'testuser',
        avatar: '/assets/img/default-profile.jpg',
        status: 'online',
        online: true,
      },
      {
        id: 'contact1',
        username: 'contactuser',
        avatar: '/assets/img/default-profile.jpg',
        status: 'offline',
        online: false,
      },
    ],
    unreadCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockChatMessage: ChatMessage = {
    id: 'msg1',
    roomId: 'room1',
    sender: 'user1',
    receiver: 'contact1',
    content: 'Hello world',
    message: 'Hello world', // For legacy support
    timestamp: new Date(),
    read: false,
    type: 'text',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const chatServiceSpyObj = jasmine.createSpyObj('ChatService', [
      'getRooms',
      'getMessages',
      'sendMessage',
      'markMessageAsRead',
      'markMessagesAsRead',
      'sendTypingIndicator',
      'connectSocket',
      'disconnectSocket',
      'configureMessageAutoDeletion',
      'sendMessageWithAttachments',
      'archiveRoom',
      'getUnreadCounts',
    ]);

    // Create BehaviorSubjects for the observables
    const newMessageSubject = new Subject<ChatMessage>();
    const messageReadSubject = new Subject<string>();
    const typingStatusSubject = new Subject<boolean>();

    chatServiceSpy = Object.assign(chatServiceSpyObj, {
      newMessage$: newMessageSubject.asObservable(),
      messageRead$: messageReadSubject.asObservable(),
      typingStatus$: typingStatusSubject.asObservable(),
      _newMessageSubject: newMessageSubject,
      _messageReadSubject: messageReadSubject,
      _typingStatusSubject: typingStatusSubject,
    });

    // Set up spy return values
    chatServiceSpy.getRooms.and.returnValue(of([mockChatRoom]));
    chatServiceSpy.getMessages.and.returnValue(of([mockChatMessage]));
    chatServiceSpy.sendMessage.and.returnValue(of(mockChatMessage));
    chatServiceSpy.markMessageAsRead.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        BrowserAnimationsModule,
        RouterModule.forRoot([]),
        NbThemeModule.forRoot({ name: 'default' }),
        NbMenuModule.forRoot(),
        NbDialogModule.forRoot(),
        ChatComponent,
        NbCardModule,
        NbButtonModule,
        NbInputModule,
        NbFormFieldModule,
        NbIconModule,
        NbSpinnerModule,
        NbAlertModule,
        NbTooltipModule,
        NbBadgeModule,
        NbContextMenuModule,
      ],
      providers: [
        { provide: ChatService, useValue: chatServiceSpy },
        {
          provide: AuthService,
          useValue: {
            getCurrentUser: () => mockUser,
            getCurrentUserId: () => mockUser.id,
          },
        },
        {
          provide: NotificationService,
          useValue: {
            success: jasmine.createSpy('success'),
            error: jasmine.createSpy('error'),
            warning: jasmine.createSpy('warning'),
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}),
            paramMap: of({}),
            snapshot: {
              paramMap: {
                get: () => null,
              },
            },
          },
        },
        NbDialogService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load rooms on init', () => {
    expect(chatServiceSpy.getRooms).toHaveBeenCalled();
    expect(component.rooms[0].name).toBe('Test Room');
  });

  it('should handle new messages', () => {
    component.selectedRoomId = 'room1';
    (chatServiceSpy as any)._newMessageSubject.next(mockChatMessage);
    fixture.detectChanges();

    expect(component.messages).toContain(mockChatMessage);
  });

  it('should handle message sending', fakeAsync(() => {
    const messageText = 'Hello world';
    component.messageText = messageText;
    component.selectedRoomId = 'room1';

    chatServiceSpy.sendMessage.and.returnValue(of(mockChatMessage));

    component.sendMessage();
    tick();
    fixture.detectChanges();

    expect(chatServiceSpy.sendMessage).toHaveBeenCalled();
    expect(component.messageText).toBe('');
  }));

  it('should handle typing events correctly', fakeAsync(() => {
    component.selectedRoomId = 'room1';
    component.onTyping();
    tick(500); // Let debounce timeout pass
    fixture.detectChanges();

    expect(component.isTyping).toBeTrue();
    // Note: The chatService typing indicator is handled internally
  }));

  it('should handle message status updates', () => {
    component.selectedRoomId = 'room1';
    component.messages = [mockChatMessage];
    (chatServiceSpy as any)._messageReadSubject.next('msg1');
    fixture.detectChanges();

    const message = component.messages.find((m) => m.id === 'msg1');
    expect(message?.read).toBeTrue();
  });

  it('should mark messages as read when viewing a room', () => {
    component.selectedRoomId = 'room1';
    fixture.detectChanges();

    expect(chatServiceSpy.markMessagesAsRead).toHaveBeenCalledWith('room1');
  });

  it('should handle new messages', fakeAsync(() => {
    // Set up component with existing messages
    component.selectedRoomId = 'room1';
    component.messages = [];

    // Simulate new message arrival
    (chatServiceSpy as any)._newMessageSubject.next(mockChatMessage);
    tick();
    fixture.detectChanges();

    // Check that message was added and marked as read if from other user
    expect(component.messages).toContain(mockChatMessage);
    if (mockChatMessage.sender !== mockUser.id) {
      expect(chatServiceSpy.markMessageAsRead).toHaveBeenCalledWith(mockChatMessage.id);
    }
  }));

  it('should cleanup subscriptions on destroy', () => {
    component.ngOnDestroy();
    expect(chatServiceSpy.disconnectSocket).toHaveBeenCalled();
  });
});
