import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SocketService } from './socket.service';
import { NotificationService, AppNotification } from './notification.service';

export interface ChatMessage {
  id: string;
  roomId: string;
  sender: {
    id: string;
    username: string;
    profileImage?: string;
  };
  recipient?: {
    id: string;
    username: string;
    profileImage?: string;
  };
  message: string;
  type: 'text' | 'image' | 'video' | 'file' | 'system';
  isEncrypted?: boolean;
  encryptionData?: {
    iv: string;
    authTag?: string;
  };
  attachments?: Array<{
    type: 'image' | 'video' | 'file';
    url: string;
    name?: string;
    size?: number;
    mimeType?: string;
    isEncrypted?: boolean;
    encryptionData?: {
      iv: string;
      authTag?: string;
    };
  }>;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  expiresAt?: Date;
}

export interface ChatRoom {
  _id: string;
  name?: string;
  type: 'direct' | 'group' | 'ad';
  participants: Array<{
    user: {
      _id: string;
      username: string;
      profileImage?: string;
      online?: boolean;
      lastActive?: Date;
    };
    role: 'admin' | 'member';
    joinedAt: Date;
    lastRead?: Date;
    isCurrentUser?: boolean;
    publicKey?: string;
    encryptedRoomKey?: string;
  }>;
  encryptionEnabled?: boolean;
  encryptionVersion?: number;
  messageExpiryEnabled?: boolean;
  messageExpiryTime?: number;
  ad?: {
    _id: string;
    title: string;
    profileImage?: string;
  };
  lastMessage?: ChatMessage;
  lastActivity: Date;
  unreadCount: number;
  otherParticipant?: {
    _id: string;
    username: string;
    profileImage?: string;
    online?: boolean;
    lastActive?: Date;
  };
}

export interface TypingIndicator {
  roomId: string;
  user: {
    id: string;
    username: string;
  };
  isTyping: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chat`;

  private roomsSubject = new BehaviorSubject<ChatRoom[]>([]);
  private currentRoomSubject = new BehaviorSubject<ChatRoom | null>(null);
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  private typingUsersSubject = new BehaviorSubject<Map<string, string>>(new Map());
  private unreadCountSubject = new BehaviorSubject<number>(0);

  // For encryption
  private privateKeysMap = new Map<string, string>(); // roomId -> privateKey
  private roomKeysMap = new Map<string, string>(); // roomId -> roomKey

  public rooms$ = this.roomsSubject.asObservable();
  public currentRoom$ = this.currentRoomSubject.asObservable();
  public messages$ = this.messagesSubject.asObservable();
  public typingUsers$ = this.typingUsersSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(
    private http: HttpClient,
    private socketService: SocketService,
    private notificationService: NotificationService,
    private cryptoService: CryptoService
  ) {
    this.initializeSocketListeners();
    this.loadEncryptionKeys();
  }

  /**
   * Initialize socket listeners for chat
   */
  private initializeSocketListeners(): void {
    // Listen for new messages
    this.socketService.on<ChatMessage>('chat:message').subscribe(message => {
      // Add message to messages if it's for the current room
      const currentRoom = this.currentRoomSubject.value;
      if (currentRoom && message.roomId === currentRoom._id) {
        this.addMessage(message);
      }

      // Update rooms list with new message
      this.updateRoomWithMessage(message);

      // Add notification if message is not from current user
      const isCurrentUser = this.isCurrentUser(message.sender.id);
      if (!isCurrentUser) {
        const notification: AppNotification = {
          id: `msg_${message.id}`,
          type: 'chat',
          message: `New message from ${message.sender.username}`,
          data: {
            roomId: message.roomId,
            messageId: message.id,
            senderId: message.sender.id,
            senderName: message.sender.username
          },
          read: false,
          createdAt: new Date(message.createdAt)
        };

        this.notificationService.addNotification(notification);
      }
    });

    // Listen for typing indicators
    this.socketService.on<TypingIndicator>('chat:typing').subscribe(data => {
      const currentRoom = this.currentRoomSubject.value;
      if (currentRoom && data.roomId === currentRoom._id) {
        const typingUsers = new Map(this.typingUsersSubject.value);

        if (data.isTyping) {
          typingUsers.set(data.user.id, data.user.username);
        } else {
          typingUsers.delete(data.user.id);
        }

        this.typingUsersSubject.next(typingUsers);
      }
    });

    // Listen for user joined/left events
    this.socketService.on<any>('chat:user-joined').subscribe(data => {
      // Update room participants
      this.updateRoomParticipants(data.roomId);
    });

    this.socketService.on<any>('chat:user-left').subscribe(data => {
      // Update room participants
      this.updateRoomParticipants(data.roomId);
    });

    // Listen for user online status changes
    this.socketService.on<any>('user:status').subscribe(data => {
      // Update rooms list with user status
      this.updateRoomParticipantStatus(data.userId, data.online);
    });
  }

  /**
   * Get chat rooms for current user
   */
  getRooms(): Observable<ChatRoom[]> {
    return this.http.get<ChatRoom[]>(`${this.apiUrl}/rooms`).pipe(
      map(rooms => {
        this.roomsSubject.next(rooms);
        this.updateUnreadCount(rooms);
        return rooms;
      })
    );
  }

  /**
   * Get messages for a chat room
   * @param roomId Room ID
   * @param options Query options
   */
  getMessages(roomId: string, options: any = {}): Observable<ChatMessage[]> {
    const queryParams = new URLSearchParams();

    if (options.limit) {
      queryParams.append('limit', options.limit.toString());
    }

    if (options.before) {
      queryParams.append('before', options.before);
    }

    if (options.after) {
      queryParams.append('after', options.after);
    }

    if (options.includeSystem !== undefined) {
      queryParams.append('includeSystem', options.includeSystem.toString());
    }

    const url = `${this.apiUrl}/rooms/${roomId}/messages?${queryParams.toString()}`;

    return this.http.get<ChatMessage[]>(url).pipe(
      map(messages => {
        this.messagesSubject.next(messages);
        return messages;
      })
    );
  }

  /**
   * Send a message to a chat room
   * @param roomId Room ID
   * @param message Message text
   * @param options Additional options
   */
  sendMessage(roomId: string, message: string, options: any = {}): Observable<ChatMessage> {
    const payload = {
      message,
      ...options
    };

    return this.http.post<ChatMessage>(`${this.apiUrl}/rooms/${roomId}/messages`, payload).pipe(
      map(message => {
        this.addMessage(message);
        this.updateRoomWithMessage(message);
        return message;
      })
    );
  }

  /**
   * Create or get a direct message room
   * @param userId User ID to chat with
   */
  createDirectRoom(userId: string): Observable<ChatRoom> {
    return this.http.post<ChatRoom>(`${this.apiUrl}/rooms/direct`, { userId }).pipe(
      map(room => {
        this.setCurrentRoom(room);
        this.updateRooms(room);
        return room;
      })
    );
  }

  /**
   * Create or get a chat room for an ad
   * @param adId Ad ID
   */
  createAdRoom(adId: string): Observable<ChatRoom> {
    return this.http.post<ChatRoom>(`${this.apiUrl}/rooms/ad`, { adId }).pipe(
      map(room => {
        this.setCurrentRoom(room);
        this.updateRooms(room);
        return room;
      })
    );
  }

  /**
   * Create a group chat room
   * @param name Group name
   * @param participantIds Array of participant user IDs
   */
  createGroupRoom(name: string, participantIds: string[]): Observable<ChatRoom> {
    return this.http.post<ChatRoom>(`${this.apiUrl}/rooms/group`, { name, participantIds }).pipe(
      map(room => {
        this.setCurrentRoom(room);
        this.updateRooms(room);
        return room;
      })
    );
  }

  /**
   * Mark messages as read in a room
   * @param roomId Room ID
   */
  markMessagesAsRead(roomId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/rooms/${roomId}/read`, {}).pipe(
      map(result => {
        // Update room unread count
        this.updateRoomUnreadCount(roomId, 0);
        return result;
      })
    );
  }

  /**
   * Get unread message counts
   */
  getUnreadCounts(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/unread`).pipe(
      map(result => {
        this.unreadCountSubject.next(result.total);
        return result;
      })
    );
  }

  /**
   * Leave a group chat room
   * @param roomId Room ID
   */
  leaveRoom(roomId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/rooms/${roomId}/leave`, {}).pipe(
      map(result => {
        // Remove room from rooms list
        const rooms = this.roomsSubject.value.filter(room => room._id !== roomId);
        this.roomsSubject.next(rooms);

        // Clear current room if it's the one being left
        const currentRoom = this.currentRoomSubject.value;
        if (currentRoom && currentRoom._id === roomId) {
          this.currentRoomSubject.next(null);
          this.messagesSubject.next([]);
        }

        return result;
      })
    );
  }

  /**
   * Join a chat room via WebSocket
   * @param roomId Room ID
   */
  joinRoom(roomId: string): void {
    this.socketService.joinChatRoom(roomId);
  }

  /**
   * Leave a chat room via WebSocket
   * @param roomId Room ID
   */
  leaveRoomSocket(roomId: string): void {
    this.socketService.leaveChatRoom(roomId);
  }

  /**
   * Send typing indicator
   * @param roomId Room ID
   * @param isTyping Whether the user is typing
   */
  sendTypingIndicator(roomId: string, isTyping: boolean): void {
    this.socketService.sendTypingIndicator(roomId, isTyping);
  }

  /**
   * Set current chat room
   * @param room Chat room
   */
  setCurrentRoom(room: ChatRoom): void {
    // Leave previous room if any
    const currentRoom = this.currentRoomSubject.value;
    if (currentRoom) {
      this.leaveRoomSocket(currentRoom._id);
    }

    // Set new room
    this.currentRoomSubject.next(room);

    // Join new room
    this.joinRoom(room._id);

    // Clear messages
    this.messagesSubject.next([]);

    // Clear typing indicators
    this.typingUsersSubject.next(new Map());

    // Mark messages as read
    this.markMessagesAsRead(room._id).subscribe();
  }

  /**
   * Clear current chat room
   */
  clearCurrentRoom(): void {
    const currentRoom = this.currentRoomSubject.value;
    if (currentRoom) {
      this.leaveRoomSocket(currentRoom._id);
    }

    this.currentRoomSubject.next(null);
    this.messagesSubject.next([]);
    this.typingUsersSubject.next(new Map());
  }

  /**
   * Add a message to the messages list
   * @param message Chat message
   */
  private addMessage(message: ChatMessage): void {
    const messages = [...this.messagesSubject.value, message];
    this.messagesSubject.next(messages);
  }

  /**
   * Update rooms list with a new message
   * @param message Chat message
   */
  private updateRoomWithMessage(message: ChatMessage): void {
    const rooms = [...this.roomsSubject.value];
    const roomIndex = rooms.findIndex(room => room._id === message.roomId);

    if (roomIndex !== -1) {
      // Update room with new message
      const room = { ...rooms[roomIndex] };
      room.lastMessage = message;
      room.lastActivity = new Date(message.createdAt);

      // Update unread count if not current room or not from current user
      const currentRoom = this.currentRoomSubject.value;
      const isCurrentRoom = currentRoom && currentRoom._id === room._id;
      const isCurrentUser = this.isCurrentUser(message.sender.id);

      if (!isCurrentRoom && !isCurrentUser) {
        room.unreadCount = (room.unreadCount || 0) + 1;
      }

      // Move room to top of list
      rooms.splice(roomIndex, 1);
      rooms.unshift(room);

      this.roomsSubject.next(rooms);
      this.updateUnreadCount(rooms);
    }
  }

  /**
   * Update room participants
   * @param roomId Room ID
   */
  private updateRoomParticipants(roomId: string): void {
    // Refresh room data from server
    this.http.get<ChatRoom>(`${this.apiUrl}/rooms/${roomId}`).subscribe(room => {
      const rooms = [...this.roomsSubject.value];
      const roomIndex = rooms.findIndex(r => r._id === roomId);

      if (roomIndex !== -1) {
        rooms[roomIndex] = room;
        this.roomsSubject.next(rooms);
      }

      // Update current room if it's the one being updated
      const currentRoom = this.currentRoomSubject.value;
      if (currentRoom && currentRoom._id === roomId) {
        this.currentRoomSubject.next(room);
      }
    });
  }

  /**
   * Update room participant status
   * @param userId User ID
   * @param online Online status
   */
  private updateRoomParticipantStatus(userId: string, online: boolean): void {
    const rooms = [...this.roomsSubject.value];
    let updated = false;

    rooms.forEach(room => {
      room.participants.forEach(participant => {
        if (participant.user._id === userId) {
          participant.user.online = online;
          updated = true;
        }
      });

      if (room.otherParticipant && room.otherParticipant._id === userId) {
        room.otherParticipant.online = online;
        updated = true;
      }
    });

    if (updated) {
      this.roomsSubject.next(rooms);
    }

    // Update current room if needed
    const currentRoom = this.currentRoomSubject.value;
    if (currentRoom) {
      let currentRoomUpdated = false;

      currentRoom.participants.forEach(participant => {
        if (participant.user._id === userId) {
          participant.user.online = online;
          currentRoomUpdated = true;
        }
      });

      if (currentRoom.otherParticipant && currentRoom.otherParticipant._id === userId) {
        currentRoom.otherParticipant.online = online;
        currentRoomUpdated = true;
      }

      if (currentRoomUpdated) {
        this.currentRoomSubject.next({ ...currentRoom });
      }
    }
  }

  /**
   * Update rooms list with a new room
   * @param newRoom New chat room
   */
  private updateRooms(newRoom: ChatRoom): void {
    const rooms = [...this.roomsSubject.value];
    const roomIndex = rooms.findIndex(room => room._id === newRoom._id);

    if (roomIndex !== -1) {
      // Update existing room
      rooms[roomIndex] = newRoom;
    } else {
      // Add new room
      rooms.unshift(newRoom);
    }

    this.roomsSubject.next(rooms);
  }

  /**
   * Update room unread count
   * @param roomId Room ID
   * @param count Unread count
   */
  private updateRoomUnreadCount(roomId: string, count: number): void {
    const rooms = [...this.roomsSubject.value];
    const roomIndex = rooms.findIndex(room => room._id === roomId);

    if (roomIndex !== -1) {
      rooms[roomIndex].unreadCount = count;
      this.roomsSubject.next(rooms);
      this.updateUnreadCount(rooms);
    }
  }

  /**
   * Update total unread count
   * @param rooms Chat rooms
   */
  private updateUnreadCount(rooms: ChatRoom[]): void {
    const totalUnread = rooms.reduce((total, room) => total + (room.unreadCount || 0), 0);
    this.unreadCountSubject.next(totalUnread);
  }

  /**
   * Check if a user ID is the current user
   * @param userId User ID
   */
  private isCurrentUser(userId: string): boolean {
    const currentRoom = this.currentRoomSubject.value;
    if (!currentRoom) return false;

    return currentRoom.participants.some(p =>
      p.user._id === userId && p.isCurrentUser
    );
  }

  /**
   * Get current room
   */
  getCurrentRoom(): ChatRoom | null {
    return this.currentRoomSubject.value;
  }

  /**
   * Get rooms
   */
  getRoomsList(): ChatRoom[] {
    return this.roomsSubject.value;
  }

  /**
   * Get messages
   */
  getMessagesList(): ChatMessage[] {
    return this.messagesSubject.value;
  }

  /**
   * Get typing users
   */
  getTypingUsers(): Map<string, string> {
    return this.typingUsersSubject.value;
  }

  /**
   * Get unread count
   */
  getUnreadCount(): number {
    return this.unreadCountSubject.value;
  }
}
