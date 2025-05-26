#!/usr/bin/env node

/**
 * Phase 2 Manual Fixes Script
 * 
 * This script handles the manual fixes needed after the automated Phase 2 migration:
 * 1. Fix broken p-button elements
 * 2. Replace nbInput with pInputText
 * 3. Convert nb-option to options arrays (requires TypeScript updates)
 * 4. Fix remaining nb-icon usage
 * 5. Fix mixed card usage
 * 6. Update validation classes
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const config = {
  srcPath: 'src',
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
  backup: process.argv.includes('--backup'),
};

// Statistics
const stats = {
  filesProcessed: 0,
  filesModified: 0,
  fixesApplied: 0,
  errors: [],
};

// Logging utility
function log(message, type = 'info') {
  const prefix = {
    info: '📝',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    verbose: '🔍'
  }[type] || '📝';
  
  if (type === 'verbose' && !config.verbose) return;
  console.log(`${prefix} ${message}`);
}

// Find all HTML files
function findFiles(pattern) {
  const fullPattern = path.join(config.srcPath, pattern);
  return glob.sync(fullPattern);
}

// Manual fix patterns
const manualFixes = [
  // Fix broken p-button elements
  {
    name: 'Fix broken p-button elements',
    pattern: /<p-button><\/p-button>\s*([^<]*(?:<nb-icon[^>]*>[^<]*<\/nb-icon>)?[^<]*)\s*<\/button>/g,
    replacement: (match, content) => {
      // Extract icon and text
      const iconMatch = content.match(/<nb-icon[^>]*icon="([^"]*)"[^>]*><\/nb-icon>/);
      const text = content.replace(/<nb-icon[^>]*>[^<]*<\/nb-icon>/, '').trim();
      
      const icon = iconMatch ? iconMatch[1].replace('-outline', '') : '';
      const primeIcon = iconMap[icon] || `pi pi-${icon}`;
      
      return `<p-button label="${text}" ${icon ? `icon="${primeIcon}"` : ''}></p-button>`;
    }
  },
  
  // Replace nbInput with pInputText
  {
    name: 'Replace nbInput with pInputText',
    pattern: /nbInput\s+fullWidth/g,
    replacement: 'pInputText'
  },
  
  // Fix status attributes to class bindings
  {
    name: 'Fix validation status to classes',
    pattern: /\[status\]="[^"]*\?\s*'danger'\s*:\s*'basic'"/g,
    replacement: '[class.ng-invalid]="$1"'
  },
  
  // Replace nb-icon with PrimeNG icons
  {
    name: 'Replace nb-icon with PrimeNG icons',
    pattern: /<nb-icon\s+icon="([^"]*)"[^>]*><\/nb-icon>/g,
    replacement: (match, iconName) => {
      const primeIcon = iconMap[iconName.replace('-outline', '')] || `pi pi-${iconName.replace('-outline', '')}`;
      return `<i class="${primeIcon}"></i>`;
    }
  },
  
  // Fix remaining nb-card usage
  {
    name: 'Fix remaining nb-card usage',
    pattern: /<\/nb-card>/g,
    replacement: '</p-card>'
  },
  
  // Fix textarea nbInput
  {
    name: 'Fix textarea nbInput',
    pattern: /<textarea\s+nbInput\s+fullWidth/g,
    replacement: '<textarea pInputTextarea'
  },
  
  // Remove nb-option elements (will need TypeScript updates)
  {
    name: 'Mark nb-option for manual conversion',
    pattern: /<nb-option[^>]*>([^<]*)<\/nb-option>/g,
    replacement: '<!-- TODO: Convert to options array: $1 -->'
  }
];

// Icon mapping from Nebular to PrimeNG
const iconMap = {
  'save': 'pi pi-save',
  'person': 'pi pi-user',
  'lock': 'pi pi-lock',
  'bell': 'pi pi-bell',
  'shield': 'pi pi-shield',
  'monitor': 'pi pi-desktop',
  'keypad': 'pi pi-key',
  'trash-2': 'pi pi-trash',
  'undo': 'pi pi-undo',
  'checkmark': 'pi pi-check',
  'close': 'pi pi-times',
  'edit': 'pi pi-pencil',
  'plus': 'pi pi-plus',
  'minus': 'pi pi-minus',
  'search': 'pi pi-search',
  'refresh': 'pi pi-refresh',
  'download': 'pi pi-download',
  'upload': 'pi pi-upload',
  'home': 'pi pi-home',
  'settings': 'pi pi-cog',
  'menu': 'pi pi-bars',
  'arrow-back': 'pi pi-arrow-left',
  'arrow-forward': 'pi pi-arrow-right',
  'chevron-left': 'pi pi-chevron-left',
  'chevron-right': 'pi pi-chevron-right',
  'chevron-up': 'pi pi-chevron-up',
  'chevron-down': 'pi pi-chevron-down'
};

// Apply manual fixes to a file
function applyManualFixes(filePath) {
  try {
    stats.filesProcessed++;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fixCount = 0;
    
    // Apply each fix pattern
    manualFixes.forEach(fix => {
      const originalContent = content;
      
      if (typeof fix.replacement === 'function') {
        content = content.replace(fix.pattern, fix.replacement);
      } else {
        content = content.replace(fix.pattern, fix.replacement);
      }
      
      if (content !== originalContent) {
        modified = true;
        fixCount++;
        log(`Applied fix: ${fix.name} in ${filePath}`, 'verbose');
      }
    });
    
    if (modified) {
      stats.filesModified++;
      stats.fixesApplied += fixCount;
      
      if (config.backup) {
        const backupPath = `${filePath}.backup.${Date.now()}`;
        fs.writeFileSync(backupPath, fs.readFileSync(filePath));
        log(`Created backup: ${backupPath}`, 'verbose');
      }
      
      if (!config.dryRun) {
        fs.writeFileSync(filePath, content);
        log(`Updated: ${filePath}`, 'success');
      } else {
        log(`[DRY RUN] Would update: ${filePath}`, 'verbose');
      }
    }
    
  } catch (error) {
    stats.errors.push({ file: filePath, error: error.message });
    log(`Error processing ${filePath}: ${error.message}`, 'error');
  }
}

// Main execution
function main() {
  log(`🚀 Starting Phase 2 manual fixes`, 'info');
  log(`Configuration: ${JSON.stringify(config, null, 2)}`, 'verbose');
  
  const htmlFiles = findFiles('**/*.component.html');
  log(`Found ${htmlFiles.length} HTML template files`, 'info');
  
  if (config.dryRun) {
    log('🔍 DRY RUN MODE - No files will be modified', 'warning');
  }
  
  htmlFiles.forEach(applyManualFixes);
  
  // Generate summary
  log(`\n📊 Manual Fixes Summary:`, 'info');
  log(`Files processed: ${stats.filesProcessed}`, 'info');
  log(`Files modified: ${stats.filesModified}`, 'info');
  log(`Fixes applied: ${stats.fixesApplied}`, 'info');
  log(`Errors: ${stats.errors.length}`, stats.errors.length > 0 ? 'error' : 'info');
  
  if (stats.errors.length > 0) {
    log('\n❌ Errors encountered:', 'error');
    stats.errors.forEach(({ file, error }) => {
      log(`  ${file}: ${error}`, 'error');
    });
  }
  
  if (config.dryRun) {
    log('\n⚠️  This was a dry run. No files were actually modified.', 'warning');
    log('Remove --dry-run flag to apply changes.', 'warning');
  } else {
    log('\n✅ Manual fixes complete!', 'success');
    log('\n📋 Next steps:', 'info');
    log('1. Update TypeScript components to add options arrays for dropdowns', 'info');
    log('2. Add missing PrimeNG module imports', 'info');
    log('3. Test components for functionality', 'info');
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { applyManualFixes, manualFixes, iconMap };
