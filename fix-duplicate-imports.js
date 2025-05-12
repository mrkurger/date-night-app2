import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find all TypeScript files
function findTsFiles(directory) {
  const files = [];

  function walk(dir) {
    const dirContents = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of dirContents) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
  }

  walk(directory);
  return files;
}

// Fix duplicate imports
function fixDuplicateImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Find duplicate Nebular imports
    const nebularImportRegex = /import\s+\{\s*(.*?)\s*\}\s+from\s+['"]@nebular\/theme['"];/g;
    const matches = [...content.matchAll(nebularImportRegex)];

    if (matches.length > 1) {
      changed = true;

      // Collect all imported items from Nebular
      const importedItems = new Set();
      matches.forEach(match => {
        const items = match[1].split(',').map(item => item.trim());
        items.forEach(item => importedItems.add(item));
      });

      // Remove duplicate imports
      content = content.replace(nebularImportRegex, '');

      // Add a single import statement with all items
      const allItems = Array.from(importedItems).join(', ');
      const newImport = `import { ${allItems} } from '@nebular/theme';`;

      // Add the new import after the last Angular import
      const angularImportRegex = /import\s+\{.*?\}\s+from\s+['"]@angular\/.*?['"];/g;
      const lastAngularImport = [...content.matchAll(angularImportRegex)].pop();

      if (lastAngularImport) {
        const position = lastAngularImport.index + lastAngularImport[0].length;
        content = content.slice(0, position) + '\n' + newImport + content.slice(position);
      } else {
        // If no Angular imports, add at the beginning
        content = newImport + '\n' + content;
      }
    }

    // Find duplicate NbDatepickerModule imports
    const datepickerRegex =
      /import\s+\{\s*NbDatepickerModule\s*\}\s+from\s+['"]@nebular\/theme['"];/g;
    const datepickerMatches = [...content.matchAll(datepickerRegex)];

    if (datepickerMatches.length > 1) {
      changed = true;

      // Remove all but the first NbDatepickerModule import
      const first = datepickerMatches[0];
      const others = datepickerMatches.slice(1);

      for (const match of others) {
        content = content.replace(match[0], '');
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed duplicate imports in ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing duplicate imports in ${filePath}:`, error);
  }
}

function main() {
  const clientAngularDir = path.join(__dirname, 'client-angular');
  const srcDir = path.join(clientAngularDir, 'src');
  const tsFiles = findTsFiles(srcDir);

  console.log(`Found ${tsFiles.length} TypeScript files to check for duplicate imports`);
  let processedCount = 0;

  for (const file of tsFiles) {
    fixDuplicateImports(file);
    processedCount++;
    if (processedCount % 50 === 0) {
      console.log(`Processed ${processedCount}/${tsFiles.length} files`);
    }
  }

  console.log(`Completed processing ${processedCount} files for duplicate imports`);
}

main();
