#!/usr/bin/env node
// @ts-check

/**
 * This script fixes the ChatMessage interface in chat.service.ts
 * to include all required properties used in components
 */

const fs = require('fs');
const path = require('path');

// Get the project root directory
const projectRoot = path.resolve(__dirname, '..');
const chatServicePath = path.join(projectRoot, 'src', 'app', 'core', 'services', 'chat.service.ts');

// Read the chat.service.ts file
if (!fs.existsSync(chatServicePath)) {
  console.error(`Chat service file not found: ${chatServicePath}`);
  process.exit(1);
}

let chatServiceContent = fs.readFileSync(chatServicePath, 'utf8');

// Define the updated ChatMessage interface
const updatedChatMessageInterface = `export interface ChatMessage {
  id: string;
  roomId: string;
  sender: string | ChatParticipant;
  receiver: string;
  content: string;
  message?: string; // Legacy support
  timestamp: Date;
  read: boolean;
  isEncrypted?: boolean;
  createdAt?: Date;
  type?: 'text' | 'system' | 'image' | 'file' | 'notification';
  expiresAt?: Date | number | string;
  encryptionData?: {
    iv: string;
    authTag?: string;
  };
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }>;
}`;

// Replace the existing ChatMessage interface
const chatMessageInterfaceRegex = /export\s+interface\s+ChatMessage\s+{[\s\S]*?}/;
const match = chatMessageInterfaceRegex.exec(chatServiceContent);

if (match) {
  console.log('Updating ChatMessage interface...');
  chatServiceContent = chatServiceContent.replace(match[0], updatedChatMessageInterface);

  // Write the updated content back to the file
  fs.writeFileSync(chatServicePath, chatServiceContent);
  console.log('ChatMessage interface updated successfully!');
} else {
  console.error('Could not find ChatMessage interface in chat.service.ts');
  process.exit(1);
}
