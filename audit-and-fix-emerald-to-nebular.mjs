// audit-and-fix-emerald-to-nebular.mjs
// Automated migration script: Emerald UI → Nebular UI
// Usage: node audit-and-fix-emerald-to-nebular.mjs [--dry-run]
// This script removes all Emerald UI component imports/usages/selectors, replaces with Nebular equivalents where possible, and removes Emerald-specific SCSS variables.

import fs from 'fs/promises';
import path from 'path';

const ROOT = path.resolve('client-angular', 'src');
const DRY_RUN = process.argv.includes('--dry-run');

// Mapping of Emerald selectors to Nebular equivalents (or null if no direct mapping)
const EMERALD_TO_NEBULAR = {
  'emerald-app-card': 'nb-card',
  'emerald-avatar': 'nb-user',
  'emerald-carousel': null, // No direct Nebular equivalent
  'emerald-info-panel': null, // Use nb-card or nb-accordion
  'emerald-label': 'nb-badge',
  'emerald-page-header': null, // Use nb-card-header or custom
  'emerald-skeleton-loader': null, // Use nb-spinner or custom
  'emerald-toggle': 'nb-toggle',
  'emerald-card-grid': null, // Use CSS grid + nb-card
  'emerald-pager': null, // Use custom pagination or nb-pagination if available
  'emerald-floating-action-button': null, // Use button nbButton shape="round"
  'emerald-tinder-card': null, // Use nb-flip-card or custom
};

// Enhanced regex for Emerald imports (catch barrel, star, and any import from 'emerald')
const EMERALD_IMPORT_ANY_REGEX = /import\s+[^;]*from\s+['"][^'"]*emerald[^'"]*['"];?\n?/gi;

// Enhanced regex for Emerald selectors (catch self-closing, different casing)
function emeraldSelectorRegex(selector) {
  // Matches <emerald-foo ...>, </emerald-foo>, <emerald-foo/>, <emerald-foo .../>
  return new RegExp(`<\/?${selector}([\s>][^>]*|\s*\/?>)`, 'gi');
}

// Regex for Emerald SCSS variables/usages
const EMERALD_SCSS_VAR_REGEX = /emerald\.var\([^)]*\)|\$emerald-[\w-]+/g;

// Track files needing manual follow-up
const manualFollowUpFiles = new Set();

// Utility: Recursively walk a directory and return all files matching a filter
async function walk(dir, filter = () => true) {
  let files = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(await walk(fullPath, filter));
    } else if (filter(fullPath)) {
      files.push(fullPath);
    }
  }
  return files;
}

// Utility: Case-insensitive search for 'emerald' in any file
async function fileContainsEmerald(file) {
  const content = await fs.readFile(file, 'utf8');
  return content.toLowerCase().includes('emerald');
}

// Remove Emerald imports from TypeScript files (enhanced)
async function removeEmeraldImports(tsFile) {
  let content = await fs.readFile(tsFile, 'utf8');
  let changed = false;
  if (EMERALD_IMPORT_ANY_REGEX.test(content)) {
    changed = true;
    content = content.replace(EMERALD_IMPORT_ANY_REGEX, '');
    logChange('REMOVE_EMERALD_IMPORT', tsFile);
  }
  if (changed && !DRY_RUN) await fs.writeFile(tsFile, content, 'utf8');
  return changed;
}

// Replace Emerald selectors in HTML files (enhanced)
async function replaceEmeraldSelectors(htmlFile) {
  let content = await fs.readFile(htmlFile, 'utf8');
  let changed = false;
  for (const [emerald, nebular] of Object.entries(EMERALD_TO_NEBULAR)) {
    const tagRegex = emeraldSelectorRegex(emerald);
    if (tagRegex.test(content)) {
      changed = true;
      if (nebular) {
        content = content.replace(tagRegex, (m, attrs) => {
          // Replace tag name, keep attributes
          return m.startsWith('</') ? `</${nebular}>` : `<${nebular}${attrs}>`;
        });
        logChange('REPLACE_SELECTOR', htmlFile, `${emerald} → ${nebular}`);
      } else {
        // No direct mapping: remove and insert TODO comment
        content = content.replace(
          tagRegex,
          m => `<!-- TODO: Replace ${emerald} with Nebular equivalent -->`,
        );
        logChange('TODO_SELECTOR', htmlFile, emerald);
        manualFollowUpFiles.add(htmlFile);
      }
    }
  }
  if (changed && !DRY_RUN) await fs.writeFile(htmlFile, content, 'utf8');
  return changed;
}

// Remove Emerald-specific SCSS variables/usages
async function removeEmeraldScssVars(scssFile) {
  let content = await fs.readFile(scssFile, 'utf8');
  let changed = false;
  if (EMERALD_SCSS_VAR_REGEX.test(content)) {
    changed = true;
    content = content.replace(EMERALD_SCSS_VAR_REGEX, '');
    logChange('REMOVE_EMERALD_SCSS_VAR', scssFile);
  }
  if (changed && !DRY_RUN) await fs.writeFile(scssFile, content, 'utf8');
  return changed;
}

// Logging utility
function logChange(type, file, details = '') {
  console.log(`[${type}] ${file}${details ? ': ' + details : ''}`);
}

// Main script (enhanced)
(async function main() {
  console.log(`\n--- Emerald → Nebular Migration Script (Enhanced) ---`);
  if (DRY_RUN) console.log('Running in DRY RUN mode. No files will be written.');

  // 1. Remove Emerald imports from .ts files
  const tsFiles = await walk(ROOT, f => f.endsWith('.ts'));
  for (const file of tsFiles) {
    await removeEmeraldImports(file);
  }

  // 2. Replace Emerald selectors in .html files
  const htmlFiles = await walk(ROOT, f => f.endsWith('.html'));
  for (const file of htmlFiles) {
    await replaceEmeraldSelectors(file);
  }

  // 3. Remove Emerald-specific SCSS variables/usages
  const scssFiles = await walk(ROOT, f => f.endsWith('.scss'));
  for (const file of scssFiles) {
    await removeEmeraldScssVars(file);
  }

  // 4. Log all files containing 'emerald' (case-insensitive)
  const allFiles = await walk(ROOT, () => true);
  const filesWithEmerald = [];
  for (const file of allFiles) {
    if (await fileContainsEmerald(file)) {
      filesWithEmerald.push(file);
    }
  }

  // 5. Summary of files needing manual follow-up
  if (manualFollowUpFiles.size > 0) {
    console.log('\n--- MANUAL FOLLOW-UP REQUIRED ---');
    for (const file of manualFollowUpFiles) {
      console.log(`TODO: Review and replace Emerald UI usage in ${file}`);
    }
  } else {
    console.log('\nAll Emerald UI usages replaced or removed.');
  }

  // 6. Summary of all files containing 'emerald'
  if (filesWithEmerald.length > 0) {
    console.log('\n--- FILES CONTAINING "emerald" (case-insensitive) ---');
    for (const file of filesWithEmerald) {
      console.log(file);
    }
  } else {
    console.log('\nNo files containing "emerald" found.');
  }

  console.log('\n--- Script Complete ---');
  if (DRY_RUN) console.log('No files were modified.');
  else console.log('All changes have been applied.');
})();
