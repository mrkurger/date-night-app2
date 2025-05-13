/**
 * Fix Nebular Modules
 * 
 * This script adds missing Nebular modules to component imports
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);Fix Nebular Modules
 *
 * This script adds missing Nebular modules to component imports
 */
const fs = require('fs');
const path = require('path');

// Function to recursively find all .ts files
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !filePath.includes('node_modules')) {
      findTsFiles(filePath, fileList);
    } else if (file.endsWith('.component.ts')) {
      const content = fs.readFileSync(filePath, 'utf8');

      // Check if the file contains Nebular components without imports
      if (
        (content.includes('nb-') || content.includes('[nb') || content.includes(' nb')) &&
        !content.includes('NebularSharedModule') &&
        !content.includes('standalone: true')
      ) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

// Main function to fix modules
function fixNebularModules() {
  const srcDir = path.join(__dirname, '..', 'src');
  const tsFiles = findTsFiles(srcDir);

  console.log(`Found ${tsFiles.length} component files that might need Nebular modules:`);

  tsFiles.forEach((filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(srcDir, filePath);

    console.log(`Analyzing ${relativePath}...`);

    // If the file has a class with @Component but not standalone
    if (content.includes('@Component') && !content.includes('standalone: true')) {
      // Check if we need to update the module file
      const dirPath = path.dirname(filePath);
      const moduleName = path.basename(filePath, '.component.ts');
      const possibleModuleFile = path.join(dirPath, `${moduleName}.module.ts`);

      if (fs.existsSync(possibleModuleFile)) {
        console.log(`  Found module file: ${path.relative(srcDir, possibleModuleFile)}`);

        // Update the module file
        let moduleContent = fs.readFileSync(possibleModuleFile, 'utf8');

        if (!moduleContent.includes('NebularSharedModule')) {
          // Add the import statement
          moduleContent = moduleContent.replace(
            /import {([^}]*)}/,
            `import {$1}\nimport { NebularSharedModule } from 'src/app/shared/modules/nebular-shared.module';`,
          );

          // Add to the imports array
          moduleContent = moduleContent.replace(/imports: \[([\s\S]*?)\]/, (match, imports) => {
            return `imports: [${imports}${imports.trim().endsWith(',') ? '' : ','}\n    NebularSharedModule\n  ]`;
          });

          // Write back the updated content
          fs.writeFileSync(possibleModuleFile, moduleContent);
          console.log(`  Updated module file with NebularSharedModule`);
        }
      }
    }
  });
}

// Run the script
fixNebularModules();
