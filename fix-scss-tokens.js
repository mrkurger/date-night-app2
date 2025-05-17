import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix design-tokens.scss file tokens
function fixTokensFile() {
  const tokenFilePath = path.join(
    __dirname,
    'client-angular',
    'src',
    'app',
    'core',
    'design',
    'design-tokens.scss',
  );

  try {
    if (fs.existsSync(tokenFilePath)) {
      console.log(`Fixing tokens file: ${tokenFilePath}`);
      let content = fs.readFileSync(tokenFilePath, 'utf8');

      // Create tokens.scss alongside design-tokens.scss
      const tokensPath = path.join(
        __dirname,
        'client-angular',
        'src',
        'app',
        'core',
        'design',
        'tokens.scss',
      );

      // Basic design tokens to create
      let tokensContent = `// Design tokens for the application
$font-family-primary: 'Roboto', sans-serif;
$font-family-secondary: 'Open Sans', sans-serif;

// Font Weights
$font-weight-light: 300;
$font-weight-regular: 400;
$font-weight-medium: 500;
$font-weight-bold: 700;

// Font Sizes
$font-size-xs: 0.75rem;    // 12px
$font-size-sm: 0.875rem;   // 14px
$font-size-md: 1rem;       // 16px
$font-size-lg: 1.125rem;   // 18px
$font-size-xl: 1.25rem;    // 20px
$font-size-2xl: 1.5rem;    // 24px
$font-size-3xl: 1.875rem;  // 30px
$font-size-4xl: 2.25rem;   // 36px

// Spacing
$spacing-1: 0.25rem;   // 4px
$spacing-2: 0.5rem;    // 8px
$spacing-3: 0.75rem;   // 12px
$spacing-4: 1rem;      // 16px
$spacing-5: 1.25rem;   // 20px
$spacing-6: 1.5rem;    // 24px
$spacing-7: 2rem;      // 32px
$spacing-8: 2.5rem;    // 40px
$spacing-9: 3rem;      // 48px
$spacing-10: 4rem;     // 64px

// Colors - Primary
$color-primary-50: #e3f2fd;
$color-primary-100: #bbdefb;
$color-primary-200: #90caf9;
$color-primary-300: #64b5f6;
$color-primary-400: #42a5f5;
$color-primary-500: #2196f3;
$color-primary-600: #1e88e5;
$color-primary-700: #1976d2;
$color-primary-800: #1565c0;
$color-primary-900: #0d47a1;

// Colors - Neutral
$color-neutral-50: #fafafa;
$color-neutral-100: #f5f5f5;
$color-neutral-200: #eeeeee;
$color-neutral-300: #e0e0e0;
$color-neutral-400: #bdbdbd;
$color-neutral-500: #9e9e9e;
$color-neutral-600: #757575;
$color-neutral-700: #616161;
$color-neutral-800: #424242;
$color-neutral-900: #212121;

// Colors - Success
$color-success-50: #e8f5e9;
$color-success-500: #4caf50;
$color-success-900: #1b5e20;

// Colors - Warning
$color-warning-50: #fff8e1;
$color-warning-500: #ffc107;
$color-warning-900: #ff6f00;

// Colors - Error
$color-error-50: #ffebee;
$color-error-500: #f44336;
$color-error-900: #b71c1c;

// Shadows
$shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
$shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
$shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

// Border Radius
$border-radius-sm: 0.125rem;  // 2px
$border-radius-md: 0.25rem;   // 4px
$border-radius-lg: 0.5rem;    // 8px
$border-radius-xl: 1rem;      // 16px
$border-radius-full: 9999px;

// Z-index
$z-index-dropdown: 1000;
$z-index-sticky: 1020;
$z-index-fixed: 1030;
$z-index-modal-backdrop: 1040;
$z-index-modal: 1050;
$z-index-popover: 1060;
$z-index-tooltip: 1070;

// Transitions
$transition-base: all 0.2s ease-in-out;
$transition-slow: all 0.3s ease-in-out;
$transition-fast: all 0.1s ease-in-out;
`;

      fs.writeFileSync(tokensPath, tokensContent);
      console.log(`Created tokens file: ${tokensPath}`);

      // Fix the design-tokens.scss file to properly @forward the tokens
      // Replace any problematic line with the correct @forward
      if (content.includes("@forward 'tokens';")) {
        console.log('Tokens forward already exists, no change needed');
      } else {
        content = content.replace(/\/\/ Forward the tokens.*/, "@forward 'tokens';");
        // If there's no comment to replace, add it to the end
        if (!content.includes("@forward 'tokens';")) {
          content += "\n\n// Forward the tokens\n@forward 'tokens';";
        }
        fs.writeFileSync(tokenFilePath, content);
        console.log('Updated design-tokens.scss to forward tokens');
      }
    } else {
      console.error(`Token file not found at ${tokenFilePath}`);
    }
  } catch (error) {
    console.error(`Error fixing tokens file: ${error}`);
  }
}

// Fix theme imports in styles.scss
function fixStylesFile() {
  const stylesPath = path.join(__dirname, 'client-angular', 'src', 'styles.scss');

  try {
    if (fs.existsSync(stylesPath)) {
      console.log(`Fixing styles file: ${stylesPath}`);
      let content = fs.readFileSync(stylesPath, 'utf8');

      // Replace problematic Nebular import
      content = content.replace(
        /@use ['"]@nebular\/theme\/styles\/prebuilt\/default.css['"];/g,
        "@import '@nebular/theme/styles/prebuilt/default.css';",
      );

      // If the Nebular import is missing, add it
      if (!content.includes('@nebular/theme/styles/prebuilt/default.css')) {
        content = "@import '@nebular/theme/styles/prebuilt/default.css';\n" + content;
      }

      // Make sure themes.scss is properly imported
      if (!content.includes('src/themes.scss')) {
        content = "@import 'src/themes.scss';\n" + content;
      }

      fs.writeFileSync(stylesPath, content);
      console.log('Updated styles.scss with correct imports');
    } else {
      console.error(`Styles file not found at ${stylesPath}`);
    }
  } catch (error) {
    console.error(`Error fixing styles file: ${error}`);
  }
}

// Create or fix themes.scss
function fixThemesFile() {
  const themesPath = path.join(__dirname, 'client-angular', 'src', 'themes.scss');

  try {
    const themesContent = `@use '@nebular/theme/styles/theming' as *;
@use '@nebular/theme/styles/themes/default' as default;

$nb-themes: nb-register-theme((
  // Core theme customizations
  color-primary-100: #cceeff,
  color-primary-200: #99ddff,
  color-primary-300: #66ccff,
  color-primary-400: #33bbff,
  color-primary-500: #00aaff,
  color-primary-600: #0088cc,
  color-primary-700: #006699,
  color-primary-800: #004466,
  color-primary-900: #002233,
), default, default);
`;

    fs.writeFileSync(themesPath, themesContent);
    console.log(`Created/updated themes file: ${themesPath}`);
  } catch (error) {
    console.error(`Error fixing themes file: ${error}`);
  }
}

// Fix component custom-nebular-components.ts
function updateCustomNebularComponentsImport() {
  const moduleFiles = [
    'src/app/app.module.ts',
    'src/app/shared/nebular.module.ts',
    'src/app/features/admin/admin.module.ts',
    'src/app/features/telemetry/telemetry.module.ts',
  ];

  const importStatement =
    "import { NbPaginatorModule, NbSortModule, NbDividerModule } from '../shared/components/custom-nebular-components';";
  const alternateImport =
    "import { NbPaginatorModule, NbSortModule, NbDividerModule } from '../../shared/components/custom-nebular-components';";

  moduleFiles.forEach(relativeFilePath => {
    const filePath = path.join(__dirname, 'client-angular', relativeFilePath);

    try {
      if (fs.existsSync(filePath)) {
        console.log(`Checking module file: ${filePath}`);
        let content = fs.readFileSync(filePath, 'utf8');

        // Check if import already exists
        if (!content.includes('NbPaginatorModule') || !content.includes('NbSortModule')) {
          // Determine which import to use based on file path
          const importToUse = relativeFilePath.startsWith('src/app/features/')
            ? alternateImport
            : importStatement;

          // Add import statement after other imports
          const lines = content.split('\n');
          let lastImportIndex = -1;

          for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().startsWith('import ')) {
              lastImportIndex = i;
            }
          }

          if (lastImportIndex >= 0) {
            lines.splice(lastImportIndex + 1, 0, importToUse);
            content = lines.join('\n');
            fs.writeFileSync(filePath, content);
            console.log(`Added custom components import to: ${filePath}`);
          }
        } else {
          console.log(`Custom components already imported in: ${filePath}`);
        }
      }
    } catch (error) {
      console.error(`Error updating module file ${filePath}: ${error}`);
    }
  });
}

// Fix the trailing commas in Component decorators
function fixTrailingCommas() {
  const appDir = path.join(__dirname, 'client-angular', 'src', 'app');

  function findTsFiles(dir) {
    const files = [];

    function walk(currentDir) {
      const dirContents = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of dirContents) {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.ts')) {
          files.push(fullPath);
        }
      }
    }

    walk(dir);
    return files;
  }

  const tsFiles = findTsFiles(appDir);
  console.log(`Found ${tsFiles.length} TypeScript files to check for trailing commas`);

  let fixCount = 0;

  tsFiles.forEach(file => {
    try {
      let content = fs.readFileSync(file, 'utf8');
      let modified = false;

      // Fix trailing commas in @Component decorator
      const fixedContent = content.replace(/,(\s*})\)/g, '$1)');

      // Fix trailing commas in imports array
      const fixedContent2 = fixedContent.replace(
        /imports\s*:\s*\[(.*),(\s*)\]/gs,
        (match, imports, spacing) => {
          return `imports: [${imports}${spacing}]`;
        },
      );

      // Fix standalone comma at end of file
      const fixedContent3 = fixedContent2.replace(/,\s*$/g, '');

      if (content !== fixedContent3) {
        fs.writeFileSync(file, fixedContent3);
        fixCount++;
        modified = true;
      }

      if (modified) {
        console.log(`Fixed trailing commas in: ${file}`);
      }
    } catch (error) {
      console.error(`Error processing file ${file}: ${error}`);
    }
  });

  console.log(`Fixed trailing commas in ${fixCount} files`);
}

// Run all fixes
function runAllFixes() {
  console.log('Starting SCSS token fixes...');
  fixTokensFile();
  fixStylesFile();
  fixThemesFile();
  updateCustomNebularComponentsImport();
  fixTrailingCommas();
  console.log('All SCSS token fixes complete!');
}

runAllFixes();
