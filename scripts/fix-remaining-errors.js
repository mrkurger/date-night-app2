#!/usr/bin/env node

/**
 * This script fixes the remaining parsing errors in Angular component files
 * that weren't fixed by the previous scripts.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const clientDir = path.join(rootDir, 'client-angular');

// List of files with known parsing errors
const filesToFix = [
  'src/app/features/admin/admin.module.ts',
  'src/app/features/admin/content-moderation/moderation-modal/moderation-modal.component.spec.ts',
  'src/app/features/chat/chat-room/chat-room.component.ts',
  'src/app/features/chat/chat.component.ts',
  'src/app/shared/components/button/button.component.ts',
  'src/app/shared/components/calendar/calendar.component.ts',
  'src/app/shared/components/card/card.component.ts',
  'src/app/shared/components/chat-message/chat-message.component.ts',
  'src/app/shared/components/checkbox/checkbox.component.ts',
  'src/app/shared/components/feature-tour/feature-tour.component.ts',
  'src/app/shared/components/icon/icon.component.ts',
  'src/app/shared/components/input/input.component.ts',
  'src/app/shared/components/map/map.component.ts',
  'src/app/shared/components/select/select.component.ts',
  'src/app/shared/emerald/components/card-grid/card-grid.component.ts',
];

// Process each file
async function processFiles() {
  console.log('Starting to fix remaining parsing errors...');

  for (const relativeFilePath of filesToFix) {
    const filePath = path.join(clientDir, relativeFilePath);

    try {
      if (fs.existsSync(filePath)) {
        console.log(`Processing ${relativeFilePath}...`);
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Fix 1: Fix erroneous commas in component decorators
        const pattern1 = /(\},|\],|`,)\s*,\s*(schemas\s*:|changeDetection\s*:)/g;
        if (pattern1.test(content)) {
          content = content.replace(pattern1, '$1\n  $2');
          modified = true;
        }

        // Fix 2: Fix import statements with erroneous commas
        const pattern2 = /import\s*\{[^}]*,\s*,\s*([^}]*)\}\s*from/g;
        if (pattern2.test(content)) {
          content = content.replace(pattern2, (match, p1) => {
            return match.replace(/, ,/, ', ');
          });
          modified = true;
        }

        // Fix 3: Fix specific import pattern with comma before CUSTOM_ELEMENTS_SCHEMA
        const pattern3 =
          /(ChangeDetectionStrategy|OnDestroy|AfterViewInit|OnInit),\s*,\s*(CUSTOM_ELEMENTS_SCHEMA)/g;
        if (pattern3.test(content)) {
          content = content.replace(pattern3, '$1,\n  $2');
          modified = true;
        }

        // Write the fixed content back to the file
        if (modified) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`✅ Fixed ${relativeFilePath}`);
        } else {
          console.log(`⚠️ No changes made to ${relativeFilePath}`);
        }
      } else {
        console.log(`⚠️ File not found: ${relativeFilePath}`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${relativeFilePath}:`, error);
    }
  }

  console.log('Completed fixing remaining parsing errors.');
}

// Run the script
processFiles();
