#!/usr/bin/env node

/**
 * Script to ensure components consistently use the appropriate modules
 * - Replaces individual Nebular module imports with NebularModule
 * - Ensures consistent import paths for shared modules
 * - Removes duplicate module imports
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const clientDir = path.join(rootDir, 'client-angular');
const srcDir = path.join(clientDir, 'src');

// List of Nebular modules that should be replaced with NebularModule
const nebularModules = [
  'NbIconModule',
  'NbBadgeModule',
  'NbCardModule',
  'NbButtonModule',
  'NbTooltipModule',
  'NbLayoutModule',
  'NbAlertModule',
  'NbSpinnerModule',
  'NbTagModule',
  'NbInputModule',
  'NbFormFieldModule',
  'NbUserModule',
  'NbDialogModule',
  'NbTabsetModule',
  'NbAccordionModule',
  'NbCheckboxModule',
  'NbRadioModule',
  'NbSelectModule',
  'NbDatepickerModule',
  'NbTimepickerModule',
  'NbAutocompleteModule',
  'NbToastrModule',
  'NbMenuModule',
  'NbSidebarModule',
  'NbContextMenuModule',
  'NbActionsModule',
  'NbSearchModule',
  'NbPopoverModule',
  'NbProgressBarModule',
  'NbStepperModule',
  'NbTreeGridModule',
  'NbListModule',
  'NbChatModule',
  'NbCalendarModule',
  'NbCalendarRangeModule',
  'NbWindowModule',
  'NbTableModule',
];

// Map of module paths to standardize imports
const modulePathMap = {
  NebularModule: '../../shared/nebular.module',
  SharedModule: '../../shared/shared.module',
  CoreModule: '../../core/core.module',
};

/**
 * Process a file to ensure it uses modules consistently
 * @param {string} filePath - Path to the file to process
 * @returns {Promise<boolean>} - Whether the file was modified
 */
async function processFile(filePath) {
  try {
    // Read the file content
    const content = await fs.readFile(filePath, 'utf8');
    let newContent = content;
    let modified = false;

    // Skip files that don't import from @nebular/theme
    if (!content.includes('@nebular/theme')) {
      return false;
    }

    // Calculate relative path to shared directory
    const relativeToSrc = path.relative(path.dirname(filePath), srcDir);
    const relativeToShared = path.join(relativeToSrc, 'app/shared');
    const relativeToCore = path.join(relativeToSrc, 'app/core');

    // Check if the file already imports NebularModule
    const hasNebularModule =
      content.includes('NebularModule') || content.includes('_NebularModule');

    // Check if the file imports individual Nebular modules
    const hasIndividualNebularModules = nebularModules.some(
      module => content.includes(`${module}`) && !content.includes(`_${module}`),
    );

    // Check if the file has imports array
    const hasImportsArray = content.includes('imports:') && content.includes('imports: [');

    // If the file imports individual Nebular modules but not NebularModule, add NebularModule
    if (hasIndividualNebularModules && !hasNebularModule && hasImportsArray) {
      // Add NebularModule import
      const nebularImportPath = path.join(relativeToShared, 'nebular.module').replace(/\\/g, '/');
      newContent = newContent.replace(
        /import\s+{([^}]*)}\s+from\s+['"]@nebular\/theme['"];?/,
        (match, imports) => {
          return `import { NebularModule } from '${nebularImportPath}';\nimport {${imports}} from '@nebular/theme';`;
        },
      );

      // Add NebularModule to imports array
      newContent = newContent.replace(/imports\s*:\s*\[\s*([^\]]*)\s*\]/, (match, imports) => {
        // Check if imports is empty
        if (!imports.trim()) {
          return `imports: [NebularModule]`;
        }
        // Check if imports already includes NebularModule
        if (imports.includes('NebularModule')) {
          return match;
        }
        // Add NebularModule to imports
        return `imports: [NebularModule, ${imports}]`;
      });

      modified = true;
    }

    // If the file imports both NebularModule and individual Nebular modules, remove individual modules from imports array
    if (hasNebularModule && hasIndividualNebularModules && hasImportsArray) {
      // Get the imports array
      const importsArrayMatch = newContent.match(/imports\s*:\s*\[\s*([^\]]*)\s*\]/);
      if (importsArrayMatch) {
        const importsArray = importsArrayMatch[1];
        let newImportsArray = importsArray;

        // Remove individual Nebular modules from imports array
        for (const module of nebularModules) {
          if (newImportsArray.includes(module) && !newImportsArray.includes(`_${module}`)) {
            newImportsArray = newImportsArray.replace(
              new RegExp(`\\s*,\\s*\\b${module}\\b|\\b${module}\\b\\s*,\\s*|\\b${module}\\b`, 'g'),
              '',
            );
          }
        }

        // Clean up any double commas or trailing commas
        newImportsArray = newImportsArray
          .replace(/,\s*,/g, ',')
          .replace(/,\s*$/g, '')
          .replace(/^\s*,/g, '');

        // Update the imports array
        newContent = newContent.replace(
          /imports\s*:\s*\[\s*([^\]]*)\s*\]/,
          `imports: [${newImportsArray}]`,
        );

        modified = true;
      }

      // Remove unused individual Nebular module imports
      for (const module of nebularModules) {
        // Skip if the module is prefixed with underscore (already handled as unused)
        if (content.includes(`_${module}`)) {
          continue;
        }

        // Check if the module is used in the component outside of imports array
        const moduleUsedInTemplate = content.includes(`<${module.replace('Module', '')}`);
        const moduleUsedInCode = content.includes(`${module.replace('Module', '')}.`);

        // If the module is not used, remove its import
        if (!moduleUsedInTemplate && !moduleUsedInCode) {
          // Remove the import if it's on a line by itself
          newContent = newContent.replace(
            new RegExp(
              `import\\s+{\\s*${module}\\s*}\\s+from\\s+['"]@nebular\\/theme['"];?\\n?`,
              'g',
            ),
            '',
          );

          // Remove the import if it's part of a multi-import statement
          newContent = newContent.replace(
            new RegExp(
              `import\\s+{([^}]*)\\b${module}\\b([^}]*)}\\s+from\\s+['"]@nebular\\/theme['"]`,
              'g',
            ),
            (match, before, after) => {
              // If there are other imports, keep the statement but remove this module
              const newBefore = before.replace(
                new RegExp(`\\s*,\\s*\\b${module}\\b|\\b${module}\\b\\s*,\\s*`, 'g'),
                '',
              );
              const newAfter = after.replace(
                new RegExp(`\\s*,\\s*\\b${module}\\b|\\b${module}\\b\\s*,\\s*`, 'g'),
                '',
              );

              // If there are no other imports, remove the entire statement
              if (!newBefore.trim() && !newAfter.trim()) {
                return '';
              }

              return `import {${newBefore}${newAfter}} from '@nebular/theme'`;
            },
          );
        }
      }
    }

    // Standardize module import paths
    for (const [moduleName, standardPath] of Object.entries(modulePathMap)) {
      // Skip if the module is not imported
      if (!content.includes(moduleName)) {
        continue;
      }

      // Calculate the correct relative path
      let correctPath;
      if (standardPath.startsWith('../../shared')) {
        correctPath = path
          .join(relativeToShared, standardPath.replace('../../shared/', ''))
          .replace(/\\/g, '/');
      } else if (standardPath.startsWith('../../core')) {
        correctPath = path
          .join(relativeToCore, standardPath.replace('../../core/', ''))
          .replace(/\\/g, '/');
      } else {
        correctPath = standardPath;
      }

      // Fix the import path
      const importRegex = new RegExp(
        `import\\s+{\\s*${moduleName}\\s*}\\s+from\\s+['"]([^'"]+)['"]`,
        'g',
      );
      newContent = newContent.replace(importRegex, (match, importPath) => {
        if (importPath !== correctPath) {
          modified = true;
          return `import { ${moduleName} } from '${correctPath}'`;
        }
        return match;
      });
    }

    // Fix empty imports
    newContent = newContent.replace(/import\s+{\s*}\s+from\s+['"][^'"]+['"];?\n?/g, '');
    newContent = newContent.replace(/import\s+{\s*,\s*}\s+from\s+['"][^'"]+['"];?\n?/g, '');

    // Fix imports with only commas
    newContent = newContent.replace(/import\s+{\s*,+\s*}\s+from\s+['"][^'"]+['"];?\n?/g, '');

    // Write the modified content back to the file
    if (modified || newContent !== content) {
      await fs.writeFile(filePath, newContent, 'utf8');
      console.log(`Fixed: ${path.relative(rootDir, filePath)}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

/**
 * Recursively find all TypeScript component files in a directory
 * @param {string} dir - Directory to search
 * @returns {Promise<string[]>} - Array of file paths
 */
async function findComponentFiles(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  const result = [];

  for (const file of files) {
    const filePath = path.join(dir, file.name);

    if (file.isDirectory()) {
      // Skip node_modules and dist directories
      if (file.name !== 'node_modules' && file.name !== 'dist') {
        const nestedFiles = await findComponentFiles(filePath);
        result.push(...nestedFiles);
      }
    } else if (file.name.endsWith('.component.ts') && !file.name.endsWith('.spec.ts')) {
      result.push(filePath);
    }
  }

  return result;
}

/**
 * Main function to process all files
 */
async function main() {
  try {
    console.log('Finding component files...');
    const files = await findComponentFiles(srcDir);
    console.log(`Found ${files.length} component files.`);

    let modifiedCount = 0;

    for (const file of files) {
      const modified = await processFile(file);
      if (modified) {
        modifiedCount++;
      }
    }

    console.log(`\nDone! Modified ${modifiedCount} files.`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
