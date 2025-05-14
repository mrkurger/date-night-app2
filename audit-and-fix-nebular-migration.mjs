// audit-and-fix-nebular-migration.mjs
// Comprehensive migration audit/fix script for Angular Nebular migration
// Uses ESModules syntax. Run with: node audit-and-fix-nebular-migration.mjs [--dry-run]

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// --- CONFIGURATION ---
const ROOT = path.resolve('client-angular', 'src');
const DRY_RUN = process.argv.includes('--dry-run');

// Nebular modules to check for duplicates and deprecations
const NEBULAR_MODULES = [
  'NbCardModule',
  'NbIconModule',
  'NbSelectModule',
  'NbFormFieldModule',
  'NbTagModule',
  'NbAlertModule',
  'NbBadgeModule',
  'NbUserModule',
  'NbButtonModule',
  'NbTooltipModule',
  'NbToggleModule',
  'NbTabsetModule',
  'NbLayoutModule',
];
const DEPRECATED_NEBULAR_MODULES = ['NbPaginatorModule', 'NbSortModule', 'NbPaginationModule'];
const DEPRECATED_ELEMENTS = ['nb-hint', 'nb-error', 'nb-form-field-control', 'nb-menu-item'];
const DELETED_COMPONENTS = ['custom-nebular-components', 'sort.component'];
const SCSS_MAP_PATTERNS = [/map\.get\(/, /tokens\./, /ds\./];

const SCSS_IMPORT_FIXES = [
  {
    pattern:
      /@import ['"]\.\/node_modules\/(@nebular\/theme\/styles\/prebuilt\/default\.css)['"];?/g,
    replacement: `@import '~@nebular/theme/styles/prebuilt/default.css';`,
  },
  {
    pattern: /@import ['"]\.\/node_modules\/eva-icons\/style\/eva-icons\.css['"];?/g,
    replacement: `@import '~eva-icons/style/eva-icons.css';`,
  },
];

// --- ENHANCED: Patterns for auto-replacement of legacy SCSS ---
const SCSS_AUTO_REPLACEMENTS = [
  // Replace map.get($colors, 'primary') with Nebular CSS var
  { pattern: /map\.get\([^,]+, *['"]primary['"]\)/g, replacement: 'var(--nb-theme-primary)' },
  { pattern: /map\.get\([^,]+, *['"]secondary['"]\)/g, replacement: 'var(--nb-theme-secondary)' },
  { pattern: /map\.get\([^,]+, *['"]success['"]\)/g, replacement: 'var(--nb-theme-success)' },
  { pattern: /map\.get\([^,]+, *['"]info['"]\)/g, replacement: 'var(--nb-theme-info)' },
  { pattern: /map\.get\([^,]+, *['"]warning['"]\)/g, replacement: 'var(--nb-theme-warning)' },
  { pattern: /map\.get\([^,]+, *['"]danger['"]\)/g, replacement: 'var(--nb-theme-danger)' },
  // Replace tokens. and ds. with CSS vars (best guess, may need manual review)
  { pattern: /tokens\.([\w-]+)/g, replacement: 'var(--nb-theme-$1)' },
  { pattern: /ds\.([\w-]+)/g, replacement: 'var(--nb-theme-$1)' },
];

// --- UTILITY FUNCTIONS ---

/**
 * Recursively walk a directory and return all files matching a filter.
 */
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

/**
 * Read a file and return its contents as a string.
 */
async function readFile(file) {
  return fs.readFile(file, 'utf8');
}

/**
 * Write a string to a file (unless dry-run).
 */
async function writeFile(file, content) {
  if (DRY_RUN) return;
  await fs.writeFile(file, content, 'utf8');
}

/**
 * Log a change or finding.
 */
function logChange(type, file, details) {
  console.log(`[${type}] ${file}${details ? ': ' + details : ''}`);
}

// --- 1. REMOVE DUPLICATE NEBULAR IMPORTS ---
async function removeDuplicateNebularImports(tsFile) {
  let content = await readFile(tsFile);
  let changed = false;

  // Remove duplicate import statements
  for (const mod of NEBULAR_MODULES) {
    const importRegex = new RegExp(
      `import \{[^}]*${mod}[^}]*\} from ['"]@nebular/theme['"];?`,
      'g',
    );
    const matches = [...content.matchAll(importRegex)];
    if (matches.length > 1) {
      // Keep only the first
      let first = true;
      content = content.replace(importRegex, m => {
        if (first) {
          first = false;
          return m;
        }
        changed = true;
        logChange('REMOVE_DUPLICATE_IMPORT', tsFile, mod);
        return '';
      });
    }
  }

  // Remove duplicate entries in imports: [] arrays
  const importsArrayRegex = /imports\s*:\s*\[([\s\S]*?)\]/gm;
  content = content.replace(importsArrayRegex, (match, arr) => {
    const items = arr
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const seen = new Set();
    const deduped = items.filter(i => {
      if (seen.has(i)) {
        changed = true;
        logChange('REMOVE_DUPLICATE_IMPORTS_ARRAY', tsFile, i);
        return false;
      }
      seen.add(i);
      return true;
    });
    return `imports: [${deduped.join(', ')}]`;
  });

  if (changed) await writeFile(tsFile, content);
  return changed;
}

// --- 2. REMOVE/REPORT DEPRECATED ELEMENTS ---
async function removeDeprecatedElements(htmlFile) {
  let content = await readFile(htmlFile);
  let changed = false;
  for (const el of DEPRECATED_ELEMENTS) {
    const regex = new RegExp(`<\/?${el}[^>]*>`, 'gi');
    if (regex.test(content)) {
      changed = true;
      logChange('REMOVE_DEPRECATED_ELEMENT', htmlFile, el);
      content = content.replace(regex, '');
    }
  }
  if (changed) await writeFile(htmlFile, content);
  return changed;
}

// --- 3. REMOVE/REPORT DEPRECATED MODULES ---
async function removeDeprecatedModules(tsFile) {
  let content = await readFile(tsFile);
  let changed = false;
  for (const mod of DEPRECATED_NEBULAR_MODULES) {
    const importRegex = new RegExp(
      `import \{[^}]*${mod}[^}]*\} from ['"]@nebular/theme['"];?`,
      'g',
    );
    if (importRegex.test(content)) {
      changed = true;
      logChange('REMOVE_DEPRECATED_MODULE_IMPORT', tsFile, mod);
      content = content.replace(importRegex, '');
    }
    // Remove from imports arrays
    const importsArrayRegex = /imports\s*:\s*\[([\s\S]*?)\]/gm;
    content = content.replace(importsArrayRegex, (match, arr) => {
      const items = arr
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      const filtered = items.filter(i => i !== mod);
      if (filtered.length !== items.length) {
        changed = true;
        logChange('REMOVE_DEPRECATED_MODULE_FROM_IMPORTS', tsFile, mod);
      }
      return `imports: [${filtered.join(', ')}]`;
    });
  }
  if (changed) await writeFile(tsFile, content);
  return changed;
}

// --- 4. FIX SCSS/CSS IMPORTS ---
async function fixScssImports(scssFile) {
  let content = await readFile(scssFile);
  let changed = false;
  for (const { pattern, replacement } of SCSS_IMPORT_FIXES) {
    if (pattern.test(content)) {
      changed = true;
      logChange('FIX_SCSS_IMPORT', scssFile, replacement);
      content = content.replace(pattern, replacement);
    }
  }
  if (changed) await writeFile(scssFile, content);
  return changed;
}

// --- 5. REPORT LEGACY SCSS MAP/FUNCTION USAGES ---
async function reportLegacyScssPatterns(scssFile) {
  const content = await readFile(scssFile);
  let found = false;
  for (const pat of SCSS_MAP_PATTERNS) {
    if (pat.test(content)) {
      found = true;
      logChange('LEGACY_SCSS_PATTERN', scssFile, pat.toString());
    }
  }
  return found;
}

// --- 6. REPORT REFERENCES TO DELETED COMPONENTS ---
async function reportDeletedComponentReferences(tsFile) {
  const content = await readFile(tsFile);
  let found = false;
  for (const comp of DELETED_COMPONENTS) {
    if (content.includes(comp)) {
      found = true;
      logChange('DELETED_COMPONENT_REFERENCE', tsFile, comp);
    }
  }
  return found;
}

// --- ENHANCED: Remove all references to deleted components in any file ---
async function removeDeletedComponentReferences(file) {
  let content = await readFile(file);
  let changed = false;
  for (const comp of DELETED_COMPONENTS) {
    // Remove import statements
    const importRegex = new RegExp(`import[^;]*${comp}[^;]*;?`, 'g');
    if (importRegex.test(content)) {
      changed = true;
      logChange('REMOVE_DELETED_COMPONENT_IMPORT', file, comp);
      content = content.replace(importRegex, '');
    }
    // Remove usages (simple: lines containing the component name)
    const usageRegex = new RegExp(`.*${comp}.*\n?`, 'g');
    if (usageRegex.test(content)) {
      changed = true;
      logChange('REMOVE_DELETED_COMPONENT_USAGE', file, comp);
      content = content.replace(usageRegex, '');
    }
  }
  if (changed) await writeFile(file, content);
  return changed;
}

// --- ENHANCED: Auto-replace legacy SCSS patterns ---
async function autoReplaceLegacyScss(scssFile, unresolvedFiles) {
  let content = await readFile(scssFile);
  let changed = false;
  let unresolved = false;
  for (const { pattern, replacement } of SCSS_AUTO_REPLACEMENTS) {
    if (pattern.test(content)) {
      changed = true;
      logChange('AUTO_REPLACE_SCSS', scssFile, pattern.toString() + ' → ' + replacement);
      content = content.replace(pattern, replacement);
    }
  }
  // After replacements, check for any remaining legacy patterns
  for (const pat of SCSS_MAP_PATTERNS) {
    if (pat.test(content)) {
      unresolved = true;
      unresolvedFiles.add(scssFile);
      logChange('UNRESOLVED_SCSS_PATTERN', scssFile, pat.toString());
    }
  }
  if (changed) await writeFile(scssFile, content);
  return unresolved;
}

// --- ENHANCED: Track unresolved files for summary report ---
const unresolvedFiles = new Set();

// --- MAIN SCRIPT (ENHANCED) ---
(async function main() {
  console.log(`\n--- Nebular Migration Audit & Fix Script (Enhanced) ---`);
  if (DRY_RUN) console.log('Running in DRY RUN mode. No files will be written.');

  // 1. TypeScript/Angular/HTML/SCSS files: Remove deleted component references
  const allFiles = [
    ...(await walk(ROOT, f => f.endsWith('.ts'))),
    ...(await walk(ROOT, f => f.endsWith('.html'))),
    ...(await walk(ROOT, f => f.endsWith('.scss'))),
  ];
  for (const file of allFiles) {
    await removeDeletedComponentReferences(file);
  }

  // 2. TypeScript/Angular files: Remove duplicate Nebular imports, deprecated modules
  const tsFiles = allFiles.filter(f => f.endsWith('.ts'));
  for (const file of tsFiles) {
    await removeDuplicateNebularImports(file);
    await removeDeprecatedModules(file);
  }

  // 3. HTML files: Remove deprecated elements
  const htmlFiles = allFiles.filter(f => f.endsWith('.html'));
  for (const file of htmlFiles) {
    await removeDeprecatedElements(file);
  }

  // 4. SCSS files: Fix imports, auto-replace legacy patterns, report unresolved
  const scssFiles = allFiles.filter(f => f.endsWith('.scss'));
  for (const file of scssFiles) {
    await fixScssImports(file);
    await autoReplaceLegacyScss(file, unresolvedFiles);
  }

  // 5. Summary report of unresolved files
  if (unresolvedFiles.size > 0) {
    console.log('\n--- SUMMARY REPORT: Files with unresolved issues ---');
    for (const file of unresolvedFiles) {
      console.log(`UNRESOLVED: ${file}`);
    }
  } else {
    console.log('\nNo unresolved legacy SCSS patterns or deleted component references remain.');
  }

  console.log('\n--- Script Complete ---');
  if (DRY_RUN) console.log('No files were modified.');
  else console.log('All changes have been applied.');
})();
