#!/usr/bin/env node

/**
 * Script to help migrate from Nebular UI components to PrimeNG
 * 
 * Usage: node migrate-to-primeng.js <directory>
 * 
 * This script will:
 * 1. Replace Nebular component selectors with PrimeNG equivalents
 * 2. Update class names to use PrimeNG conventions
 * 3. Update component imports
 * 
 * Example: node migrate-to-primeng.js src/app/components
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name using ESM syntax
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Component mapping from Nebular to PrimeNG
const componentMap = {
  // Selectors
  'nb-card': 'p-card',
  'nb-card-header': 'p-card-header',
  'nb-card-body': 'p-card-body',
  'nb-card-footer': 'p-card-footer',
  'nb-button': 'p-button',
  'nb-input': 'p-inputtext',
  'nb-select': 'p-dropdown',
  'nb-checkbox': 'p-checkbox',
  'nb-radio': 'p-radiobutton',
  'nb-toggle': 'p-inputswitch',
  'nb-icon': 'p-icon',
  'nb-spinner': 'p-progressspinner',
  'nb-badge': 'p-badge',
  'nb-user': 'p-avatar',
  'nb-accordion': 'p-accordion',
  'nb-tabset': 'p-tabview',
  'nb-datepicker': 'p-calendar',
  'nb-paginator': 'p-paginator',
  'nb-dialog': 'p-dialog',
  'nb-menu': 'p-menu',
  'nb-tag': 'p-tag',
  'nb-alert': 'p-message',
  'nb-toast': 'p-toast',
  'nb-tree': 'p-tree',
  'nb-layout': 'p-panel',
  'nb-sidebar': 'p-sidebar',
  'nb-stepper': 'p-steps',
  'nb-divider': 'p-divider',
  
  // Class names
  'nb-card': 'p-card',
  'nb-card-header': 'p-card-header',
  'nb-card-body': 'p-card-body',
  'nb-card-footer': 'p-card-footer',
  'nb-button': 'p-button',
  'nb-primary': 'p-button-primary',
  'nb-secondary': 'p-button-secondary',
  'nb-success': 'p-button-success',
  'nb-info': 'p-button-info',
  'nb-warning': 'p-button-warning',
  'nb-danger': 'p-button-danger',
  'nb-small': 'p-button-sm',
  'nb-medium': 'p-button',
  'nb-large': 'p-button-lg',
  'nb-full-width': 'w-full',
  'nb-icon-start': 'p-button-icon-left',
  'nb-icon-end': 'p-button-icon-right'
};

// Import mapping for component modules
const importMap = {
  '@nebular/theme': 'primeng',
  // Add more specific mappings as needed
  'NbCardModule': 'CardModule',
  'NbButtonModule': 'ButtonModule',
  'NbInputModule': 'InputTextModule',
  'NbSelectModule': 'DropdownModule',
  'NbCheckboxModule': 'CheckboxModule',
  'NbRadioModule': 'RadioButtonModule',
  'NbToggleModule': 'InputSwitchModule',
  'NbIconModule': 'IconField',
  'NbSpinnerModule': 'ProgressSpinnerModule',
  'NbBadgeModule': 'BadgeModule',
  'NbUserModule': 'AvatarModule',
  'NbAccordionModule': 'AccordionModule',
  'NbTabsetModule': 'TabViewModule',
  'NbDatepickerModule': 'CalendarModule',
  'NbPaginatorModule': 'PaginatorModule',
  'NbDialogModule': 'DialogModule',
  'NbMenuModule': 'MenuModule',
  'NbTagModule': 'TagModule'
};

/**
 * Process all files in a directory recursively
 * @param {string} dirPath - Directory to process
 * @returns {Promise<void>}
 */
async function processDirectory(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'dist') {
        // Process subdirectories recursively
        await processDirectory(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || 
                                   entry.name.endsWith('.html') || 
                                   entry.name.endsWith('.scss'))) {
        // Process TypeScript, HTML and SCSS files
        await replaceInFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error);
    throw error; // Re-throw to be caught by the main function
  }
}

/**
 * Replace Nebular components with PrimeNG equivalents in a file
 * @param {string} filePath - File to process
 * @returns {Promise<void>}
 */
async function replaceInFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    let modified = false;

    // Replace component selectors and class names
    for (const [nebular, primeng] of Object.entries(componentMap)) {
      const regex = new RegExp(nebular, 'g');
      if (content.match(regex)) {
        content = content.replace(regex, primeng);
        modified = true;
      }
    }

    // Replace imports
    for (const [nebular, primeng] of Object.entries(importMap)) {
      const importRegex = new RegExp(`from ['\"]${nebular}.*['\"]`, 'g');
      if (content.match(importRegex)) {
        content = content.replace(importRegex, `from 'primeng/${primeng.toLowerCase()}'`);
        modified = true;
      }
      
      // Replace module names in imports
      const moduleRegex = new RegExp(`\\b${nebular}\\b`, 'g');
      if (content.match(moduleRegex)) {
        content = content.replace(moduleRegex, primeng);
        modified = true;
      }
    }

    if (modified) {
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    throw error; // Re-throw to be caught by the main function
  }
}

/**
 * Main function to migrate components
 * @param {string} directoryPath - Directory to migrate
 * @returns {Promise<void>}
 */
async function migrateToNebular(directoryPath) {
  try {
    const fullPath = path.resolve(process.cwd(), directoryPath);
    console.log(`Starting migration in ${fullPath}`);
    
    // Check if directory exists
    try {
      await fs.access(fullPath);
    } catch (error) {
      throw new Error(`Directory not found: ${fullPath}`);
    }
    
    await processDirectory(fullPath);
    console.log('Migration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error; // Re-throw for the main handler
  }
}

// Main execution
if (process.argv.length <= 2) {
  console.error('Error: Please provide a directory path to migrate.');
  console.error('Usage: node migrate-to-primeng.js <directory>');
  console.error('Example: node migrate-to-primeng.js src/app/components');
  process.exit(1);
}

const directory = process.argv[2];
try {
  migrateToNebular(directory);
} catch (error) {
  console.error('Migration failed:', error);
  console.error(error.stack);
  process.exit(1);
}