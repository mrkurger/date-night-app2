// scripts/fix-scss-and-list-legacy.js
import { promises as fs } from 'fs';
import path from 'path';

const PROJECT_ROOT = process.cwd();
const SCAN_DIR = path.join(PROJECT_ROOT, 'client-angular', 'src');
const LEGACY_PATTERNS = [
  /emerald/i,
  /material/i,
  /ds\./,
  /tokens\./,
  /\$font-heading/,
  /\$color-primary/,
  /@use\s+['"][^'"]*(emerald|material|ds|tokens)[^'"]*['"]/,
  /@import\s+['"][^'"]*(emerald|material|ds|tokens)[^'"]*['"]/,
];

// Map legacy SCSS variables to Nebular/CSS custom properties
const REPLACEMENTS = [
  // Add more as needed
  [/\$color-primary/g, 'var(--nb-primary-color)'],
  [/\$color-secondary/g, 'var(--nb-secondary-color)'],
  [/\$color-accent/g, 'var(--nb-accent-color)'],
  [/\$color-success/g, 'var(--nb-success-color)'],
  [/\$color-warning/g, 'var(--nb-warning-color)'],
  [/\$color-danger/g, 'var(--nb-danger-color)'],
  [/\$color-info/g, 'var(--nb-info-color)'],
  [/\$font-heading/g, 'var(--nb-font-heading)'],
  [/\$font-body/g, 'var(--nb-font-body)'],
  [/\$font-size-base/g, 'var(--nb-font-size)'],
  [/\$border-radius/g, 'var(--nb-border-radius)'],
  [/\$shadow/g, 'var(--nb-shadow)'],
  // Add more mappings as you discover them
];

const CSS_IMPORTS_TO_REMOVE = [
  /@import\s+['"][^'"]*node_modules\/@nebular\/theme\/styles\/prebuilt\/default\.css['"];/g,
  /@import\s+['"][^'"]*node_modules\/primeicons\/primeicons\.css['"];/g,
];

const INVALID_VAR_ASSIGN = /^\s*var\(--([^)]+)\)\s*:\s*([^;]+);/gm;
const INVALID_FOR_LOOP =
  /^\s*@for\s+var\(--([^)]+)\)\s+from\s+([^\s]+)\s+through\s+([^\s]+)\s*\{/gm;
const INVALID_SCSS_FN = /color\.adjust\([^)]+\)/g;

const legacyFiles = new Set();

const DRY_RUN = process.argv.includes('--dry-run');

async function scanAndFixFile(filePath) {
  let content = await fs.readFile(filePath, 'utf8');
  let original = content;
  let changed = false;

  // Remove invalid CSS imports
  for (const pattern of CSS_IMPORTS_TO_REMOVE) {
    if (pattern.test(content)) {
      content = content.replace(
        pattern,
        '/* Removed invalid CSS import (should be in angular.json) */',
      );
      changed = true;
    }
  }

  // Fix invalid var(--foo): value; → --foo: value; (add :root if not present)
  content = content.replace(INVALID_VAR_ASSIGN, (match, varName, value) => {
    changed = true;
    return `/* TODO: Move this to :root or a selector if needed */\n--${varName}: ${value};`;
  });

  // Remove invalid @for loops using CSS variables
  content = content.replace(INVALID_FOR_LOOP, match => {
    changed = true;
    return `/* TODO: Invalid @for loop using CSS variable removed: ${match} */`;
  });

  // Remove invalid SCSS function calls with CSS variables
  content = content.replace(INVALID_SCSS_FN, match => {
    changed = true;
    return `/* TODO: Invalid SCSS function call with CSS variable removed: ${match} */`;
  });

  // Auto-replace legacy variables with Nebular/CSS custom properties
  for (const replacement of REPLACEMENTS) {
    const pattern = replacement[0];
    const replacementText = replacement[1];
    if (pattern instanceof RegExp && typeof replacementText === 'string' && pattern.test(content)) {
      content = content.replace(pattern, replacementText);
      changed = true;
    }
  }

  // List legacy references
  for (const pattern of LEGACY_PATTERNS) {
    if (pattern instanceof RegExp && pattern.test(content)) {
      legacyFiles.add(filePath);
    }
  }

  // Write back if changed
  if (changed && content !== original) {
    if (DRY_RUN) {
      console.log(`--- [DRY RUN] Would fix: ${filePath} ---`);
      // Show a diff-like preview (first 5 changed lines)
      const origLines = original.split('\n');
      const newLines = content.split('\n');
      let shown = 0;
      for (let i = 0; i < Math.max(origLines.length, newLines.length); i++) {
        if (origLines[i] !== newLines[i]) {
          console.log(`- ${origLines[i] || ''}`);
          console.log(`+ ${newLines[i] || ''}`);
          shown++;
          if (shown >= 5) {
            console.log('... (more changes not shown)');
            break;
          }
        }
      }
    } else {
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
    }
  }
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.scss')) {
      await scanAndFixFile(fullPath);
    }
  }
}

async function main() {
  await walk(SCAN_DIR);

  // List files with legacy references
  if (legacyFiles.size > 0) {
    console.log('\nFiles with legacy emerald/material/ds/tokens references:');
    for (const file of legacyFiles) {
      console.log(file);
    }
  } else {
    console.log('\nNo files with legacy emerald/material/ds/tokens references found.');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
