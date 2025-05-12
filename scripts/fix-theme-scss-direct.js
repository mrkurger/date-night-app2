#!/usr/bin/env node

/**
 * This script directly fixes the theme.scss file by writing a new version
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const themeScssPath = path.join(rootDir, 'client-angular', 'src', 'app', 'theme.scss');

// The correct content for theme.scss
const correctContent = `@use '@nebular/theme/styles/theming' as *;
@use '@nebular/theme/styles/themes/default';

$nb-themes: nb-register-theme(
  (
    // add your custom variables here
  ), 
  default, 
  default
);

@include nb-install() {
  @include nb-theme-global();
  @include nb-auth-global();
}
`;

// Write the file
try {
  fs.writeFileSync(themeScssPath, correctContent, 'utf8');
  console.log('✅ Successfully fixed theme.scss');
} catch (error) {
  console.error('❌ Error fixing theme.scss:', error);
}
