// audit-and-fix-angular-migration.mjs
// Usage: node audit-and-fix-angular-migration.mjs
// This script automates key migration fixes for Nebular/Angular standalone/component/module issues and SCSS deprecations.
// It is safe to run recursively from your Angular project root. Review changes with git before committing.

import fs from 'fs/promises';
import path from 'path';

const projectRoot = process.cwd();
const srcDir = path.join(projectRoot, 'client-angular', 'src');

// Utility: Recursively get all files matching a filter
async function getAllFiles(dir, filter = () => true) {
  let files = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(await getAllFiles(fullPath, filter));
    } else if (filter(fullPath)) {
      files.push(fullPath);
    }
  }
  return files;
}

// 1. Remove standalone components from NgModule declarations and add to imports
async function fixStandaloneDeclarations() {
  const tsFiles = await getAllFiles(srcDir, (f) => f.endsWith('.ts'));
  for (const file of tsFiles) {
    let content = await fs.readFile(file, 'utf8');
    let changed = false;

    // Find @NgModule blocks
    const ngModuleRegex = /@NgModule\s*\(\s*{([\s\S]*?)}\s*\)/gm;
    let match;
    while ((match = ngModuleRegex.exec(content)) !== null) {
      let block = match[1];
      // Find declarations: [ ... ]
      const declRegex = /declarations\s*:\s*\[([\s\S]*?)\]/m;
      const importsRegex = /imports\s*:\s*\[([\s\S]*?)\]/m;
      const standaloneRegex =
        /import\s*{\s*([A-Za-z0-9_,\s]+)\s*}\s*from\s*['"][^'"]+\.component['"];?/g;

      // Find all imported symbols in this file from .component files
      let standaloneComponents = [];
      let importMatch;
      while ((importMatch = standaloneRegex.exec(content)) !== null) {
        standaloneComponents.push(...importMatch[1].split(',').map((s) => s.trim()));
      }

      // Remove standalone components from declarations
      if (declRegex.test(block)) {
        let declBlock = block.match(declRegex)[1];
        let newDeclBlock = declBlock;
        for (const comp of standaloneComponents) {
          // Remove from declarations
          const compRegex = new RegExp(`\\b${comp}\\b,?\\s*`, 'g');
          newDeclBlock = newDeclBlock.replace(compRegex, '');
        }
        if (newDeclBlock !== declBlock) {
          block = block.replace(declBlock, newDeclBlock);
          changed = true;
        }
      }

      // Add standalone components to imports if not present
      if (importsRegex.test(block)) {
        let importsBlock = block.match(importsRegex)[1];
        let newImportsBlock = importsBlock;
        for (const comp of standaloneComponents) {
          if (!new RegExp(`\\b${comp}\\b`).test(importsBlock)) {
            newImportsBlock += `\n    ${comp},`;
            changed = true;
          }
        }
        if (newImportsBlock !== importsBlock) {
          block = block.replace(importsBlock, newImportsBlock);
        }
      }

      // Replace the @NgModule block in content
      content = content.replace(match[1], block);
    }

    if (changed) {
      await fs.writeFile(file, content, 'utf8');
      console.log(`[Standalone Fix] Updated: ${file}`);
    }
  }
}

// 2. Add required Nebular modules/components to imports arrays if selectors are used in the template
const nebularSelectorToModule = {
  'nb-card': 'NbCardModule',
  'nb-card-header': 'NbCardModule',
  'nb-card-body': 'NbCardModule',
  'nb-card-footer': 'NbCardModule',
  'nb-badge': 'NbBadgeModule',
  'nb-user': 'NbUserModule',
  'nb-alert': 'NbAlertModule',
  'nb-table': 'NbTableModule',
  'nb-tree-grid': 'NbTreeGridModule',
  'nb-tag': 'NbTagModule',
  'nb-tag-list': 'NbTagModule',
  'nb-paginator': 'NbPaginatorModule',
  'nb-hint': 'NbFormFieldModule',
  'nb-form-field': 'NbFormFieldModule',
  'nb-form-field-label': 'NbFormFieldModule',
  'nb-form-field-control': 'NbFormFieldModule',
  'nb-form-field-hint': 'NbFormFieldModule',
  'nb-error': 'NbFormFieldModule',
  'nb-select': 'NbSelectModule',
  'nb-option': 'NbSelectModule',
  'nb-icon': 'NbIconModule',
  'nb-toggle': 'NbToggleModule',
  'nb-tooltip': 'NbTooltipModule',
  'nb-datepicker-toggle': 'NbDatepickerModule',
  // Add more as needed
};

async function fixNebularImports() {
  const tsFiles = await getAllFiles(srcDir, (f) => f.endsWith('.ts'));
  for (const file of tsFiles) {
    let content = await fs.readFile(file, 'utf8');
    let changed = false;

    // Find the templateUrl or inline template
    const templateUrlMatch = content.match(/templateUrl\s*:\s*['"](.+?)['"]/);
    let templateContent = '';
    if (templateUrlMatch) {
      // External template
      const templatePath = path.join(path.dirname(file), templateUrlMatch[1]);
      try {
        templateContent = await fs.readFile(templatePath, 'utf8');
      } catch {
        continue;
      }
    } else {
      // Inline template
      const templateMatch = content.match(/template\s*:\s*`([\s\S]*?)`/);
      if (templateMatch) templateContent = templateMatch[1];
    }

    // Find used Nebular selectors
    let usedModules = new Set();
    for (const selector in nebularSelectorToModule) {
      if (templateContent.includes(`<${selector}`) || templateContent.includes(`</${selector}`)) {
        usedModules.add(nebularSelectorToModule[selector]);
      }
    }
    if (usedModules.size === 0) continue;

    // Add missing Nebular modules to imports array
    const importsRegex = /imports\s*:\s*\[([\s\S]*?)\]/m;
    if (importsRegex.test(content)) {
      let importsBlock = content.match(importsRegex)[1];
      let newImportsBlock = importsBlock;
      for (const mod of usedModules) {
        if (!new RegExp(`\\b${mod}\\b`).test(importsBlock)) {
          newImportsBlock += `\n    ${mod},`;
          changed = true;
        }
      }
      if (newImportsBlock !== importsBlock) {
        content = content.replace(importsBlock, newImportsBlock);
      }
    }

    // Add missing Nebular imports at the top if needed
    for (const mod of usedModules) {
      if (!content.includes(`import { ${mod} } from '@nebular/theme'`)) {
        content = `import { ${mod} } from '@nebular/theme';\n` + content;
        changed = true;
      }
    }

    if (changed) {
      await fs.writeFile(file, content, 'utf8');
      console.log(`[Nebular Import Fix] Updated: ${file}`);
    }
  }
}

// 3. Replace deprecated SCSS functions (map-get → map.get)
async function fixScssDeprecations() {
  const scssFiles = await getAllFiles(srcDir, (f) => f.endsWith('.scss'));
  for (const file of scssFiles) {
    let content = await fs.readFile(file, 'utf8');
    if (content.includes('map-get(')) {
      const newContent = content.replace(/map-get\(/g, 'map.get(');
      await fs.writeFile(file, newContent, 'utf8');
      console.log(`[SCSS Fix] Updated: ${file}`);
    }
  }
}

// 4. Fix zone.js import in polyfills.ts
async function fixZoneJsImport() {
  const polyfillsPath = path.join(srcDir, 'polyfills.ts');
  try {
    let content = await fs.readFile(polyfillsPath, 'utf8');
    if (content.includes('zone.js/dist/zone')) {
      const newContent = content.replace(/zone\.js\/dist\/zone/g, 'zone.js');
      await fs.writeFile(polyfillsPath, newContent, 'utf8');
      console.log(`[Zone.js Fix] Updated: ${polyfillsPath}`);
    }
  } catch {
    // File may not exist
  }
}

// MAIN
(async () => {
  console.log('--- Angular/Nebular Migration Audit & Fix Script ---');
  await fixStandaloneDeclarations();
  await fixNebularImports();
  await fixScssDeprecations();
  await fixZoneJsImport();
  console.log(
    '--- All automated fixes complete. Please review changes with git before committing. ---',
  );
})();
