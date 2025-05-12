// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (chat-list.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import {
  NbSortComponent,
  NbSortHeaderComponent,
  NbSortEvent,
} from '../../../shared/components/custom-nebular-components';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatService, ChatRoom } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule, TimeAgoPipe, NbSortComponent, NbSortHeaderComponent, NbSortEvent],
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
    this.currentUserId = this.authService.getCurrentUserId();
    this.loadRooms();
    this.setupSocketListeners();
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());

    // Disconnect from socket
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
    this.chatService.onNewMessage((message) => {
      // Find the room for this message
      const roomId = message.roomId;
      const room = this.rooms.find((r) => r._id === roomId);

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

    // Subscribe to unread count updates
    const unreadSub = this.chatService.unreadCount$.subscribe((count) => {
      // This is a total count, individual room counts are handled above
    });

    this.subscriptions.push(unreadSub);

    // Subscribe to online users updates
    const onlineSub = this.chatService.onlineUsers$.subscribe((users) => {
      // Update online status for users in rooms
      // This would require mapping user IDs to rooms
    });

    this.subscriptions.push(onlineSub);
  }

  /**
   * NbSortEvent rooms by last activity
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
    // This would open a dialog to select a user
    // For now, we'll just navigate to a placeholder route
    this.router.navigate(['/chat/new']);
  }

  /**
   * Get the other user's name in a direct chat
   */
  getOtherUserName(room: ChatRoom): string {
    if (room.name) {
      return room.name;
    }

    // In a real app, you would have user details in the room object
    // For now, we'll just use a placeholder
    const otherParticipant = room.participants.find((p) => p !== this.currentUserId);
    return otherParticipant ? `User ${otherParticipant.substring(0, 5)}` : 'Chat Room';
  }

  /**
   * Get the last message preview
   */
  getLastMessagePreview(room: ChatRoom): string {
    if (!room.lastMessage) {
      return 'No messages yet';
    }

    const message = room.lastMessage.message || room.lastMessage.content || '';

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
        return `📎 ${attachment.name || 'File'}`;
      }
    }

    // Truncate long messages
    if (message.length > 50) {
      return message.substring(0, 47) + '...';
    }

    return message;
  }

  /**
   * Get the last message time
   */
  getLastMessageTime(room: ChatRoom): Date {
    if (!room.lastMessage) {
      return new Date(room.updatedAt || room.createdAt);
    }

    return new Date(room.lastMessage.timestamp || room.lastMessage.createdAt);
  }

  /**
   * Check if a room has unread messages
   */
  hasUnreadMessages(room: ChatRoom): boolean {
    return room.unreadCount > 0;
  }

  /**
   * Archive a chat room
   */
  archiveRoom(event: Event, room: ChatRoom): void {
    event.stopPropagation();

    this.chatService.archiveRoom(room._id, true).subscribe(
      (updatedRoom) => {
        // Remove from list
        this.rooms = this.rooms.filter((r) => r._id !== room._id);
        this.notificationService.success('Chat archived');
      },
      (error) => {
        console.error('Error archiving room:', error);
        this.notificationService.error('Failed to archive chat');
      },
    );
  }

  /**
   * Pin a chat room
   */
  togglePin(event: Event, room: ChatRoom): void {
    event.stopPropagation();

    const newPinned = !room.pinned;

    this.chatService.pinRoom(room._id, newPinned).subscribe(
      (updatedRoom) => {
        // Update local state
        room.pinned = newPinned;
        // Re-sort rooms
        this.rooms = this.sortRooms(this.rooms);
        this.notificationService.success(newPinned ? 'Chat pinned' : 'Chat unpinned');
      },
      (error) => {
        console.error('Error pinning room:', error);
        this.notificationService.error('Failed to update chat');
      },
    );
  }
}
