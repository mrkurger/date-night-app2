import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DataViewModule } from 'primeng/dataview';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { SkeletonModule } from 'primeng/skeleton';

// Application-specific services and models
import { ChatService, ChatRoom } from '@features/chat/services/chat.service';
import { AuthService } from '@core/auth/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { User } from '@core/auth/models/auth.model';

// Shared Components and Pipes
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { TimeAgoPipe } from '@shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    ProgressSpinnerModule,
    DataViewModule,
    BadgeModule,
    TooltipModule,
    RippleModule,
    SkeletonModule,
    AvatarComponent,
    TimeAgoPipe,
  ],
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatListComponent implements OnInit, OnDestroy {
  rooms: ChatRoom[] = [];
  loading = true;
  error = false;
  currentUserId: string | undefined;
  selectedRoomId: string | undefined;

  private subscriptions: Subscription[] = [];

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.authService.currentUser$.subscribe((currentUser) => {
        this.currentUserId = currentUser?._id;
        if (this.currentUserId) {
          this.loadRooms();
          this.setupSocketListeners();
        } else {
          this.router.navigate(['/auth/login']);
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.chatService.disconnectSocket();
  }

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

  setupSocketListeners(): void {
    this.chatService.connectSocket();

    this.subscriptions.push(
      this.chatService.newMessage$.subscribe((message) => {
        const roomIndex = this.rooms.findIndex((r) => r.id === message.roomId);
        if (roomIndex > -1) {
          this.rooms[roomIndex].lastMessage = message;
          this.rooms = this.sortRooms(this.rooms);
        }
      }),
    );

    this.subscriptions.push(
      this.chatService.onlineUsers$.subscribe((users) => {
        // Logic to update online status of users/rooms
      }),
    );
  }

  sortRooms(rooms: ChatRoom[]): ChatRoom[] {
    return [...rooms].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      const aTime = a.lastMessage?.timestamp || a.updatedAt || a.createdAt;
      const bTime = b.lastMessage?.timestamp || b.updatedAt || b.createdAt;

      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
  }

  goToRoom(roomId: string): void {
    this.router.navigate(['/chat', roomId]);
  }

  createNewChat(): void {
    this.router.navigate(['/chat/new']);
  }

  getOtherUserName(room: ChatRoom): string {
    if (room.name) {
      return room.name;
    }

    const otherParticipant = room.participants?.find((p) => p.id !== this.currentUserId);
    return otherParticipant?.name || 'Unknown User';
  }

  getLastMessagePreview(room: ChatRoom): string {
    if (room.lastMessage) {
      return room.lastMessage.content || '';
    }
    return 'No messages yet';
  }

  getLastMessageTime(room: ChatRoom): Date | undefined {
    return room.lastMessage?.timestamp ? new Date(room.lastMessage.timestamp) : undefined;
  }

  hasUnreadMessages(room: ChatRoom): boolean {
    return room.unreadCount ? room.unreadCount > 0 : false;
  }

  isRoomOnline(room: ChatRoom): boolean {
    if (!room.isGroupChat) {
      const otherParticipant = room.participants?.find((p) => p.id !== this.currentUserId);
      return otherParticipant?.isOnline || false;
    }
    return false;
  }

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

  togglePin(event: Event, room: ChatRoom): void {
    event.stopPropagation();
    room.pinned = !room.pinned;
    this.rooms = this.sortRooms(this.rooms);
  }
}
