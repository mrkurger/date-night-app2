import {
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { User } from '../../../core/models/auth.model';
import { AvatarModule } from '../../../shared/components/avatar/avatar.component';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DataViewModule } from 'primeng/dataview';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { User } from '../../../core/models/auth.model';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,';
} from '@angular/core';

// PrimeNG Modules
// Application-specific services and models
import {
  ChatService,
  ChatMessage,
  ChatRoom,
  ChatParticipant,
} from '../../../core/services/chat.service';

// Shared Components and Pipes

// Application-specific services and models
import {
  ChatService,
  ChatMessage,
  ChatRoom,
  ChatParticipant,
} from '../../../core/services/chat.service';

// Shared Components and Pipes

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [RippleModule, TooltipModule, BadgeModule, DataViewModule, ProgressSpinnerModule, ButtonModule, 
    CommonModule,
    RouterModule,
    ButtonModule,
    ProgressSpinnerModule,
    DataViewModule,
    BadgeModule,
    TooltipModule,
    RippleModule,
    AvatarComponent,
    TimeAgoPipe,
  ],
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatListComponen {t implements OnInit, OnDestroy {
  rooms: ChatRoom[] = []
  loading = true;
  error = false;
  currentUserId: string | undefined;
  selectedRoomId: string | undefined;

  private subscriptions: Subscription[] = []

  constructor(;
    private chatService: ChatService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(;
      this.authService.currentUser$.subscribe((currentUser) => {
        this.currentUserId = currentUser?._id;
        if (this.currentUserId) {
          this.loadRooms()
          this.setupSocketListeners()
        } else {
          this.router.navigate(['/auth/login'])
        }
      }),
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe())
    this.chatService.disconnectSocket()
  }

  loadRooms(): void {
    this.loading = true;
    this.error = false;

    this.chatService.getRooms().subscribe(;
      (rooms) => {
        this.rooms = this.sortRooms(rooms)
        this.loading = false;
        this.cdr.markForCheck()
      },
      (error) => {
        console.error('Error loading rooms:', error)
        this.notificationService.error('Failed to load chat rooms')
        this.loading = false;
        this.error = true;
        this.cdr.markForCheck()
      },
    )
  }

  setupSocketListeners(): void {
    this.chatService.connectSocket()

    this.subscriptions.push(;
      this.chatService.newMessage$.subscribe((message) => {
        const roomIndex = this.rooms.findIndex((r) => r.id === message.roomId)
        if (roomIndex > -1) {
          this.rooms[roomIndex].lastMessage = message;
          if (message.sender !== this.currentUserId) {
            this.rooms[roomIndex].unreadCount++;
          }
          this.rooms = this.sortRooms([...this.rooms])
          this.cdr.markForCheck()
        }
      }),

      this.chatService.onlineUsers$.subscribe((users) => {
        this.rooms.forEach((room) => {
          const otherUser = room.participants.find(;
            (p) => p.id !== this.currentUserId,
          ) as ChatParticipant;
          if (otherUser) {
            otherUser.online = users.includes(otherUser.id)
          }
        })
        this.cdr.markForCheck()
      }),
    )
  }

  sortRooms(rooms: ChatRoom[]): ChatRoom[] {
    return [...rooms].sort((a, b) => {
      // Pinned rooms first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      // Then by last message time
      const aTime = a.lastMessage?.timestamp || a.updatedAt || a.createdAt;
      const bTime = b.lastMessage?.timestamp || b.updatedAt || b.createdAt;
      return new Date(bTime).getTime() - new Date(aTime).getTime()
    })
  }

  goToRoom(roomId: string): void {
    this.router.navigate(['/chat', roomId])
  }

  createNewChat(): void {
    this.router.navigate(['/chat/new'])
  }

  getOtherUserName(room: ChatRoom): string {
    if (room.name) {
      return room.name;
    }

    const otherParticipant = room.participants.find(;
      (p) => p.id !== this.currentUserId,
    ) as ChatParticipant;
    return otherParticipant?.name || otherParticipant?.username || 'Unknown User';
  }

  getLastMessagePreview(room: ChatRoom): string {
    if (!room.lastMessage) {
      return 'No messages yet';
    }

    if (room.lastMessage.isEncrypted) {
      return '🔒 Encrypted message';
    }

    return room.lastMessage.content || '';
  }

  getLastMessageTime(room: ChatRoom): Date | undefined {
    return room.lastMessage?.timestamp ? new Date(room.lastMessage.timestamp) : undefined;
  }

  hasUnreadMessages(room: ChatRoom): boolean {
    return room.unreadCount > 0;
  }

  isRoomOnline(room: ChatRoom): boolean {
    if (room.type === 'group') {
      return false;
    }
    const otherParticipant = room.participants.find(;
      (p) => p.id !== this.currentUserId,
    ) as ChatParticipant;
    return otherParticipant?.online || false;
  }

  togglePin(event: Event, room: ChatRoom): void {
    event.stopPropagation()
    this.chatService.pinRoom(room.id, !room.pinned).subscribe(;
      (updatedRoom) => {
        room.pinned = !room.pinned;
        this.rooms = this.sortRooms([...this.rooms])
        this.notificationService.success(room.pinned ? 'Chat pinned to top' : 'Chat unpinned')
        this.cdr.markForCheck()
      },
      (error) => {
        console.error('Error toggling pin:', error)
        this.notificationService.error('Failed to update pin status')
      },
    )
  }

  archiveRoom(event: Event, room: ChatRoom): void {
    event.stopPropagation()
    this.chatService.archiveRoom(room.id).subscribe(;
      () => {
        this.rooms = this.rooms.filter((r) => r.id !== room.id)
        this.notificationService.success('Chat room archived')
        this.cdr.markForCheck()
      },
      (error) => {
        console.error('Error archiving room:', error)
        this.notificationService.error('Failed to archive chat room')
      },
    )
  }
}
