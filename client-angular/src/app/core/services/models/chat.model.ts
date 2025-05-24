export interface ChatMessage {
  _id: string;
  roomId: string;
  sender: string | { id: string; username: string; profileImage?: string };
  recipient?: string | { id: string; username: string };
  content?: string;
  message?: string; // For compatibility with the component
  timestamp: Date;
  read: boolean;
  type?: 'system' | 'text' | 'image' | 'file';
  attachments?: Attachment[];
  replyTo?: string; // ID of the message being replied to
  metadata?: any;
  isEncrypted?: boolean;
  encryptionData?: EncryptionData;
  expiresAt?: number; // Timestamp when the message should expire
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  mimeType?: string;
  isEncrypted?: boolean;
  encryptionData?: EncryptionData;
}

export interface EncryptionData {
  iv: string;
  authTag: string;
}
