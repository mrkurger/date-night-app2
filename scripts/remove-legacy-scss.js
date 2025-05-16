// scripts/remove-legacy-scss.js
// Script to remove legacy Emerald/Material/DS SCSS references and replace with Nebular/CSS custom properties.
// Usage: node scripts/remove-legacy-scss.js

import { promises as fs } from 'fs';
import path from 'path';

const PROJECT_ROOT = process.cwd();
const SCAN_DIRS = [
  'client-angular/src/app',
  'client-angular/src/styles/design-system',
];
const LEGACY_IMPORT_PATTERNS = [
  /@use\s+['"][^'"]*emerald[^'"]*['"].*;/g,
  /@use\s+['"][^'"]*material[^'"]*['"].*;/g,
  /@use\s+['"][^'"]*ds[^'"]*['"].*;/g,
  /@use\s+['"][^'"]*tokens[^'"]*['"].*;/g,
  /@import\s+['"][^'"]*emerald[^'"]*['"].*;/g,
  /@import\s+['"][^'"]*material[^'"]*['"].*;/g,
  /@import\s+['"][^'"]*ds[^'"]*['"].*;/g,
  /@import\s+['"][^'"]*tokens[^'"]*['"].*;/g,
];
const LEGACY_CLASS_PREFIXES = [
  /\.emerald-/g,
  /\.material-/g,
];
const LEGACY_VARIABLES = [
  { regex: /\$font-heading/g, replacement: 'var(--font-heading) /* TODO: Verify correct CSS variable */' },
  { regex: /\$color-primary/g, replacement: 'var(--color-primary)' },
  { regex: /ds\.\$color-primary/g, replacement: 'var(--color-primary)' },
  { regex: /tokens\.\$color-primary/g, replacement: 'var(--color-primary)' },
  { regex: /ds\.\$([a-zA-Z0-9-_]+)/g, replacement: 'var(--$1) /* TODO: Verify correct CSS variable */' },
  { regex: /tokens\.\$([a-zA-Z0-9-_]+)/g, replacement: 'var(--$1) /* TODO: Verify correct CSS variable */' },
  { regex: /\$([a-zA-Z0-9-_]+)/g, replacement: 'var(--$1) /* TODO: Verify correct CSS variable */' }, // fallback
];

async function processFile(filePath) {
  let content = await fs.readFile(filePath, 'utf8');
  let original = content;

  // Remove legacy @use/@import lines
  for (const pattern of LEGACY_IMPORT_PATTERNS) {
    content = content.replace(pattern, '');
  }

  // Replace legacy class prefixes
  for (const prefix of LEGACY_CLASS_PREFIXES) {
    content = content.replace(prefix, '.nebular-');
  }

  // Replace legacy variables
  for (const { regex, replacement } of LEGACY_VARIABLES) {
    content = content.replace(regex, replacement);
  }

  if (content !== original) {
    await fs.writeFile(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.scss')) {
      await processFile(fullPath);
    }
  }
}

async function main() {
  for (const dir of SCAN_DIRS) {
    const absDir = path.join(PROJECT_ROOT, dir);
    try {
      await walk(absDir);
    } catch (err) {
      // Directory may not exist, skip
    }
  }
  console.log('Legacy SCSS cleanup complete.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
