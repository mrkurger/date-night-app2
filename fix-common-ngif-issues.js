import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find all component files with ngIf errors
function findNgIfComponents() {
  // List of components that were identified in the build output as having ngIf issues
  const problematicComponents = [
    'client-angular/src/app/features/ad-management/travel-itinerary/travel-itinerary.component.ts',
    'client-angular/src/app/features/auth/register/register.component.ts',
  ];

  console.log(
    `Fixing CommonModule imports for ngIf components: ${problematicComponents.length} files`,
  );

  problematicComponents.forEach(file => {
    fixComponentImport(path.join(__dirname, file));
  });
}

// Fix missing imports in component
function fixComponentImport(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      console.log(`Fixing imports for ${filePath}`);
      const content = fs.readFileSync(filePath, 'utf8');

      // Check if this is a standalone component
      const isStandalone = content.includes('standalone: true');

      if (isStandalone) {
        // For standalone components, we need to add CommonModule to imports
        let updatedContent = content;

        // First, ensure CommonModule is imported
        if (!content.includes('import { CommonModule }')) {
          updatedContent = updatedContent.replace(
            'import {',
            "import { CommonModule } from '@angular/common';\nimport {",
          );
        }

        // Then ensure it's in the imports array
        if (!content.includes('imports: [') || !content.includes('CommonModule')) {
          // Add CommonModule to imports array
          if (content.includes('imports: [')) {
            updatedContent = updatedContent.replace('imports: [', 'imports: [CommonModule, ');
          } else {
            updatedContent = updatedContent.replace(
              'standalone: true,',
              'standalone: true,\n  imports: [CommonModule],',
            );
          }
        }

        // Add ReactiveFormsModule if the component seems to be using forms
        if (content.includes('formGroup') && !content.includes('ReactiveFormsModule')) {
          // First, ensure ReactiveFormsModule is imported
          if (!content.includes('import { ReactiveFormsModule }')) {
            updatedContent = updatedContent.replace(
              'import {',
              "import { ReactiveFormsModule } from '@angular/forms';\nimport {",
            );
          }

          // Then add it to imports if missing
          if (
            !updatedContent.includes('imports: [ReactiveFormsModule') &&
            !updatedContent.includes('imports: [CommonModule, ReactiveFormsModule')
          ) {
            updatedContent = updatedContent.replace(
              'imports: [CommonModule',
              'imports: [CommonModule, ReactiveFormsModule',
            );
          }
        }

        fs.writeFileSync(filePath, updatedContent);
        console.log(`Updated standalone component ${filePath}`);
      } else {
        // For non-standalone components, make sure component has proper imports in its module
        fixParentModule(filePath);
      }
    } else {
      console.error(`File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing component ${filePath}: ${error.message}`);
  }
}

// Find the parent module for non-standalone components
function fixParentModule(componentPath) {
  // Extract the feature directory from the component path
  const parts = componentPath.split('/');
  const featureIndex = parts.indexOf('features');

  if (featureIndex === -1) {
    console.error(`Cannot find feature directory for ${componentPath}`);
    return;
  }

  const featureName = parts[featureIndex + 1];
  const modulePath = path.join(
    __dirname,
    'client-angular',
    'src',
    'app',
    'features',
    featureName,
    `${featureName}.module.ts`,
  );

  // Check if module file exists
  if (fs.existsSync(modulePath)) {
    console.log(`Found module file ${modulePath}`);

    // Read module file
    const moduleContent = fs.readFileSync(modulePath, 'utf8');

    // Ensure CommonModule and ReactiveFormsModule are imported
    let updatedModuleContent = moduleContent;

    // Add imports if needed
    if (!moduleContent.includes('import { CommonModule }')) {
      updatedModuleContent = updatedModuleContent.replace(
        'import {',
        "import { CommonModule } from '@angular/common';\nimport {",
      );
    }

    if (
      componentPath.includes('form') &&
      !moduleContent.includes('import { ReactiveFormsModule }')
    ) {
      updatedModuleContent = updatedModuleContent.replace(
        'import {',
        "import { ReactiveFormsModule } from '@angular/forms';\nimport {",
      );
    }

    // Add modules to imports array if needed
    if (!updatedModuleContent.includes('CommonModule')) {
      updatedModuleContent = updatedModuleContent.replace(
        'imports: [',
        'imports: [\n    CommonModule,',
      );
    }

    if (componentPath.includes('form') && !updatedModuleContent.includes('ReactiveFormsModule')) {
      updatedModuleContent = updatedModuleContent.replace(
        'imports: [',
        'imports: [\n    ReactiveFormsModule,',
      );
    }

    // Remove trailing commas
    updatedModuleContent = updatedModuleContent.replace(/,(\s*[}\]])/g, '$1');

    // Write updated module file
    fs.writeFileSync(modulePath, updatedModuleContent);
    console.log(`Updated module file ${modulePath}`);
  } else {
    // Create a temporary helper component wrapper since we can't find the module
    console.log(`Module file not found for ${componentPath}, creating helper wrapper`);

    const componentName = path.basename(componentPath, '.ts');
    const helperPath = componentPath.replace('.ts', '.helper.ts');

    const helperContent = `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ${componentName} } from './${componentName}';

@Component({
  selector: 'app-${componentName}-wrapper',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ${componentName}],
  template: '<${componentName}></${componentName}>'
})
export class ${componentName}Wrapper {}`;

    fs.writeFileSync(helperPath, helperContent);
    console.log(`Created helper wrapper at ${helperPath}`);
  }
}

// Fix all SCSS issues by updating the color variables
function fixScssColorIssues() {
  const designTokensPath = path.join(
    __dirname,
    'client-angular',
    'src',
    'app',
    'core',
    'design',
    'design-tokens.scss',
  );

  if (fs.existsSync(designTokensPath)) {
    console.log(`Fixing SCSS color issues in ${designTokensPath}`);

    const content = fs.readFileSync(designTokensPath, 'utf8');

    // Replace problematic color adjustment with direct color values
    const updatedContent = content.replace(
      /$neutral-800: color\.adjust\(var\(--color-dark-gray-3\), \$lightness: -10%\);/g,
      '$neutral-800: #2e3a59; // Fixed from var(--color-dark-gray-3)',
    );

    fs.writeFileSync(designTokensPath, updatedContent);
    console.log(`Updated design-tokens.scss with fixed color values`);
  } else {
    console.error(`Design tokens file not found at ${designTokensPath}`);
  }
}

// Fix routerLink issues in app.component.html
function fixRouterLinkIssues() {
  const appComponentPath = path.join(__dirname, 'client-angular', 'src', 'app', 'app.component.ts');

  if (fs.existsSync(appComponentPath)) {
    console.log(`Fixing RouterModule issues in ${appComponentPath}`);

    const content = fs.readFileSync(appComponentPath, 'utf8');

    // Add RouterModule to imports if needed
    let updatedContent = content;

    if (!content.includes('import { RouterModule }')) {
      updatedContent = updatedContent.replace(
        'import {',
        "import { RouterModule } from '@angular/router';\nimport {",
      );
    }

    if (content.includes('standalone: true') && !content.includes('RouterModule')) {
      updatedContent = updatedContent.replace('imports: [', 'imports: [RouterModule, ');
    }

    fs.writeFileSync(appComponentPath, updatedContent);
    console.log(`Updated app.component.ts with RouterModule import`);
  } else {
    console.error(`App component file not found at ${appComponentPath}`);
  }
}

// Fix NbDividerModule references
function fixNbDividerModuleIssues() {
  const componentsWithDividerModule = [
    'client-angular/src/app/features/admin/components/alert-form-dialog/alert-form-dialog.component.ts',
    'client-angular/src/app/features/favorites/favorites-list/favorites-list.component.ts',
    'client-angular/src/app/features/favorites/favorites-page/favorites-page.component.ts',
  ];

  componentsWithDividerModule.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);

    if (fs.existsSync(fullPath)) {
      console.log(`Fixing NbDividerModule issues in ${fullPath}`);

      const content = fs.readFileSync(fullPath, 'utf8');

      // Replace NbDividerModule with NbDividerComponent and import from custom component
      const updatedContent = content
        .replace(/NbDividerModule/g, 'NbDividerComponent')
        .replace(
          "} from '@nebular/theme'",
          "} from '@nebular/theme';\nimport { NbDividerComponent } from '../../../shared/components/custom-nebular-components'",
        );

      fs.writeFileSync(fullPath, updatedContent);
      console.log(`Updated ${fullPath} with NbDividerComponent import`);
    } else {
      console.error(`File not found: ${fullPath}`);
    }
  });
}

// Fix trailing comma issues
function fixTrailingCommaIssues() {
  const tsFiles = findAllTsFiles(path.join(__dirname, 'client-angular', 'src'));

  console.log(`Checking ${tsFiles.length} TypeScript files for trailing comma issues`);

  let fixedCount = 0;

  tsFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');

      // Find class decorators with trailing commas
      const regex = /(@Component\(\s*{\s*[^}]*,\s*}\s*\))/g;

      if (regex.test(content)) {
        // Remove trailing commas in object literals inside decorators
        const updatedContent = content.replace(/,(\s*}\s*\))/g, '$1');

        fs.writeFileSync(file, updatedContent);
        fixedCount++;
        console.log(`Fixed trailing comma in ${file}`);
      }
    } catch (error) {
      console.error(`Error fixing trailing commas in ${file}: ${error.message}`);
    }
  });

  console.log(`Fixed trailing commas in ${fixedCount} files`);
}

// Helper function to find all TypeScript files
function findAllTsFiles(directory) {
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

// Main function to run all fixes
function runAllFixes() {
  console.log('Starting frontend error fixes...');

  // Fix *ngIf issues - fix CommonModule imports
  findNgIfComponents();

  // Fix SCSS color issues
  fixScssColorIssues();

  // Fix RouterModule issues
  fixRouterLinkIssues();

  // Fix NbDividerModule issues
  fixNbDividerModuleIssues();

  // Fix trailing comma issues
  fixTrailingCommaIssues();

  console.log('All frontend error fixes completed!');
}

runAllFixes();
