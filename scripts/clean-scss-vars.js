// clean-scss-vars.js
// Node.js ESModule script to clean invalid CSS variable assignments from SCSS files
// Usage: node scripts/clean-scss-vars.js [--dry-run]
// - Recursively scans all .scss files under client-angular/src/
// - Removes lines like 'var(--foo): ...;' outside of selector/:root
// - Supports --dry-run to preview changes

import { promises as fs } from 'fs';
import path from 'path';

const SRC_DIR = path.resolve('client-angular/src');
const DRY_RUN = process.argv.includes('--dry-run');

async function getScssFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(entry => {
      const res = path.resolve(dir, entry.name);
      return entry.isDirectory() ? getScssFiles(res) : res;
    }),
  );
  return Array.prototype.concat(...files).filter(f => f.endsWith('.scss'));
}

function isTopLevel(line, insideBlock) {
  // Only consider lines outside of any selector or block
  return !insideBlock && line.trim().startsWith('var(--');
}

async function cleanFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  const lines = content.split('\n');
  let insideBlock = false;
  let changed = false;
  const cleaned = [];

  for (let line of lines) {
    // Track if we're inside a selector/block
    if (line.includes('{')) insideBlock = true;
    if (line.includes('}')) insideBlock = false;

    // Remove top-level var(--foo): ...; lines
    if (isTopLevel(line, insideBlock)) {
      changed = true;
      if (DRY_RUN) {
        console.log(`[DRY RUN] Would remove in ${filePath}: ${line.trim()}`);
      }
      continue;
    }
    cleaned.push(line);
  }

  if (changed && !DRY_RUN) {
    await fs.writeFile(filePath, cleaned.join('\n'), 'utf8');
    console.log(`Fixed: ${filePath}`);
  }
}

async function main() {
  const files = await getScssFiles(SRC_DIR);
  let found = false;
  for (const file of files) {
    await cleanFile(file);
  }
  if (DRY_RUN) {
    console.log('[DRY RUN] Complete.');
  } else {
    console.log('SCSS cleanup complete.');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
