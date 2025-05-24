import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';

// PrimeNG imports
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
import { FileUploadModule } from 'primeng/fileupload';
import { MenuItem } from 'primeng/api';
import { MessageService, ConfirmationService } from 'primeng/api';

// Custom components and services
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import {
  ChatService,
  ChatMessage,
  ChatRoom,
  ChatParticipant,
  ChatMessageRequest,
} from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

/**
 * ChatComponent provides a real-time chat interface using PrimeNG components.
 * It handles user conversations, message sending/receiving, and chat room management.
 *
 * Features:
 * - Real-time messaging
 * - User presence indicators
 * - Message history
 * - User blocking
 * - Chat room management
 * - File sharing (images, documents)
 *
 * @implements OnInit
 * @implements OnDestroy
 * @implements AfterViewChecked
 */
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    BadgeModule,
    TooltipModule,
    MenuModule,
    DialogModule,
    TabViewModule,
    AvatarModule,
    SkeletonModule,
    ConfirmDialogModule,
    ProgressSpinnerModule,
    FileUploadModule,
    AvatarComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  // ViewChild references
  @ViewChild('messageList') messageList!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  // Dialog visibility flags
  showNewMessageDialog = false;
  showImagePreview = false;
  showMediaGallery = false;

  // Message input
  messageText = '';
  newMessageSearch = '';
  filteredNewMessageContacts: ChatParticipant[] = [];

  // Chat data
  messages: ChatMessage[] = [];
  currentMessages: ChatMessage[] = [];
  rooms: ChatRoom[] = [];
  contacts: ChatParticipant[] = [];
  filteredContacts: ChatParticipant[] = [];
  newMessage = '';
  currentUserId = '';
  selectedRoomId: string | null = null;
  searchTerm = '';

  // UI state
  loadingContacts = true;
  loading = false;
  isContactTyping = false;
  showEmojiPicker = false;
  notificationsEnabled = true;
  currentFilter: 'all' | 'unread' | 'archived' = 'all';
  searchQuery = '';
  selectedContactId: string | null = null;
  selectedContact: ChatParticipant | null = null;

  // Menu items for chat actions
  chatMenuItems: MenuItem[] = [
    {
      label: 'View Profile',
      icon: 'pi pi-user',
      command: () => this.viewProfile(),
    },
    {
      label: 'Clear History',
      icon: 'pi pi-trash',
      command: () => this.clearHistory(),
    },
    {
      label: 'Block User',
      icon: 'pi pi-ban',
      command: () => this.blockUser(),
    },
    {
      label: 'Report',
      icon: 'pi pi-exclamation-triangle',
      command: () => this.report(),
    },
  ];

  private subscriptions: Subscription[] = [];
  private typingSubject = new Subject<string>();
  private shouldScrollToBottom = true;

  /**
   * Initializes the chat component with required services and sets up initial state
   *
   * @param chatService - Service handling chat operations
   * @param authService - Service for user authentication
   * @param notificationService - Service for showing user notifications
   * @param confirmationService - Service for confirmation dialogs
   * @param router - Angular router service
   * @param route - Current route information
   */
  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.currentUserId = this.authService.getCurrentUserId();
  }

  /**
   * Lifecycle hook that is called after data-bound properties are initialized
   */
  ngOnInit(): void {
    this.loadRooms();
    this.setupSubscriptions();
  }

  /**
   * Lifecycle hook that is called before the component is destroyed
   * Cleans up subscriptions and disconnects from chat service
   */
  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.chatService.disconnectSocket();
  }

  /**
   * Lifecycle hook that is called after every check of the component's view
   * Handles automatic scrolling to the bottom of the chat
   */
  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
    }
  }

  /**
   * Sends a new message in the current chat room
   * Shows appropriate loading states and error messages
   */
  sendMessage(): void {
    if (!this.messageText.trim()) return;

    const messageRequest: ChatMessageRequest = {
      content: this.messageText,
      roomId: this.selectedRoomId!,
      senderId: this.currentUserId,
      type: 'text',
    };

    this.chatService.sendMessage(messageRequest).subscribe({
      next: () => {
        this.messageText = '';
        this.shouldScrollToBottom = true;
      },
      error: (error) => {
        this.notificationService.showError('Failed to send message');
        console.error('Error sending message:', error);
      },
    });
  }

  /**
   * Handles user typing events with debounce
   * Notifies other users when the current user is typing
   */
  onTyping(): void {
    if (this.selectedRoomId) {
      this.typingSubject.next(this.selectedRoomId);
    }
  }

  /**
   * Filters the contacts list based on search query
   * Updates filteredContacts array with matching results
   */
  filterContacts(): void {
    if (!this.searchQuery) {
      this.filteredContacts = [...this.contacts];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredContacts = this.contacts.filter((contact) =>
      contact.name.toLowerCase().includes(query),
    );
  }

  /**
   * Filters the contacts list for the new message dialog
   * Excludes the current user from the results
   */
  filterNewMessageContacts(): void {
    if (!this.newMessageSearch) {
      this.filteredNewMessageContacts = [...this.contacts];
      return;
    }

    const query = this.newMessageSearch.toLowerCase();
    this.filteredNewMessageContacts = this.contacts.filter(
      (contact) => contact.name.toLowerCase().includes(query) && contact.id !== this.currentUserId,
    );
  }

  // UI Actions
  /**
   * Selects a contact to view the chat history
   * Loads messages for the selected contact
   *
   * @param contactId - ID of the contact to select
   */
  selectContact(contactId: string): void {
    this.selectedContactId = contactId;
    this.selectedContact = this.contacts.find((c) => c.id === contactId) || null;
    if (this.selectedContact) {
      this.loadMessages(this.selectedContact.id);
    }
  }

  /**
   * Opens the new message dialog
   * Initializes the contact filter
   */
  openNewMessageDialog(): void {
    this.showNewMessageDialog = true;
    this.filterContacts();
  }

  /**
   * Navigates to the user profile page of the selected contact
   */
  viewProfile(): void {
    if (this.selectedContact) {
      this.router.navigate(['/profile', this.selectedContact.id]);
    }
  }

  /**
   * Clears the chat history for the current room after confirmation
   */
  clearHistory(): void {
    if (!this.selectedRoomId) {
      this.notificationService.showError('No chat room selected');
      return;
    }

    this.confirmationService.confirm({
      message: 'Are you sure you want to clear the chat history? This action cannot be undone.',
      header: 'Clear Chat History',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'pi pi-trash',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-outlined',
      accept: () => {
        this.loading = true;
        this.chatService
          .clearHistory(this.selectedRoomId!)
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: () => {
              this.currentMessages = [];
              this.notificationService.showSuccess('Chat history cleared successfully');
            },
            error: (error) => {
              console.error('Error clearing chat history:', error);
              this.notificationService.showError('Failed to clear chat history. Please try again.');
            },
          });
      },
    });
  }

  /**
   * Blocks a user after confirmation
   */
  blockUser(): void {
    if (!this.selectedContact) {
      this.notificationService.showError('No user selected');
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to block ${this.selectedContact.name}? You won't receive messages from this user anymore.`,
      header: 'Block User',
      icon: 'pi pi-ban',
      acceptIcon: 'pi pi-ban',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-outlined',
      accept: () => {
        this.loading = true;
        this.chatService
          .blockUser(this.selectedContact!.id)
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: () => {
              this.notificationService.showSuccess(
                `${this.selectedContact!.name} has been blocked`,
              );
              this.loadRooms(); // Refresh room list
            },
            error: (error) => {
              console.error('Error blocking user:', error);
              this.notificationService.showError('Failed to block user. Please try again.');
            },
          });
      },
    });
  }

  /**
   * Reports a user after confirmation
   */
  report(): void {
    if (!this.selectedContact) {
      this.notificationService.showError('No user selected');
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to report ${this.selectedContact.name}? Our team will review your report.`,
      header: 'Report User',
      icon: 'pi pi-exclamation-circle',
      acceptIcon: 'pi pi-flag',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'p-button-warning',
      rejectButtonStyleClass: 'p-button-outlined',
      accept: () => {
        this.loading = true;
        this.chatService
          .reportUser(this.selectedContact!.id)
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: () => {
              this.notificationService.showSuccess('Report submitted successfully');
            },
            error: (error) => {
              console.error('Error reporting user:', error);
              this.notificationService.showError('Failed to submit report. Please try again.');
            },
          });
      },
    });
  }

  // Helper methods
  /**
   * Loads the chat rooms for the current user
   * Updates the rooms array and handles loading state
   */
  private loadRooms(): void {
    this.loadingContacts = true;
    this.chatService.getRooms().subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        this.loadingContacts = false;
      },
      error: (error) => {
        this.notificationService.showError('Failed to load chat rooms');
        console.error('Error loading rooms:', error);
        this.loadingContacts = false;
      },
    });
  }

  /**
   * Loads the messages for a specific chat room
   * Updates the currentMessages array and handles loading state
   *
   * @param roomId - ID of the room to load messages for
   */
  private loadMessages(roomId: string): void {
    this.loading = true;
    this.chatService.getMessages(roomId).subscribe({
      next: (messages) => {
        this.currentMessages = messages;
        this.loading = false;
        this.shouldScrollToBottom = true;
      },
      error: (error) => {
        this.notificationService.showError('Failed to load messages');
        console.error('Error loading messages:', error);
        this.loading = false;
      },
    });
  }

  /**
   * Sets up subscriptions for chat events
   * - New messages
   * - Typing status
   * - User presence
   */
  private setupSubscriptions(): void {
    this.subscriptions.push(
      this.chatService.newMessage$.subscribe((message) => {
        if (message.roomId === this.selectedRoomId) {
          this.currentMessages = [...this.currentMessages, message];
          this.shouldScrollToBottom = true;
        }
      }),

      this.chatService.typingStatus$.subscribe((status) => {
        if (status.roomId === this.selectedRoomId) {
          this.isContactTyping = status.isTyping;
        }
      }),

      this.typingSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((roomId) => {
        this.chatService.sendTypingIndicator(roomId);
      }),
    );
  }

  /**
   * Scrolls the message list to the bottom
   * Ensures the latest messages are visible
   */
  private scrollToBottom(): void {
    if (this.messageList) {
      const element = this.messageList.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
    this.shouldScrollToBottom = false;
  }

  // File upload functionality
  readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  readonly ALLOWED_TYPES = [
    'image/*',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ];

  /**
   * Handles file upload for chat attachments
   * @param event Upload event from PrimeNG FileUpload
   */
  onFileUpload(event: any): void {
    if (!this.selectedRoomId) {
      this.notificationService.showError('Please select a chat room first');
      return;
    }

    const files = event.files;
    if (!files || files.length === 0) return;

    // Check file size
    const oversizedFiles = files.filter((file: File) => file.size > this.MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      this.notificationService.showError(
        `Some files exceed the 10MB size limit: ${oversizedFiles.map((f) => f.name).join(', ')}`,
      );
      return;
    }

    // Upload files
    this.loading = true;
    const formData = new FormData();
    files.forEach((file: File) => {
      formData.append('files', file);
      formData.append(
        'fileMetadata',
        JSON.stringify({
          originalName: file.name,
          originalType: file.type,
        }),
      );
    });

    this.chatService
      .uploadFiles(this.selectedRoomId, formData)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response) => {
          // Send file message(s)
          response.files.forEach((file) => {
            const message: ChatMessageRequest = {
              roomId: this.selectedRoomId!,
              content: '',
              senderId: this.currentUserId,
              type: this.getFileType(file.type),
              fileUrl: file.url,
              fileName: file.name,
            };
            this.sendChatMessage(message);
          });
          this.notificationService.showSuccess('Files uploaded successfully');
        },
        error: (error) => {
          console.error('Error uploading files:', error);
          this.notificationService.showError('Failed to upload files. Please try again.');
        },
      });
  }

  /**
   * Sends a chat message
   */
  sendChatMessage(message: ChatMessageRequest): void {
    if (!message.content?.trim() && !message.fileUrl) return;

    this.loading = true;
    this.chatService
      .sendMessage(message)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response) => {
          this.currentMessages = [...this.currentMessages, response];
          this.scrollToBottom();

          if (message.type === 'text') {
            this.messageText = ''; // Clear text input after sending
          }
        },
        error: (error) => {
          console.error('Error sending message:', error);
          this.notificationService.showError('Failed to send message. Please try again.');
        },
      });
  }

  /**
   * Determines file type for chat message
   */
  private getFileType(mimeType: string): 'image' | 'file' {
    return mimeType.startsWith('image/') ? 'image' : 'file';
  }
}
