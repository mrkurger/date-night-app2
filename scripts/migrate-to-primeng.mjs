#!/usr/bin/env node
// migrate-to-primeng.mjs
// Script to migrate from Emerald UI and Angular Material to PrimeNG
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientAngularDir = path.join(__dirname, '..', 'client-angular');

// First ensure required dependencies are installed
async function installDependencies() {
  console.log('Installing PrimeNG and required dependencies...');
  const { execSync } = await import('child_process');
  try {
    execSync(
      'cd ' + clientAngularDir + ' && npm install --legacy-peer-deps primeng primeicons primeflex',
      { stdio: 'inherit' },
    );
    console.log('Dependencies installed successfully');
  } catch (error) {
    console.error('Failed to install dependencies:', error);
    process.exit(1);
  }
}

// Component mappings from Emerald/Material to PrimeNG
const COMPONENT_MAPPINGS = {
  // Emerald UI to PrimeNG
  'emerald-app-card': 'p-card',
  'emerald-button': 'p-button',
  'emerald-input': 'p-inputText',
  'emerald-label': 'p-tag',
  'emerald-toggle': 'p-inputSwitch',
  'emerald-card-grid': 'div class="grid"',
  'emerald-pager': 'p-paginator',
  'emerald-floating-action-button': 'p-button styleClass="p-button-rounded"',
  'emerald-avatar': 'p-avatar',
  'emerald-carousel': 'p-carousel',
  'emerald-info-panel': 'p-panel',
  'emerald-page-header': 'p-toolbar',
  'emerald-skeleton-loader': 'p-skeleton',

  // Material to PrimeNG
  'mat-card': 'p-card',
  'mat-button': 'p-button',
  'mat-raised-button': 'p-button styleClass="p-button-raised"',
  'mat-stroked-button': 'p-button styleClass="p-button-outlined"',
  'mat-flat-button': 'p-button styleClass="p-button-flat"',
  'mat-icon-button': 'p-button styleClass="p-button-rounded p-button-text"',
  'mat-form-field': 'span class="p-float-label"',
  'mat-label': 'label',
  'mat-select': 'p-dropdown',
  'mat-checkbox': 'p-checkbox',
  'mat-radio-group': 'p-selectButton',
  'mat-slide-toggle': 'p-inputSwitch',
  'mat-table': 'p-table',
  'mat-paginator': 'p-paginator',
};

// Import mappings
const IMPORT_MAPPINGS = {
  '@emerald/core': null,
  '@emerald/components': null,
  '@angular/material/button': 'primeng/button',
  '@angular/material/card': 'primeng/card',
  '@angular/material/checkbox': 'primeng/checkbox',
  '@angular/material/form-field': null,
  '@angular/material/input': 'primeng/inputtext',
  '@angular/material/select': 'primeng/dropdown',
  '@angular/material/table': 'primeng/table',
  '@angular/material/paginator': 'primeng/paginator',
};

// Module mappings for imports arrays
const MODULE_MAPPINGS = {
  MatButtonModule: 'ButtonModule',
  MatCardModule: 'CardModule',
  MatCheckboxModule: 'CheckboxModule',
  MatInputModule: 'InputTextModule',
  MatSelectModule: 'DropdownModule',
  MatTableModule: 'TableModule',
  MatPaginatorModule: 'PaginatorModule',
  EmeraldModule: null,
};

// Process files and make replacements
async function processFiles() {
  const srcDir = path.join(clientAngularDir, 'src');

  // Find all HTML and TS files
  async function findFiles(dir, ext) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      entries.map(entry => {
        const res = path.resolve(dir, entry.name);
        return entry.isDirectory() ? findFiles(res, ext) : res;
      }),
    );
    return files.flat().filter(file => file.endsWith(ext));
  }

  // Process HTML files
  const htmlFiles = await findFiles(srcDir, '.html');
  for (const file of htmlFiles) {
    await processHtmlFile(file);
  }

  // Process TS files
  const tsFiles = await findFiles(srcDir, '.ts');
  for (const file of tsFiles) {
    await processTypeScriptFile(file);
  }
}

async function processHtmlFile(filePath) {
  console.log(`Processing HTML file: ${filePath}`);
  let content = await fs.readFile(filePath, 'utf8');
  let modified = false;

  for (const [oldSelector, newSelector] of Object.entries(COMPONENT_MAPPINGS)) {
    const regex = new RegExp(`<${oldSelector}([^>]*)>`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, `<${newSelector}$1>`);
      content = content.replace(
        new RegExp(`</${oldSelector}>`, 'g'),
        `</${newSelector.split(' ')[0]}>`,
      );
      modified = true;
    }
  }

  if (modified) {
    await fs.writeFile(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

async function processTypeScriptFile(filePath) {
  console.log(`Processing TypeScript file: ${filePath}`);
  let content = await fs.readFile(filePath, 'utf8');
  let modified = false;

  // Replace imports
  for (const [oldImport, newImport] of Object.entries(IMPORT_MAPPINGS)) {
    if (newImport) {
      const importRegex = new RegExp(`from ['"]${oldImport}['"]`, 'g');
      if (importRegex.test(content)) {
        content = content.replace(importRegex, `from '${newImport}'`);
        modified = true;
      }
    }
  }

  // Replace module names in imports arrays
  for (const [oldModule, newModule] of Object.entries(MODULE_MAPPINGS)) {
    if (newModule) {
      const moduleRegex = new RegExp(`\\b${oldModule}\\b`, 'g');
      if (moduleRegex.test(content)) {
        content = content.replace(moduleRegex, newModule);
        modified = true;
      }
    }
  }

  if (modified) {
    await fs.writeFile(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

async function main() {
  console.log('Starting migration to PrimeNG...');

  // First install dependencies
  await installDependencies();

  // Then process all files
  await processFiles();

  console.log('\nMigration completed!');
  console.log('\nNext steps:');
  console.log('1. Review the changes in your code editor');
  console.log('2. Test the application');
  console.log('3. Fix any styling issues');
  console.log('4. Run ng serve to verify everything works');
}

main().catch(console.error);
