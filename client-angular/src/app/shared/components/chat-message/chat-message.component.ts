// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (chat-message.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMessage } from '../../../core/services/chat.service';
import { EncryptionService } from '../../../core/services/encryption.service';
import { AuthService } from '../../../core/services/auth.service';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule, TimeAgoPipe],
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatMessageComponent implements OnInit {
  @Input() message!: ChatMessage;
  @Input() roomId!: string;
  @Input() showSender = true;

  decryptedContent: string | null = null;
  isCurrentUser = false;
  isDecrypting = false;
  decryptionFailed = false;

  constructor(
    private encryptionService: EncryptionService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Check if this message is from the current user
    const currentUser = this.authService.getCurrentUser();
    const currentUserId = currentUser?.id;
    const senderId =
      typeof this.message.sender === 'string' ? this.message.sender : this.message.sender.id;

    this.isCurrentUser = senderId === currentUserId;

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
   * Get the display name for the message sender
   */
  getSenderName(): string {
    if (typeof this.message.sender === 'string') {
      return 'Unknown User';
    }
    return this.message.sender.username || 'Unknown User';
  }

  /**
   * Get the timestamp for the message
   */
  getTimestamp(): Date {
    // Use timestamp property, fallback to Date.now() if not available
    return new Date(this.message.timestamp || Date.now());
  }

  /**
   * Get the CSS classes for the message
   */
  getMessageClasses(): { [key: string]: boolean } {
    return {
      message: true,
      'message--outgoing': this.isCurrentUser,
      'message--incoming': !this.isCurrentUser,
      'message--encrypted': this.message.isEncrypted,
      'message--decryption-failed': this.decryptionFailed,
      'message--system': this.message.type === 'system',
    };
  }
}
