#!/usr/bin/env node

/**
 * Phase 3 Icon Cleanup Script
 * 
 * This script handles the final cleanup of remaining nb-icon components
 * and converts them to PrimeIcons.
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
  iconsReplaced: 0,
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

// Icon mapping from Nebular/Eva to PrimeIcons
const iconMap = {
  // Common icons
  'menu-2-outline': 'pi pi-bars',
  'menu-outline': 'pi pi-bars',
  'search-outline': 'pi pi-search',
  'person-outline': 'pi pi-user',
  'bell-outline': 'pi pi-bell',
  'settings-outline': 'pi pi-cog',
  'home-outline': 'pi pi-home',
  'heart-outline': 'pi pi-heart',
  'star-outline': 'pi pi-star',
  'plus-outline': 'pi pi-plus',
  'minus-outline': 'pi pi-minus',
  'close-outline': 'pi pi-times',
  'checkmark-outline': 'pi pi-check',
  'arrow-back-outline': 'pi pi-arrow-left',
  'arrow-forward-outline': 'pi pi-arrow-right',
  'chevron-left-outline': 'pi pi-chevron-left',
  'chevron-right-outline': 'pi pi-chevron-right',
  'chevron-up-outline': 'pi pi-chevron-up',
  'chevron-down-outline': 'pi pi-chevron-down',
  'edit-outline': 'pi pi-pencil',
  'trash-2-outline': 'pi pi-trash',
  'download-outline': 'pi pi-download',
  'upload-outline': 'pi pi-upload',
  'refresh-outline': 'pi pi-refresh',
  'save-outline': 'pi pi-save',
  'copy-outline': 'pi pi-copy',
  'share-outline': 'pi pi-share-alt',
  'link-outline': 'pi pi-link',
  'external-link-outline': 'pi pi-external-link',
  'eye-outline': 'pi pi-eye',
  'eye-off-outline': 'pi pi-eye-slash',
  'lock-outline': 'pi pi-lock',
  'unlock-outline': 'pi pi-unlock',
  'shield-outline': 'pi pi-shield',
  'info-outline': 'pi pi-info-circle',
  'alert-triangle-outline': 'pi pi-exclamation-triangle',
  'alert-circle-outline': 'pi pi-exclamation-circle',
  'question-mark-outline': 'pi pi-question-circle',
  'calendar-outline': 'pi pi-calendar',
  'clock-outline': 'pi pi-clock',
  'map-outline': 'pi pi-map',
  'pin-outline': 'pi pi-map-marker',
  'phone-outline': 'pi pi-phone',
  'email-outline': 'pi pi-envelope',
  'message-circle-outline': 'pi pi-comment',
  'message-square-outline': 'pi pi-comments',
  'camera-outline': 'pi pi-camera',
  'image-outline': 'pi pi-image',
  'video-outline': 'pi pi-video',
  'music-outline': 'pi pi-volume-up',
  'file-outline': 'pi pi-file',
  'folder-outline': 'pi pi-folder',
  'archive-outline': 'pi pi-archive',
  'grid-outline': 'pi pi-th',
  'list-outline': 'pi pi-list',
  'filter-outline': 'pi pi-filter',
  'sort-ascending-outline': 'pi pi-sort-amount-up',
  'sort-descending-outline': 'pi pi-sort-amount-down',
  'more-horizontal-outline': 'pi pi-ellipsis-h',
  'more-vertical-outline': 'pi pi-ellipsis-v',
  
  // Without -outline suffix
  'menu-2': 'pi pi-bars',
  'menu': 'pi pi-bars',
  'search': 'pi pi-search',
  'person': 'pi pi-user',
  'bell': 'pi pi-bell',
  'settings': 'pi pi-cog',
  'home': 'pi pi-home',
  'heart': 'pi pi-heart',
  'star': 'pi pi-star',
  'plus': 'pi pi-plus',
  'minus': 'pi pi-minus',
  'close': 'pi pi-times',
  'checkmark': 'pi pi-check',
  'arrow-back': 'pi pi-arrow-left',
  'arrow-forward': 'pi pi-arrow-right',
  'chevron-left': 'pi pi-chevron-left',
  'chevron-right': 'pi pi-chevron-right',
  'chevron-up': 'pi pi-chevron-up',
  'chevron-down': 'pi pi-chevron-down',
  'edit': 'pi pi-pencil',
  'trash-2': 'pi pi-trash',
  'download': 'pi pi-download',
  'upload': 'pi pi-upload',
  'refresh': 'pi pi-refresh',
  'save': 'pi pi-save',
  'copy': 'pi pi-copy',
  'share': 'pi pi-share-alt',
  'link': 'pi pi-link',
  'external-link': 'pi pi-external-link',
  'eye': 'pi pi-eye',
  'eye-off': 'pi pi-eye-slash',
  'lock': 'pi pi-lock',
  'unlock': 'pi pi-unlock',
  'shield': 'pi pi-shield',
  'info': 'pi pi-info-circle',
  'alert-triangle': 'pi pi-exclamation-triangle',
  'alert-circle': 'pi pi-exclamation-circle',
  'question-mark': 'pi pi-question-circle',
  'calendar': 'pi pi-calendar',
  'clock': 'pi pi-clock',
  'map': 'pi pi-map',
  'pin': 'pi pi-map-marker',
  'phone': 'pi pi-phone',
  'email': 'pi pi-envelope',
  'message-circle': 'pi pi-comment',
  'message-square': 'pi pi-comments',
  'camera': 'pi pi-camera',
  'image': 'pi pi-image',
  'video': 'pi pi-video',
  'music': 'pi pi-volume-up',
  'file': 'pi pi-file',
  'folder': 'pi pi-folder',
  'archive': 'pi pi-archive',
  'grid': 'pi pi-th',
  'list': 'pi pi-list',
  'filter': 'pi pi-filter',
  'sort-ascending': 'pi pi-sort-amount-up',
  'sort-descending': 'pi pi-sort-amount-down',
  'more-horizontal': 'pi pi-ellipsis-h',
  'more-vertical': 'pi pi-ellipsis-v'
};

// Icon conversion patterns
const iconConversions = [
  // Standard nb-icon with icon attribute
  {
    name: 'nb-icon with icon attribute',
    pattern: /<nb-icon\s+icon="([^"]*)"[^>]*><\/nb-icon>/g,
    replacement: (match, iconName) => {
      const primeIcon = iconMap[iconName] || `pi pi-${iconName.replace('-outline', '')}`;
      return `<i class="${primeIcon}"></i>`;
    }
  },
  
  // nb-icon with [icon] binding
  {
    name: 'nb-icon with [icon] binding',
    pattern: /<nb-icon\s+\[icon\]="([^"]*)"[^>]*><\/nb-icon>/g,
    replacement: (match, iconBinding) => {
      // For dynamic bindings, we'll need to handle this in the component
      return `<i [class]="getIconClass(${iconBinding})"></i>`;
    }
  },
  
  // nb-icon with pack attribute
  {
    name: 'nb-icon with pack attribute',
    pattern: /<nb-icon\s+icon="([^"]*)"[^>]*pack="[^"]*"[^>]*><\/nb-icon>/g,
    replacement: (match, iconName) => {
      const primeIcon = iconMap[iconName] || `pi pi-${iconName.replace('-outline', '')}`;
      return `<i class="${primeIcon}"></i>`;
    }
  },
  
  // nb-icon with status attribute
  {
    name: 'nb-icon with status attribute',
    pattern: /<nb-icon\s+icon="([^"]*)"[^>]*status="([^"]*)"[^>]*><\/nb-icon>/g,
    replacement: (match, iconName, status) => {
      const primeIcon = iconMap[iconName] || `pi pi-${iconName.replace('-outline', '')}`;
      const statusClass = getStatusClass(status);
      return `<i class="${primeIcon} ${statusClass}"></i>`;
    }
  }
];

// Get status class for PrimeNG
function getStatusClass(status) {
  const statusMap = {
    'primary': 'text-blue-500',
    'success': 'text-green-500',
    'info': 'text-blue-400',
    'warning': 'text-yellow-500',
    'danger': 'text-red-500',
    'basic': 'text-gray-500'
  };
  return statusMap[status] || 'text-gray-500';
}

// Apply icon conversions to a file
function convertIcons(filePath) {
  try {
    stats.filesProcessed++;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let iconCount = 0;
    
    // Apply each conversion pattern
    iconConversions.forEach(conversion => {
      const originalContent = content;
      
      if (typeof conversion.replacement === 'function') {
        content = content.replace(conversion.pattern, conversion.replacement);
      } else {
        content = content.replace(conversion.pattern, conversion.replacement);
      }
      
      if (content !== originalContent) {
        modified = true;
        const matches = originalContent.match(conversion.pattern);
        if (matches) {
          iconCount += matches.length;
          log(`Applied ${conversion.name}: ${matches.length} replacements in ${filePath}`, 'verbose');
        }
      }
    });
    
    if (modified) {
      stats.filesModified++;
      stats.iconsReplaced += iconCount;
      
      if (config.backup) {
        const backupPath = `${filePath}.backup.${Date.now()}`;
        fs.writeFileSync(backupPath, fs.readFileSync(filePath));
        log(`Created backup: ${backupPath}`, 'verbose');
      }
      
      if (!config.dryRun) {
        fs.writeFileSync(filePath, content);
        log(`Updated: ${filePath} (${iconCount} icons)`, 'success');
      } else {
        log(`[DRY RUN] Would update: ${filePath} (${iconCount} icons)`, 'verbose');
      }
    }
    
  } catch (error) {
    stats.errors.push({ file: filePath, error: error.message });
    log(`Error processing ${filePath}: ${error.message}`, 'error');
  }
}

// Find all HTML files
function findFiles() {
  const pattern = path.join(config.srcPath, '**/*.component.html');
  return glob.sync(pattern);
}

// Main execution
function main() {
  log(`🚀 Starting icon cleanup migration`, 'info');
  log(`Configuration: ${JSON.stringify(config, null, 2)}`, 'verbose');
  
  const htmlFiles = findFiles();
  log(`Found ${htmlFiles.length} HTML template files`, 'info');
  
  if (config.dryRun) {
    log('🔍 DRY RUN MODE - No files will be modified', 'warning');
  }
  
  htmlFiles.forEach(convertIcons);
  
  // Generate summary
  log(`\n📊 Icon Cleanup Summary:`, 'info');
  log(`Files processed: ${stats.filesProcessed}`, 'info');
  log(`Files modified: ${stats.filesModified}`, 'info');
  log(`Icons replaced: ${stats.iconsReplaced}`, 'info');
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
    log('\n✅ Icon cleanup complete!', 'success');
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { convertIcons, iconConversions, iconMap };
