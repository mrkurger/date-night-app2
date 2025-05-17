// remove-deprecated-imports.mjs
// Usage: node remove-deprecated-imports.mjs [rootDir]

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

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function processFile(file) {
  let content = await fs.readFile(file, 'utf8');
  let original = content;
  let changed = false;

  // Remove deprecated import lines
  for (const dep of DEPRECATED) {
    // Remove entire import line if it contains a deprecated symbol
    const importRegex = new RegExp(`^.*import.*\\b${escapeRegExp(dep)}\\b.*;\\s*$`, 'gm');
    if (importRegex.test(content)) {
      content = content.replace(importRegex, '');
      changed = true;
    }
  }

  // Optionally, comment out inline usage of deprecated symbols (for safety)
  for (const dep of DEPRECATED) {
    const usageRegex = new RegExp(`\\b${escapeRegExp(dep)}\\b`, 'g');
    if (usageRegex.test(content)) {
      content = content.replace(usageRegex, `/*DEPRECATED:${dep}*/`);
      changed = true;
    }
  }

  if (changed && content !== original) {
    await fs.writeFile(file, content, 'utf8');
    console.log(`Cleaned: ${file}`);
  }
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      await processFile(fullPath);
    }
  }
}

(async () => {
  await walk(ROOT);
  console.log('✅ Deprecated imports removal complete.');
})();
