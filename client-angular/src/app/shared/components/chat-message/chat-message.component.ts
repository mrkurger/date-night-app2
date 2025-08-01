import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../../core/services/auth.service';
import { EncryptionService } from '../../../core/services/encryption.service';
import { ChatMessage, Attachment } from '../../../core/services/models/chat.model';
import { FileSizePipe } from '../../pipes/file-size.pipe';
import { LinkifyPipe } from '../../pipes/linkify.pipe';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';

/**
 *
 */
@Component({
  selector: 'app-chat-message',
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    BadgeModule,
    ProgressSpinnerModule,
    AvatarModule,
    TooltipModule,
    TimeAgoPipe,
    LinkifyPipe,
    FileSizePipe,
  ],
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ChatMessageComponent implements OnInit {
  @Input() message!: ChatMessage;
  @Input() roomId!: string;
  @Input() showSender = true;

  decryptedContent: string | null = null;
  isCurrentUser = false;
  isDecrypting = false;
  decryptionFailed = false;

  /**
   *
   */
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  /**
   *
   */
  ngOnInit(): void {
    // Check if this message is from the current user
    this.isCurrentUser = this.checkIfCurrentUser();

    // Handle message content
    this.processMessageContent();
  }

  /**
   * Process the message content, decrypting if necessary
   */
  private async processMessageContent(): Promise<void> {
    // If the message is not encrypted, use the content directly
    if (!this.message.isEncrypted) {
      this.decryptedContent = this.message.message || this.message.content || '';
      return;
    }

    // If the message is encrypted, try to decrypt it
    this.isDecrypting = true;
    this.cdr.markForCheck();

    try {
      // Ensure we have the necessary encryption data
      if (!this.message.encryptionData || !this.message.encryptionData.iv) {
        throw new Error('Missing encryption data');
      }

      const encryptedData = {
        ciphertext: this.message.message || '',
        iv: this.message.encryptionData.iv,
        authTag: this.message.encryptionData.authTag,
      };

      // Decrypt the message
      const decrypted = await this.encryptionService.decryptMessage(this.roomId, encryptedData);

      if (decrypted) {
        this.decryptedContent = decrypted;
      } else {
        this.decryptionFailed = true;
        this.decryptedContent = '[Encrypted message - Unable to decrypt]';
      }
    } catch (error) {
      console.error('Error decrypting message:', error);
      this.decryptionFailed = true;
      this.decryptedContent = '[Encrypted message - Unable to decrypt]';
    } finally {
      this.isDecrypting = false;
      this.cdr.markForCheck();
    }
  }

  /**
   * Check if the message is from the current user
   */
  private checkIfCurrentUser(): boolean {
    // Subscribe to currentUser$ observable instead of trying to access getValue
    let isCurrentUser = false;
    this.authService.currentUser$.subscribe((currentUser) => {
      if (currentUser && this.message.sender) {
        const senderId =
          typeof this.message.sender === 'string' ? this.message.sender : this.message.sender.id;
        isCurrentUser = senderId === currentUser.id;
      }
    });
    return isCurrentUser;
  }

  /**
   * Get the display name for the message sender
   */
  getSenderName(): string {
    if (typeof this.message.sender === 'string') {
      return 'Unknown User';
    }
    return this.message.sender.username || 'Unknown User';
  }

  /**
   * Get the profile image for the message sender
   */
  getSenderProfileImage(): string {
    if (typeof this.message.sender === 'string') {
      return '/assets/img/default-profile.jpg';
    }
    return this.message.sender.profileImage || '/assets/img/default-profile.jpg';
  }

  /**
   * Get the CSS classes for the message
   */
  getMessageClasses(): { [key: string]: boolean } {
    return {
      message: true,
      'message--outgoing': this.isCurrentUser,
      'message--incoming': !this.isCurrentUser,
      'message--encrypted': this.message.isEncrypted || false,
      'message--decryption-failed': this.decryptionFailed || false,
      'message--system': this.message.type === 'system',
    };
  }

  /**
   * Open an attachment (for images)
   */
  openAttachment(attachment: Attachment): void {
    if (attachment.type === 'image' && attachment.url) {
      window.open(attachment.url, '_blank');
    }
  }

  /**
   * Download an attachment
   */
  downloadAttachment(attachment: Attachment): void {
    if (attachment.url) {
      window.open(attachment.url, '_blank');
    }
  }

  /**
   * TrackBy function for attachment list
   */
  trackByAttachment(index: number, attachment: Attachment): string {
    return attachment.id || attachment.url || index.toString();
  }
}
