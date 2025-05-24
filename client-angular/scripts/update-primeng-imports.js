#!/usr/bin/env node

/**
 * Script to update and optimize PrimeNG imports in Angular components
 * 
 * Usage: node update-primeng-imports.js <directory>
 * 
 * This script will:
 * 1. Consolidate multiple PrimeNG imports into a single import statement
 * 2. Add missing PrimeNG module imports based on template usage
 * 3. Remove unused PrimeNG imports
 * 
 * Example: node update-primeng-imports.js src/app/components
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name using ESM syntax
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// List of PrimeNG modules and their corresponding components/selectors
const primengModules = [
  'ButtonModule', // p-button
  'InputTextModule', // p-inputtext
  'CardModule', // p-card
  'DropdownModule', // p-dropdown
  'TableModule', // p-table
  'DialogModule', // p-dialog
  'ToastModule', // p-toast
  'CheckboxModule', // p-checkbox
  'RadioButtonModule', // p-radiobutton
  'InputSwitchModule', // p-inputswitch
  'CalendarModule', // p-calendar
  'AccordionModule', // p-accordion
  'TabViewModule', // p-tabview
  'PanelModule', // p-panel
  'MenuModule', // p-menu
  'MessageModule', // p-message
  'MessagesModule', // p-messages
  'ProgressSpinnerModule', // p-progressspinner
  'ProgressBarModule', // p-progressbar
  'TreeModule', // p-tree
  'TagModule', // p-tag
  'DividerModule', // p-divider
  'PaginatorModule', // p-paginator
  'AvatarModule', // p-avatar
  'BadgeModule', // p-badge
  'ChipModule', // p-chip
  'TooltipModule', // p-tooltip
  'SidebarModule', // p-sidebar
  'StepsModule', // p-steps
];

// Map selectors to their modules
const selectorToModule = {
  'p-button': 'ButtonModule',
  'p-inputtext': 'InputTextModule',
  'p-card': 'CardModule',
  'p-dropdown': 'DropdownModule',
  'p-table': 'TableModule',
  'p-dialog': 'DialogModule',
  'p-toast': 'ToastModule',
  'p-checkbox': 'CheckboxModule',
  'p-radiobutton': 'RadioButtonModule',
  'p-inputswitch': 'InputSwitchModule',
  'p-calendar': 'CalendarModule',
  'p-accordion': 'AccordionModule',
  'p-tabview': 'TabViewModule',
  'p-panel': 'PanelModule',
  'p-menu': 'MenuModule',
  'p-message': 'MessageModule',
  'p-messages': 'MessagesModule',
  'p-progressspinner': 'ProgressSpinnerModule',
  'p-progressbar': 'ProgressBarModule',
  'p-tree': 'TreeModule',
  'p-tag': 'TagModule',
  'p-divider': 'DividerModule',
  'p-paginator': 'PaginatorModule',
  'p-avatar': 'AvatarModule',
  'p-badge': 'BadgeModule',
  'p-chip': 'ChipModule',
  'p-tooltip': 'TooltipModule',
  'p-sidebar': 'SidebarModule',
  'p-steps': 'StepsModule',
  // Add more selectors as needed
};

// Helper directives that may be used
const directivesToModule = {
  'pButton': 'ButtonModule',
  'pTooltip': 'TooltipModule',
  'pInputText': 'InputTextModule',
  'pValidateOnly': 'ValidateOnlyModule',
  // Add more directives as needed
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
      } else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts')) {
        // Only process TypeScript files that are not test files
        await processComponentFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error);
    throw error; // Re-throw to be caught by the main function
  }
}

/**
 * Process a component file to update PrimeNG imports
 * @param {string} filePath - File to process
 * @returns {Promise<void>}
 */
async function processComponentFile(filePath) {
  try {
    console.log(`Processing ${filePath}...`);

    // Read the file content
    let content = await fs.readFile(filePath, 'utf8');

    // Check if the file already has consolidated imports
    if (content.includes('import {') && content.includes("} from 'primeng")) {
      console.log(`  Already has consolidated imports`);
      // We still continue to make sure all necessary modules are imported
    }

    // Find all individual PrimeNG imports
    const importRegex = /import\s+{\s*([^}]+)\s*}\s+from\s+['"]primeng\/[^'"]+['"]/g;
    const individualImportRegex = /import\s+(\w+)\s+from\s+['"]primeng\/[^'"]+['"]/g;

    // Collect all imported modules
    const importedModules = new Set();

    // Find imports using the first pattern (destructured imports)
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const modules = match[1].split(',').map((m) => m.trim());
      modules.forEach((module) => importedModules.add(module));
    }

    // Find imports using the second pattern (individual imports)
    while ((match = individualImportRegex.exec(content)) !== null) {
      importedModules.add(match[1]);
    }

    // Find the templateUrl or inline template
    const templateUrlMatch = content.match(/templateUrl\s*:\s*['"]([\w\/-]+.html)['"]/);
    let templateContent = '';

    if (templateUrlMatch) {
      // External template
      const templatePath = path.join(path.dirname(filePath), templateUrlMatch[1]);
      try {
        templateContent = await fs.readFile(templatePath, 'utf8');
      } catch (error) {
        console.warn(`Could not find template file: ${templatePath}`);
        // Continue processing without template content
      }
    } else {
      // Inline template
      const templateMatch = content.match(/template\s*:\s*`([\\s\\S]*?)`/);
      if (templateMatch) {
        templateContent = templateMatch[1];
      }
    }

    // Check template for usage of PrimeNG components
    for (const [selector, module] of Object.entries(selectorToModule)) {
      // Skip if already imported
      if (importedModules.has(module)) {
        continue;
      }

      // Check if the selector is used in the template
      if (templateContent && templateContent.includes(selector)) {
        importedModules.add(module);
      }
    }

    // Check for directive usage
    for (const [directive, module] of Object.entries(directivesToModule)) {
      // Skip if already imported
      if (importedModules.has(module)) {
        continue;
      }

      // Check if the directive is used in the template
      if (templateContent && (
          templateContent.includes(`[${directive}]`) ||
          templateContent.includes(`(${directive})`) ||
          templateContent.includes(`${directive}=`) ||
          templateContent.includes(`${directive}=`) ||
          templateContent.includes(` ${directive}`) ||
          templateContent.includes(`"${directive}"`)
        )) {
        importedModules.add(module);
      }
    }

    // Remove all existing PrimeNG imports
    content = content.replace(/import\s+{\s*[^}]+\s*}\s+from\s+['"]primeng\/[^'"]+['"];\s*/g, '');
    content = content.replace(/import\s+\w+\s+from\s+['"]primeng\/[^'"]+['"];\s*/g, '');

    // Group modules by their package
    const modulesByPackage = {};

    // Create a new consolidated import statement for each package
    for (const module of importedModules) {
      const packageName = module.replace('Module', '').toLowerCase();
      
      if (!modulesByPackage[packageName]) {
        modulesByPackage[packageName] = [];
      }
      
      modulesByPackage[packageName].push(module);
    }

    // If we have any modules to import, add the import statements
    if (Object.keys(modulesByPackage).length > 0) {
      // Find the position to insert imports - after the last import statement
      const importEndIndex = content.lastIndexOf('import ');
      const importEndLineIndex = importEndIndex !== -1 ? 
        content.indexOf('\n', importEndIndex) : -1;
      
      // Generate import statements
      let importStatements = '';
      for (const [packageName, modules] of Object.entries(modulesByPackage)) {
        importStatements += `import { ${modules.join(', ')} } from 'primeng/${packageName}';\n`;
      }
      
      // Insert the new import statements
      if (importEndLineIndex !== -1) {
        content = content.slice(0, importEndLineIndex + 1) + 
                  importStatements +
                  content.slice(importEndLineIndex + 1);
      } else {
        // If no imports found, add at the beginning
        content = importStatements + content;
      }

      // Also ensure modules are in the imports array for standalone components
      if (content.includes('standalone: true')) {
        // Get all modules as a string
        const modulesString = Array.from(importedModules).join(', ');
        
        // Check if there's an existing imports array
        if (content.includes('imports: [')) {
          // Add to existing imports array if modules aren't already included
          const importedModulesArray = Array.from(importedModules);
          for (const module of importedModulesArray) {
            if (!content.includes(`imports: [${module}`) && 
                !content.includes(`imports: [ ${module}`) && 
                !content.includes(`, ${module}`)) {
              
              // Add to imports array
              content = content.replace(/imports:\s*\[/, `imports: [${module}, `);
            }
          }
        } else {
          // Add new imports array if not present
          content = content.replace(
            'standalone: true',
            `standalone: true,\n  imports: [${modulesString}]`
          );
        }
      }
      
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`  Updated imports in ${filePath}`);
    } else {
      console.log(`  No PrimeNG imports required in ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing component file ${filePath}:`, error);
    throw error; // Re-throw to be caught by the main function
  }
}

/**
 * Main function to update PrimeNG imports
 * @param {string} directoryPath - Directory to update imports in
 * @returns {Promise<void>}
 */
async function updatePrimeNGImports(directoryPath) {
  try {
    const fullPath = path.resolve(process.cwd(), directoryPath);
    console.log(`Starting PrimeNG import updates in ${fullPath}`);
    
    // Check if directory exists
    try {
      await fs.access(fullPath);
    } catch (error) {
      throw new Error(`Directory not found: ${fullPath}`);
    }
    
    await processDirectory(fullPath);
    console.log('PrimeNG import updates complete!');
  } catch (error) {
    console.error('Update failed:', error);
    throw error; // Re-throw for the main handler
  }
}

// Main execution
if (process.argv.length <= 2) {
  console.error('Error: Please provide a directory path to update PrimeNG imports.');
  console.error('Usage: node update-primeng-imports.js <directory>');
  console.error('Example: node update-primeng-imports.js src/app/components');
  process.exit(1);
}

const directory = process.argv[2];
try {
  updatePrimeNGImports(directory);
} catch (error) {
  console.error('Update failed:', error);
  console.error(error.stack);
  process.exit(1);
}