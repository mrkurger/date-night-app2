// scripts/fix-remaining-esm-issues.js
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PATTERNS_TO_FIX = [
  // Fix dotenv requires
  {
    test: /require\(['"]dotenv['"]\)\.config\(\)/g,
    replace: `import 'dotenv/config'`,
  },
  // Fix dynamic imports
  {
    test: /const\s*{\s*([^}]+)\s*}\s*=\s*require\(['"](.*?)['"]\)/g,
    replace: `const { $1 } = await import('$2')`,
  },
  // Fix remaining requires
  {
    test: /const\s+(\w+)\s*=\s*require\(['"](.*?)['"]\)/g,
    replace: `import $1 from '$2'`,
  },
  // Fix dynamic imports at non-top level
  {
    test: /import\((.*?)\)/g,
    replace: `import($1)`,
  },
  // Fix module.exports
  {
    test: /module\.exports\s*=\s*/g,
    replace: 'export default ',
  },
];

async function fixFile(filePath) {
  try {
    let content = await fsPromises.readFile(filePath, 'utf-8');
    let modified = false;

    // Add async wrapper for files with dynamic imports
    if (content.includes('import(') && !content.includes('async')) {
      content = content.replace(/^([\s\S]*?)(const|let|var|function|\()/, `$1(async () => {\n$2`);
      content += '\n})();';
      modified = true;
    }

    for (const pattern of PATTERNS_TO_FIX) {
      const originalContent = content;
      content = content.replace(pattern.test, pattern.replace);
      if (originalContent !== content) {
        modified = true;
      }
    }

    if (modified) {
      await fsPromises.writeFile(filePath, content, 'utf-8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

async function processDirectory(dirPath) {
  const files = await fsPromises.readdir(dirPath, { withFileTypes: true });
  let fixedCount = 0;

  for (const file of files) {
    const fullPath = path.join(dirPath, file.name);

    if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
      fixedCount += await processDirectory(fullPath);
    } else if (file.isFile() && file.name.endsWith('.js')) {
      const fixed = await fixFile(fullPath);
      if (fixed) fixedCount++;
    }
  }

  return fixedCount;
}

async function main() {
  const serverDir = path.resolve(__dirname, '../server');
  console.log('🔄 Starting ESM fixes...');
  const fixedCount = await processDirectory(serverDir);
  console.log(`✨ Fixed ${fixedCount} files`);
}

main().catch(console.error);
