/**
 * Scans Angular standalone components for "not used within the template" warnings
 * and removes those unused imports from their @Component imports list.
 * 
 * Usage:
 *    node ./scripts/remove-unused-imports.mjs
 *
 * Requirements:
 *    1. An angular-warnings.log file in your project root or a specified path
 *       containing lines such as:
 *         TS-998113: SomeComponent is not used within the template of ...
 *    2. A /src folder with .ts files to scan
 * 
 * Creates/Updates:
 *    1. This script's companion HTML docs for compliance.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Modify if your warnings file is in a different location
const warningsFile = path.join(__dirname, '..', 'angular-warnings.log');
const projectSrc = path.join(__dirname, '..', 'src');

// Reads “not used within the template” warnings and extracts the component names
function loadUnusedImports() {
  if (!fs.existsSync(warningsFile)) return new Set();
  const text = fs.readFileSync(warningsFile, 'utf8');
  const lines = text.split('\n');
  const unusedImports = lines
    .filter(line => line.includes('not used within the template'))
    .map(line => {
      const match = line.match(/: (.*?) is not used within the template/);
      return match ? match[1].trim() : null;
    })
    .filter(Boolean);
  return new Set(unusedImports);
}

/**
 * Removes any identified unused imports in @Component -> imports: []
 * from Angular standalone components.
 */
function removeUnusedFromComponent(filePath, unusedImports) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Match pattern for @Component with standalone: true and an imports array
  const componentRegex = /@Component\s*\(\{\s*standalone:\s*true[\s\S]*?imports:\s*\[([\s\S]*?)\]/g;
  const updated = content.replace(componentRegex, (match, group) => {
    const lines = group
      .split(',')
      .map(line => line.replace(/\/\/[^\n]*/, '').trim()) // strip inline comments
      .filter(entry => entry && !unusedImports.has(entry));
    return match.replace(group, lines.join(',\n    '));
  });

  if (updated !== content) {
    fs.writeFileSync(filePath, updated, 'utf8');
  }
}

/**
 * Recursively scan .ts files, removing unused imports in Angular components.
 */
function scanSourceForUnused(projectPath, unusedImports) {
  const items = fs.readdirSync(projectPath, { withFileTypes: true });
  for (const item of items) {
    if (item.isDirectory()) {
      scanSourceForUnused(path.join(projectPath, item.name), unusedImports);
    } else if (item.name.endsWith('.ts')) {
      const filePath = path.join(projectPath, item.name);
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('@Component') && content.includes('standalone: true')) {
        removeUnusedFromComponent(filePath, unusedImports);
      }
    }
  }
}

// Main flow
const unused = loadUnusedImports();
scanSourceForUnused(projectSrc, unused);
console.log('Unused component imports (if any) removed successfully.');
