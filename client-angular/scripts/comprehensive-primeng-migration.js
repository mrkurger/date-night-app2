#!/usr/bin/env node

/**
 * Comprehensive PrimeNG Migration Script - December 2024
 *
 * This script implements the systematic migration plan from the mixed UI framework
 * state (PrimeNG 35%, Nebular 45%, Custom 15%, Material 5%) to 100% PrimeNG.
 *
 * Usage: node scripts/comprehensive-primeng-migration.js [phase] [options]
 *
 * Migration Phases:
 * - phase1: Remove Angular Material components (Critical Priority - 1-2 weeks)
 * - phase2: Migrate Nebular components to PrimeNG (High Priority - 4-6 weeks)
 * - phase3: Replace custom components (Medium Priority - 6-8 weeks)
 * - icons: Migrate icon systems to PrimeIcons
 * - all: Run all phases sequentially
 *
 * Options:
 * - --dry-run: Preview changes without modifying files
 * - --verbose: Show detailed migration information
 * - --backup: Create backup files before modification
 * - --report: Generate migration report
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
  report: process.argv.includes('--report'),
  phase: process.argv[2] || 'phase1',
};

// Migration statistics
const stats = {
  filesProcessed: 0,
  filesModified: 0,
  componentsReplaced: 0,
  errors: [],
};

// Phase 1: Angular Material to PrimeNG mappings
const angularMaterialMappings = {
  'mat-date-range-input': {
    replacement: 'p-calendar',
    attributes: {
      selectionMode: 'range',
      '[showIcon]': 'true',
    },
    imports: ['CalendarModule'],
    notes: 'Requires range selection configuration and date handling updates',
  },
  'mat-date-range-picker': {
    replacement: 'p-calendar',
    attributes: {
      selectionMode: 'range',
    },
    imports: ['CalendarModule'],
  },
  'mat-table': {
    replacement: 'p-table',
    attributes: {
      '[value]': 'dataSource',
      '[columns]': 'displayedColumns',
    },
    imports: ['TableModule'],
    notes: 'Requires complete restructure of table template',
  },
  'mat-header-cell': {
    replacement: 'th',
    wrapper: 'p-table structure',
    notes: 'Use p-table column templates',
  },
  'mat-cell': {
    replacement: 'td',
    wrapper: 'p-table structure',
    notes: 'Use p-table column templates',
  },
  'mat-header-row': {
    replacement: 'tr',
    wrapper: 'thead in p-table',
  },
  'mat-row': {
    replacement: 'tr',
    wrapper: 'tbody in p-table',
  },
};

// Phase 2: Nebular to PrimeNG mappings
const nebularMappings = {
  'nb-card': {
    replacement: 'p-card',
    imports: ['CardModule'],
    childMappings: {
      'nb-card-header': 'ng-template pTemplate="header"',
      'nb-card-body': 'ng-template pTemplate="content"',
      'nb-card-footer': 'ng-template pTemplate="footer"',
    },
  },
  'nb-form-field': {
    replacement: 'div',
    attributes: {
      class: 'p-field',
    },
    notes: 'Requires validation restructure',
  },
  'nb-select': {
    replacement: 'p-dropdown',
    attributes: {
      '[options]': 'options',
      optionLabel: 'label',
      optionValue: 'value',
    },
    imports: ['DropdownModule'],
    notes: 'Convert nb-option elements to options array',
  },
  'nb-checkbox': {
    replacement: 'p-checkbox',
    imports: ['CheckboxModule'],
  },
  'nb-tabset': {
    replacement: 'p-tabView',
    imports: ['TabViewModule'],
    childMappings: {
      'nb-tab': 'p-tabPanel',
    },
  },
  'nb-spinner': {
    replacement: 'p-progressSpinner',
    imports: ['ProgressSpinnerModule'],
  },
  'nb-alert': {
    replacement: 'p-message',
    attributes: {
      '[severity]': 'status',
    },
    imports: ['MessageModule'],
  },
  'nb-toggle': {
    replacement: 'p-inputSwitch',
    imports: ['InputSwitchModule'],
  },
  'nb-radio-group': {
    replacement: 'div',
    attributes: {
      class: 'p-field-radiobutton',
    },
    imports: ['RadioButtonModule'],
  },
  'nb-radio': {
    replacement: 'p-radioButton',
    imports: ['RadioButtonModule'],
  },
};

// Phase 3: Custom component mappings
const customComponentMappings = {
  'app-button': {
    replacement: 'p-button',
    attributes: {
      pButton: '',
    },
    imports: ['ButtonModule'],
  },
  'app-input': {
    replacement: 'input',
    attributes: {
      pInputText: '',
    },
    imports: ['InputTextModule'],
  },
  'app-select': {
    replacement: 'p-dropdown',
    attributes: {
      '[options]': 'options',
    },
    imports: ['DropdownModule'],
  },
  'app-icon': {
    replacement: 'i',
    attributes: {
      class: 'pi pi-{iconName}',
    },
    notes: 'Replace with PrimeIcons class',
  },
};

// Icon mappings from Eva Icons to PrimeIcons
const iconMappings = {
  'menu-2-outline': 'pi pi-bars',
  'search-outline': 'pi pi-search',
  'person-outline': 'pi pi-user',
  'bell-outline': 'pi pi-bell',
  'settings-outline': 'pi pi-cog',
  'lock-outline': 'pi pi-lock',
  'shield-outline': 'pi pi-shield',
  'monitor-outline': 'pi pi-desktop',
  'save-outline': 'pi pi-save',
  'trash-2-outline': 'pi pi-trash',
  'keypad-outline': 'pi pi-key',
  'undo-outline': 'pi pi-undo',
  'arrow-back-outline': 'pi pi-arrow-left',
  'message-circle-outline': 'pi pi-comment',
  'calendar-outline': 'pi pi-calendar',
  'pin-outline': 'pi pi-map-marker',
  'options-2-outline': 'pi pi-ellipsis-v',
  'menu-arrow-outline': 'pi pi-angle-left',
};

// Utility functions
function log(message, level = 'info') {
  if (level === 'verbose' && !config.verbose) return;

  const prefix =
    {
      info: '📝',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      verbose: '🔍',
    }[level] || '📝';

  console.log(`${prefix} ${message}`);
}

function findFiles(pattern) {
  return glob.sync(pattern, { cwd: config.srcPath });
}

function readFile(filePath) {
  const fullPath = path.join(config.srcPath, filePath);
  return fs.readFileSync(fullPath, 'utf8');
}

function writeFile(filePath, content) {
  if (config.dryRun) {
    log(`[DRY RUN] Would write to: ${filePath}`, 'verbose');
    return;
  }

  if (config.backup) {
    const backupPath = `${filePath}.backup.${Date.now()}`;
    const fullPath = path.join(config.srcPath, filePath);
    const backupFullPath = path.join(config.srcPath, backupPath);
    fs.copyFileSync(fullPath, backupFullPath);
    log(`Created backup: ${backupPath}`, 'verbose');
  }

  const fullPath = path.join(config.srcPath, filePath);
  fs.writeFileSync(fullPath, content, 'utf8');
  log(`Updated: ${filePath}`, 'success');
  stats.filesModified++;
}

// Migration functions for each phase
function migrateAngularMaterial(content, filePath) {
  let modified = false;
  let newContent = content;

  Object.entries(angularMaterialMappings).forEach(([oldComponent, mapping]) => {
    const regex = new RegExp(`<${oldComponent}([^>]*)>`, 'g');
    const matches = newContent.match(regex);

    if (matches) {
      log(`Found ${matches.length} ${oldComponent} in ${filePath}`, 'verbose');

      newContent = newContent.replace(regex, (match, attributes) => {
        modified = true;
        stats.componentsReplaced++;

        const newAttributes = Object.entries(mapping.attributes || {})
          .map(([key, value]) => `${key}="${value}"`)
          .join(' ');

        return `<${mapping.replacement}${attributes} ${newAttributes}>`;
      });

      // Handle closing tags
      newContent = newContent.replace(
        new RegExp(`</${oldComponent}>`, 'g'),
        `</${mapping.replacement}>`,
      );

      if (mapping.notes) {
        log(`Note for ${oldComponent}: ${mapping.notes}`, 'warning');
      }
    }
  });

  return { content: newContent, modified };
}

function migrateNebularComponents(content, filePath) {
  let modified = false;
  let newContent = content;

  Object.entries(nebularMappings).forEach(([oldComponent, mapping]) => {
    const regex = new RegExp(`<${oldComponent}([^>]*)>`, 'g');
    const matches = newContent.match(regex);

    if (matches) {
      log(`Found ${matches.length} ${oldComponent} in ${filePath}`, 'verbose');

      newContent = newContent.replace(regex, (match, attributes) => {
        modified = true;
        stats.componentsReplaced++;

        const newAttributes = Object.entries(mapping.attributes || {})
          .map(([key, value]) => `${key}="${value}"`)
          .join(' ');

        return `<${mapping.replacement}${attributes} ${newAttributes}>`;
      });

      // Handle closing tags
      newContent = newContent.replace(
        new RegExp(`</${oldComponent}>`, 'g'),
        `</${mapping.replacement}>`,
      );

      // Handle child component mappings
      if (mapping.childMappings) {
        Object.entries(mapping.childMappings).forEach(([oldChild, newChild]) => {
          newContent = newContent.replace(
            new RegExp(`<${oldChild}([^>]*)>`, 'g'),
            `<${newChild}$1>`,
          );
          newContent = newContent.replace(
            new RegExp(`</${oldChild}>`, 'g'),
            `</${newChild.split(' ')[0]}>`,
          );
        });
      }

      if (mapping.notes) {
        log(`Note for ${oldComponent}: ${mapping.notes}`, 'warning');
      }
    }
  });

  return { content: newContent, modified };
}

function migrateCustomComponents(content, filePath) {
  let modified = false;
  let newContent = content;

  Object.entries(customComponentMappings).forEach(([oldComponent, mapping]) => {
    const regex = new RegExp(`<${oldComponent}([^>]*)>`, 'g');
    const matches = newContent.match(regex);

    if (matches) {
      log(`Found ${matches.length} ${oldComponent} in ${filePath}`, 'verbose');

      newContent = newContent.replace(regex, (match, attributes) => {
        modified = true;
        stats.componentsReplaced++;

        const newAttributes = Object.entries(mapping.attributes || {})
          .map(([key, value]) => `${key}="${value}"`)
          .join(' ');

        return `<${mapping.replacement}${attributes} ${newAttributes}>`;
      });

      // Handle closing tags
      newContent = newContent.replace(
        new RegExp(`</${oldComponent}>`, 'g'),
        `</${mapping.replacement}>`,
      );

      if (mapping.notes) {
        log(`Note for ${oldComponent}: ${mapping.notes}`, 'warning');
      }
    }
  });

  return { content: newContent, modified };
}

function migrateIcons(content, filePath) {
  let modified = false;
  let newContent = content;

  // Migrate Eva Icons to PrimeIcons
  Object.entries(iconMappings).forEach(([evaIcon, primeIcon]) => {
    const regex = new RegExp(`icon="${evaIcon}"`, 'g');
    const matches = newContent.match(regex);

    if (matches) {
      log(`Found ${matches.length} Eva icon ${evaIcon} in ${filePath}`, 'verbose');
      newContent = newContent.replace(regex, `class="${primeIcon}"`);
      modified = true;
      stats.componentsReplaced++;
    }
  });

  // Convert nb-icon to i element with PrimeIcons
  const nbIconRegex = /<nb-icon\s+icon="([^"]+)"([^>]*)><\/nb-icon>/g;
  const nbIconMatches = newContent.match(nbIconRegex);

  if (nbIconMatches) {
    log(`Found ${nbIconMatches.length} nb-icon elements in ${filePath}`, 'verbose');

    newContent = newContent.replace(nbIconRegex, (match, iconName, attributes) => {
      const primeIcon = iconMappings[iconName] || `pi pi-${iconName}`;
      log(`Converting nb-icon ${iconName} to ${primeIcon}`, 'verbose');
      modified = true;
      stats.componentsReplaced++;
      return `<i class="${primeIcon}"${attributes}></i>`;
    });
  }

  // Convert app-icon to i element
  const appIconRegex = /<app-icon\s+name="([^"]+)"([^>]*)><\/app-icon>/g;
  const appIconMatches = newContent.match(appIconRegex);

  if (appIconMatches) {
    log(`Found ${appIconMatches.length} app-icon elements in ${filePath}`, 'verbose');

    newContent = newContent.replace(appIconRegex, (match, iconName, attributes) => {
      const primeIcon = iconMappings[iconName] || `pi pi-${iconName}`;
      log(`Converting app-icon ${iconName} to ${primeIcon}`, 'verbose');
      modified = true;
      stats.componentsReplaced++;
      return `<i class="${primeIcon}"${attributes}></i>`;
    });
  }

  return { content: newContent, modified };
}

// Main migration function
function migrateFile(filePath) {
  try {
    const content = readFile(filePath);
    let result = { content, modified: false };

    stats.filesProcessed++;

    switch (config.phase) {
      case 'phase1':
        result = migrateAngularMaterial(result.content, filePath);
        break;
      case 'phase2':
        result = migrateNebularComponents(result.content, filePath);
        break;
      case 'phase3':
        result = migrateCustomComponents(result.content, filePath);
        break;
      case 'icons':
        result = migrateIcons(result.content, filePath);
        break;
      case 'all':
        // Run all phases sequentially
        result = migrateAngularMaterial(result.content, filePath);
        result = migrateNebularComponents(result.content, filePath);
        result = migrateCustomComponents(result.content, filePath);
        result = migrateIcons(result.content, filePath);
        break;
      default:
        log(`Unknown phase: ${config.phase}`, 'error');
        return;
    }

    if (result.modified) {
      writeFile(filePath, result.content);
    }
  } catch (error) {
    log(`Error processing ${filePath}: ${error.message}`, 'error');
    stats.errors.push({ file: filePath, error: error.message });
  }
}

// Generate migration report
function generateReport() {
  if (!config.report) return;

  const report = {
    timestamp: new Date().toISOString(),
    phase: config.phase,
    configuration: config,
    statistics: stats,
    summary: {
      filesProcessed: stats.filesProcessed,
      filesModified: stats.filesModified,
      componentsReplaced: stats.componentsReplaced,
      errorCount: stats.errors.length,
      successRate: `${(((stats.filesProcessed - stats.errors.length) / stats.filesProcessed) * 100).toFixed(2)}%`,
    },
  };

  const reportPath = `migration-report-${config.phase}-${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`Migration report saved to: ${reportPath}`, 'success');
}

// Main execution
function main() {
  log(`🚀 Starting PrimeNG migration - Phase: ${config.phase}`, 'info');
  log(`Configuration: ${JSON.stringify(config, null, 2)}`, 'verbose');

  const htmlFiles = findFiles('**/*.component.html');
  log(`Found ${htmlFiles.length} HTML template files`, 'info');

  if (config.dryRun) {
    log('🔍 DRY RUN MODE - No files will be modified', 'warning');
  }

  htmlFiles.forEach((filePath) => {
    migrateFile(filePath);
  });

  // Generate summary
  log(`\n📊 Migration Summary:`, 'info');
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

  generateReport();

  if (config.dryRun) {
    log('\n⚠️  This was a dry run. No files were actually modified.', 'warning');
    log('Remove --dry-run flag to apply changes.', 'warning');
  } else {
    log('\n✅ Migration complete!', 'success');
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  migrateAngularMaterial,
  migrateNebularComponents,
  migrateCustomComponents,
  migrateIcons,
  angularMaterialMappings,
  nebularMappings,
  customComponentMappings,
  iconMappings,
};
