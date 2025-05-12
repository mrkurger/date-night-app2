import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Module name mapping
const moduleMap = {
  MatButtonModule: 'NbButtonModule',
  MatCardModule: 'NbCardModule',
  MatCheckboxModule: 'NbCheckboxModule',
  MatNativeDateModule: 'NbDatepickerModule',
  MatDatepickerModule: 'NbDatepickerModule',
  MatDialogModule: 'NbDialogModule',
  MatFormFieldModule: 'NbFormFieldModule',
  MatIconModule: 'NbIconModule',
  MatInputModule: 'NbInputModule',
  MatMenuModule: 'NbMenuModule',
  MatPaginatorModule: 'NbPaginationModule',
  MatProgressSpinnerModule: 'NbSpinnerModule',
  MatSelectModule: 'NbSelectModule',
  MatSnackBarModule: 'NbToastrModule',
  MatSortModule: 'NbSortModule',
  MatTableModule: 'NbTableModule',
  MatTabsModule: 'NbTabsetModule',
  MatTooltipModule: 'NbTooltipModule',
  MatBadgeModule: 'NbBadgeModule',
  MatChipsModule: 'NbTagModule',
  MatAutocompleteModule: 'NbAutocompleteModule',
  MatSlideToggleModule: 'NbToggleModule',
  MatDividerModule: 'NbLayoutModule',
};

// Modules that don't exist in Nebular and should be removed
const invalidModules = ['NbPaginationModule', 'NbSortModule'];

// Find all TypeScript files in the client-angular/src directory
function findTsFiles(directory) {
  const files = [];
  function walk(dir) {
    const dirContents = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of dirContents) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts')) {
        files.push(fullPath);
      }
    }
  }
  walk(directory);
  return files;
}

// Find modules with imports arrays and replace Material module references with Nebular ones
function fixModuleImports(filePath) {
  console.log(`Processing ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Find imports array in NgModule decorator
  const ngModuleRegex = /@NgModule\(\s*{\s*(?:[^}]*,)?\s*imports\s*:\s*\[([\s\S]*?)\]/g;
  const matches = Array.from(content.matchAll(ngModuleRegex));

  if (matches.length > 0) {
    for (const match of matches) {
      const importsArray = match[1];
      let newImportsArray = importsArray;

      // Replace each Material module with its Nebular equivalent
      for (const [matModule, nbModule] of Object.entries(moduleMap)) {
        const matModuleRegex = new RegExp(`\\b${matModule}\\b`, 'g');
        if (matModuleRegex.test(newImportsArray)) {
          newImportsArray = newImportsArray.replace(matModuleRegex, nbModule);
          modified = true;
        }
      }

      if (modified) {
        content = content.replace(importsArray, newImportsArray);
      }
    }
  }

  // Remove references to invalid Nebular modules from imports
  for (const invalidModule of invalidModules) {
    const invalidModuleRegex = new RegExp(`\\s*${invalidModule}\\s*,?`, 'g');
    if (invalidModuleRegex.test(content)) {
      content = content.replace(invalidModuleRegex, '');
      modified = true;
    }
  }

  // Remove references to invalid Nebular modules from import statements
  const importRegex = /import\s*{([^}]*)}\s*from\s*['"]@nebular\/theme['"]/g;
  const importMatches = Array.from(content.matchAll(importRegex));

  if (importMatches.length > 0) {
    for (const match of importMatches) {
      const importList = match[1];
      let newImportList = importList;

      for (const invalidModule of invalidModules) {
        const invalidModuleRegex = new RegExp(`\\s*${invalidModule}\\s*,?`, 'g');
        if (invalidModuleRegex.test(newImportList)) {
          newImportList = newImportList.replace(invalidModuleRegex, '');
          modified = true;
        }
      }

      if (newImportList !== importList) {
        content = content.replace(importList, newImportList);
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
    return true;
  }
  return false;
}

// Main function
function main() {
  const srcDir = path.join(__dirname, 'client-angular', 'src');
  const tsFiles = findTsFiles(srcDir);

  console.log(`Found ${tsFiles.length} TypeScript files (excluding spec files)`);
  let totalUpdated = 0;

  for (const file of tsFiles) {
    if (fixModuleImports(file)) {
      totalUpdated++;
    }
  }

  console.log(`Module imports fixed in ${totalUpdated} files`);
}

main();
