#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_DIR = path.join(__dirname, '..', 'tests');

const TYPE_IMPORTS = `import { Request, Response, NextFunction } from 'express';
import { jest } from '@jest/globals';
`;

const INTERFACE_TYPES = `
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

interface RequestWithFile extends Request {
  file?: MulterFile;
  files?: MulterFile[];
}

interface TestUser {
  _id: string;
  email: string;
  password: string;
}
`;

/**
 * Convert a JavaScript file to TypeScript
 * @param {string} filePath The path to the JS file
 */
async function convertFileToTypeScript(filePath) {
  console.log(`Converting ${filePath}`);
  const content = await fs.readFile(filePath, 'utf8');

  // Add type imports
  let newContent = content.replace(
    /import\s*{([^}]+)}\s*from\s*'@jest\/globals'/,
    `${TYPE_IMPORTS}${INTERFACE_TYPES}\n// Original imports\nimport {$1} from '@jest/globals'`
  );

  // Convert require statements to imports
  newContent = newContent.replace(
    /const\s+(\w+)\s+=\s+require\(['"]([^'"]+)['"]\);?/g,
    'import $1 from "$2";'
  );
  newContent = newContent.replace(
    /const\s+{\s*([^}]+)\s*}\s+=\s+require\(['"]([^'"]+)['"]\);?/g,
    'import { $1 } from "$2";'
  );

  // Add types to Express middleware functions
  newContent = newContent.replace(
    /\((req,\s*res,\s*next)\)\s*=>/g,
    '(req: RequestWithFile, res: Response, next: NextFunction) =>'
  );
  newContent = newContent.replace(
    /function\s*\((req,\s*res,\s*next)\)/g,
    'function(req: RequestWithFile, res: Response, next: NextFunction)'
  );

  // Add types to variables
  newContent = newContent.replace(/let\s+(testUser|accessToken|testMediaId);/g, 'let $1: any;');

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
      (file.name.endsWith('.test.js') || file.name.endsWith('.spec.js')) &&
      !file.name.includes('.config.js')
    ) {
      await convertFileToTypeScript(filePath);
    }
  }
}

// Main execution
console.log('Starting test file conversion...');
await findTestFiles(TEST_DIR).catch(console.error);
console.log('Conversion complete!');
