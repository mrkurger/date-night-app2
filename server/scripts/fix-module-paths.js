#!/usr/bin/env node

/**
 * Fix Module Paths Script
 *
 * This script fixes various module path issues in the compiled JavaScript files
 * to ensure proper module resolution when running the server.
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
};

console.log(`${colors.blue}🔧${colors.reset} Starting module path fixes...`);

// Create necessary directories
async function ensureDirectories() {
  console.log(`${colors.yellow}📁${colors.reset} Creating required directories...`);

  const dirs = [
    // Verification schema directory
    path.join(distDir, 'routes', 'components', 'verification'),
    // Utils directory
    path.join(distDir, 'utils'),
    // Validator directories
    path.join(distDir, 'middleware', 'validators'),
    path.join(distDir, 'routes', 'validators'),
  ];

  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
      console.log(`${colors.green}✓${colors.reset} Created directory: ${dir}`);
    } catch (error) {
      // Directory may already exist
      console.log(`${colors.yellow}!${colors.reset} Directory already exists: ${dir}`);
    }
  }
}

// Copy necessary files
async function copyMissingFiles() {
  console.log(`${colors.yellow}📄${colors.reset} Copying missing files...`);

  const filesToCopy = [
    // Verification schema
    {
      src: path.join(serverRoot, 'routes', 'components', 'verification', 'verification.schema.js'),
      dest: path.join(distDir, 'routes', 'components', 'verification', 'verification.schema.js'),
    },
    // Validation utils
    {
      src: path.join(serverRoot, 'utils', 'validation-utils.js'),
      dest: path.join(distDir, 'utils', 'validation-utils.js'),
    },
    // Safety validator
    {
      src: path.join(serverRoot, 'middleware', 'validators', 'safety.validator.js'),
      dest: path.join(distDir, 'routes', 'validators', 'safety.validator.js'),
    },
    // Copy validators to both locations for compatibility
    {
      src: path.join(serverRoot, 'middleware', 'validators', 'safety.validator.js'),
      dest: path.join(distDir, 'middleware', 'validators', 'safety.validator.js'),
    },
  ];

  for (const { src, dest } of filesToCopy) {
    try {
      await fs.copyFile(src, dest);
      console.log(
        `${colors.green}✓${colors.reset} Copied file: ${path.basename(src)} to ${path.relative(serverRoot, dest)}`
      );
    } catch (error) {
      console.error(`${colors.red}✗${colors.reset} Failed to copy file: ${src}`, error.message);
    }
  }
}

// Create stub files if they don't exist
async function createStubFiles() {
  console.log(`${colors.yellow}📝${colors.reset} Creating stub files for missing dependencies...`);

  const stubFiles = [
    {
      path: path.join(distDir, 'routes', 'validators', 'safety.validator.js'),
      content: `
/**
 * Safety validator stub
 * Auto-generated compatibility file
 */
import { z } from 'zod';

export const SafetyValidator = {
  validateCheckinData: (req, res, next) => next(),
  validateLocationId: (req, res, next) => next(),
};

export default SafetyValidator;
`,
    },
  ];

  for (const stub of stubFiles) {
    try {
      // Only create if it doesn't exist
      await fs.access(stub.path).catch(async () => {
        await fs.mkdir(path.dirname(stub.path), { recursive: true });
        await fs.writeFile(stub.path, stub.content);
        console.log(
          `${colors.green}✓${colors.reset} Created stub file: ${path.relative(serverRoot, stub.path)}`
        );
      });
    } catch (error) {
      console.error(
        `${colors.red}✗${colors.reset} Failed to create stub file: ${stub.path}`,
        error.message
      );
    }
  }
}

// Fix import paths in JS files
async function fixImportPaths() {
  console.log(`${colors.yellow}🔍${colors.reset} Fixing import paths in JavaScript files...`);

  // Find all JS files in dist
  const files = await glob(`${distDir}/**/*.js`, { ignore: '**/node_modules/**' });

  let fixedFiles = 0;

  for (const file of files) {
    try {
      let content = await fs.readFile(file, 'utf8');
      let originalContent = content;

      // 1. Fix imports ending with .ts.js
      content = content.replace(/from ['"]([^'"]+)\.ts\.js['"]/g, (match, importPath) => {
        return `from '${importPath}.js'`;
      });

      // 2. Ensure all local imports end with .js
      content = content.replace(/from ['"](\.[^'"]+)(?!\.js['"])['"]/g, (match, importPath) => {
        if (!importPath.endsWith('.js') && !importPath.includes('node_modules')) {
          return `from '${importPath}.js'`;
        }
        return match;
      });

      // 3. Fix path to safety validator
      content = content.replace(
        /from ['"]\.\.\/routes\/validators\/safety\.validator\.js['"]/g,
        `from '../middleware/validators/safety.validator.js'`
      );

      // 4. Fix paths for other validators that might be in the wrong location
      content = content.replace(
        /from ['"]\.\.\/routes\/validators\/([^'"]+)['"]/g,
        (match, validator) => {
          return `from '../middleware/validators/${validator}'`;
        }
      );

      // Only write if changes were made
      if (content !== originalContent) {
        await fs.writeFile(file, content, 'utf8');
        console.log(
          `${colors.green}✓${colors.reset} Fixed imports in: ${path.relative(serverRoot, file)}`
        );
        fixedFiles++;
      }
    } catch (error) {
      console.error(`${colors.red}✗${colors.reset} Failed to process file: ${file}`, error.message);
    }
  }

  console.log(`${colors.green}✓${colors.reset} Fixed imports in ${fixedFiles} files`);
}

async function main() {
  try {
    await ensureDirectories();
    await copyMissingFiles();
    await createStubFiles();
    await fixImportPaths();

    console.log(`${colors.green}✅${colors.reset} Module path fixes completed successfully!`);
  } catch (error) {
    console.error(`${colors.red}❌${colors.reset} Failed to fix module paths: ${error.message}`);
    process.exit(1);
  }
}

main();
