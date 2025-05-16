#!/usr/bin/env node
// @ts-check

/**
 * This script checks for and prevents common issues:
 * 1. Duplicate CSP meta tags in index.html
 * 2. Duplicate properties in ChatMessage interface
 */

const fs = require('fs');
const path = require('path');

// Get the project root directory
const projectRoot = path.resolve(__dirname, '..');
const indexPath = path.join(projectRoot, 'src', 'index.html');
const chatServicePath = path.join(projectRoot, 'src', 'app', 'core', 'services', 'chat.service.ts');

console.log('🔍 Checking for duplicate issues...');

// Check index.html for duplicate CSP meta tags
if (fs.existsSync(indexPath)) {
  console.log('\nChecking index.html for duplicate CSP meta tags...');
  let indexContent = fs.readFileSync(indexPath, 'utf8');

  // Count CSP meta tags
  const cspMatches = indexContent.match(/<meta\s+http-equiv="Content-Security-Policy"/g);
  const cspCount = cspMatches ? cspMatches.length : 0;

  if (cspCount > 1) {
    console.log(`⚠️ Found ${cspCount} CSP meta tags in index.html. Fixing...`);

    // Keep only the most comprehensive CSP meta tag
    const cspRegex = /<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"/g;
    const cspTags = [];
    let match;

    while ((match = cspRegex.exec(indexContent)) !== null) {
      cspTags.push({
        fullTag: match[0],
        content: match[1],
        length: match[1].length,
      });
    }

    // Sort by length (most comprehensive first)
    cspTags.sort((a, b) => b.length - a.length);

    // Keep only the first (most comprehensive) CSP tag
    for (let i = 1; i < cspTags.length; i++) {
      indexContent = indexContent.replace(
        cspTags[i].fullTag,
        '<!-- Removed duplicate CSP meta tag -->',
      );
    }

    fs.writeFileSync(indexPath, indexContent);
    console.log('✅ Fixed duplicate CSP meta tags in index.html');
  } else {
    console.log('✅ No duplicate CSP meta tags found in index.html');
  }
} else {
  console.error(`❌ Index file not found: ${indexPath}`);
}

// Check chat.service.ts for duplicate properties in ChatMessage interface
if (fs.existsSync(chatServicePath)) {
  console.log('\nChecking chat.service.ts for duplicate properties in ChatMessage interface...');
  let chatServiceContent = fs.readFileSync(chatServicePath, 'utf8');

  // Extract ChatMessage interface
  const interfaceRegex = /export\s+interface\s+ChatMessage\s+{([\s\S]*?)}/;
  const interfaceMatch = interfaceRegex.exec(chatServiceContent);

  if (interfaceMatch) {
    const interfaceContent = interfaceMatch[1];

    // Check for duplicate properties
    const propertyRegex = /\s+(\w+)\??:/g;
    const properties = new Map();
    let propMatch;
    let hasDuplicates = false;

    while ((propMatch = propertyRegex.exec(interfaceContent)) !== null) {
      const propName = propMatch[1];
      if (properties.has(propName)) {
        hasDuplicates = true;
        console.log(
          `⚠️ Found duplicate property '${propName}' in ChatMessage interface. Fixing...`,
        );
      } else {
        properties.set(propName, true);
      }
    }

    if (hasDuplicates) {
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
      chatServiceContent = chatServiceContent.replace(
        interfaceMatch[0],
        updatedChatMessageInterface,
      );

      fs.writeFileSync(chatServicePath, chatServiceContent);
      console.log('✅ Fixed duplicate properties in ChatMessage interface');
    } else {
      console.log('✅ No duplicate properties found in ChatMessage interface');
    }
  } else {
    console.error('❌ Could not find ChatMessage interface in chat.service.ts');
  }
} else {
  console.error(`❌ Chat service file not found: ${chatServicePath}`);
}

console.log('\n✅ All checks completed!');
