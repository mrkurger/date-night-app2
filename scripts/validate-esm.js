// scripts/validate-esm.js
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMMONJS_PATTERNS = [
  {
    name: 'require() calls',
    pattern: /\brequire\s*\(['"]/g,
  },
  {
    name: 'module.exports',
    pattern: /\bmodule\.exports\b/g,
  },
  {
    name: 'exports.',
    pattern: /\bexports\./g,
  },
  {
    name: '__dirname without import',
    pattern: /\b__dirname\b/g,
  },
  {
    name: '__filename without import',
    pattern: /\b__filename\b/g,
  },
  {
    name: 'Dynamic import at non-top level without async',
    pattern: /(?<!async\s+)function.*\bimport\s*\(/g,
  },
];

async function validateFile(filePath) {
  const content = await fsPromises.readFile(filePath, 'utf-8');
  const issues = [];

  for (const pattern of COMMONJS_PATTERNS) {
    const matches = content.match(pattern.pattern);
    if (matches) {
      issues.push({
        type: pattern.name,
        count: matches.length,
        lines: matches.map(match => {
          const lines = content.split('\n');
          const lineIndex = lines.findIndex(line => line.includes(match));
          return lineIndex + 1;
        }),
      });
    }
  }

  return issues;
}

async function processDirectory(dirPath) {
  const files = await fsPromises.readdir(dirPath, { withFileTypes: true });
  const issues = {};

  for (const file of files) {
    const fullPath = path.join(dirPath, file.name);

    if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
      const subIssues = await processDirectory(fullPath);
      if (Object.keys(subIssues).length > 0) {
        issues[file.name] = subIssues;
      }
    } else if (file.isFile() && file.name.endsWith('.js')) {
      const fileIssues = await validateFile(fullPath);
      if (fileIssues.length > 0) {
        issues[file.name] = fileIssues;
      }
    }
  }

  return issues;
}

async function main() {
  const serverDir = path.resolve(__dirname, '../server');
  console.log('🔍 Checking for CommonJS patterns...');
  const issues = await processDirectory(serverDir);

  if (Object.keys(issues).length === 0) {
    console.log('✨ No CommonJS patterns found!');
  } else {
    console.log('⚠️ Found CommonJS patterns:');
    console.log(JSON.stringify(issues, null, 2));
    process.exit(1);
  }
}

main().catch(console.error);
