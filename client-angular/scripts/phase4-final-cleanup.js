#!/usr/bin/env node

/**
 * Phase 4 Final Cleanup Script
 * 
 * This script handles the final cleanup and consolidation:
 * 1. Convert remaining nb-icon components to PrimeIcons
 * 2. Handle specialized components (nb-hint, nb-datepicker, etc.)
 * 3. Convert remaining nb-option elements
 * 4. Clean up form field labels
 * 5. Handle remaining alerts and notifications
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
  componentsReplaced: 0,
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

// Final cleanup patterns
const finalCleanupPatterns = [
  // Remaining nb-icon components
  {
    name: 'nb-icon to PrimeIcons',
    pattern: /<nb-icon\s+icon="([^"]*)"[^>]*><\/nb-icon>/g,
    replacement: (match, iconName) => {
      const iconMap = {
        'menu-2-outline': 'pi pi-bars',
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
        'edit-outline': 'pi pi-pencil',
        'trash-2-outline': 'pi pi-trash',
        'save-outline': 'pi pi-save',
        'lock-outline': 'pi pi-lock',
        'shield-outline': 'pi pi-shield',
        'info-outline': 'pi pi-info-circle',
        'calendar-outline': 'pi pi-calendar',
        'map-outline': 'pi pi-map',
        'email-outline': 'pi pi-envelope',
        'phone-outline': 'pi pi-phone'
      };
      const primeIcon = iconMap[iconName] || `pi pi-${iconName.replace('-outline', '')}`;
      return `<i class="${primeIcon}"></i>`;
    },
    notes: 'Convert remaining nb-icon to PrimeIcons'
  },
  
  // nb-hint to p-tooltip
  {
    name: 'nb-hint to p-tooltip',
    pattern: /<nb-hint([^>]*?)>(.*?)<\/nb-hint>/gs,
    replacement: '<span pTooltip="$2"$1><i class="pi pi-info-circle"></i></span>',
    notes: 'Convert hint to PrimeNG tooltip'
  },
  
  // nb-datepicker to p-calendar
  {
    name: 'nb-datepicker to p-calendar',
    pattern: /<nb-datepicker([^>]*)><\/nb-datepicker>/g,
    replacement: '<p-calendar$1></p-calendar>',
    notes: 'Convert datepicker to PrimeNG calendar'
  },
  
  // nb-toggle to p-inputSwitch
  {
    name: 'nb-toggle to p-inputSwitch',
    pattern: /<nb-toggle([^>]*)><\/nb-toggle>/g,
    replacement: '<p-inputSwitch$1></p-inputSwitch>',
    notes: 'Convert toggle to PrimeNG input switch'
  },
  
  // nb-paginator to p-paginator
  {
    name: 'nb-paginator to p-paginator',
    pattern: /<nb-paginator([^>]*)><\/nb-paginator>/g,
    replacement: '<p-paginator$1></p-paginator>',
    notes: 'Convert paginator to PrimeNG paginator'
  },
  
  // nb-option to comment (needs manual conversion)
  {
    name: 'nb-option to comment',
    pattern: /<nb-option([^>]*?)>(.*?)<\/nb-option>/gs,
    replacement: '<!-- TODO: Convert to options array: $2 -->',
    notes: 'Mark nb-option for manual conversion'
  },
  
  // nb-alert to p-message
  {
    name: 'nb-alert to p-message',
    pattern: /<nb-alert([^>]*?)>(.*?)<\/nb-alert>/gs,
    replacement: '<p-message$1 text="$2"></p-message>',
    notes: 'Convert alert to PrimeNG message'
  },
  
  // nb-spinner to p-progressSpinner
  {
    name: 'nb-spinner to p-progressSpinner',
    pattern: /<nb-spinner([^>]*)><\/nb-spinner>/g,
    replacement: '<p-progressSpinner$1></p-progressSpinner>',
    notes: 'Convert spinner to PrimeNG progress spinner'
  },
  
  // nb-checkbox to p-checkbox
  {
    name: 'nb-checkbox to p-checkbox',
    pattern: /<nb-checkbox([^>]*)><\/nb-checkbox>/g,
    replacement: '<p-checkbox$1></p-checkbox>',
    notes: 'Convert checkbox to PrimeNG checkbox'
  },
  
  // nb-form-field-label to label
  {
    name: 'nb-form-field-label to label',
    pattern: /<nb-form-field-label([^>]*?)>(.*?)<\/nb-form-field-label>/gs,
    replacement: '<label$1>$2</label>',
    notes: 'Convert form field label to semantic label'
  },
  
  // nb-menu-item to p-menuitem
  {
    name: 'nb-menu-item to p-menuitem',
    pattern: /<nb-menu-item([^>]*?)>(.*?)<\/nb-menu-item>/gs,
    replacement: '<p-menuitem$1>$2</p-menuitem>',
    notes: 'Convert menu item to PrimeNG menu item'
  },
  
  // nb-action to button
  {
    name: 'nb-action to button',
    pattern: /<nb-action([^>]*?)>(.*?)<\/nb-action>/gs,
    replacement: '<button class="action-button"$1>$2</button>',
    notes: 'Convert action to semantic button'
  },
  
  // nb-actions to div
  {
    name: 'nb-actions to div',
    pattern: /<nb-actions([^>]*?)>(.*?)<\/nb-actions>/gs,
    replacement: '<div class="actions-container"$1>$2</div>',
    notes: 'Convert actions container to div'
  },
  
  // nb-breadcrumb to p-breadcrumb item
  {
    name: 'nb-breadcrumb to p-breadcrumb item',
    pattern: /<nb-breadcrumb([^>]*?)>(.*?)<\/nb-breadcrumb>/gs,
    replacement: '<li class="breadcrumb-item"$1>$2</li>',
    notes: 'Convert breadcrumb to list item'
  },
  
  // nb-breadcrumbs to p-breadcrumb
  {
    name: 'nb-breadcrumbs to p-breadcrumb',
    pattern: /<nb-breadcrumbs([^>]*?)>(.*?)<\/nb-breadcrumbs>/gs,
    replacement: '<p-breadcrumb$1>$2</p-breadcrumb>',
    notes: 'Convert breadcrumbs to PrimeNG breadcrumb'
  },
  
  // nb-icon-button to p-button
  {
    name: 'nb-icon-button to p-button',
    pattern: /<nb-icon-button([^>]*?)>(.*?)<\/nb-icon-button>/gs,
    replacement: '<p-button icon="pi pi-info" size="small"$1></p-button>',
    notes: 'Convert icon button to PrimeNG button'
  },
  
  // nb-chat to div
  {
    name: 'nb-chat to div',
    pattern: /<nb-chat([^>]*?)>(.*?)<\/nb-chat>/gs,
    replacement: '<div class="chat-container"$1>$2</div>',
    notes: 'Convert chat to div container'
  },
  
  // nb-chat-message to div
  {
    name: 'nb-chat-message to div',
    pattern: /<nb-chat-message([^>]*?)>(.*?)<\/nb-chat-message>/gs,
    replacement: '<div class="chat-message"$1>$2</div>',
    notes: 'Convert chat message to div'
  }
];

// Apply cleanup patterns to a file
function applyFinalCleanup(filePath) {
  try {
    stats.filesProcessed++;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let componentCount = 0;
    
    // Apply each cleanup pattern
    finalCleanupPatterns.forEach(pattern => {
      const originalContent = content;
      
      if (typeof pattern.replacement === 'function') {
        content = content.replace(pattern.pattern, pattern.replacement);
      } else {
        content = content.replace(pattern.pattern, pattern.replacement);
      }
      
      if (content !== originalContent) {
        modified = true;
        const matches = originalContent.match(pattern.pattern);
        if (matches) {
          componentCount += matches.length;
          log(`Applied ${pattern.name}: ${matches.length} replacements in ${filePath}`, 'verbose');
        }
      }
    });
    
    if (modified) {
      stats.filesModified++;
      stats.componentsReplaced += componentCount;
      
      if (config.backup) {
        const backupPath = `${filePath}.backup.${Date.now()}`;
        fs.writeFileSync(backupPath, fs.readFileSync(filePath));
        log(`Created backup: ${backupPath}`, 'verbose');
      }
      
      if (!config.dryRun) {
        fs.writeFileSync(filePath, content);
        log(`Updated: ${filePath} (${componentCount} components)`, 'success');
      } else {
        log(`[DRY RUN] Would update: ${filePath} (${componentCount} components)`, 'verbose');
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
  log(`🚀 Starting Phase 4 final cleanup`, 'info');
  log(`Configuration: ${JSON.stringify(config, null, 2)}`, 'verbose');
  
  const htmlFiles = findFiles();
  log(`Found ${htmlFiles.length} HTML template files`, 'info');
  
  if (config.dryRun) {
    log('🔍 DRY RUN MODE - No files will be modified', 'warning');
  }
  
  htmlFiles.forEach(applyFinalCleanup);
  
  // Generate summary
  log(`\n📊 Phase 4 Cleanup Summary:`, 'info');
  log(`Files processed: ${stats.filesProcessed}`, 'info');
  log(`Files modified: ${stats.filesModified}`, 'info');
  log(`Components replaced: ${stats.componentsReplaced}`, 'info');
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
    log('\n✅ Phase 4 cleanup complete!', 'success');
    log('\n📋 Next steps:', 'info');
    log('1. Update TypeScript components for new PrimeNG modules', 'info');
    log('2. Handle specialized custom components manually', 'info');
    log('3. Optimize bundle and dependencies', 'info');
    log('4. Finalize documentation', 'info');
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { applyFinalCleanup, finalCleanupPatterns };
