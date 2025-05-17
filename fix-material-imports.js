import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Material to Nebular module mapping
const moduleMap = {
  MatButtonModule: 'NbButtonModule',
  MatCardModule: 'NbCardModule',
  MatCheckboxModule: 'NbCheckboxModule',
  MatDatepickerModule: 'NbDatepickerModule',
  MatDialogModule: 'NbDialogModule',
  MatFormFieldModule: 'NbFormFieldModule',
  MatIconModule: 'NbIconModule',
  MatInputModule: 'NbInputModule',
  MatMenuModule: 'NbMenuModule',
  MatPaginatorModule: 'NbPaginatorModule', // Not an actual module, will be handled later
  MatProgressSpinnerModule: 'NbSpinnerModule',
  MatSelectModule: 'NbSelectModule',
  MatSnackBarModule: 'NbToastrModule',
  MatSortModule: 'NbSortModule', // Not an actual module, will be handled later
  MatTableModule: 'NbTableModule',
  MatTabsModule: 'NbTabsetModule',
  MatTooltipModule: 'NbTooltipModule',
  MatDividerModule: 'NbDividerModule', // Not an actual module, will be handled later
  MatChipsModule: 'NbTagModule',
  MatSlideToggleModule: 'NbToggleModule',
  MatBadgeModule: 'NbBadgeModule',
  MatNativeDateModule: 'NbDatepickerModule',
  MatAutocompleteModule: 'NbAutocompleteModule',
};

// Material to Nebular class mapping
const classMap = {
  MatDialog: 'NbDialogService',
  MatDialogRef: 'NbDialogRef',
  MAT_DIALOG_DATA: 'NB_DIALOG_CONFIG',
  MatChipInputEvent: 'NbTagInputAddEvent',
  PageEvent: 'NbPaginationChangeEvent',
  Sort: 'NbSortEvent',
  MatSnackBar: 'NbToastrService',
};

// Material to Nebular import path mapping
const importMap = {
  '@angular/material/button': '@nebular/theme',
  '@angular/material/card': '@nebular/theme',
  '@angular/material/checkbox': '@nebular/theme',
  '@angular/material/core': '@nebular/theme',
  '@angular/material/datepicker': '@nebular/theme',
  '@angular/material/dialog': '@nebular/theme',
  '@angular/material/form-field': '@nebular/theme',
  '@angular/material/icon': '@nebular/theme',
  '@angular/material/input': '@nebular/theme',
  '@angular/material/menu': '@nebular/theme',
  '@angular/material/paginator': '@nebular/theme',
  '@angular/material/progress-spinner': '@nebular/theme',
  '@angular/material/select': '@nebular/theme',
  '@angular/material/snack-bar': '@nebular/theme',
  '@angular/material/sort': '@nebular/theme',
  '@angular/material/table': '@nebular/theme',
  '@angular/material/tabs': '@nebular/theme',
  '@angular/material/tooltip': '@nebular/theme',
  '@angular/material/divider': '@nebular/theme',
  '@angular/material/chips': '@nebular/theme',
  '@angular/material/slide-toggle': '@nebular/theme',
  '@angular/material/badge': '@nebular/theme',
  '@angular/material/autocomplete': '@nebular/theme',
};

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

// Replace Material imports with Nebular equivalents
function updateImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Replace import paths
    for (const [materialPath, nebularPath] of Object.entries(importMap)) {
      const importRegex = new RegExp(
        `import\\s+\\{([^}]*)\\}\\s+from\\s+['"]${materialPath}['"]`,
        'g',
      );
      if (importRegex.test(content)) {
        changed = true;
        content = content.replace(importRegex, (match, imports) => {
          // Replace class names in the import
          const updatedImports = imports
            .split(',')
            .map(importItem => {
              const trimmedItem = importItem.trim();
              for (const [matClass, nbClass] of Object.entries(classMap)) {
                if (trimmedItem === matClass || trimmedItem.startsWith(`${matClass} as`)) {
                  return importItem.replace(matClass, nbClass);
                }
              }
              for (const [matModule, nbModule] of Object.entries(moduleMap)) {
                if (trimmedItem === matModule || trimmedItem.startsWith(`${matModule} as`)) {
                  return importItem.replace(matModule, nbModule);
                }
              }
              return importItem;
            })
            .join(', ');

          return `import {${updatedImports}} from '${nebularPath}'`;
        });
      }
    }

    // Replace Material module names in code
    for (const [matModule, nbModule] of Object.entries(moduleMap)) {
      const moduleRegex = new RegExp(`\\b${matModule}\\b`, 'g');
      if (moduleRegex.test(content)) {
        changed = true;
        content = content.replace(moduleRegex, nbModule);
      }
    }

    // Replace Material class names in code
    for (const [matClass, nbClass] of Object.entries(classMap)) {
      const classRegex = new RegExp(`\\b${matClass}\\b`, 'g');
      if (classRegex.test(content)) {
        changed = true;
        content = content.replace(classRegex, nbClass);
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated imports in ${filePath}`);
    }
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error);
  }
}

function main() {
  const clientAngularDir = path.join(__dirname, 'client-angular');
  const srcDir = path.join(clientAngularDir, 'src');
  const tsFiles = findTsFiles(srcDir);

  console.log(`Found ${tsFiles.length} TypeScript files to process`);
  let processedCount = 0;

  for (const file of tsFiles) {
    updateImports(file);
    processedCount++;
    if (processedCount % 50 === 0) {
      console.log(`Processed ${processedCount}/${tsFiles.length} files`);
    }
  }

  console.log(`Completed processing ${processedCount} files`);
}

main();
