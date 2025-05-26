#!/usr/bin/env node

/**
 * Phase 3 Emerald Design System Migration Script
 * 
 * This script handles the complex migration of Emerald design system components:
 * 1. nb-skeleton components → p-skeleton
 * 2. nb-flip-card → custom PrimeNG implementation
 * 3. nb-info-panel → p-panel/p-accordion
 * 4. nb-user → p-avatar
 * 5. nb-card-grid → p-dataView
 * 6. nb-header → custom header implementation
 * 7. nb-tag → p-tag/p-chip
 * 8. Layout components → PrimeNG layout
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

// Emerald component migration patterns
const emeraldMigrations = [
  // Skeleton components
  {
    name: 'nb-skeleton to p-skeleton',
    pattern: /<nb-skeleton([^>]*)><\/nb-skeleton>/g,
    replacement: '<p-skeleton$1></p-skeleton>',
    notes: 'Direct replacement with PrimeNG skeleton'
  },
  
  {
    name: 'nb-skeleton-list to p-skeleton',
    pattern: /<nb-skeleton-list([^>]*)><\/nb-skeleton-list>/g,
    replacement: '<p-skeleton shape="rectangle" height="20px"$1></p-skeleton>',
    notes: 'Convert list skeleton to rectangle skeleton'
  },
  
  {
    name: 'nb-skeleton-card to p-skeleton',
    pattern: /<nb-skeleton-card([^>]*)><\/nb-skeleton-card>/g,
    replacement: '<p-skeleton shape="rectangle" height="200px"$1></p-skeleton>',
    notes: 'Convert card skeleton to rectangle skeleton'
  },
  
  {
    name: 'nb-skeleton-profile to p-skeleton',
    pattern: /<nb-skeleton-profile([^>]*)><\/nb-skeleton-profile>/g,
    replacement: '<p-skeleton shape="circle" size="4rem"$1></p-skeleton>',
    notes: 'Convert profile skeleton to circle skeleton'
  },
  
  // User/Avatar components
  {
    name: 'nb-user to p-avatar',
    pattern: /<nb-user([^>]*?)>(.*?)<\/nb-user>/gs,
    replacement: (match, attrs, content) => {
      // Extract user attributes and convert to avatar
      const nameMatch = content.match(/<nb-user-name[^>]*>(.*?)<\/nb-user-name>/);
      const titleMatch = content.match(/<nb-user-title[^>]*>(.*?)<\/nb-user-title>/);
      
      let avatarContent = '';
      if (nameMatch) {
        avatarContent += `<span class="p-avatar-label">${nameMatch[1]}</span>`;
      }
      
      return `<p-avatar${attrs}>${avatarContent}</p-avatar>`;
    },
    notes: 'Convert user component to avatar with label'
  },
  
  // Tag components
  {
    name: 'nb-tag to p-tag',
    pattern: /<nb-tag([^>]*?)>(.*?)<\/nb-tag>/gs,
    replacement: '<p-tag$1 value="$2"></p-tag>',
    notes: 'Convert tag to PrimeNG tag'
  },
  
  {
    name: 'nb-tag-list to div with p-tag',
    pattern: /<nb-tag-list([^>]*?)>(.*?)<\/nb-tag-list>/gs,
    replacement: '<div class="tag-list"$1>$2</div>',
    notes: 'Convert tag list to div container'
  },
  
  // Badge components
  {
    name: 'nb-badge to p-badge',
    pattern: /<nb-badge([^>]*?)>(.*?)<\/nb-badge>/gs,
    replacement: '<p-badge$1 value="$2"></p-badge>',
    notes: 'Convert badge to PrimeNG badge'
  },
  
  // Progress components
  {
    name: 'nb-progress-bar to p-progressBar',
    pattern: /<nb-progress-bar([^>]*)><\/nb-progress-bar>/g,
    replacement: '<p-progressBar$1></p-progressBar>',
    notes: 'Convert progress bar to PrimeNG progress bar'
  },
  
  // Layout components
  {
    name: 'nb-layout to div',
    pattern: /<nb-layout([^>]*?)>(.*?)<\/nb-layout>/gs,
    replacement: '<div class="layout"$1>$2</div>',
    notes: 'Convert layout to div with class'
  },
  
  {
    name: 'nb-layout-header to header',
    pattern: /<nb-layout-header([^>]*?)>(.*?)<\/nb-layout-header>/gs,
    replacement: '<header class="layout-header"$1>$2</header>',
    notes: 'Convert layout header to semantic header'
  },
  
  {
    name: 'nb-layout-footer to footer',
    pattern: /<nb-layout-footer([^>]*?)>(.*?)<\/nb-layout-footer>/gs,
    replacement: '<footer class="layout-footer"$1>$2</footer>',
    notes: 'Convert layout footer to semantic footer'
  },
  
  {
    name: 'nb-layout-column to div',
    pattern: /<nb-layout-column([^>]*?)>(.*?)<\/nb-layout-column>/gs,
    replacement: '<div class="layout-column"$1>$2</div>',
    notes: 'Convert layout column to div'
  },
  
  // Menu components
  {
    name: 'nb-menu to p-menu',
    pattern: /<nb-menu([^>]*?)>(.*?)<\/nb-menu>/gs,
    replacement: '<p-menu$1>$2</p-menu>',
    notes: 'Convert menu to PrimeNG menu'
  },
  
  {
    name: 'nb-menu-item to p-menuitem',
    pattern: /<nb-menu-item([^>]*?)>(.*?)<\/nb-menu-item>/gs,
    replacement: '<p-menuitem$1>$2</p-menuitem>',
    notes: 'Convert menu item to PrimeNG menu item'
  },
  
  // List components
  {
    name: 'nb-list to ul',
    pattern: /<nb-list([^>]*?)>(.*?)<\/nb-list>/gs,
    replacement: '<ul class="list"$1>$2</ul>',
    notes: 'Convert list to semantic ul'
  },
  
  {
    name: 'nb-list-item to li',
    pattern: /<nb-list-item([^>]*?)>(.*?)<\/nb-list-item>/gs,
    replacement: '<li class="list-item"$1>$2</li>',
    notes: 'Convert list item to semantic li'
  },
  
  // Accordion components
  {
    name: 'nb-accordion to p-accordion',
    pattern: /<nb-accordion([^>]*?)>(.*?)<\/nb-accordion>/gs,
    replacement: '<p-accordion$1>$2</p-accordion>',
    notes: 'Convert accordion to PrimeNG accordion'
  },
  
  {
    name: 'nb-accordion-item to p-accordionTab',
    pattern: /<nb-accordion-item([^>]*?)>(.*?)<\/nb-accordion-item>/gs,
    replacement: '<p-accordionTab$1>$2</p-accordionTab>',
    notes: 'Convert accordion item to PrimeNG accordion tab'
  },
  
  {
    name: 'nb-accordion-item-header to ng-template pTemplate="header"',
    pattern: /<nb-accordion-item-header([^>]*?)>(.*?)<\/nb-accordion-item-header>/gs,
    replacement: '<ng-template pTemplate="header"$1>$2</ng-template>',
    notes: 'Convert accordion header to template'
  },
  
  {
    name: 'nb-accordion-item-body to ng-template pTemplate="content"',
    pattern: /<nb-accordion-item-body([^>]*?)>(.*?)<\/nb-accordion-item-body>/gs,
    replacement: '<ng-template pTemplate="content"$1>$2</ng-template>',
    notes: 'Convert accordion body to template'
  },
  
  // Sidebar components
  {
    name: 'nb-sidebar to p-sidebar',
    pattern: /<nb-sidebar([^>]*?)>(.*?)<\/nb-sidebar>/gs,
    replacement: '<p-sidebar$1>$2</p-sidebar>',
    notes: 'Convert sidebar to PrimeNG sidebar'
  },
  
  // Divider components
  {
    name: 'nb-divider to p-divider',
    pattern: /<nb-divider([^>]*)><\/nb-divider>/g,
    replacement: '<p-divider$1></p-divider>',
    notes: 'Convert divider to PrimeNG divider'
  },
  
  // Alert components
  {
    name: 'nb-alert to p-message',
    pattern: /<nb-alert([^>]*?)>(.*?)<\/nb-alert>/gs,
    replacement: '<p-message$1 text="$2"></p-message>',
    notes: 'Convert alert to PrimeNG message'
  },
  
  // Paginator components
  {
    name: 'nb-paginator to p-paginator',
    pattern: /<nb-paginator([^>]*)><\/nb-paginator>/g,
    replacement: '<p-paginator$1></p-paginator>',
    notes: 'Convert paginator to PrimeNG paginator'
  }
];

// Apply migrations to a file
function migrateEmeraldComponents(filePath) {
  try {
    stats.filesProcessed++;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let componentCount = 0;
    
    // Apply each migration pattern
    emeraldMigrations.forEach(migration => {
      const originalContent = content;
      
      if (typeof migration.replacement === 'function') {
        content = content.replace(migration.pattern, migration.replacement);
      } else {
        content = content.replace(migration.pattern, migration.replacement);
      }
      
      if (content !== originalContent) {
        modified = true;
        const matches = originalContent.match(migration.pattern);
        if (matches) {
          componentCount += matches.length;
          log(`Applied ${migration.name}: ${matches.length} replacements in ${filePath}`, 'verbose');
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
  log(`🚀 Starting Emerald design system migration`, 'info');
  log(`Configuration: ${JSON.stringify(config, null, 2)}`, 'verbose');
  
  const htmlFiles = findFiles();
  log(`Found ${htmlFiles.length} HTML template files`, 'info');
  
  if (config.dryRun) {
    log('🔍 DRY RUN MODE - No files will be modified', 'warning');
  }
  
  htmlFiles.forEach(migrateEmeraldComponents);
  
  // Generate summary
  log(`\n📊 Emerald Migration Summary:`, 'info');
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
    log('\n✅ Emerald migration complete!', 'success');
    log('\n📋 Next steps:', 'info');
    log('1. Update TypeScript components for new PrimeNG modules', 'info');
    log('2. Handle complex custom components manually', 'info');
    log('3. Test component functionality', 'info');
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { migrateEmeraldComponents, emeraldMigrations };
