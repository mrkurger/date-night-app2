import { NbIconModule } from '@nebular/theme';
import { NbFormFieldModule } from '@nebular/theme';
import { NbUserModule } from '@nebular/theme';
import { NbCardModule } from '@nebular/theme';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  ChangeDetectorRef,
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
import {
  NbCardModule,
  NbUserModule,
  NbActionsModule,
  NbContextMenuModule,
  NbIconModule,
  NbFormFieldModule,
  NbInputModule,
  NbButtonModule,
} from '@nebular/theme';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChatService, ChatMessage, ChatRoom } from '../../../core/services/chat.service';
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
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NbCardModule,
    NbUserModule,
    NbActionsModule,
    NbContextMenuModule,
    NbIconModule,
    NbFormFieldModule,
    NbInputModule,
    NbButtonModule,
    ChatMessageComponent,
  ],
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss'],
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

  chatActions = [
    { title: 'View Profile', icon: 'person-outline' },
    { title: 'Clear Chat', icon: 'trash-2-outline' },
    { title: 'Block User', icon: 'slash-outline' },
    { title: 'Report', icon: 'alert-triangle-outline' },
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
    this.currentUserId = this.authService.getCurrentUserId();
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
    if (this.messageForm.valid && this.otherUser) {
      const messageText = this.messageForm.get('message')?.value;
      if (messageText) {
        this.chatService
          .sendMessage({
            id: Date.now().toString(),
            roomId: this.roomId,
            sender: this.currentUserId,
            receiver: this.otherUser.id,
            content: messageText,
            timestamp: new Date(),
            read: false,
          })
          .pipe(takeUntil(this.destroy$))
          .subscribe(
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
   * Handle file selection for attachments
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const files = Array.from(input.files);

    // Check file size limits
    const oversizedFiles = files.filter((file) => file.size > 10 * 1024 * 1024); // 10MB
    if (oversizedFiles.length > 0) {
      this.notificationService.error(
        `Some files exceed the 10MB size limit: ${oversizedFiles.map((f) => f.name).join(', ')}`,
      );
      return;
    }

    // Send message with attachments
    this.chatService
      .sendMessageWithAttachments(this.roomId, this.newMessage, files)
      .then((message) => {
        // Message will be added via socket listener
        this.scrollToBottomIfNeeded();
        this.newMessage = '';
      })
      .catch((error) => {
        console.error('Error sending message with attachments:', error);
        this.notificationService.error('Failed to send attachments');
      });

    // Reset the input
    input.value = '';
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
   * Handle settings changes
   */
  onSettingsChanged(settings: any): void {
    this.showSettings = false;
    this.notificationService.success('Chat settings updated');

    // Reload room to get updated settings
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
