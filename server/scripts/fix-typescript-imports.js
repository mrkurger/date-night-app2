#!/usr/bin/env node

/**
 * TypeScript Import Resolution Script
 *
 * This script fixes common TypeScript import issues in compiled JavaScript files:
 * 1. Resolves double extensions (.ts.js -> .js)
 * 2. Adds .js extensions to local imports that don't have them
 * 3. Creates empty stub files for missing modules
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.join(__dirname, '..');
const distDir = path.join(serverRoot, 'dist');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[36m',
  magenta: '\x1b[35m',
};

console.log(`${colors.blue}🔧${colors.reset} Starting TypeScript import resolution...`);

/**
 * Ensures a directory exists
 */
async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
    return true;
  } catch (error) {
    if (error.code !== 'EEXIST') {
      console.error(
        `${colors.red}Error creating directory ${dir}: ${error.message}${colors.reset}`
      );
      return false;
    }
    return true;
  }
}

/**
 * Fixes import paths in a JavaScript file
 */
async function fixImportPaths(file) {
  try {
    const content = await fs.readFile(file, 'utf8');
    let updatedContent = content;
    let changes = 0;

    // Fix imports ending with .ts.js
    updatedContent = updatedContent.replace(
      /from ['"]([^'"]+)\.ts\.js['"]/g,
      (match, importPath) => {
        changes++;
        return `from '${importPath}.js'`;
      }
    );

    // Ensure all local imports end with .js
    updatedContent = updatedContent.replace(
      /from ['"](\.[^'"]+)(?!\.js['"])['"]/g,
      (match, importPath) => {
        if (!importPath.endsWith('.js') && !importPath.includes('node_modules')) {
          changes++;
          return `from '${importPath}.js'`;
        }
        return match;
      }
    );

    // Remove .ts from any remaining imports
    updatedContent = updatedContent.replace(/from ['"]([^'"]+)\.ts['"]/g, (match, importPath) => {
      changes++;
      return `from '${importPath}'`;
    });

    // Only update if changes were made
    if (changes > 0) {
      await fs.writeFile(file, updatedContent);
      console.log(
        `${colors.green}✓${colors.reset} Fixed ${changes} import paths in ${path.relative(serverRoot, file)}`
      );
      return true;
    }
    return false;
  } catch (error) {
    console.error(`${colors.red}❌${colors.reset} Error processing ${file}: ${error.message}`);
    return false;
  }
}

/**
 * Collects all import paths from JavaScript files
 */
async function collectImportPaths(files) {
  const importPaths = new Map();
  const importRegex = /from\s+['"]([^'"]+)['"]/g;

  for (const file of files) {
    try {
      const content = await fs.readFile(file, 'utf8');
      let match;

      // Extract all imports from the file
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];

        // Skip node_modules and non-relative imports
        if (importPath.includes('node_modules') || !importPath.startsWith('.')) {
          continue;
        }

        // Normalize the import path
        let normalizedPath = importPath;
        if (importPath.endsWith('.ts')) {
          normalizedPath = importPath.replace(/\.ts$/, '.js');
        } else if (!importPath.endsWith('.js')) {
          normalizedPath = `${importPath}.js`;
        }

        // Calculate the absolute path
        const basedir = path.dirname(file);
        const absolutePath = path.resolve(basedir, normalizedPath);

        // Store the import path
        if (!importPaths.has(absolutePath)) {
          importPaths.set(absolutePath, []);
        }
        importPaths.get(absolutePath).push({
          importedFrom: file,
          importStatement: match[0],
        });
      }
    } catch (error) {
      console.error(`${colors.red}❌${colors.reset} Error reading ${file}: ${error.message}`);
    }
  }

  return importPaths;
}

/**
 * Creates stub files for missing imports
 */
async function createStubFiles(importPaths) {
  const stubsCreated = [];

  for (const [filePath, imports] of importPaths.entries()) {
    try {
      // Check if file exists
      await fs.access(filePath);
    } catch (error) {
      // File doesn't exist, create a stub
      const dirName = path.dirname(filePath);
      const fileName = path.basename(filePath);

      try {
        // Create directory if it doesn't exist
        await ensureDir(dirName);

        // Generate stub file content
        const stubContent = `/**
 * Generated stub file for TypeScript compatibility
 * @generated
 * 
 * This file was auto-generated to resolve imports in:
 * ${imports.map(i => `- ${path.relative(serverRoot, i.importedFrom)}`).join('\n * ')}
 */

// Export a default empty object
export default {};

// Named exports would be added here if needed
`;

        // Write the stub file
        await fs.writeFile(filePath, stubContent);
        console.log(
          `${colors.magenta}✓${colors.reset} Created stub file: ${path.relative(serverRoot, filePath)}`
        );
        stubsCreated.push(filePath);
      } catch (stubError) {
        console.error(
          `${colors.red}❌${colors.reset} Error creating stub ${filePath}: ${stubError.message}`
        );
      }
    }
  }

  return stubsCreated;
}

/**
 * Main execution function
 */
async function main() {
  try {
    // Find all JS files in dist
    const files = await glob(`${distDir}/**/*.js`, { ignore: '**/node_modules/**' });
    console.log(
      `${colors.blue}📄${colors.reset} Found ${files.length} JavaScript files to process`
    );

    // Fix import paths in all files
    let fixedFiles = 0;
    for (const file of files) {
      const fixed = await fixImportPaths(file);
      if (fixed) fixedFiles++;
    }
    console.log(`${colors.green}✅${colors.reset} Fixed import paths in ${fixedFiles} files`);

    // Collect all import paths and create stub files
    const importPaths = await collectImportPaths(files);
    console.log(`${colors.blue}🔍${colors.reset} Found ${importPaths.size} unique import paths`);

    const stubsCreated = await createStubFiles(importPaths);
    console.log(
      `${colors.green}✅${colors.reset} Created ${stubsCreated.length} stub files for missing imports`
    );

    console.log(
      `${colors.green}✅${colors.reset} TypeScript import resolution completed successfully!`
    );
  } catch (error) {
    console.error(`${colors.red}❌${colors.reset} Script failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main();
