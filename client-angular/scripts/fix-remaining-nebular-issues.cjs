#!/usr/bin/env node
// @ts-check
 

/**
 * This script fixes remaining Nebular issues in the Angular client
 * It updates component imports, fixes template issues, and ensures proper module usage
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the project root directory
const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');

// Function to recursively find all TypeScript files
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts') && !file.endsWith('.spec.ts')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Function to fix standalone component imports
function fixStandaloneComponentImports(filePath) {
  console.log(`Processing ${filePath}...`);

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Check if it's a standalone component
  if (content.includes('standalone: true') && content.includes('@Component')) {
    // Fix imports array formatting
    const importsRegex = /imports:\s*\[([\s\S]*?)\]/g;
    const match = importsRegex.exec(content);

    if (match) {
      const importsList = match[1];

      // Check if imports list is not properly formatted
      if (importsList.includes(',') && !importsList.includes('\n')) {
        console.log('  Fixing imports array formatting...');

        // Split by commas and format
        const imports = importsList
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item);
        const formattedImports = imports.join(',\n    ');

        // Replace with formatted imports
        const newImportsBlock = `imports: [\n    ${formattedImports}\n  ]`;
        content = content.replace(match[0], newImportsBlock);
        modified = true;
      }
    }

    // Check for missing Nebular modules
    const componentContent = content.toLowerCase();
    const nebularComponents = [
      { tag: 'nb-card', module: 'NbCardModule' },
      { tag: 'nb-button', module: 'NbButtonModule' },
      { tag: 'nb-icon', module: 'NbIconModule' },
      { tag: 'nb-input', module: 'NbInputModule' },
      { tag: 'nb-form-field', module: 'NbFormFieldModule' },
      { tag: 'nb-select', module: 'NbSelectModule' },
      { tag: 'nb-option', module: 'NbSelectModule' },
      { tag: 'nb-checkbox', module: 'NbCheckboxModule' },
      { tag: 'nb-radio', module: 'NbRadioModule' },
      { tag: 'nb-toggle', module: 'NbToggleModule' },
      { tag: 'nb-list', module: 'NbListModule' },
      { tag: 'nb-list-item', module: 'NbListModule' },
      { tag: 'nb-user', module: 'NbUserModule' },
      { tag: 'nb-badge', module: 'NbBadgeModule' },
      { tag: 'nb-spinner', module: 'NbSpinnerModule' },
      { tag: 'nb-alert', module: 'NbAlertModule' },
      { tag: 'nb-accordion', module: 'NbAccordionModule' },
      { tag: 'nb-tab', module: 'NbTabsetModule' },
      { tag: 'nb-tabset', module: 'NbTabsetModule' },
      { tag: 'nb-tag', module: 'NbTagModule' },
      { tag: 'nb-tag-list', module: 'NbTagModule' },
      { tag: 'nbtaginput', module: 'NbTagModule' },
      { tag: 'nbtooltip', module: 'NbTooltipModule' },
    ];

    // Check for each Nebular component
    const missingModules = new Set();
    nebularComponents.forEach(({ tag, module }) => {
      if (componentContent.includes(tag) && !content.includes(module)) {
        missingModules.add(module);
      }
    });

    // Add missing modules to imports
    if (missingModules.size > 0) {
      console.log(`  Adding missing modules: ${Array.from(missingModules).join(', ')}...`);

      // Check if there's already a Nebular import
      const nebularImportRegex = /import\s+{([^}]*)}\s+from\s+['"]@nebular\/theme['"];/;
      const nebularImportMatch = nebularImportRegex.exec(content);

      if (nebularImportMatch) {
        // Add to existing import
        const existingImports = nebularImportMatch[1]
          .split(',')
          .map((i) => i.trim())
          .filter((i) => i);
        const newImports = [...existingImports, ...Array.from(missingModules)].sort();

        // Format the imports
        const formattedImports = newImports.join(',\n  ');
        const newImportStatement = `import {\n  ${formattedImports}\n} from '@nebular/theme';`;

        content = content.replace(nebularImportMatch[0], newImportStatement);
      } else {
        // Add new import statement
        const formattedImports = Array.from(missingModules).sort().join(',\n  ');
        const newImportStatement = `import {\n  ${formattedImports}\n} from '@nebular/theme';\n`;

        // Add after the last import
        const lastImportIndex = content.lastIndexOf('import ');
        const lastImportEndIndex = content.indexOf(';', lastImportIndex) + 1;

        content =
          content.substring(0, lastImportEndIndex) +
          '\n' +
          newImportStatement +
          content.substring(lastImportEndIndex);
      }

      // Add to imports array
      const importsArrayRegex = /imports:\s*\[([\s\S]*?)\]/;
      const importsArrayMatch = importsArrayRegex.exec(content);

      if (importsArrayMatch) {
        const existingImportsArray = importsArrayMatch[1]
          .split(',')
          .map((i) => i.trim())
          .filter((i) => i);
        const newImportsArray = [...existingImportsArray, ...Array.from(missingModules)].sort();

        // Format the imports array
        const formattedImportsArray = newImportsArray.join(',\n    ');
        const newImportsArrayStatement = `imports: [\n    ${formattedImportsArray}\n  ]`;

        content = content.replace(importsArrayMatch[0], newImportsArrayStatement);
      }

      modified = true;
    }

    // Save changes if modified
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log('  File updated successfully!');
    } else {
      console.log('  No changes needed.');
    }
  }
}

// Main function
function main() {
  console.log('Finding TypeScript files...');
  const tsFiles = findTsFiles(srcDir);
  console.log(`Found ${tsFiles.length} TypeScript files.`);

  console.log('\nFixing standalone component imports...');
  tsFiles.forEach(fixStandaloneComponentImports);

  console.log('\nAll fixes completed successfully!');
}

// Run the script
main();
