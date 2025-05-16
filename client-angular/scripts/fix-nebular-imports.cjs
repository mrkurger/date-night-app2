#!/usr/bin/env node
// @ts-check
/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * This script fixes Nebular component imports in Angular components
 * It consolidates multiple imports from @nebular/theme into a single import
 * It adds missing imports for components used in templates
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the project root directory
const projectRoot = path.resolve(__dirname, '..');
const componentsDir = path.join(projectRoot, 'src', 'app', 'shared', 'components');

// List of all Nebular modules that might be used
const nebularModules = [
  'NbIconModule',
  'NbCardModule',
  'NbButtonModule',
  'NbInputModule',
  'NbFormFieldModule',
  'NbDialogModule',
  'NbSelectModule',
  'NbSpinnerModule',
  'NbTagModule',
  'NbTooltipModule',
  'NbToggleModule',
  'NbBadgeModule',
  'NbUserModule',
  'NbDialogRef',
  'NB_DIALOG_CONFIG',
  'NbTagInputAddEvent',
];

// Process a component file
function processComponentFile(filePath) {
  console.log(`Processing ${filePath}...`);

  // Read the file content
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if the file already has consolidated imports
  if (content.includes('import {') && content.includes("} from '@nebular/theme';")) {
    console.log(`  Already has consolidated imports`);
    return;
  }

  // Find all individual Nebular imports
  const importRegex = /import\s+{\s*([^}]+)\s*}\s+from\s+['"]@nebular\/theme['"];/g;
  const individualImportRegex = /import\s+(\w+)\s+from\s+['"]@nebular\/theme['"];/g;

  // Collect all imported modules
  const importedModules = new Set();

  // Find imports using the first pattern
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const modules = match[1].split(',').map((m) => m.trim());
    modules.forEach((module) => importedModules.add(module));
  }

  // Find imports using the second pattern
  while ((match = individualImportRegex.exec(content)) !== null) {
    importedModules.add(match[1]);
  }

  // Check template for usage of Nebular components
  nebularModules.forEach((module) => {
    // Skip if already imported
    if (importedModules.has(module)) {
      return;
    }

    // Check if the module name (without 'Module' suffix) is used in the template
    const componentName = module.replace('Module', '').toLowerCase();
    if (
      content.includes(`nb-${componentName}`) ||
      content.includes(`[nb${componentName}]`) ||
      content.includes(`(nb${componentName})`) ||
      content.includes(`nbInput`) ||
      content.includes(`nbButton`) ||
      content.includes(`nbTooltip`) ||
      content.includes(`nbSpinner`)
    ) {
      importedModules.add(module);
    }
  });

  // Check for dialog components
  if (content.includes('dialogRef') || content.includes('NbDialogRef')) {
    importedModules.add('NbDialogRef');
  }

  if (content.includes('@Inject') && content.includes('DIALOG_DATA')) {
    importedModules.add('NB_DIALOG_CONFIG');
  }

  // Remove all existing Nebular imports
  content = content.replace(/import\s+{\s*[^}]+\s*}\s+from\s+['"]@nebular\/theme['"];/g, '');
  content = content.replace(/import\s+\w+\s+from\s+['"]@nebular\/theme['"];/g, '');

  // Create a new consolidated import statement
  const importStatement = `import {\n  ${Array.from(importedModules).join(',\n  ')}\n} from '@nebular/theme';`;

  // Add the new import statement at the beginning of the file
  content = importStatement + '\n' + content;

  // Write the updated content back to the file
  fs.writeFileSync(filePath, content);
  console.log(`  Updated with consolidated imports: ${Array.from(importedModules).join(', ')}`);
}

// Process all component files
function processAllComponents() {
  // Get all subdirectories in the components directory
  const componentDirs = fs
    .readdirSync(componentsDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => path.join(componentsDir, dirent.name));

  // Process each component directory
  componentDirs.forEach((dir) => {
    // Find the component file (*.component.ts)
    const componentFiles = fs
      .readdirSync(dir)
      .filter((file) => file.endsWith('.component.ts'))
      .map((file) => path.join(dir, file));

    // Process each component file
    componentFiles.forEach(processComponentFile);
  });
}

// Run the script
try {
  processAllComponents();
  console.log('Nebular imports fixed successfully!');
} catch (error) {
  console.error('Error fixing Nebular imports:', error);
  process.exit(1);
}
