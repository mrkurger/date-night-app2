#!/usr/bin/env node

/**
 * This script fixes the theme.scss file in the Angular client
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const themeScssPath = path.join(rootDir, 'client-angular', 'src', 'app', 'theme.scss');

// Fix the theme.scss file
function fixThemeScss() {
  console.log('Fixing theme.scss file...');

  try {
    if (fs.existsSync(themeScssPath)) {
      const content = fs.readFileSync(themeScssPath, 'utf8');

      // Replace the problematic syntax with properly formatted syntax
      const fixedContent = `@use '@nebular/theme/styles/theming' as *;
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
}`;

      // Write the fixed content back to the file
      fs.writeFileSync(themeScssPath, fixedContent, 'utf8');
      console.log('✅ Fixed theme.scss file');
    } else {
      console.log('⚠️ theme.scss file not found');
    }
  } catch (error) {
    console.error('❌ Error fixing theme.scss:', error);
  }
}

// Run the script
fixThemeScss();
