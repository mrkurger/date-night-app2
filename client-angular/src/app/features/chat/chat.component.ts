import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  TemplateRef,
  AfterViewChecked,
  Input,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { NebularModule } from '../../../app/shared/nebular.module';
import {
  NbCardModule,
  NbButtonModule,
  NbInputModule,
  NbFormFieldModule,
  NbIconModule,
  NbTooltipModule,
  NbBadgeModule,
  NbTagModule,
  NbContextMenuModule,
  NbMenuModule,
} from '@nebular/theme';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Custom Components
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { AppSortComponent } from '../../shared/components/custom-nebular-components/nb-sort/nb-sort.component';
import { AppSortHeaderComponent } from '../../shared/components/custom-nebular-components/nb-sort/nb-sort.component';
import type { AppSortEvent } from '../../shared/components/custom-nebular-components/nb-sort/nb-sort.module';

// Services
import {
  ChatService,
  ChatMessage,
  ChatRoom,
  ChatParticipant,
} from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

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
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [NebularModule, CommonModule,
    FormsModule,
    NbCardModule,
    NbButtonModule,
    NbInputModule,
    NbFormFieldModule,
    NbIconModule,
    NbTooltipModule,
    NbBadgeModule,
    NbContextMenuModule,
    NbMenuModule,
    NbTagModule,
    AvatarComponent,
    // These components are imported but not used in the template
    // Keeping them commented for future reference
    // SkeletonLoaderComponent,
    // AppSortComponent,
    // AppSortHeaderComponent,
  ],
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
  rooms: ChatRoom[] = [];
  contacts: ChatParticipant[] = [];
  filteredContacts: ChatParticipant[] = [];
  newMessage = '';
  currentUserId = '';
  selectedRoomId: string | null = null;
  searchTerm = '';

  // UI state
  loadingContacts = true;
  loading = true;
  isContactTyping = false;
  showEmojiPicker = false;
  notificationsEnabled = true;
  currentFilter: 'all' | 'unread' | 'archived' = 'all';
  searchQuery = '';
  selectedContactId: string | null = null;
  selectedContact: ChatParticipant | null = null;

  // Reply functionality
  replyingTo: ChatMessage | null = null;

  // Temporary message functionality
  temporaryMessageMode = false;
  temporaryMessageTTL = 24 * 60 * 60 * 1000; // Default: 24 hours in milliseconds

  // Message auto-deletion settings
  messageAutoDeletionEnabled = true;
  messageExpiryTime = 7 * 24 * 60 * 60 * 1000;

  // Chat menu items
  chatMenuItems = [
    { title: 'View Profile', icon: 'person-outline', data: { action: 'viewProfile' } },
    { title: 'Clear History', icon: 'trash-2-outline', data: { action: 'clearHistory' } },
    { title: 'Block User', icon: 'slash-outline', data: { action: 'blockUser' } },
    { title: 'Report', icon: 'alert-triangle-outline', data: { action: 'report' } },
  ];

  // Current messages
  currentMessages: ChatMessage[] = [];

  // Typing indicator
  isTyping = false;

  // Message input
  messageText = '';

  // Subscriptions
  private subscriptions: Subscription[] = [];
  private typingSubject = new Subject<string>();
  private shouldScrollToBottom = true;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.currentUserId = this.authService.getCurrentUserId();
  }

  ngOnInit(): void {
    this.loadRooms();
    this.setupSubscriptions();
  }

  // Send message method
  sendMessage(): void {
    if (!this.messageText.trim()) return;

    console.log('Sending message:', this.messageText);
    // Implementation would typically call a service method

    this.messageText = '';
  }

  // Handle typing events
  onTyping(): void {
    // Implementation would typically notify other users that this user is typing
    console.log('User is typing...');
  }

  // Image preview
  previewImage: { url: string; type: string } | null = null;

  // New message dialog
  newMessageSearch = '';
  filteredNewMessageContacts: ChatParticipant[] = [];

  // Search in chat
  chatSearchQuery = '';
  chatSearchResults: ChatMessage[] = [];

  // Media gallery
  galleryTab: 'images' | 'files' | 'links' = 'images';
  galleryImages: { url: string; type: string }[] = [];
  galleryFiles: { url: string; type: string }[] = [];
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

  // Download image
  downloadImage(): void {
    if (this.previewImage && this.previewImage.url) {
      window.open(this.previewImage.url, '_blank');
    }
  }

  // Share image
  shareImage(): void {
    console.log('Sharing image:', this.previewImage);
    // Implementation would typically open a share dialog
  }

  // Scroll to message
  scrollToMessage(message: any): void {
    console.log('Scrolling to message:', message);
    // Implementation would typically scroll to the message in the chat
  }

  // Select contact for new message
  selectNewMessageContact(contact: any): void {
    console.log('Selected contact for new message:', contact);
    // Implementation would typically start a new chat with the selected contact
  }

  // Open link in new tab
  openLink(url: string): void {
    window.open(url, '_blank');
  }

  // Show message date if it's the first message of the day or after a time gap
  showMessageDate(message: ChatMessage): boolean {
    const index = this.currentMessages.indexOf(message);
    if (index === 0) return true;

    const prevMessage = this.currentMessages[index - 1];
    const prevDate = new Date(prevMessage.timestamp);
    const currentDate = new Date(message.timestamp);

    // Show date if it's a different day or more than 1 hour apart
    return (
      prevDate.getDate() !== currentDate.getDate() ||
      prevDate.getMonth() !== currentDate.getMonth() ||
      prevDate.getFullYear() !== currentDate.getFullYear() ||
      currentDate.getTime() - prevDate.getTime() > 60 * 60 * 1000
    );
  }

  // Highlight search text in messages
  highlightSearchText(text: string): string {
    if (!this.searchQuery || !text) return text;

    const regex = new RegExp(`(${this.escapeRegExp(this.searchQuery)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  // Helper method to escape special characters in regex
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Open image preview
  openImagePreview(image: any): void {
    // Implementation would typically open a modal or lightbox
    console.log('Opening image preview:', image.url);
  }

  // Download attachment
  downloadAttachment(file: any): void {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name || 'download';
    link.target = '_blank';
    link.click();
  }

  // Get file icon based on file type
  getFileIcon(file: any): string {
    const type = file.type?.toLowerCase() || '';

    if (type.includes('image')) return 'image-outline';
    if (type.includes('pdf')) return 'file-text-outline';
    if (type.includes('word') || type.includes('doc')) return 'file-text-outline';
    if (type.includes('excel') || type.includes('sheet')) return 'grid-outline';
    if (type.includes('video')) return 'film-outline';
    if (type.includes('audio')) return 'music-outline';
    if (type.includes('zip') || type.includes('rar')) return 'archive-outline';

    return 'file-outline';
  }

  filterConversations(): void {
    if (!this.searchQuery) {
      this.filteredContacts = [...this.contacts];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredContacts = this.contacts.filter(
      (contact) =>
        contact.name?.toLowerCase().includes(query) ||
        contact.lastMessage?.content?.toLowerCase().includes(query),
    );
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filterConversations();
  }

  selectContact(contactId: string): void {
    this.selectedContactId = contactId;
    this.selectedContact = this.contacts.find((c) => c.id === contactId) || null;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.chatService.disconnectSocket();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
    }
  }

  private loadRooms(): void {
    this.loadingContacts = true;
    this.chatService.getRooms().subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        this.loadingContacts = false;
      },
      error: (err) => {
        console.error('Error loading chat rooms:', err);
        this.loadingContacts = false;
      },
    });
  }

  private setupSubscriptions(): void {
    // Subscribe to new messages
    this.subscriptions.push(
      this.chatService.newMessage$.subscribe((message) => {
        this.handleNewMessage(message);
      }),
    );

    // Subscribe to typing status
    this.subscriptions.push(
      this.chatService.typingStatus$.subscribe((isTyping) => {
        this.isContactTyping = isTyping;
      }),
    );

    // Setup typing indicator
    this.subscriptions.push(
      this.typingSubject
        .pipe(debounceTime(TYPING_INDICATOR_DELAY), distinctUntilChanged())
        .subscribe((roomId) => {
          this.chatService.sendTypingIndicator(roomId);
        }),
    );
  }

  private handleNewMessage(message: ChatMessage): void {
    if (message.roomId === this.selectedRoomId) {
      this.messages.push(message);
      this.shouldScrollToBottom = true;
    }
  }

  private scrollToBottom(): void {
    if (this.messageList) {
      const element = this.messageList.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
}
