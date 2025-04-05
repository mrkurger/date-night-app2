import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, BehaviorSubject } from 'rxjs';

// Define the ChatMessage interface locally until it's properly exported from the service
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
}

// Define a contact interface
interface Contact {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  online: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: ChatMessage[] = [];
  contacts: Contact[] = [];
  newMessage = '';
  currentUserId = '';
  selectedContactId: string | null = null;
  searchTerm = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser ? currentUser._id : '';
  }

  ngOnInit(): void {
    // Load contacts first
    this.loadContacts();

    // Check if we have a recipient ID in the route
    const routeSub = this.route.params.subscribe(params => {
      if (params['userId']) {
        this.selectedContactId = params['userId'];
        this.loadMessages();
      }
    });

    this.subscriptions.push(routeSub);
    this.setupSocketListeners();

    // Create some dummy contacts for demo purposes
    this.createDummyContacts();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadContacts(): void {
    // In a real app, you would load contacts from the service
    this.chatService.getContacts().subscribe({
      next: (contacts) => {
        this.contacts = contacts;
        // If we have contacts but no selected contact, select the first one
        if (this.contacts.length > 0 && !this.selectedContactId) {
          this.selectContact(this.contacts[0].id);
        }
      },
      error: (err) => {
        console.error('Error loading contacts:', err);
        // Use mock data if API call fails
        this.contacts = this.chatService.getMockContacts();
        if (this.contacts.length > 0 && !this.selectedContactId) {
          this.selectContact(this.contacts[0].id);
        }
      }
    });
  }

  loadMessages(): void {
    if (this.selectedContactId) {
      this.chatService.getMessages(this.selectedContactId).subscribe({
        next: (messages) => {
          // Transform the messages from the service format to the component format
          this.messages = messages.map(msg => {
            // Create a properly typed sender object
            let senderObj: {id: string; username: string};
            if (typeof msg.sender === 'string') {
              senderObj = {
                id: msg.sender,
                username: 'User'
              };
            } else {
              // Handle the case where sender is an object
              const senderAsObj = msg.sender as any; // Use any to bypass type checking
              senderObj = {
                id: senderAsObj.id || 'unknown',
                username: senderAsObj.username || 'Unknown User'
              };
            }

            // Create a properly typed recipient object if it exists
            let recipientObj: {id: string; username: string} | undefined = undefined;
            if (msg.recipient) {
              if (typeof msg.recipient === 'string') {
                recipientObj = {
                  id: msg.recipient,
                  username: 'Recipient'
                };
              } else {
                // Handle the case where recipient is an object
                const recipientAsObj = msg.recipient as any; // Use any to bypass type checking
                recipientObj = {
                  id: recipientAsObj.id || 'unknown',
                  username: recipientAsObj.username || 'Unknown Recipient'
                };
              }
            }

            return {
              _id: msg._id,
              sender: senderObj,
              recipient: recipientObj,
              message: msg.message || msg.content,
              timestamp: msg.timestamp,
              read: msg.read
            };
          });
        },
        error: (err) => console.error('Error loading messages:', err)
      });
    }
  }

  sendMessage(): void {
    if (this.newMessage.trim() && this.selectedContactId) {
      this.chatService.sendMessage(this.selectedContactId, this.newMessage).subscribe({
        next: () => {
          // Add the message to our list immediately for better UX
          const newMessage: ChatMessage = {
            _id: Date.now().toString(), // Temporary ID
            sender: {
              id: this.currentUserId,
              username: 'You'
            },
            message: this.newMessage,
            timestamp: new Date(),
            read: false
          };

          this.messages = [...this.messages, newMessage];
          this.newMessage = '';

          // Update the last message in contacts
          this.updateContactLastMessage(this.selectedContactId, newMessage.message);
        },
        error: (err) => console.error('Error sending message:', err)
      });
    }
  }

  setupSocketListeners(): void {
    this.chatService.connectSocket();

    // Create a subject that we can subscribe to and unsubscribe from
    const messageSubject = new BehaviorSubject<any>(null);

    // Set up the socket listener
    this.chatService.onNewMessage((message) => {
      messageSubject.next(message);
    });

    // Subscribe to our subject
    const messageSub = messageSubject.subscribe(message => {
      if (!message) return; // Skip the initial null value

      // Update messages array if the message is for the current chat
      if (this.selectedContactId &&
          (message.sender.id === this.selectedContactId ||
           (message.recipient && message.recipient.id === this.selectedContactId))) {
        this.messages = [...this.messages, message];

        // Mark as read if it's from the selected contact
        if (message.sender.id === this.selectedContactId) {
          this.markAsRead(message._id);
        }
      }

      // Update the unread count for the contact
      if (message.sender && message.sender.id) {
        this.incrementUnreadCount(message.sender.id);
      }
    });

    this.subscriptions.push(messageSub);
  }

  selectContact(contactId: string): void {
    this.selectedContactId = contactId;

    // Update URL without reloading
    this.router.navigate(['/chat', contactId], { replaceUrl: true });

    // Load messages for this contact
    this.loadMessages();

    // Reset unread count for this contact
    this.resetUnreadCount(contactId);
  }

  getSelectedContact(): Contact | undefined {
    return this.contacts.find(contact => contact.id === this.selectedContactId);
  }

  markAsRead(messageId: string): void {
    this.chatService.markAsRead(messageId).subscribe({
      next: () => {
        // Update the message in our local array
        this.messages = this.messages.map(msg =>
          msg._id === messageId ? { ...msg, read: true } : msg
        );
      },
      error: (err) => console.error('Error marking message as read:', err)
    });
  }

  updateContactLastMessage(contactId: string, message: string): void {
    this.contacts = this.contacts.map(contact => {
      if (contact.id === contactId) {
        return {
          ...contact,
          lastMessage: message,
          lastMessageTime: new Date()
        };
      }
      return contact;
    });
  }

  incrementUnreadCount(contactId: string): void {
    if (contactId !== this.selectedContactId) {
      this.contacts = this.contacts.map(contact => {
        if (contact.id === contactId) {
          return {
            ...contact,
            unreadCount: contact.unreadCount + 1
          };
        }
        return contact;
      });
    }
  }

  resetUnreadCount(contactId: string): void {
    this.contacts = this.contacts.map(contact => {
      if (contact.id === contactId) {
        return {
          ...contact,
          unreadCount: 0
        };
      }
      return contact;
    });
  }

  // For demo purposes only - in a real app, this would come from the backend
  private createDummyContacts(): void {
    if (this.contacts.length === 0) {
      this.contacts = [
        {
          id: '1',
          name: 'John Doe',
          lastMessage: 'Hey, how are you doing?',
          lastMessageTime: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
          unreadCount: 2,
          online: true
        },
        {
          id: '2',
          name: 'Jane Smith',
          lastMessage: 'See you tomorrow!',
          lastMessageTime: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
          unreadCount: 0,
          online: false
        },
        {
          id: '3',
          name: 'Mike Johnson',
          lastMessage: 'Thanks for the info',
          lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
          unreadCount: 0,
          online: true
        }
      ];

      // If we have a selected contact from the route but no messages yet,
      // create some dummy messages
      if (this.selectedContactId && this.messages.length === 0) {
        const contact = this.contacts.find(c => c.id === this.selectedContactId);
        if (contact) {
          this.createDummyMessages(contact);
        }
      }
    }
  }

  private createDummyMessages(contact: Contact): void {
    const now = new Date();
    this.messages = [
      {
        _id: '1',
        sender: {
          id: contact.id,
          username: contact.name
        },
        message: 'Hey there! How are you?',
        timestamp: new Date(now.getTime() - 1000 * 60 * 30), // 30 minutes ago
        read: true
      },
      {
        _id: '2',
        sender: {
          id: this.currentUserId,
          username: 'You'
        },
        message: 'I\'m doing great! How about you?',
        timestamp: new Date(now.getTime() - 1000 * 60 * 25), // 25 minutes ago
        read: true
      },
      {
        _id: '3',
        sender: {
          id: contact.id,
          username: contact.name
        },
        message: contact.lastMessage,
        timestamp: contact.lastMessageTime,
        read: contact.unreadCount === 0
      }
    ];
  }
}