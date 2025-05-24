import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  ChangeDetectorRef,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// PrimeNG imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { MenuItem } from 'primeng/api';

import {
  ChatService,
  ChatMessage,
  ChatRoom,
  ChatMessageRequest,
} from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ChatMessageComponent } from '../../../shared/components/chat-message/chat-message.component';

interface ChatUser {
  id: string;
  username: string;
  avatar?: string;
}

interface User {
  _id: string;
  username: string;
  avatar?: string;
}

@Component({
  selector: 'app-chat-room',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputGroupModule,
    AvatarModule,
    MenuModule,
    CheckboxModule,
    DropdownModule,
    ProgressSpinnerModule,
    TooltipModule,
    DialogModule,
    ChatMessageComponent,
  ],
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss'],
  standalone: true,
})
export class ChatRoomComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  roomId = '';
  room: ChatRoom | null = null;
  messages: ChatMessage[] = [];
  loading = true;
  loadingMore = false;
  showSettings = false;

  currentUserId = '';
  otherUser: ChatUser | null = null;

  isEncryptionEnabled = false;
  isMessageExpiryEnabled = false;
  messageExpiryTime = 24; // Default 24 hours

  private subscriptions: Subscription[] = [];
  private shouldScrollToBottom = true;
  private oldestMessageId: string | null = null;
  hasMoreMessages = true;

  contact: ChatUser | null = null;
  isTyping = false;
  private destroy$ = new Subject<void>();

  messageForm = new FormGroup({
    message: new FormControl('', [Validators.required]),
  });

  chatActions: MenuItem[] = [
    {
      label: 'View Profile',
      icon: 'pi pi-user',
      command: () => this.viewProfile(),
    },
    {
      label: 'Pin Chat',
      icon: 'pi pi-bookmark',
      command: () => this.pinChat(),
    },
    {
      label: 'Enable Message Expiry',
      icon: 'pi pi-clock',
      command: () => this.toggleSettings(),
    },
    {
      label: 'Clear Chat',
      icon: 'pi pi-trash',
      command: () => this.clearChat(),
    },
    {
      label: 'Block User',
      icon: 'pi pi-ban',
      command: () => this.blockUser(),
    },
    {
      label: 'Report',
      icon: 'pi pi-exclamation-triangle',
      command: () => this.reportUser(),
    },
  ];

  newMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
  ) {
    this.authService.getCurrentUser().subscribe((user) => {
      this.currentUserId = user?._id || '';
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const roomId = params.get('id');
      if (roomId) {
        this.roomId = roomId;
        this.loadRoom();
        this.loadMessages();
        this.setupSocketListeners();
      } else {
        this.router.navigate(['/chat']);
      }
    });

    // Subscribe to typing status
    this.subscriptions.push(
      this.chatService.typingStatus$.pipe(takeUntil(this.destroy$)).subscribe((isTyping) => {
        this.isTyping = isTyping;
        this.scrollToBottomIfNeeded();
      }),
    );
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottomIfNeeded();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  /**
   * Load chat room details
   */
  loadRoom(): void {
    this.loading = true;

    this.chatService.getRooms().subscribe(
      (rooms) => {
        const room = rooms.find((r) => r.id === this.roomId);
        if (room) {
          this.room = room;
          this.determineOtherUser();
          this.chatService.markMessagesAsRead(this.roomId).subscribe();
        } else {
          this.notificationService.error('Chat room not found');
          this.router.navigate(['/chat']);
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error loading room:', error);
        this.notificationService.error('Failed to load chat room');
        this.loading = false;
      },
    );
  }

  /**
   * Load chat messages
   */
  loadMessages(): void {
    this.loading = true;

    this.chatService.getMessages(this.roomId).subscribe(
      (messages) => {
        this.messages = messages;
        this.loading = false;
        this.shouldScrollToBottom = true;

        if (messages.length > 0) {
          this.oldestMessageId = messages[messages.length - 1].id;
        }

        this.hasMoreMessages = messages.length >= 50;
      },
      (error) => {
        console.error('Error loading messages:', error);
        this.notificationService.error('Failed to load messages');
        this.loading = false;
      },
    );
  }

  /**
   * Load more messages (older messages)
   */
  loadMoreMessages(): void {
    if (!this.hasMoreMessages || this.loadingMore) {
      return;
    }

    this.loadingMore = true;

    this.chatService.getMessages(this.roomId, 50, this.oldestMessageId).subscribe(
      (messages) => {
        if (messages.length > 0) {
          this.messages = [...this.messages, ...messages];
          this.oldestMessageId = messages[messages.length - 1].id;
        }

        this.hasMoreMessages = messages.length >= 50;
        this.loadingMore = false;
      },
      (error) => {
        console.error('Error loading more messages:', error);
        this.notificationService.error('Failed to load more messages');
        this.loadingMore = false;
      },
    );
  }

  /**
   * Set up socket listeners for real-time updates
   */
  setupSocketListeners(): void {
    this.chatService.connectSocket();

    this.subscriptions.push(
      this.chatService.newMessage$.pipe(takeUntil(this.destroy$)).subscribe((message) => {
        if (message.roomId === this.roomId) {
          this.messages = [message, ...this.messages];
          this.shouldScrollToBottom = true;

          if (message.sender !== this.currentUserId) {
            this.chatService.markMessageAsRead(message.id).subscribe();
          }
        }
      }),
    );

    this.subscriptions.push(
      this.chatService.messageRead$.pipe(takeUntil(this.destroy$)).subscribe((messageId) => {
        const message = this.messages.find((m) => m.id === messageId);
        if (message) {
          message.read = true;
          this.cdr.detectChanges();
        }
      }),
    );
  }

  /**
   * Determine the other user in the conversation
   */
  determineOtherUser(): void {
    if (!this.room || !this.room.participants) {
      return;
    }

    const otherParticipant = this.room.participants.find((p) => p.id !== this.currentUserId);
    if (otherParticipant) {
      this.otherUser = {
        id: otherParticipant.id,
        username: otherParticipant.username,
        avatar: otherParticipant.avatar || '/assets/img/default-profile.jpg',
      };
    }
  }

  /**
   * Send a new message
   */
  sendMessage(): void {
    if (this.messageForm.valid) {
      const message = this.messageForm.get('message')?.value;
      if (message) {
        const payload: ChatMessageRequest = {
          roomId: this.roomId,
          content: message,
          ...(this.isMessageExpiryEnabled && {
            ttl: this.messageExpiryTime * 60 * 60, // Convert hours to seconds
          }),
        };

        this.chatService.sendMessage(payload).subscribe(
          () => {
            this.messageForm.reset();
            this.scrollToBottomIfNeeded();
          },
          (error) => {
            this.notificationService.error('Failed to send message');
            console.error('Error sending message:', error);
          },
        );
      }
    }
  }

  /**
   * Menu action methods
   */
  viewProfile(): void {
    if (this.otherUser) {
      this.router.navigate(['/profile', this.otherUser.id]);
    }
  }

  pinChat(): void {
    if (this.room) {
      this.chatService.pinRoom(this.room.id).subscribe(
        () => {
          this.notificationService.success('Chat pinned successfully');
        },
        (error) => {
          console.error('Error pinning chat:', error);
          this.notificationService.error('Failed to pin chat');
        },
      );
    }
  }

  clearChat(): void {
    if (this.room) {
      this.chatService.clearRoom(this.room.id).subscribe(
        () => {
          this.messages = [];
          this.notificationService.success('Chat cleared successfully');
        },
        (error) => {
          console.error('Error clearing chat:', error);
          this.notificationService.error('Failed to clear chat');
        },
      );
    }
  }

  blockUser(): void {
    if (this.otherUser) {
      this.chatService.blockUser(this.otherUser.id).subscribe(
        () => {
          this.notificationService.success('User blocked successfully');
          this.router.navigate(['/chat']);
        },
        (error) => {
          console.error('Error blocking user:', error);
          this.notificationService.error('Failed to block user');
        },
      );
    }
  }

  reportUser(): void {
    if (this.otherUser) {
      this.chatService.reportUser(this.otherUser.id).subscribe(
        () => {
          this.notificationService.success('User reported successfully');
        },
        (error) => {
          console.error('Error reporting user:', error);
          this.notificationService.error('Failed to report user');
        },
      );
    }
  }

  /**
   * Handle file selection for attachments
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (files?.length) {
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      const fileArray = Array.from(files);
      const oversizedFiles = fileArray.filter((file) => file.size > maxFileSize);

      if (oversizedFiles.length > 0) {
        this.notificationService.error(
          `Some files exceed the 10MB size limit: ${oversizedFiles.map((f) => f.name).join(', ')}`,
        );
        return;
      }

      // Send message with attachments
      this.chatService
        .sendMessageWithAttachments(
          this.roomId,
          this.messageForm.get('message')?.value || '',
          fileArray,
        )
        .then(() => {
          this.messageForm.reset();
          this.scrollToBottomIfNeeded();
        })
        .catch((error) => {
          this.notificationService.error('Failed to send files');
          console.error('Error sending files:', error);
        });
    }
  }

  /**
   * Send typing indicator
   */
  onTyping(): void {
    this.chatService.sendTypingIndicator(this.roomId);
  }

  /**
   * Scroll messages container to bottom
   */
  scrollToBottomIfNeeded(): void {
    try {
      if (this.messageContainer) {
        this.messageContainer.nativeElement.scrollTop =
          this.messageContainer.nativeElement.scrollHeight;
        this.cdr.detectChanges();
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  /**
   * Handle scroll event to load more messages
   */
  onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    if (element.scrollTop < 100 && this.hasMoreMessages && !this.loadingMore) {
      this.loadMoreMessages();
    }
  }

  /**
   * Toggle chat settings panel
   */
  toggleSettings(): void {
    this.showSettings = !this.showSettings;
  }

  /**
   * Toggle message expiry
   */
  toggleMessageExpiry(): void {
    if (!this.room) return;

    this.isMessageExpiryEnabled = !this.isMessageExpiryEnabled;
    this.chatService
      .updateRoomSettings(this.roomId, {
        messageExpiryEnabled: this.isMessageExpiryEnabled,
        messageExpiryTime: this.messageExpiryTime,
      })
      .subscribe(
        () => {
          this.notificationService.success(
            this.isMessageExpiryEnabled ? 'Message expiry enabled' : 'Message expiry disabled',
          );
        },
        (error) => {
          console.error('Error updating message expiry settings:', error);
          this.notificationService.error('Failed to update message expiry settings');
          // Revert state on error
          this.isMessageExpiryEnabled = !this.isMessageExpiryEnabled;
        },
      );
  }

  /**
   * Toggle encryption for the chat room
   */
  toggleEncryption(): void {
    if (!this.room) return;

    this.isEncryptionEnabled = !this.isEncryptionEnabled;
    this.chatService
      .updateRoomSettings(this.roomId, {
        encryptionEnabled: this.isEncryptionEnabled,
      })
      .subscribe(
        () => {
          this.notificationService.success(
            this.isEncryptionEnabled
              ? 'End-to-end encryption enabled'
              : 'End-to-end encryption disabled',
          );
        },
        (error) => {
          console.error('Error updating encryption settings:', error);
          this.notificationService.error('Failed to update encryption settings');
          // Revert state on error
          this.isEncryptionEnabled = !this.isEncryptionEnabled;
        },
      );
  }

  /**
   * Update message expiry time
   */
  updateMessageExpiryTime(event: any) {
    const value = event.value;
    this.messageExpiryTime = value;

    if (!this.room || !this.isMessageExpiryEnabled) return;

    this.chatService
      .updateRoomSettings(this.roomId, {
        messageExpiryTime: value,
      })
      .subscribe(
        () => {
          this.notificationService.success('Message expiry time updated');
        },
        (error) => {
          console.error('Error updating message expiry time:', error);
          this.notificationService.error('Failed to update message expiry time');
        },
      );
  }

  /**
   * Handle settings changes
   */
  onSettingsChanged(settings: any): void {
    this.showSettings = false;

    if (settings.messageExpiry !== undefined) {
      this.toggleMessageExpiry();
    }

    if (settings.encryption !== undefined) {
      this.toggleEncryption();
    }

    if (settings.expiryTime !== undefined) {
      this.updateMessageExpiryTime(settings.expiryTime);
    }

    this.notificationService.success('Chat settings updated');
    this.loadRoom();
  }

  /**
   * Navigate back to the chat list
   */
  navigateBack(): void {
    this.router.navigate(['/chat']);
  }

  isOwnMessage(message: ChatMessage): boolean {
    return message.sender === this.currentUserId;
  }
}
