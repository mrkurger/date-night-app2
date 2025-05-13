import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  TemplateRef,
  AfterViewChecked,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Nebular Components
import {
  NbDialogService,
  NbDialogModule,
  NbIconModule,
  NbButtonModule,
  NbFormFieldModule,
  NbInputModule,
  NbMenuModule,
  NbTooltipModule,
  NbTabsetModule,
} from '@nebular/theme';

// Custom Components
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import {
  NbSortComponent,
  NbSortHeaderComponent,
  NbSortEvent,
} from '../../shared/components/custom-nebular-components';

// Services
import {
  ChatService,
  ChatMessage,
  ChatRoom,
  ChatParticipant,
} from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

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
    NbSortComponent,
    NbSortHeaderComponent,
    NbSortEvent,
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
  isContactTyping = false;
  showEmojiPicker = false;
  notificationsEnabled = true;
  currentFilter: 'all' | 'unread' | 'archived' = 'all';

  // Reply functionality
  replyingTo: ChatMessage | null = null;

  // Temporary message functionality
  temporaryMessageMode = false;
  temporaryMessageTTL = 24 * 60 * 60 * 1000; // Default: 24 hours in milliseconds

  // Message auto-deletion settings
  messageAutoDeletionEnabled = true;
  messageExpiryTime = 7 * 24 * 60 * 60 * 1000;

  // New message dialog
  newMessageSearch = '';
  filteredNewMessageContacts: ChatParticipant[] = [];

  // Image preview
  previewImage: { url: string; type: string } | null = null;

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
    private dialog: NbDialogService,
  ) {
    this.currentUserId = this.authService.getCurrentUserId();
  }

  ngOnInit(): void {
    this.loadRooms();
    this.setupSubscriptions();
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

  // ... rest of the file stays the same ...
}
