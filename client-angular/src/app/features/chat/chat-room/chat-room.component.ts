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
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

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
import { ChipModule } from 'primeng/chip';
import { RippleModule } from 'primeng/ripple';
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
    ChipModule,
    RippleModule,
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
  contact: ChatUser | null = null;

  isEncryptionEnabled = false;
  isMessageExpiryEnabled = false;
  messageExpiryTime = 24; // Default 24 hours
  selectedFiles: File[] = [];

  private subscriptions: Subscription[] = [];
  private shouldScrollToBottom = true;
  private oldestMessageId: string | null = null;
  private typingTimeout: any;
  hasMoreMessages = true;
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
      label: 'Settings',
      icon: 'pi pi-cog',
      command: () => this.toggleSettings(),
    },
    {
      separator: true,
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
      styleClass: 'text-danger',
    },
    {
      label: 'Report',
      icon: 'pi pi-exclamation-triangle',
      command: () => this.reportUser(),
      styleClass: 'text-danger',
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.initializeUser();
    this.setupRouteListener();
    this.setupTypingListener();
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
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }

  private initializeUser(): void {
    this.authService
      .getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        if (user) {
          this.currentUserId = user._id;
        } else {
          this.router.navigate(['/login']);
        }
      });
  }

  private setupRouteListener(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
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
  }

  private setupTypingListener(): void {
    this.chatService.typingStatus$
      .pipe(takeUntil(this.destroy$), debounceTime(300))
      .subscribe((isTyping) => {
        this.isTyping = isTyping;
        if (isTyping) {
          this.scrollToBottomIfNeeded();
        }
      });
  }

  loadRoom(): void {
    this.loading = true;

    this.chatService.getRooms().subscribe(
      (rooms) => {
        const room = rooms.find((r) => r.id === this.roomId);
        if (room) {
          this.room = room;
          this.setupContactInfo();
          this.chatService.markMessagesAsRead(this.roomId).subscribe();

          // Initialize settings
          this.isMessageExpiryEnabled = !!room.messageExpiryTime;
          this.messageExpiryTime = room.messageExpiryTime || 24;
          this.isEncryptionEnabled = room.encryptionEnabled || false;
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

  private setupContactInfo(): void {
    if (this.room?.participants) {
      const otherParticipant = this.room.participants.find((p) => p.id !== this.currentUserId);
      if (otherParticipant) {
        this.contact = {
          id: otherParticipant.id,
          username: otherParticipant.username,
          avatar: otherParticipant.avatar || '/assets/img/default-profile.jpg',
        };
      }
    }
  }

  loadMessages(): void {
    this.loading = true;

    this.chatService.getMessages(this.roomId).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.loading = false;
        this.shouldScrollToBottom = true;

        if (messages.length > 0) {
          this.oldestMessageId = messages[messages.length - 1].id;
        }

        this.hasMoreMessages = messages.length >= 50;
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.notificationService.error('Failed to load messages');
        this.loading = false;
      },
    });
  }

  loadMoreMessages(): void {
    if (!this.hasMoreMessages || this.loadingMore) return;

    this.loadingMore = true;

    this.chatService.getMessages(this.roomId, 50, this.oldestMessageId).subscribe({
      next: (messages) => {
        if (messages.length > 0) {
          this.messages = [...this.messages, ...messages];
          this.oldestMessageId = messages[messages.length - 1].id;
        }
        this.hasMoreMessages = messages.length >= 50;
        this.loadingMore = false;
      },
      error: (error) => {
        console.error('Error loading more messages:', error);
        this.notificationService.error('Failed to load more messages');
        this.loadingMore = false;
      },
    });
  }

  setupSocketListeners(): void {
    this.chatService.connectSocket();

    // New message handler
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

    // Message read handler
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

  sendMessage(): void {
    if (!this.messageForm.valid && !this.selectedFiles.length) return;

    const content = this.messageForm.get('message')?.value || '';
    const hasAttachments = this.selectedFiles.length > 0;

    if (hasAttachments) {
      this.sendMessageWithAttachments(content);
    } else {
      this.sendTextMessage(content);
    }
  }

  private async sendTextMessage(content: string): Promise<void> {
    const payload: ChatMessageRequest = {
      roomId: this.roomId,
      content,
      ...(this.isMessageExpiryEnabled && {
        ttl: this.messageExpiryTime * 60 * 60, // Convert hours to seconds
      }),
    };

    try {
      await this.chatService.sendMessage(payload).toPromise();
      this.messageForm.reset();
      this.scrollToBottomIfNeeded();
    } catch (error) {
      this.notificationService.error('Failed to send message');
      console.error('Error sending message:', error);
    }
  }

  private async sendMessageWithAttachments(content: string): Promise<void> {
    try {
      await this.chatService.sendMessageWithAttachments(this.roomId, content, this.selectedFiles);
      this.messageForm.reset();
      this.selectedFiles = [];
      this.scrollToBottomIfNeeded();
    } catch (error) {
      this.notificationService.error('Failed to send files');
      console.error('Error sending files:', error);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (files?.length) {
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      const fileArray = Array.from(files);
      const oversizedFiles = fileArray.filter((file) => file.size > maxFileSize);

      if (oversizedFiles.length > 0) {
        this.notificationService.error(
          `The following files exceed 10MB: ${oversizedFiles.map((f) => f.name).join(', ')}`,
        );
        return;
      }

      this.selectedFiles = [...this.selectedFiles, ...fileArray];
    }
  }

  removeFile(file: File): void {
    this.selectedFiles = this.selectedFiles.filter((f) => f !== file);
  }

  onTyping(): void {
    this.chatService.sendTypingIndicator(this.roomId);

    // Clear previous timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    // Set new timeout to clear typing status
    this.typingTimeout = setTimeout(() => {
      this.isTyping = false;
    }, 3000);
  }

  toggleMessageExpiry(): void {
    if (this.room) {
      const settings = {
        messageExpiryEnabled: this.isMessageExpiryEnabled,
        messageExpiryTime: this.isMessageExpiryEnabled ? this.messageExpiryTime : 0,
      };

      this.chatService.updateRoomSettings(this.room.id, settings).subscribe({
        next: () => {
          this.notificationService.success('Message expiry settings updated');
        },
        error: (error) => {
          console.error('Error updating message expiry:', error);
          this.notificationService.error('Failed to update message expiry settings');
        },
      });
    }
  }

  toggleEncryption(): void {
    if (this.room) {
      const settings: any = {
        encryptionEnabled: this.isEncryptionEnabled,
      };

      this.chatService.updateRoomSettings(this.room.id, settings).subscribe({
        next: () => {
          this.notificationService.success(
            this.isEncryptionEnabled
              ? 'End-to-end encryption enabled'
              : 'End-to-end encryption disabled',
          );
        },
        error: (error) => {
          console.error('Error toggling encryption:', error);
          this.notificationService.error('Failed to update encryption settings');
        },
      });
    }
  }

  // Menu Actions
  viewProfile(): void {
    if (this.contact) {
      this.router.navigate(['/profile', this.contact.id]);
    }
  }

  pinChat(): void {
    if (this.room) {
      this.chatService.pinRoom(this.room.id).subscribe({
        next: () => {
          this.room!.pinned = !this.room!.pinned;
          this.notificationService.success(this.room!.pinned ? 'Chat pinned' : 'Chat unpinned');
        },
        error: (error) => {
          console.error('Error pinning chat:', error);
          this.notificationService.error('Failed to pin chat');
        },
      });
    }
  }

  clearChat(): void {
    if (this.room) {
      this.chatService.clearRoom(this.room.id).subscribe({
        next: () => {
          this.messages = [];
          this.notificationService.success('Chat cleared');
        },
        error: (error) => {
          console.error('Error clearing chat:', error);
          this.notificationService.error('Failed to clear chat');
        },
      });
    }
  }

  blockUser(): void {
    if (this.contact) {
      this.chatService.blockUser(this.contact.id).subscribe({
        next: () => {
          this.notificationService.success('User blocked');
          this.router.navigate(['/chat']);
        },
        error: (error) => {
          console.error('Error blocking user:', error);
          this.notificationService.error('Failed to block user');
        },
      });
    }
  }

  reportUser(): void {
    if (this.contact) {
      this.chatService.reportUser(this.contact.id).subscribe({
        next: () => {
          this.notificationService.success('User reported');
        },
        error: (error) => {
          console.error('Error reporting user:', error);
          this.notificationService.error('Failed to report user');
        },
      });
    }
  }

  toggleSettings(): void {
    this.showSettings = !this.showSettings;
  }

  isOwnMessage(message: ChatMessage): boolean {
    return message.sender === this.currentUserId;
  }

  messageTrackBy(index: number, message: ChatMessage): string {
    return message.id;
  }

  private scrollToBottomIfNeeded(): void {
    try {
      if (this.messageContainer) {
        const element = this.messageContainer.nativeElement;
        const atBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 100;

        if (atBottom) {
          setTimeout(() => {
            element.scrollTop = element.scrollHeight;
            this.cdr.detectChanges();
          }, 0);
        }
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    if (element.scrollTop < 100 && this.hasMoreMessages && !this.loadingMore) {
      this.loadMoreMessages();
    }
  }
}
