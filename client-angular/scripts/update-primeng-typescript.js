#!/usr/bin/env node

/**
 * Update TypeScript Components for PrimeNG
 * 
 * This script updates TypeScript component files to:
 * 1. Add PrimeNG module imports
 * 2. Add options arrays for dropdowns
 * 3. Update component imports arrays
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
  importsAdded: 0,
  optionsAdded: 0,
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

// PrimeNG module mappings
const primengModules = {
  'p-card': 'CardModule',
  'p-button': 'ButtonModule',
  'p-dropdown': 'DropdownModule',
  'p-checkbox': 'CheckboxModule',
  'p-radioButton': 'RadioButtonModule',
  'p-inputText': 'InputTextModule',
  'p-inputTextarea': 'InputTextareaModule',
  'p-calendar': 'CalendarModule',
  'p-table': 'TableModule',
  'p-tabView': 'TabViewModule',
  'p-tabPanel': 'TabViewModule',
  'p-progressSpinner': 'ProgressSpinnerModule',
  'p-message': 'MessageModule',
  'p-messages': 'MessagesModule',
  'p-toast': 'ToastModule',
  'p-dialog': 'DialogModule',
  'p-sidebar': 'SidebarModule',
  'p-menu': 'MenuModule',
  'p-menubar': 'MenubarModule',
  'p-paginator': 'PaginatorModule',
  'p-tooltip': 'TooltipModule',
  'p-badge': 'BadgeModule',
  'p-chip': 'ChipModule',
  'p-tag': 'TagModule',
  'p-avatar': 'AvatarModule',
  'p-image': 'ImageModule',
  'p-galleria': 'GalleriaModule',
  'p-carousel': 'CarouselModule',
  'p-accordion': 'AccordionModule',
  'p-panel': 'PanelModule',
  'p-fieldset': 'FieldsetModule',
  'p-divider': 'DividerModule',
  'p-splitter': 'SplitterModule',
  'p-toolbar': 'ToolbarModule',
  'p-breadcrumb': 'BreadcrumbModule',
  'p-steps': 'StepsModule',
  'p-tieredMenu': 'TieredMenuModule',
  'p-megaMenu': 'MegaMenuModule',
  'p-contextMenu': 'ContextMenuModule',
  'p-slideMenu': 'SlideMenuModule',
  'p-panelMenu': 'PanelMenuModule',
  'p-dock': 'DockModule',
  'p-tabMenu': 'TabMenuModule'
};

// Find TypeScript component files
function findComponentFiles() {
  const pattern = path.join(config.srcPath, '**/*.component.ts');
  return glob.sync(pattern);
}

// Analyze HTML template to determine required PrimeNG modules
function analyzeTemplate(componentPath) {
  const htmlPath = componentPath.replace('.ts', '.html');
  
  if (!fs.existsSync(htmlPath)) {
    return { modules: [], hasDropdowns: false };
  }
  
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  const requiredModules = new Set();
  
  // Check for PrimeNG components
  Object.keys(primengModules).forEach(component => {
    if (htmlContent.includes(`<${component}`) || htmlContent.includes(`</${component}>`)) {
      requiredModules.add(primengModules[component]);
    }
  });
  
  // Check for PrimeNG directives
  if (htmlContent.includes('pInputText')) requiredModules.add('InputTextModule');
  if (htmlContent.includes('pInputTextarea')) requiredModules.add('InputTextareaModule');
  if (htmlContent.includes('pButton')) requiredModules.add('ButtonModule');
  if (htmlContent.includes('pTooltip')) requiredModules.add('TooltipModule');
  
  // Check if there are dropdowns that need options arrays
  const hasDropdowns = htmlContent.includes('<!-- TODO: Convert to options array:');
  
  return {
    modules: Array.from(requiredModules),
    hasDropdowns
  };
}

// Update TypeScript component file
function updateComponentFile(filePath) {
  try {
    stats.filesProcessed++;
    
    const analysis = analyzeTemplate(filePath);
    
    if (analysis.modules.length === 0 && !analysis.hasDropdowns) {
      return; // No changes needed
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Add PrimeNG imports
    if (analysis.modules.length > 0) {
      const existingImports = content.match(/import\s+{[^}]*}\s+from\s+['"]primeng\/[^'"]+['"];?/g) || [];
      const existingModules = new Set();
      
      existingImports.forEach(imp => {
        const match = imp.match(/import\s+{([^}]*)}/);
        if (match) {
          match[1].split(',').forEach(mod => {
            existingModules.add(mod.trim());
          });
        }
      });
      
      const newModules = analysis.modules.filter(mod => !existingModules.has(mod));
      
      if (newModules.length > 0) {
        // Group modules by their package
        const moduleGroups = {};
        newModules.forEach(module => {
          const packageName = getPackageName(module);
          if (!moduleGroups[packageName]) {
            moduleGroups[packageName] = [];
          }
          moduleGroups[packageName].push(module);
        });
        
        // Add import statements
        let importStatements = '';
        Object.keys(moduleGroups).forEach(packageName => {
          const modules = moduleGroups[packageName];
          importStatements += `import { ${modules.join(', ')} } from 'primeng/${packageName}';\n`;
        });
        
        // Insert after existing imports
        const lastImportMatch = content.match(/import[^;]+;(?=\s*\n\s*(?:\/\/|\/\*|\n|@|export|interface|class|const|let|var|function))/g);
        if (lastImportMatch) {
          const lastImport = lastImportMatch[lastImportMatch.length - 1];
          const insertIndex = content.lastIndexOf(lastImport) + lastImport.length;
          content = content.slice(0, insertIndex) + '\n' + importStatements + content.slice(insertIndex);
        } else {
          // Insert at the beginning
          content = importStatements + '\n' + content;
        }
        
        modified = true;
        stats.importsAdded += newModules.length;
        log(`Added PrimeNG imports: ${newModules.join(', ')} to ${filePath}`, 'verbose');
      }
    }
    
    // Add modules to component imports array
    if (analysis.modules.length > 0) {
      const importsArrayMatch = content.match(/imports:\s*\[([\s\S]*?)\]/);
      if (importsArrayMatch) {
        const currentImports = importsArrayMatch[1];
        const newModules = analysis.modules.filter(mod => !currentImports.includes(mod));
        
        if (newModules.length > 0) {
          const updatedImports = currentImports.trim() 
            ? `${currentImports.trim()},\n    ${newModules.join(',\n    ')}`
            : newModules.join(',\n    ');
          
          content = content.replace(
            /imports:\s*\[([\s\S]*?)\]/,
            `imports: [\n    ${updatedImports}\n  ]`
          );
          
          modified = true;
          log(`Added modules to imports array: ${newModules.join(', ')} in ${filePath}`, 'verbose');
        }
      }
    }
    
    // Add dropdown options arrays (basic implementation)
    if (analysis.hasDropdowns) {
      // Add basic options arrays if they don't exist
      const optionsToAdd = [
        'profileVisibilityOptions',
        'allowMessagingOptions', 
        'contentDensityOptions',
        'cardSizeOptions',
        'defaultViewTypeOptions'
      ];
      
      optionsToAdd.forEach(optionName => {
        if (!content.includes(optionName)) {
          const optionsArray = generateOptionsArray(optionName);
          
          // Insert before constructor
          const constructorMatch = content.match(/constructor\s*\(/);
          if (constructorMatch) {
            const insertIndex = content.indexOf(constructorMatch[0]);
            content = content.slice(0, insertIndex) + optionsArray + '\n\n  ' + content.slice(insertIndex);
            modified = true;
            stats.optionsAdded++;
            log(`Added options array: ${optionName} to ${filePath}`, 'verbose');
          }
        }
      });
    }
    
    if (modified) {
      stats.filesModified++;
      
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

// Get package name for PrimeNG module
function getPackageName(moduleName) {
  const packageMap = {
    'CardModule': 'card',
    'ButtonModule': 'button',
    'DropdownModule': 'dropdown',
    'CheckboxModule': 'checkbox',
    'RadioButtonModule': 'radiobutton',
    'InputTextModule': 'inputtext',
    'InputTextareaModule': 'inputtextarea',
    'CalendarModule': 'calendar',
    'TableModule': 'table',
    'TabViewModule': 'tabview',
    'ProgressSpinnerModule': 'progressspinner',
    'MessageModule': 'message',
    'MessagesModule': 'messages',
    'ToastModule': 'toast',
    'DialogModule': 'dialog',
    'SidebarModule': 'sidebar',
    'MenuModule': 'menu',
    'MenubarModule': 'menubar',
    'PaginatorModule': 'paginator',
    'TooltipModule': 'tooltip',
    'BadgeModule': 'badge',
    'ChipModule': 'chip',
    'TagModule': 'tag',
    'AvatarModule': 'avatar',
    'ImageModule': 'image',
    'GalleriaModule': 'galleria',
    'CarouselModule': 'carousel',
    'AccordionModule': 'accordion',
    'PanelModule': 'panel',
    'FieldsetModule': 'fieldset',
    'DividerModule': 'divider',
    'SplitterModule': 'splitter',
    'ToolbarModule': 'toolbar',
    'BreadcrumbModule': 'breadcrumb',
    'StepsModule': 'steps'
  };
  
  return packageMap[moduleName] || moduleName.toLowerCase().replace('module', '');
}

// Generate options array for dropdowns
function generateOptionsArray(optionName) {
  const optionsMap = {
    'profileVisibilityOptions': `profileVisibilityOptions = [
    { label: 'Public - Visible to everyone', value: 'public' },
    { label: 'Registered Users - Only visible to registered users', value: 'registered' },
    { label: 'Private - Only visible to users you\\'ve matched with', value: 'private' }
  ];`,
    'allowMessagingOptions': `allowMessagingOptions = [
    { label: 'Everyone', value: 'all' },
    { label: 'Only Matches', value: 'matches' },
    { label: 'No One (Disable messaging)', value: 'none' }
  ];`,
    'contentDensityOptions': `contentDensityOptions = [
    { label: 'Compact', value: 'compact' },
    { label: 'Normal', value: 'normal' },
    { label: 'Comfortable', value: 'comfortable' }
  ];`,
    'cardSizeOptions': `cardSizeOptions = [
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' }
  ];`,
    'defaultViewTypeOptions': `defaultViewTypeOptions = [
    { label: 'Netflix View', value: 'netflix' },
    { label: 'Tinder View', value: 'tinder' },
    { label: 'List View', value: 'list' }
  ];`
  };
  
  return optionsMap[optionName] || `${optionName} = [];`;
}

// Main execution
function main() {
  log(`🚀 Starting TypeScript component updates for PrimeNG`, 'info');
  log(`Configuration: ${JSON.stringify(config, null, 2)}`, 'verbose');
  
  const componentFiles = findComponentFiles();
  log(`Found ${componentFiles.length} TypeScript component files`, 'info');
  
  if (config.dryRun) {
    log('🔍 DRY RUN MODE - No files will be modified', 'warning');
  }
  
  componentFiles.forEach(updateComponentFile);
  
  // Generate summary
  log(`\n📊 TypeScript Update Summary:`, 'info');
  log(`Files processed: ${stats.filesProcessed}`, 'info');
  log(`Files modified: ${stats.filesModified}`, 'info');
  log(`Imports added: ${stats.importsAdded}`, 'info');
  log(`Options arrays added: ${stats.optionsAdded}`, 'info');
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
    log('\n✅ TypeScript updates complete!', 'success');
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { updateComponentFile, analyzeTemplate, primengModules };
