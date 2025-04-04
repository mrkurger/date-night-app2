import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-chat',
  template: `
    <div class="container mt-4">
      <div class="chat-container">
        <div class="message-list">
          <div *ngFor="let message of messages" class="message" [class.sent]="message.senderId === currentUserId">
            <p>{{message.text}}</p>
          </div>
        </div>
        <div class="message-input">
          <input [(ngModel)]="newMessage" (keyup.enter)="sendMessage()" placeholder="Type a message...">
          <button (click)="sendMessage()">Send</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      height: 400px;
      border: 1px solid #ccc;
      overflow-y: scroll;
      display: flex;
      flex-direction: column;
    }
    .message-list {
      flex-grow: 1;
      padding: 10px;
    }
    .message {
      background-color: #f0f0f0;
      border-radius: 5px;
      padding: 5px;
      margin-bottom: 5px;
    }
    .sent {
      background-color: #e0f7fa;
      align-self: flex-end;
    }
    .message-input {
      display: flex;
      padding: 10px;
      border-top: 1px solid #ccc;
    }
    .message-input input {
      flex-grow: 1;
      margin-right: 10px;
    }
  `]
})
export class ChatComponent implements OnInit {
  messages: any[] = []; // Replace 'any' with a specific interface
  newMessage = '';
  currentUserId: string;
  recipientId: string | null = null; // Get this from route params or input

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
  ) {
    this.currentUserId = this.authService.getCurrentUser()._id;
  }

  ngOnInit(): void {
    // Example: Get recipientId from route params
    // this.route.params.subscribe(params => {
    //   this.recipientId = params['userId'];
    //   this.loadMessages();
    //   this.setupSocketListeners();
    // });
    this.loadMessages();
    this.setupSocketListeners();
  }

  loadMessages(): void {
    if (this.recipientId) {
      this.chatService.getMessages(this.recipientId).subscribe({
        next: (messages) => this.messages = messages,
        error: (err) => console.error('Error loading messages:', err)
      });
    }
  }

  sendMessage(): void {
    if (this.newMessage.trim() && this.recipientId) {
      this.chatService.sendMessage(this.recipientId, this.newMessage).subscribe({
        next: () => {
          this.newMessage = '';
          this.loadMessages(); // Or update messages array directly
        },
        error: (err) => console.error('Error sending message:', err)
      });
    }
  }

  setupSocketListeners(): void {
    this.chatService.onNewMessage().subscribe(message => {
      // Update messages array if the message is for the current chat
      if (message.senderId === this.recipientId || message.recipientId === this.recipientId) {
        this.messages = [...this.messages, message];
      }
    });
  }
}