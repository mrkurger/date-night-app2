import { ViewChild } from '@angular/core';
import { Input } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (chat.component)
//
// COMMON CUSTOMIZATIONS:
// - MESSAGE_BUBBLE_COLORS: Colors for message bubbles (default: see below)
// - TYPING_INDICATOR_DELAY: Delay before showing typing indicator (default: 500ms)
// - MAX_ATTACHMENT_SIZE: Maximum size for attachments in bytes (default: 10MB)
// - EMOJI_CATEGORIES: Categories of emojis available in the picker (default: see below)
// ===================================================
import { 
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  TemplateRef,
  AfterViewChecked,
import { ChatService } from '../../core/services/chat.service';
import { NbSortComponent, NbSortHeaderComponent, NbSortEvent } from '../../shared/components/custom-nebular-components';

import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NbDialog, NbDialogModule, NbIconModule, NbButtonModule, NbFormFieldModule, NbInputModule, NbMenuModule, NbTooltipModule, NbTabsetModule , NbDialogService} from '@nebular/theme';
import { Subscription, BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';


// Material Imports








// Emerald Components
// TODO: Migrate to Nebular UI - import { AvatarComponent } from '../../shared/emerald/components/avatar/avatar.component';
// TODO: Migrate to Nebular UI - import { SkeletonLoaderComponent } from '../../shared/emerald/components/skeleton-loader/skeleton-loader.component';

// Interfaces
interface ChatMessage {
  _id: string;
  sender: {
    id: string;
    username: string;
  };
  recipient?: {
    id: string;
    username: string;
  };
  message: string;
  timestamp: Date;
  read: boolean;
  attachments?: Attachment[];
  replyTo?: string; // ID of the message being replied to
  expiresAt?: Date; // Optional expiration date for temporary messages
  ttl?: number; // Time to live in hours
  expiryWarningShown?: boolean; // Flag to track if expiry warning has been shown
}

interface Contact {
  id: string;
  name: string;
  imageUrl?: string;
  lastMessage: string;
  lastMessageTime: Date;
  lastSeen?: Date;
  unreadCount: number;
  online: boolean;
  typing?: boolean;
  pinned?: boolean;
  archived?: boolean;
}

interface MessageGroup {
  date: Date;
  messages: ChatMessage[];
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  timestamp: Date;
}

interface EmojiCategory {
  name: string;
  icon: string;
  emojis: string[];
}

// Constants
const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB
const TYPING_INDICATOR_DELAY = 500; // ms

@Component({
  
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NbIconModule,
    NbButtonModule,
    NbFormFieldModule,
    NbInputModule,
    NbMenuModule,
    NbTooltipModule,
    NbTabsetModule,
    NbDialogModule,
    AvatarComponent,
    SkeletonLoaderComponent,
   NbSortComponent, NbSortHeaderComponent, NbSortEvent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  // ViewChild references
  @ViewChild('messageList') messageList!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;
  @ViewChild('newMessageDialog') newMessageDialog!: TemplateRef<any>;
  @ViewChild('imagePreviewDialog') imagePreviewDialog!: TemplateRef<any>;
  @ViewChild('searchInChatDialog') searchInChatDialog!: TemplateRef<any>;
  @ViewChild('mediaGalleryDialog') mediaGalleryDialog!: TemplateRef<any>;
  @ViewChild('fileInput') fileInput!: ElementRef;

  // Chat data
  messages: ChatMessage[] = [];
  messageGroups: MessageGroup[] = [];
  contacts: Contact[] = [];
  filteredContacts: Contact[] = [];
  newMessage = '';
  currentUserId = '';
  selectedContactId: string | null = null;
  searchTerm = '';

  // UI state
  loadingContacts = true;
  isContactTyping = false;
  showEmojiPicker = false;
  notificationsEnabled = true;
  currentFilter: 'all' | 'unread' | 'archived' = 'all';

  // Reply functionality
  replyingTo: ChatMessage | null = null;

  // Temporary message functionality
  temporaryMessageMode = false;
  temporaryMessageTTL = 24 * 60 * 60 * 1000; // Default: 24 hours in milliseconds
  expiryCheckInterval: any; // For the timer that checks expired messages

  // Message auto-deletion settings
  messageAutoDeletionEnabled = true;
  messageExpiryTime = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  // New message dialog
  newMessageSearch = '';
  filteredNewMessageContacts: Contact[] = [];

  // Image preview
  previewImage: Attachment | null = null;

  // Search in chat
  chatSearchQuery = '';
  chatSearchResults: ChatMessage[] = [];

  // Media gallery
  galleryTab: 'images' | 'files' | 'links' = 'images';
  galleryImages: Attachment[] = [];
  galleryFiles: Attachment[] = [];
  galleryLinks: { url: string; title?: string; timestamp: Date }[] = [];

  // Emoji picker
  emojiCategories: EmojiCategory[] = [
    {
      name: 'Smileys & Emotion',
      icon: 'sentiment_satisfied_alt',
      emojis: [
        '😀',
        '😃',
        '😄',
        '😁',
        '😆',
        '😅',
        '😂',
        '🤣',
        '😊',
        '😇',
        '🙂',
        '🙃',
        '😉',
        '😌',
        '😍',
        '🥰',
        '😘',
      ],
    },
    {
      name: 'People & Body',
      icon: 'person',
      emojis: [
        '👍',
        '👎',
        '👌',
        '✌️',
        '🤞',
        '🤟',
        '🤘',
        '🤙',
        '👈',
        '👉',
        '👆',
        '👇',
        '👋',
        '🤚',
        '🖐️',
        '✋',
        '🖖',
      ],
    },
    {
      name: 'Objects',
      icon: 'emoji_objects',
      emojis: [
        '❤️',
        '🧡',
        '💛',
        '💚',
        '💙',
        '💜',
        '🖤',
        '💔',
        '❣️',
        '💕',
        '💞',
        '💓',
        '💗',
        '💖',
        '💘',
        '💝',
        '💟',
      ],
    },
  ];
  currentCategoryEmojis: string[] = this.emojiCategories[0].emojis;

  // Subscriptions
  private subscriptions: Subscription[] = [];
  private typingSubject = new Subject<string>();
  private shouldScrollToBottom = true;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: NbDialogService,
  ) {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser ? currentUser._id : '';

    // Set up typing indicator with debounce
    const typingSub = this.typingSubject
      .pipe(debounceTime(TYPING_INDICATOR_DELAY), distinctUntilChanged())
      .subscribe((message) => {
        if (this.selectedContactId) {
          this.chatService.sendTypingIndicator(this.selectedContactId);
        }
      });

    this.subscriptions.push(typingSub);
  }

  ngOnInit(): void {
    // Load contacts first
    this.loadContacts();

    // Check if we have a recipient ID in the route
    const routeSub = this.route.params.subscribe((params) => {
      if (params['userId']) {
        this.selectedContactId = params['userId'];
        this.loadMessages();
        this.loadMessageAutoDeletionSettings();
      }
    });

    this.subscriptions.push(routeSub);
    this.setupSocketListeners();

    // Set up a timer to check for expired messages every minute
    this.expiryCheckInterval = setInterval(() => {
      this.checkExpiredMessages();
    }, 60000); // 60000 ms = 1 minute
  }

  /**
   * Load message auto-deletion settings for the current chat room
   */
  loadMessageAutoDeletionSettings(): void {
    if (!this.selectedContactId) return;

    const settings = this.chatService.getMessageAutoDeletionSettings(this.selectedContactId);
    this.messageAutoDeletionEnabled = settings.enabled;
    this.messageExpiryTime = settings.ttl;

    console.log(
      `Loaded message auto-deletion settings for room ${this.selectedContactId}: enabled=${settings.enabled}, ttl=${this.formatTTL(settings.ttl)}`,
    );
  }

  ngAfterViewChecked(): void {
    // Scroll to bottom if needed
    if (this.shouldScrollToBottom && this.messageList) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());

    // Clear the expiry check interval
    if (this.expiryCheckInterval) {
      clearInterval(this.expiryCheckInterval);
    }
  }

  /**
   * Check for and handle expired messages
   */
  private checkExpiredMessages(): void {
    const now = new Date().getTime();
    const expiredMessageIds: string[] = [];
    const aboutToExpireIds: string[] = [];
    const warningThreshold = 5 * 60 * 1000; // 5 minutes

    this.messages.forEach((message) => {
      if (message.expiresAt) {
        const expiryTime = message.expiresAt.getTime();

        if (expiryTime <= now) {
          expiredMessageIds.push(message._id);
        } else if (expiryTime - now <= warningThreshold && !message.expiryWarningShown) {
          aboutToExpireIds.push(message._id);
          message.expiryWarningShown = true;
        }
      }
    });

    // Show warnings for messages about to expire
    if (aboutToExpireIds.length > 0) {
      const warningMsg =
        aboutToExpireIds.length === 1
          ? 'A message will expire soon'
          : `${aboutToExpireIds.length} messages will expire soon`;
      this.notificationService.info(warningMsg);
    }

    // Remove expired messages
    if (expiredMessageIds.length > 0) {
      this.messages = this.messages.filter((msg) => !expiredMessageIds.includes(msg._id));
      this.groupMessagesByDate();

      const expiryMsg =
        expiredMessageIds.length === 1
          ? 'A temporary message has expired and been removed'
          : `${expiredMessageIds.length} temporary messages have expired and been removed`;
      this.notificationService.info(expiryMsg);
    }
  }

  /**
   * Format a TTL value for display
   */
  private formatTTL(ttl: number): string {
    const hours = ttl / (60 * 60 * 1000);
    if (hours === 1) return '1 hour';
    if (hours < 24) return `${hours} hours`;
    const days = hours / 24;
    return days === 1 ? '1 day' : `${days} days`;
  }

  /**
   * Load contacts from the server
   */
  loadContacts(): void {
    this.loadingContacts = true;

    // In a real app, you would load contacts from the service
    this.chatService.getContacts().subscribe({
      next: (contacts) => {
        this.contacts = this.enhanceContacts(contacts);
        this.filterContacts();

        // If we have contacts but no selected contact, select the first one
        if (this.contacts.length > 0 && !this.selectedContactId) {
          this.selectContact(this.contacts[0].id);
        }

        this.loadingContacts = false;
      },
      error: (err) => {
        console.error('Error loading contacts:', err);
        // Use mock data if API call fails
        this.contacts = this.enhanceContacts(this.chatService.getMockContacts());
        this.filterContacts();

        if (this.contacts.length > 0 && !this.selectedContactId) {
          this.selectContact(this.contacts[0].id);
        }

        this.loadingContacts = false;
      }
    });
  }

  /**
   * Enhance contacts with additional properties for UI
   */
  enhanceContacts(contacts: any[]): Contact[] {
    return contacts.map((contact) => ({
      ...contact,
      imageUrl: contact.imageUrl || this.getRandomProfileImage(),
      lastSeen: contact.lastSeen || new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24),
      pinned: contact.pinned || false,
      archived: contact.archived || false,
      typing: false
    }));
  }

  /**
   * Load messages for the selected contact
   */
  loadMessages(): void {
    if (this.selectedContactId) {
      this.chatService.getMessages(this.selectedContactId).subscribe({
        next: (messages) => {
          // Transform the messages from the service format to the component format
          this.messages = this.transformMessages(messages);

          // Group messages by date
          this.groupMessagesByDate();

          // Mark messages as read
          this.markContactMessagesAsRead();

          // Scroll to bottom of message list
          this.shouldScrollToBottom = true;

          // Extract media for gallery
          this.extractMediaFromMessages();
        },
        error: (err) => {
          console.error('Error loading messages:', err);

          // If no messages, create dummy messages for demo
          if (this.selectedContactId && this.messages.length === 0) {
            const contact = this.getSelectedContact();
            if (contact) {
              this.createDummyMessages(contact);
              this.groupMessagesByDate();
              this.extractMediaFromMessages();
            }
          }
        }
      });
    }
  }

  /**
   * Transform messages from API format to component format
   */
  transformMessages(messages: any[]): ChatMessage[] {
    return messages.map((msg) => {
      // Create a properly typed sender object
      let senderObj: { id: string; username: string };
      if (typeof msg.sender === 'string') {
        senderObj = {
          id: msg.sender,
          username: this.getContactById(msg.sender)?.name || 'User',
        };
      } else {
        // Handle the case where sender is an object
        const senderAsObj = msg.sender;
        senderObj = {
          id: senderAsObj.id || 'unknown',
          username:
            senderAsObj.username || this.getContactById(senderAsObj.id)?.name || 'Unknown User',
        };
      }

      // Create a properly typed recipient object if it exists
      let recipientObj: { id: string; username: string } | undefined;
      if (msg.recipient) {
        if (typeof msg.recipient === 'string') {
          recipientObj = {
            id: msg.recipient,
            username: this.getContactById(msg.recipient)?.name || 'Recipient',
          };
        } else {
          // Handle the case where recipient is an object
          const recipientAsObj = msg.recipient;
          recipientObj = {
            id: recipientAsObj.id || 'unknown',
            username:
              recipientAsObj.username ||
              this.getContactById(recipientAsObj.id)?.name ||
              'Unknown Recipient',
          };
        }
      }

      // Create attachments if they exist
      const attachments = msg.attachments ? this.transformAttachments(msg.attachments) : undefined;

      return {
        _id: msg._id,
        sender: senderObj,
        recipient: recipientObj,
        message: msg.message || msg.content,
        timestamp: new Date(msg.timestamp),
        read: msg.read,
        attachments,
        replyTo: msg.replyTo,
        expiresAt: msg.expiresAt ? new Date(msg.expiresAt) : undefined,
      };
    });
  }

  /**
   * Transform attachments from API format to component format
   */
  transformAttachments(attachments: any[]): Attachment[] {
    return attachments.map((att) => ({
      id: att.id || att._id || Date.now().toString(),
      name: att.name || att.filename || 'Attachment',
      type: att.type || att.mimeType || 'application/octet-stream',
      size: att.size || 0,
      url: att.url || att.path || '',
      timestamp: new Date(att.timestamp || att.createdAt || Date.now())
    }));
  }

  /**
   * Group messages by date for display
   */
  groupMessagesByDate(): void {
    const groups: { [key: string]: MessageGroup } = {};

    this.messages.forEach((message) => {
      const date = new Date(message.timestamp);
      const dateKey = date.toDateString();

      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: date,
          messages: [],
        };
      }

      groups[dateKey].messages.push(message);
    });

    this.messageGroups = Object.values(groups).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Extract media from messages for gallery view
   */
  extractMediaFromMessages(): void {
    this.galleryImages = [];
    this.galleryFiles = [];
    this.galleryLinks = [];

    this.messages.forEach((message) => {
      // Extract attachments
      if (message.attachments && message.attachments.length > 0) {
        message.attachments.forEach((attachment) => {
          if (this.isImageAttachment(attachment)) {
            this.galleryImages.push(attachment);
          } else {
            this.galleryFiles.push(attachment);
          }
        });
      }

      // Extract links from message text
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const matches = message.message.match(urlRegex);

      if (matches) {
        matches.forEach((url) => {
          this.galleryLinks.push({
            url,
            timestamp: message.timestamp
          });
        });
      }
    });
  }

  /**
   * Send a message to the selected contact
   */
  sendMessage(): void {
    if (this.canSendMessage()) {
      const replyToId = this.replyingTo?._id;

      // Determine if this should be a temporary message with custom TTL
      let ttl: number | undefined;
      if (this.temporaryMessageMode) {
        ttl = this.temporaryMessageTTL;
        this.temporaryMessageMode = false;
      } else if (this.messageAutoDeletionEnabled) {
        ttl = this.messageExpiryTime;
      }

      this.chatService
        .sendMessage(this.selectedContactId, this.newMessage, replyToId, ttl)
        .subscribe({
          next: (response) => {
            // Add the message to our list immediately for better UX
            const newMessage: ChatMessage = {
              _id: response._id || Date.now().toString(),
              sender: {
                id: this.currentUserId,
                username: 'You',
              },
              message: this.newMessage,
              timestamp: new Date(),
              read: false,
              replyTo: replyToId,
              expiresAt: response.expiresAt
                ? new Date(response.expiresAt)
                : ttl
                  ? new Date(Date.now() + ttl)
                  : undefined,
            };

            this.messages = [...this.messages, newMessage];
            this.groupMessagesByDate();
            this.newMessage = '';
            this.replyingTo = null;

            // Update the last message in contacts
            this.updateContactLastMessage(this.selectedContactId, newMessage.message);

            // Scroll to bottom
            this.shouldScrollToBottom = true;
          },
          error: (err) => {
            console.error('Error sending message:', err);
            this.notificationService.error('Failed to send message. Please try again.');
          }
        });
    }
  }

  /**
   * Toggle temporary message mode
   * When enabled, the next message sent will auto-delete after the specified TTL
   */
  toggleTemporaryMessageMode(): void {
    this.temporaryMessageMode = !this.temporaryMessageMode;

    if (this.temporaryMessageMode) {
      this.notificationService.info(
        `Temporary message mode enabled. Next message will auto-delete after ${this.formatTTL(this.temporaryMessageTTL)}.`,
      );
    } else {
      this.notificationService.info('Temporary message mode disabled.');
    }

    // Focus on the message input after toggling
    setTimeout(() => {
      if (this.messageInput) {
        this.messageInput.nativeElement.focus();
      }
    }, 0);
  }

  /**
   * Set the TTL for temporary messages
   * @param hours Number of hours before the message auto-deletes
   */
  setTemporaryMessageTTL(hours: number): void {
    this.temporaryMessageTTL = hours * 60 * 60 * 1000;

    if (this.temporaryMessageMode) {
      this.notificationService.info(
        `Temporary messages will auto-delete after ${this.formatTTL(this.temporaryMessageTTL)}.`,
      );
    }
  }

  /**
   * Check if a message can be sent
   */
  canSendMessage(): boolean {
    return !!this.newMessage.trim() && !!this.selectedContactId;
  }

  /**
   * Handle Enter key in message input
   */
  handleEnterKey(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  /**
   * Notify that user is typing
   */
  onTyping(): void {
    this.typingSubject.next(this.newMessage);

    // Auto-resize textarea
    if (this.messageInput) {
      const textarea = this.messageInput.nativeElement;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }

  /**
   * Set up WebSocket listeners for real-time chat
   */
  setupSocketListeners(): void {
    this.chatService.connectSocket();

    // Create a subject that we can subscribe to and unsubscribe from
    const messageSubject = new BehaviorSubject<any>(null);
    const typingSubject = new BehaviorSubject<any>(null);

    // Set up the socket listener for new messages
    this.chatService.onNewMessage((message) => {
      messageSubject.next(message);
    });

    // Set up the socket listener for typing indicators
    this.chatService.onTypingIndicator((data) => {
      typingSubject.next(data);
    });

    // Subscribe to message subject
    const messageSub = messageSubject.subscribe((message) => {
      if (!message) return; // Skip the initial null value

      // Update messages array if the message is for the current chat
      if (
        this.selectedContactId &&
        (message.sender.id === this.selectedContactId ||
          (message.recipient && message.recipient.id === this.selectedContactId))
      ) {
        // Transform the message to match our format
        const formattedMessage = this.transformMessages([message])[0];
        this.messages = [...this.messages, formattedMessage];
        this.groupMessagesByDate();
        this.extractMediaFromMessages();

        // Mark as read if it's from the selected contact
        if (message.sender.id === this.selectedContactId) {
          this.markAsRead(message._id);
        }

        // Scroll to bottom
        this.shouldScrollToBottom = true;
      }

      // Update the unread count for the contact
      if (message.sender && message.sender.id) {
        this.incrementUnreadCount(message.sender.id);
      }
    });

    // Subscribe to typing indicator subject
    const typingSub = typingSubject.subscribe((data) => {
      if (!data) return; // Skip the initial null value

      // Update typing indicator for the contact
      if (data.userId && data.userId !== this.currentUserId) {
        this.updateContactTypingStatus(data.userId, true);

        // Auto-reset typing status after 3 seconds
        setTimeout(() => {
          this.updateContactTypingStatus(data.userId, false);
        }, 3000);
      }
    });

    this.subscriptions.push(messageSub, typingSub);
  }

  /**
   * Update typing status for a contact
   */
  updateContactTypingStatus(contactId: string, isTyping: boolean): void {
    this.contacts = this.contacts.map((contact) => {
      if (contact.id === contactId) {
        return {
          ...contact,
          typing: isTyping,
        };
      }
      return contact;
    });

    this.filterContacts();

    // Update UI typing indicator if this is the selected contact
    if (contactId === this.selectedContactId) {
      this.isContactTyping = isTyping;
    }
  }

  /**
   * Select a contact to chat with
   */
  selectContact(contactId: string): void {
    this.selectedContactId = contactId;

    // Update URL without reloading
    this.router.navigate(['/chat', contactId], { replaceUrl: true });

    // Load messages for this contact
    this.loadMessages();

    // Load message auto-deletion settings for this contact
    this.loadMessageAutoDeletionSettings();

    // Reset unread count for this contact
    this.resetUnreadCount(contactId);

    // Reset UI state
    this.replyingTo = null;
    this.showEmojiPicker = false;
    this.temporaryMessageMode = false;
  }

  /**
   * Deselect the current contact (mobile view)
   */
  deselectContact(): void {
    this.selectedContactId = null;
    this.router.navigate(['/chat'], { replaceUrl: true });
  }

  /**
   * Get a contact by ID
   */
  getContactById(contactId: string): Contact | undefined {
    return this.contacts.find((contact) => contact.id === contactId);
  }

  /**
   * Get the currently selected contact
   */
  getSelectedContact(): Contact | undefined {
    return this.getContactById(this.selectedContactId);
  }

  /**
   * Check if the selected contact is pinned
   */
  isPinned(): boolean {
    const contact = this.getSelectedContact();
    return contact?.pinned || false;
  }

  /**
   * Toggle pin status for the selected contact
   */
  togglePin(): void {
    if (this.selectedContactId) {
      this.contacts = this.contacts.map((contact) => {
        if (contact.id === this.selectedContactId) {
          return {
            ...contact,
            pinned: !contact.pinned,
          };
        }
        return contact;
      });

      this.filterContacts();

      // In a real app, you would save this to the server
      this.notificationService.success(
        this.isPinned() ? 'Conversation pinned to the top' : 'Conversation unpinned',
      );
    }
  }

  /**
   * Block a contact
   */
  blockContact(): void {
    if (this.selectedContactId) {
      // In a real app, you would call an API to block the contact
      this.notificationService.success('Contact blocked');

      // Remove from contacts list
      this.contacts = this.contacts.filter((contact) => contact.id !== this.selectedContactId);

      this.filterContacts();
      this.deselectContact();
    }
  }

  /**
   * Clear conversation history
   */
  clearConversation(): void {
    if (this.selectedContactId) {
      // In a real app, you would call an API to clear the conversation
      this.messages = [];
      this.messageGroups = [];
      this.galleryImages = [];
      this.galleryFiles = [];
      this.galleryLinks = [];

      this.notificationService.success('Conversation cleared');
    }
  }

  /**
   * Mark a message as read
   */
  markAsRead(messageId: string): void {
    this.chatService.markAsRead(messageId).subscribe({
      next: () => {
        // Update the message in our local array
        this.messages = this.messages.map((msg) =>
          msg._id === messageId ? { ...msg, read: true } : msg,
        );

        // Update message groups
        this.groupMessagesByDate();
      },
      error: (err) => console.error('Error marking message as read:', err)
    });
  }

  /**
   * Mark all messages from the selected contact as read
   */
  markContactMessagesAsRead(): void {
    if (this.selectedContactId) {
      const unreadMessages = this.messages.filter(
        (msg) => msg.sender.id === this.selectedContactId && !msg.read,
      );

      unreadMessages.forEach((msg) => {
        this.markAsRead(msg._id);
      });

      this.resetUnreadCount(this.selectedContactId);
    }
  }

  /**
   * Mark all messages as read
   */
  markAllAsRead(): void {
    this.contacts.forEach((contact) => {
      this.resetUnreadCount(contact.id);
    });

    this.notificationService.success('All messages marked as read');
  }

  /**
   * Archive all chats
   */
  archiveAllChats(): void {
    this.contacts = this.contacts.map((contact) => ({
      ...contact,
      archived: true
    }));

    this.filterContacts();
    this.notificationService.success('All conversations archived');
  }

  /**
   * Update the last message for a contact
   */
  updateContactLastMessage(contactId: string, message: string): void {
    this.contacts = this.contacts.map((contact) => {
      if (contact.id === contactId) {
        return {
          ...contact,
          lastMessage: message,
          lastMessageTime: new Date(),
        };
      }
      return contact;
    });

    this.filterContacts();
  }

  /**
   * Increment the unread count for a contact
   */
  incrementUnreadCount(contactId: string): void {
    if (contactId !== this.selectedContactId) {
      this.contacts = this.contacts.map((contact) => {
        if (contact.id === contactId) {
          return {
            ...contact,
            unreadCount: contact.unreadCount + 1,
          };
        }
        return contact;
      });

      this.filterContacts();
    }
  }

  /**
   * Reset the unread count for a contact
   */
  resetUnreadCount(contactId: string): void {
    this.contacts = this.contacts.map((contact) => {
      if (contact.id === contactId) {
        return {
          ...contact,
          unreadCount: 0,
        };
      }
      return contact;
    });

    this.filterContacts();
  }

  /**
   * Filter contacts based on search term and current filter
   */
  filterContacts(): void {
    let filtered = [...this.contacts];

    // Apply search filter
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (contact) =>
          contact.name.toLowerCase().includes(search) ||
          contact.lastMessage.toLowerCase().includes(search),
      );
    }

    // Apply current filter
    if (this.currentFilter === 'unread') {
      filtered = filtered.filter((contact) => contact.unreadCount > 0);
    } else if (this.currentFilter === 'archived') {
      filtered = filtered.filter((contact) => contact.archived);
    } else if (this.currentFilter === 'all') {
      filtered = filtered.filter((contact) => !contact.archived);
    }

    // NbSortEvent: pinned first, then by last message time
    filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
    });

    this.filteredContacts = filtered;
  }

  /**
   * Filter conversations by type
   */
  filterConversations(filter: 'all' | 'unread' | 'archived'): void {
    this.currentFilter = filter;
    this.filterContacts();
  }

  /**
   * Toggle notifications for the chat
   */
  toggleNotifications(): void {
    this.notificationsEnabled = !this.notificationsEnabled;
    this.notificationService.info(
      this.notificationsEnabled ? 'Notifications enabled' : 'Notifications muted',
    );
  }

  /**
   * Format message content with links and emojis
   */
  formatMessageContent(content: string): string {
    // Convert URLs to links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    let formattedContent = content.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');

    // Escape HTML except for the links we just added
    formattedContent = formattedContent
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(
        /&lt;a href="(.*?)" target="_blank"&gt;(.*?)&lt;\/a&gt;/g,
        '<a href="$1" target="_blank">$2</a>',
      );

    return formattedContent;
  }

  /**
   * Check if an attachment is an image
   */
  isImageAttachment(attachment: Attachment): boolean {
    return attachment.type.startsWith('image/');
  }

  /**
   * Get the appropriate icon for a file type
   */
  getFileIcon(file: Attachment): string {
    const type = file.type.toLowerCase();

    if (type.includes('pdf')) return 'picture_as_pdf';
    if (type.includes('word') || type.includes('document')) return 'description';
    if (type.includes('excel') || type.includes('sheet')) return 'table_chart';
    if (type.includes('powerpoint') || type.includes('presentation')) return 'slideshow';
    if (type.includes('zip') || type.includes('rar') || type.includes('tar')) return 'archive';
    if (type.includes('audio')) return 'audio_file';
    if (type.includes('video')) return 'video_file';

    return 'insert_drive_file';
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Reply to a message
   */
  replyToMessage(message: ChatMessage): void {
    this.replyingTo = message;

    // Focus on the message input
    setTimeout(() => {
      if (this.messageInput) {
        this.messageInput.nativeElement.focus();
      }
    }, 0);
  }

  /**
   * Cancel replying to a message
   */
  cancelReply(): void {
    this.replyingTo = null;
  }

  /**
   * Forward a message to another contact
   */
  forwardMessage(message: ChatMessage): void {
    // Open new message dialog
    const dialogRef = this.dialog.open(this.newMessageDialog);

    // Store the message to forward
    const messageToForward = message;

    // When a contact is selected, forward the message
    dialogRef.onClose.subscribe((result) => {
      if (result) {
        // In a real app, you would call an API to forward the message
        this.notificationService.success('Message forwarded');
      }
    });
  }

  /**
   * Copy a message to clipboard
   */
  copyMessage(message: ChatMessage): void {
    navigator.clipboard
      .writeText(message.message)
      .then(() => {
        this.notificationService.success('Message copied to clipboard');
      })
      .catch((err) => {
        console.error('Error copying message:', err);
        this.notificationService.error('Failed to copy message');
      });
  }

  /**
   * Delete a message
   */
  deleteMessage(message: ChatMessage): void {
    // In a real app, you would call an API to delete the message
    this.messages = this.messages.filter((msg) => msg._id !== message._id);
    this.groupMessagesByDate();
    this.extractMediaFromMessages();

    this.notificationService.success('Message deleted');
  }

  /**
   * Truncate a message for display in the reply preview
   */
  truncateMessage(message: string, maxLength = 50): string {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  }

  /**
   * Scroll to the bottom of the message list
   */
  scrollToBottom(): void {
    if (this.messageList) {
      const element = this.messageList.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  /**
   * Toggle the emoji picker
   */
  toggleEmojiPicker(): void {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  /**
   * Select an emoji category
   */
  selectEmojiCategory(category: EmojiCategory): void {
    this.currentCategoryEmojis = category.emojis;
  }

  /**
   * Add an emoji to the message input
   */
  addEmoji(emoji: string): void {
    this.newMessage += emoji;

    // Focus back on the input
    if (this.messageInput) {
      this.messageInput.nativeElement.focus();
    }
  }

  /**
   * Open the attachment menu
   */
  openAttachmentMenu(): void {
    // In a real app, you would open a file picker or menu
    // For now, we'll just show a notification
    this.notificationService.info('Attachment feature coming soon');

    // When implementing file uploads, make sure to handle temporary messages:
    // 1. Check if temporaryMessageMode is enabled
    // 2. If enabled, use the temporaryMessageTTL value for the attachment TTL
    // 3. Use chatService.convertHoursToMilliseconds(this.temporaryMessageTTL) to convert to milliseconds
    // 4. Pass the TTL to the chatService.sendMessageWithAttachments method
  }

  /**
   * Open the new message dialog
   */
  openNewMessageDialog(): void {
    this.newMessageSearch = '';
    this.filteredNewMessageContacts = [...this.contacts];

    const dialogRef = this.dialog.open(this.newMessageDialog);

    dialogRef.onClose.subscribe((result) => {
      if (result) {
        // Handle result if needed
      }
    });
  }

  /**
   * Select a contact from the new message dialog
   */
  selectNewMessageContact(contact: Contact): void {
    this.dialog.closeAll();
    this.selectContact(contact.id);
  }

  /**
   * Open image preview dialog
   */
  openImagePreview(image: Attachment): void {
    this.previewImage = image;

    this.dialog.open(this.imagePreviewDialog, {
      maxWidth: '90vw',
      maxHeight: '90vh',
      panelClass: 'image-preview-dialog'
    });
  }

  /**
   * Download an image from the preview
   */
  downloadImage(): void {
    if (this.previewImage) {
      this.downloadAttachment(this.previewImage);
    }
  }

  /**
   * Share an image from the preview
   */
  shareImage(): void {
    if (this.previewImage && navigator.share) {
      navigator
        .share({
          title: this.previewImage.name,
          url: this.previewImage.url
        })
        .catch((err) => {
          console.error('Error sharing image:', err);
        });
    } else {
      this.notificationService.info('Sharing not supported on this device');
    }
  }

  /**
   * Download an attachment
   */
  downloadAttachment(attachment: Attachment): void {
    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Open the search in chat dialog
   */
  openSearchInChat(): void {
    this.chatSearchQuery = '';
    this.chatSearchResults = [];

    this.dialog.open(this.searchInChatDialog);
  }

  /**
   * Highlight search text in results
   */
  highlightSearchText(text: string): string {
    if (!this.chatSearchQuery) return text;

    const regex = new RegExp(`(${this.chatSearchQuery})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  /**
   * Scroll to a specific message
   */
  scrollToMessage(message: ChatMessage): void {
    this.dialog.closeAll();

    // Find the message element and scroll to it
    setTimeout(() => {
      const messageId = message._id;
      const messageElement = document.getElementById(`message-${messageId}`);

      if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        messageElement.classList.add('highlight');

        // Remove highlight after animation
        setTimeout(() => {
          messageElement.classList.remove('highlight');
        }, 2000);
      }
    }, 100);
  }

  /**
   * Open the media gallery dialog
   */
  openMediaGallery(): void {
    this.galleryTab = 'images';

    this.dialog.open(this.mediaGalleryDialog, {
      width: '80vw',
      maxWidth: '800px',
      maxHeight: '80vh'
    });
  }

  /**
   * Open a link in a new tab
   */
  openLink(url: string): void {
    window.open(url, '_blank');
  }

  /**
   * View the selected contact's profile
   */
  viewContactProfile(): void {
    if (this.selectedContactId) {
      // In a real app, you would navigate to the contact's profile
      this.notificationService.info('Profile view coming soon');
    }
  }

  /**
   * Get a random profile image for demo purposes
   */
  private getRandomProfileImage(): string {
    const images = [
      '/assets/img/profile1.jpg',
      '/assets/img/profile2.jpg',
      '/assets/img/profile3.jpg',
      '/assets/img/profile4.jpg',
      '/assets/img/default-profile.jpg',
    ];

    return images[Math.floor(Math.random() * images.length)];
  }

  /**
   * Create dummy messages for demo purposes
   */
  private createDummyMessages(contact: Contact): void {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    // Create messages from different days for testing date separators
    this.messages = [
      // Yesterday
      {
        _id: '1',
        sender: {
          id: contact.id,
          username: contact.name,
        },
        message: 'Hey there! How are you?',
        timestamp: new Date(yesterday.setHours(10, 30)),
        read: true,
      },
      {
        _id: '2',
        sender: {
          id: this.currentUserId,
          username: 'You',
        },
        message: "I'm doing great! How about you?",
        timestamp: new Date(yesterday.setHours(10, 35)),
        read: true,
      },
      {
        _id: '3',
        sender: {
          id: contact.id,
          username: contact.name,
        },
        message: 'Pretty good, thanks for asking! What are you up to this weekend?',
        timestamp: new Date(yesterday.setHours(10, 40)),
        read: true,
      },

      // Today
      {
        _id: '4',
        sender: {
          id: this.currentUserId,
          username: 'You',
        },
        message: "I'm planning to go hiking, weather permitting. Want to join?",
        timestamp: new Date(now.setHours(9, 15)),
        read: true,
      },
      {
        _id: '5',
        sender: {
          id: contact.id,
          username: contact.name,
        },
        message: 'That sounds fun! Where are you thinking of going?',
        timestamp: new Date(now.setHours(9, 20)),
        read: true,
      },
      {
        _id: '6',
        sender: {
          id: this.currentUserId,
          username: 'You',
        },
        message:
          "I was thinking of trying the new trail at Mount Rainier. It's supposed to have amazing views!",
        timestamp: new Date(now.setHours(9, 25)),
        read: true,
      },
      {
        _id: '7',
        sender: {
          id: contact.id,
          username: contact.name,
        },
        message: 'Check out this photo from my last hike there:',
        timestamp: new Date(now.setHours(9, 30)),
        read: true,
        attachments: [
          {
            id: 'img1',
            name: 'mountain.jpg',
            type: 'image/jpeg',
            size: 1024 * 1024 * 2.5, // 2.5MB
            url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
            timestamp: new Date(now.setHours(9, 30)),
          },
        ],
      },
      {
        _id: '8',
        sender: {
          id: this.currentUserId,
          username: 'You',
        },
        message: 'Wow, that looks amazing! 😍',
        timestamp: new Date(now.setHours(9, 32)),
        read: true,
      },
      {
        _id: '9',
        sender: {
          id: contact.id,
          username: contact.name,
        },
        message:
          "Here's the trail map I used: https://www.alltrails.com/trail/us/washington/mount-rainier",
        timestamp: new Date(now.setHours(9, 35)),
        read: true,
      },
      {
        _id: '10',
        sender: {
          id: contact.id,
          username: contact.name,
        },
        message: 'And I also have the PDF guide if you want it:',
        timestamp: new Date(now.setHours(9, 36)),
        read: true,
        attachments: [
          {
            id: 'file1',
            name: 'Rainier_Trail_Guide.pdf',
            type: 'application/pdf',
            size: 1024 * 1024 * 1.2, // 1.2MB
            url: '#',
            timestamp: new Date(now.setHours(9, 36)),
          }
        ],
      },
      {
        _id: '11',
        sender: {
          id: this.currentUserId,
          username: 'You',
        },
        message:
          "Thanks! This is super helpful. I'll check it out and let you know if I have any questions.",
        timestamp: new Date(now.setHours(9, 40)),
        read: true,
      },
      {
        _id: '12',
        sender: {
          id: contact.id,
          username: contact.name,
        },
        message: contact.lastMessage,
        timestamp: contact.lastMessageTime,
        read: contact.unreadCount === 0,
      }
    ];
  }
}
