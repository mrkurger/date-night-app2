import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatService, ChatRoom, ChatParticipant } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import { NbButtonModule, NbIconModule, NbBadgeModule } from '@nebular/theme';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule, TimeAgoPipe, NbButtonModule, NbIconModule, NbBadgeModule],
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss'],
})
export class ChatListComponent implements OnInit, OnDestroy {
  rooms: ChatRoom[] = [];
  loading = true;
  error = false;
  currentUserId = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?._id || '';
    this.loadRooms();
    this.setupSocketListeners();
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());

    // Disconnect socket
    this.chatService.disconnectSocket();
  }

  /**
   * Load chat rooms
   */
  loadRooms(): void {
    this.loading = true;
    this.error = false;

    this.chatService.getRooms().subscribe(
      (rooms) => {
        this.rooms = this.sortRooms(rooms);
        this.loading = false;
      },
      (error) => {
        console.error('Error loading rooms:', error);
        this.notificationService.error('Failed to load chat rooms');
        this.loading = false;
        this.error = true;
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
    const messageSub = this.chatService.newMessage$.subscribe((message) => {
      // Find the room for this message
      const roomId = message.roomId;
      const room = this.rooms.find((r) => r.id === roomId);

      if (room) {
        // Update last message
        room.lastMessage = message;

        // Update unread count if message is not from current user
        if (message.sender !== this.currentUserId) {
          room.unreadCount = (room.unreadCount || 0) + 1;
        }

        // Re-sort rooms
        this.rooms = this.sortRooms(this.rooms);
      } else {
        // If room doesn't exist, reload all rooms
        this.loadRooms();
      }
    });

    this.subscriptions.push(messageSub);

    // Subscribe to online users updates
    const onlineSub = this.chatService.onlineUsers$.subscribe((users) => {
      // Update online status for users in rooms
      // This would require mapping user IDs to rooms
    });

    this.subscriptions.push(onlineSub);
  }

  /**
   * Sort rooms by last activity
   */
  sortRooms(rooms: ChatRoom[]): ChatRoom[] {
    return [...rooms].sort((a, b) => {
      // Pinned rooms first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      // Then by last activity
      const aTime = a.lastMessage?.timestamp || a.updatedAt || a.createdAt;
      const bTime = b.lastMessage?.timestamp || b.updatedAt || b.createdAt;

      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
  }

  /**
   * Navigate to a chat room
   */
  goToRoom(roomId: string): void {
    this.router.navigate(['/chat', roomId]);
  }

  /**
   * Create a new chat
   */
  createNewChat(): void {
    this.router.navigate(['/chat/new']);
  }

  /**
   * Get the other user's name in a direct chat
   */
  getOtherUserName(room: ChatRoom): string {
    if (room.name) {
      return room.name;
    }

    const otherParticipant = room.participants.find(
      (p: ChatParticipant) => p.id !== this.currentUserId,
    );
    return otherParticipant ? otherParticipant.username : 'Chat Room';
  }

  /**
   * Get the last message preview
   */
  getLastMessagePreview(room: ChatRoom): string {
    if (!room.lastMessage) {
      return 'No messages yet';
    }

    const message = room.lastMessage.content || room.lastMessage.message || '';

    // If message is encrypted, show a placeholder
    if (room.lastMessage.isEncrypted) {
      return '🔒 Encrypted message';
    }

    // If message has attachments
    if (room.lastMessage.attachments && room.lastMessage.attachments.length > 0) {
      const attachment = room.lastMessage.attachments[0];
      if (attachment.type === 'image') {
        return '📷 Photo';
      } else if (attachment.type === 'video') {
        return '🎥 Video';
      } else {
        return `📎 ${attachment.name}`;
      }
    }

    return message.length > 50 ? `${message.substring(0, 47)}...` : message;
  }

  /**
   * Get the last message time
   */
  getLastMessageTime(room: ChatRoom): Date {
    return (
      room.lastMessage?.timestamp || room.lastMessage?.createdAt || room.updatedAt || room.createdAt
    );
  }

  /**
   * Check if room has unread messages
   */
  hasUnreadMessages(room: ChatRoom): boolean {
    return room.unreadCount > 0;
  }

  /**
   * Archive a chat room
   */
  archiveRoom(event: Event, room: ChatRoom): void {
    event.stopPropagation();
    this.chatService.archiveRoom(room.id).subscribe(
      () => {
        this.rooms = this.rooms.filter((r) => r.id !== room.id);
        this.notificationService.success('Chat room archived');
      },
      (error) => {
        console.error('Error archiving room:', error);
        this.notificationService.error('Failed to archive chat room');
      },
    );
  }

  /**
   * Toggle pin status of a room
   */
  togglePin(event: Event, room: ChatRoom): void {
    event.stopPropagation();
    room.pinned = !room.pinned;
    this.rooms = this.sortRooms(this.rooms);
  }
}
