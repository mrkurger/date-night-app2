// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (chat-room.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
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
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatService, ChatMessage, ChatRoom } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';
import { EncryptionService } from '../../../core/services/encryption.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ChatMessageComponent } from '../../../shared/components/chat-message/chat-message.component';
import { ChatSettingsComponent } from '../../../shared/components/chat-settings/chat-settings.component';

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatMessageComponent, ChatSettingsComponent],
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss'],
})
export class ChatRoomComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messageContainer') messageContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  roomId = '';
  room: ChatRoom | null = null;
  messages: ChatMessage[] = [];
  newMessage = '';
  loading = true;
  loadingMore = false;
  showSettings = false;

  currentUserId = '';
  otherUser: any = null;

  isEncryptionEnabled = false;
  encryptionStatus: 'enabled' | 'disabled' | 'initializing' = 'initializing';

  private subscriptions: Subscription[] = [];
  private scrollToBottom = true;
  private oldestMessageId: string | null = null;
  hasMoreMessages = true; // Made public for template access // Made public for template access // Made public for template access // Made public for template access // Made public for template access

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
    private authService: AuthService,
    private encryptionService: EncryptionService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();

    // Get room ID from route params
    this.route.paramMap.subscribe((params) => {
      const roomId = params.get('id');
      if (roomId) {
        this.roomId = roomId;
        this.loadRoom();
        this.loadMessages();
        this.setupSocketListeners();
        this.checkEncryptionStatus();
      } else {
        this.router.navigate(['/chat']);
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.scrollToBottom) {
      this.scrollMessagesToBottom();
      this.scrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  /**
   * Load chat room details
   */
  loadRoom(): void {
    this.loading = true;

    this.chatService.getRooms().subscribe(
      (rooms) => {
        const room = rooms.find((r) => r._id === this.roomId);
        if (room) {
          this.room = room;
          this.determineOtherUser();

          // Mark messages as read
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
        this.scrollToBottom = true;

        if (messages.length > 0) {
          this.oldestMessageId = messages[messages.length - 1]._id;
        }

        // If we got fewer messages than requested, there are no more
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
          // Add messages to the end (they come in reverse chronological order)
          this.messages = [...this.messages, ...messages];
          this.oldestMessageId = messages[messages.length - 1]._id;
        }

        // If we got fewer messages than requested, there are no more
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
    // Connect to socket
    this.chatService.connectSocket();

    // Listen for new messages
    this.chatService.onNewMessage((message) => {
      if (message.roomId === this.roomId) {
        this.messages = [message, ...this.messages];
        this.scrollToBottom = true;

        // Mark message as read if it's not from current user
        if (message.sender !== this.currentUserId) {
          this.chatService.markAsRead(message._id).subscribe();
        }
      }
    });

    // Listen for message read events
    this.chatService.onMessageRead((data) => {
      const { messageId } = data;
      const message = this.messages.find((m) => m._id === messageId);
      if (message) {
        message.read = true;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Check encryption status for the room
   */
  async checkEncryptionStatus(): Promise<void> {
    this.encryptionStatus = 'initializing';

    try {
      // Check if encryption is available
      const isAvailable = this.encryptionService.isEncryptionAvailable();
      if (!isAvailable) {
        this.encryptionStatus = 'disabled';
        return;
      }

      // Try to get the room key
      const roomKey = await this.encryptionService.getRoomKey(this.roomId);
      if (roomKey) {
        this.encryptionStatus = 'enabled';
        this.isEncryptionEnabled = true;
      } else {
        // Try to set up encryption for the room
        this.encryptionService.setupRoomEncryption(this.roomId).subscribe(
          (success) => {
            this.encryptionStatus = success ? 'enabled' : 'disabled';
            this.isEncryptionEnabled = success;
          },
          (error) => {
            console.error('Error setting up encryption:', error);
            this.encryptionStatus = 'disabled';
            this.isEncryptionEnabled = false;
          },
        );
      }
    } catch (error) {
      console.error('Error checking encryption status:', error);
      this.encryptionStatus = 'disabled';
      this.isEncryptionEnabled = false;
    }
  }

  /**
   * Determine the other user in the conversation
   */
  determineOtherUser(): void {
    if (!this.room || !this.room.participants) {
      return;
    }

    // Find the other user in the participants
    const otherParticipant = this.room.participants.find((p) => p !== this.currentUserId);
    if (otherParticipant) {
      // Get user details (this would be implemented in a real app)
      // For now, we'll just use a placeholder
      this.otherUser = {
        id: otherParticipant,
        name: 'User ' + otherParticipant.substring(0, 5),
        avatar: '/assets/img/default-profile.jpg',
      };
    }
  }

  /**
   * Send a new message
   */
  sendMessage(): void {
    if (!this.newMessage.trim()) {
      return;
    }

    const content = this.newMessage.trim();
    this.newMessage = '';

    // Focus the input field after sending
    setTimeout(() => {
      this.messageInput.nativeElement.focus();
    }, 0);

    this.chatService.sendMessage(this.roomId, content).subscribe(
      (message) => {
        // Message will be added via socket listener
        this.scrollToBottom = true;
      },
      (error) => {
        console.error('Error sending message:', error);
        this.notificationService.error('Failed to send message');
        // Restore the message if it failed to send
        this.newMessage = content;
      },
    );
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
    this.chatService.sendMessageWithAttachments(this.roomId, this.newMessage, files).subscribe(
      (message) => {
        // Message will be added via socket listener
        this.scrollToBottom = true;
        this.newMessage = '';
      },
      (error) => {
        console.error('Error sending message with attachments:', error);
        this.notificationService.error('Failed to send attachments');
      },
    );

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
  scrollMessagesToBottom(): void {
    if (this.messageContainer) {
      const element = this.messageContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  /**
   * Handle scroll event to load more messages
   */
  onScroll(event: Event): void {
    const element = event.target as HTMLElement;

    // If scrolled near the top, load more messages
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
}
