// audit-angular-imports.mjs
// Usage: node audit-angular-imports.mjs [rootDir]
// Scans Angular project for import/export/standalone issues after Nebular migration

import fs from 'fs/promises';
import path from 'path';

const ROOT = process.argv[2] || './client-angular/src/app';
const DEPRECATED = [
  'NbSortModule',
  'NbSortComponent',
  'NbSortHeaderComponent',
  'NbPaginatorComponent',
  'NbDividerComponent',
  'MatSortModule',
  'MatSort',
  'MatPaginator',
  'MatDivider',
  'Emerald',
  'emerald',
  'material',
  'Material',
];
const CUSTOM_STANDALONE = [
  'AppSortComponent',
  'AppSortHeaderComponent',
  'NbPaginatorComponent',
  'NbDividerComponent',
];

const results = [];

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function scanFile(file) {
  const content = await fs.readFile(file, 'utf8');
  const issues = [];

  // 1. Deprecated imports
  for (const dep of DEPRECATED) {
    const regex = new RegExp(`\\b${dep}\\b`, 'g');
    if (regex.test(content)) {
      issues.push(`Deprecated reference: ${dep}`);
    }
  }

  // 2. Standalone component declaration
  if (/standalone:\s*true/.test(content)) {
    // Check if this file is being declared in a module elsewhere
    // (This will be caught in the module scan below)
  }

  // 3. NgModule/Component imports/exports/declarations
  if (/@NgModule|@Component/.test(content)) {
    // Find imports array
    const importsMatch = content.match(/imports\s*:\s*\[([^\]]*)\]/s);
    if (importsMatch) {
      const importsArr = importsMatch[1];
      for (const comp of CUSTOM_STANDALONE) {
        const regex = new RegExp(`\\b${comp}\\b`, 'g');
        if (regex.test(importsArr) && !/standalone:\s*true/.test(content)) {
          issues.push(`Standalone component "${comp}" should only be imported, not declared.`);
        }
      }
      // Unused imports: check if imported but not used in template/class
      const importLines = importsArr
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      for (const imp of importLines) {
        if (
          imp &&
          !new RegExp(`\\b${escapeRegExp(imp)}\\b`).test(content.replace(importsArr, ''))
        ) {
          issues.push(`Possibly unused import in imports array: ${imp}`);
        }
      }
    }
    // Find declarations array
    const declarationsMatch = content.match(/declarations\s*:\s*\[([^\]]*)\]/s);
    if (declarationsMatch) {
      const declarationsArr = declarationsMatch[1];
      for (const comp of CUSTOM_STANDALONE) {
        const regex = new RegExp(`\\b${comp}\\b`, 'g');
        if (regex.test(declarationsArr)) {
          issues.push(
            `Standalone component "${comp}" should NOT be declared in declarations array.`,
          );
        }
      }
    }
    // Find exports array
    const exportsMatch = content.match(/exports\s*:\s*\[([^\]]*)\]/s);
    if (exportsMatch) {
      const exportsArr = exportsMatch[1];
      for (const dep of DEPRECATED) {
        const regex = new RegExp(`\\b${dep}\\b`, 'g');
        if (regex.test(exportsArr)) {
          issues.push(`Deprecated export: ${dep}`);
        }
      }
    }
  }

  if (issues.length) {
    results.push({ file, issues });
  }
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      await scanFile(fullPath);
    }
  }
}

(async () => {
  await walk(ROOT);
  if (results.length === 0) {
    console.log('✅ No import/export/standalone issues found.');
  } else {
    console.log('❌ Issues found:');
    for (const { file, issues } of results) {
      console.log(`\nFile: ${file}`);
      for (const issue of issues) {
        console.log(`  - ${issue}`);
      }
    }
  }
})();
