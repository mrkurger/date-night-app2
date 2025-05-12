import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapping from Material to Nebular components
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
  '@angular/material/badge': '@nebular/theme',
  '@angular/material/chips': '@nebular/theme',
  '@angular/material/autocomplete': '@nebular/theme',
  '@angular/material/slide-toggle': '@nebular/theme',
  '@angular/material/divider': '@nebular/theme',
};

// Component name mapping
const componentMap = {
  MatButton: 'NbButton',
  MatCard: 'NbCard',
  MatCheckbox: 'NbCheckbox',
  MatNativeDateModule: 'NbDatepickerModule',
  MatDatepicker: 'NbDatepicker',
  MatDialog: 'NbDialog',
  MatFormField: 'NbFormField',
  MatIcon: 'NbIcon',
  MatInput: 'NbInput',
  MatMenu: 'NbMenu',
  MatPaginator: 'NbPagination',
  PageEvent: 'NbPaginationChangeEvent',
  MatProgressSpinner: 'NbSpinner',
  MatSelect: 'NbSelect',
  MatSnackBar: 'NbToastrService',
  MatSort: 'NbSort',
  Sort: 'NbSortEvent',
  MatTable: 'NbTable',
  MatTabs: 'NbTabset',
  MatTooltip: 'NbTooltip',
  MatBadge: 'NbBadge',
  MatChips: 'NbTag',
  MatAutocomplete: 'NbAutocomplete',
  MatSlideToggle: 'NbToggle',
  MatDivider: 'NbDivider',
};

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
  MatDividerModule: 'NbDividerModule',
};

// Find all TypeScript files in the client-angular/src directory
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

// Update imports in a file
function updateImports(filePath) {
  console.log(`Processing ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Replace Material imports with Nebular
  for (const [materialImport, nebularImport] of Object.entries(importMap)) {
    const materialRegex = new RegExp(
      `import\\s+{([^}]*)}\\s+from\\s+['"]${materialImport}['"]`,
      'g',
    );
    const matches = Array.from(content.matchAll(materialRegex));

    for (const match of matches) {
      const importedItems = match[1].split(',').map(item => item.trim());
      const nebularItems = importedItems.map(item => {
        // Extract the imported name and any alias
        const [name, alias] = item.split(' as ').map(part => part.trim());
        // Replace with the corresponding Nebular name if it exists
        const nebularName = componentMap[name] || moduleMap[name] || name;
        return alias ? `${nebularName} as ${alias}` : nebularName;
      });

      // Create the new Nebular import statement
      const newImport = `import { ${nebularItems.join(', ')} } from '${nebularImport}'`;
      content = content.replace(match[0], newImport);
      modified = true;
    }
  }

  // Handle Emerald components
  const emeraldRegex = /import\s+{([^}]*)}\s+from\s+['"]\.\.\/\.\.\/shared\/emerald\/.*['"]/g;
  content = content.replace(emeraldRegex, (match, importedItems) => {
    // For now, we'll just add a comment that these need manual migration
    return `// TODO: Migrate to Nebular UI - ${match}`;
  });

  // Replace emerald module imports
  content = content.replace(
    /import\s+{\s*EmeraldModule\s*}\s+from\s+['"]\.\.\/\.\.\/shared\/emerald\/emerald\.module['"]/g,
    `import { NebularModule } from '../../shared/nebular.module'`,
  );

  // Replace EmeraldModule in imports array with NebularModule
  content = content.replace(/EmeraldModule/g, 'NebularModule');

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

// Main function
function main() {
  const srcDir = path.join(__dirname, 'client-angular', 'src');
  const tsFiles = findTsFiles(srcDir);

  console.log(`Found ${tsFiles.length} TypeScript files`);
  for (const file of tsFiles) {
    updateImports(file);
  }

  console.log('Migration completed');
}

main();
