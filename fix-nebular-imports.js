// Script to fix Nebular module imports across the codebase
import { promises as fs } from 'fs';
import path from 'path';

// Helper function to recursively get all TypeScript files
async function getAllTypeScriptFiles(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  const paths = await Promise.all(
    files.map(async file => {
      const filePath = path.join(dir, file.name);
      if (file.isDirectory()) {
        return getAllTypeScriptFiles(filePath);
      } else if (file.name.endsWith('.ts')) {
        return [filePath];
      }
      return [];
    }),
  );
  return paths.flat();
}

// List of all Nebular module names
const NEBULAR_MODULES = [
  'NbThemeModule',
  'NbLayoutModule',
  'NbButtonModule',
  'NbCardModule',
  'NbIconModule',
  'NbInputModule',
  'NbFormFieldModule',
  'NbUserModule',
  'NbActionsModule',
  'NbContextMenuModule',
  'NbMenuModule',
  'NbToastrModule',
  'NbDialogModule',
  'NbSpinnerModule',
  'NbChatModule',
  'NbSidebarModule',
  'NbListModule',
  'NbSelectModule',
  'NbAccordionModule',
  'NbCheckboxModule',
  'NbRadioModule',
  'NbDatepickerModule',
  'NbTimepickerModule',
  'NbToggleModule',
  'NbPopoverModule',
  'NbTooltipModule',
  'NbTabsetModule',
  'NbRouteTabsetModule',
  'NbBadgeModule',
  'NbAlertModule',
  'NbSearchModule',
  'NbWindowModule',
  'NbTagModule',
  'NbTreeGridModule',
  'NbStepperModule',
  'NbCalendarModule',
];

async function fixFile(filePath) {
  console.log(`Processing ${filePath}...`);

  let content = await fs.readFile(filePath, 'utf8');
  const originalContent = content;

  // Check if file has any Nebular imports
  const hasNebularImports = NEBULAR_MODULES.some(module => content.includes(module));
  if (!hasNebularImports) {
    return;
  }

  // Remove direct Nebular module imports
  content = content.replace(
    /import\s*{([^}]*)}\s*from\s*['"]@nebular\/theme['"];?/g,
    (match, importList) => {
      const imports = importList
        .split(',')
        .map(i => i.trim())
        .filter(i => !NEBULAR_MODULES.includes(i))
        .join(',\n  ');

      return imports ? `import {\n  ${imports}\n} from '@nebular/theme';` : '';
    },
  );

  // Remove empty lines after removing imports
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

  // Check if NebularModule is already imported
  const hasNebularModuleImport = content.includes('import { NebularModule }');

  // Add NebularModule import if needed
  if (!hasNebularModuleImport) {
    const relativePathToShared = path
      .relative(
        path.dirname(filePath),
        path.join(path.dirname(filePath), '..', '..', '..', 'shared', 'nebular.module'),
      )
      .replace(/\\/g, '/');

    content = content.replace(
      /(import [^;]+;\n\n?)/,
      `$1import { NebularModule } from '${relativePathToShared}';\n\n`,
    );
  }

  // Update imports array in @NgModule decorator if present
  content = content.replace(
    /(@NgModule\s*\(\s*{\s*imports\s*:\s*\[)([\s\S]*?)(\s*\])/,
    (match, start, imports, end) => {
      // Remove any Nebular module imports
      const cleanedImports = imports
        .split(',')
        .map(i => i.trim())
        .filter(i => !NEBULAR_MODULES.includes(i))
        .filter(Boolean);

      // Add NebularModule if not already present
      if (!cleanedImports.includes('NebularModule')) {
        cleanedImports.push('NebularModule');
      }

      return `${start}\n    ${cleanedImports.join(',\n    ')}${end}`;
    },
  );

  // Only write file if changes were made
  if (content !== originalContent) {
    await fs.writeFile(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

async function main() {
  try {
    const basePath = path.join(process.cwd(), 'client-angular/src/app');
    const files = await getAllTypeScriptFiles(basePath);
    for (const file of files) {
      await fixFile(file);
    }
    console.log('All files processed successfully');
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
