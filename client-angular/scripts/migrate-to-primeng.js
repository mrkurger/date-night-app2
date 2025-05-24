// migrate-to-primeng.js
// Script to migrate from Emerald UI and Angular Material to PrimeNG
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Component mappings
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
    
    // Angular Material to PrimeNG
    'mat-card': 'p-card',
    'mat-button': 'p-button',
    'mat-raised-button': 'p-button styleClass="p-button-raised"',
    'mat-stroked-button': 'p-button styleClass="p-button-outlined"',
    'mat-flat-button': 'p-button styleClass="p-button-flat"',
    'mat-icon-button': 'p-button styleClass="p-button-icon"',
    'mat-form-field': 'span class="p-float-label"',
    'mat-label': 'label',
    'mat-input': 'p-inputText',
    'mat-select': 'p-dropdown',
    'mat-option': 'ng-template pTemplate="item"',
    'mat-checkbox': 'p-checkbox',
    'mat-radio': 'p-radioButton',
    'mat-slide-toggle': 'p-inputSwitch',
    'mat-progress-spinner': 'p-progressSpinner',
    'mat-table': 'p-table',
    'mat-paginator': 'p-paginator'
};

// Import mappings
const IMPORT_MAPPINGS = {
    // Emerald UI to PrimeNG
    '@emerald/core': null,
    '@emerald/components': null,
    '@emerald/icons': null,
    
    // Angular Material to PrimeNG modules
    '@angular/material/button': 'primeng/button',
    '@angular/material/card': 'primeng/card',
    '@angular/material/checkbox': 'primeng/checkbox',
    '@angular/material/core': null,
    '@angular/material/form-field': null,
    '@angular/material/icon': 'primeng/icon',
    '@angular/material/input': 'primeng/inputtext',
    '@angular/material/select': 'primeng/dropdown',
    '@angular/material/progress-spinner': 'primeng/progressspinner',
    '@angular/material/table': 'primeng/table',
    '@angular/material/paginator': 'primeng/paginator'
};

// Module mappings
const MODULE_MAPPINGS = {
    // Material modules to PrimeNG modules
    'MatButtonModule': 'ButtonModule',
    'MatCardModule': 'CardModule',
    'MatCheckboxModule': 'CheckboxModule',
    'MatFormFieldModule': null,
    'MatIconModule': null,
    'MatInputModule': 'InputTextModule',
    'MatSelectModule': 'DropdownModule',
    'MatProgressSpinnerModule': 'ProgressSpinnerModule',
    'MatTableModule': 'TableModule',
    'MatPaginatorModule': 'PaginatorModule',
    
    // Emerald modules
    'EmeraldModule': null,
    'AppCardComponent': 'CardModule',
    'AvatarComponent': 'AvatarModule',
    'CarouselComponent': 'CarouselModule',
    'InfoPanelComponent': 'PanelModule',
    'LabelComponent': 'TagModule',
    'PageHeaderComponent': 'ToolbarModule',
    'SkeletonLoaderComponent': 'SkeletonModule',
    'ToggleComponent': 'InputSwitchModule',
    'CardGridComponent': null,
    'PagerComponent': 'PaginatorModule',
    'FloatingActionButtonComponent': 'ButtonModule'
};

async function findFiles(dir, pattern) {
    const files = await fs.readdir(dir, { withFileTypes: true });
    const results = [];
    
    for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
            results.push(...(await findFiles(fullPath, pattern)));
        } else if (pattern.test(file.name)) {
            results.push(fullPath);
        }
    }
    
    return results;
}

async function updateHtmlFile(filePath) {
    console.log(`Processing HTML file: ${filePath}`);
    let content = await fs.readFile(filePath, 'utf8');
    let modified = false;
    
    // Replace component selectors
    for (const [oldSelector, newSelector] of Object.entries(COMPONENT_MAPPINGS)) {
        if (newSelector) {
            const regex = new RegExp(`<${oldSelector}([^>]*)>`, 'g');
            const newContent = content.replace(regex, `<${newSelector}$1>`);
            
            const closingRegex = new RegExp(`</${oldSelector}>`, 'g');
            content = newContent.replace(closingRegex, `</${newSelector.split(' ')[0]}>`);
            
            if (content !== newContent) {
                modified = true;
            }
        }
    }
    
    if (modified) {
        await fs.writeFile(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

async function updateTypeScriptFile(filePath) {
    console.log(`Processing TypeScript file: ${filePath}`);
    let content = await fs.readFile(filePath, 'utf8');
    let modified = false;
    
    // Replace imports
    for (const [oldImport, newImport] of Object.entries(IMPORT_MAPPINGS)) {
        if (newImport) {
            const importRegex = new RegExp(`from ['"]${oldImport}['"]`, 'g');
            const newContent = content.replace(importRegex, `from '${newImport}'`);
            if (content !== newContent) {
                content = newContent;
                modified = true;
            }
        }
    }
    
    // Replace module names
    for (const [oldModule, newModule] of Object.entries(MODULE_MAPPINGS)) {
        if (newModule) {
            const moduleRegex = new RegExp(`\\b${oldModule}\\b`, 'g');
            const newContent = content.replace(moduleRegex, newModule);
            if (content !== newContent) {
                content = newContent;
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
    const srcDir = path.join(__dirname, '..', 'src');
    
    // Process HTML files
    const htmlFiles = await findFiles(srcDir, /\.html$/);
    for (const file of htmlFiles) {
        await updateHtmlFile(file);
    }
    
    // Process TypeScript files
    const tsFiles = await findFiles(srcDir, /\.ts$/);
    for (const file of tsFiles) {
        await updateTypeScriptFile(file);
    }
    
    console.log('Migration completed');
}

main().catch(console.error);
