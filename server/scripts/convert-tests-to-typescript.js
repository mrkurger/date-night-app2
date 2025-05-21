import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TESTS_DIR = path.join(__dirname, '..', 'tests');

/**
 * Convert a JavaScript file to TypeScript
 * @param {string} filePath The path to the JS file
 */
async function convertFileToTypeScript(filePath) {
  console.log(`Converting ${filePath}`);
  const content = await fs.readFile(filePath, 'utf8');

  // Convert require statements to imports
  let newContent = content
    .replace(/const\s+(\w+)\s+=\s+require\(['"]([^'"]+)['"]\);?/g, 'import $1 from "$2";')
    .replace(
      /const\s+{\s*([^}]+)\s*}\s+=\s+require\(['"]([^'"]+)['"]\);?/g,
      'import { $1 } from "$2";'
    );

  // Add type imports for jest
  if (content.includes('describe') || content.includes('it') || content.includes('test')) {
    newContent = `import type { jest } from '@jest/globals';\n${newContent}`;
  }

  // Add basic TypeScript types
  newContent = newContent
    .replace(/function\s+(\w+)\s*\(([\w\s,]*)\)/g, 'function $1($2): void')
    .replace(/async\s+function\s+(\w+)\s*\(([\w\s,]*)\)/g, 'async function $1($2): Promise<void>')
    .replace(/\bconst\s+(\w+)\s*=\s*\(([\w\s,]*)\)\s*=>/g, 'const $1 = ($2): void =>')
    .replace(
      /\bconst\s+(\w+)\s*=\s*async\s*\(([\w\s,]*)\)\s*=>/g,
      'const $1 = async ($2): Promise<void> =>'
    );

  // Save as .ts file
  const tsFilePath = filePath.replace(/\.js$/, '.ts');
  await fs.writeFile(tsFilePath, newContent);

  // Delete original .js file
  await fs.unlink(filePath);
  console.log(`Converted ${filePath} to ${tsFilePath}`);
}

/**
 * Recursively find all JavaScript test files
 * @param {string} dir Directory to search
 */
async function findTestFiles(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true });

  for (const file of files) {
    const filePath = path.join(dir, file.name);

    if (file.isDirectory()) {
      await findTestFiles(filePath);
    } else if (
      file.name.endsWith('.js') &&
      !file.name.endsWith('.d.js') &&
      !file.name.endsWith('.config.js') &&
      !file.name.includes('babel') &&
      !file.name.includes('webpack')
    ) {
      await convertFileToTypeScript(filePath);
    }
  }
}

// Main execution
console.log('Starting test file conversion...');
await findTestFiles(TESTS_DIR);
console.log('Conversion complete!');
