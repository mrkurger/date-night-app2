#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Find all JavaScript files in scripts directory
function findJSFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findJSFiles(fullPath));
    } else if (item.endsWith('.js')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Fix fs imports in a file
function fixFsImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Check if file imports fs/promises
  if (
    content.includes("import fs from 'fs/promises'") ||
    content.includes('const fs = require("fs/promises")')
  ) {
    console.log(`Fixing fs imports in: ${filePath}`);

    // Replace fs/promises import with regular fs import
    content = content.replace(/import fs from ['"]fs\/promises['"];?/g, "import fs from 'fs';");
    content = content.replace(
      /const fs = require\(['"]fs\/promises['"]\);?/g,
      'const fs = require("fs");',
    );

    // Also add fs/promises import for async operations if needed
    if (
      content.includes('fs.readFile(') ||
      content.includes('fs.writeFile(') ||
      content.includes('fs.mkdir(')
    ) {
      // Add both imports
      content = content.replace(
        /import fs from ['"]fs['"];?/g,
        "import fs from 'fs';\nimport fsPromises from 'fs/promises';",
      );
      content = content.replace(
        /const fs = require\(['"]fs['"]\);?/g,
        'const fs = require("fs");\nconst fsPromises = require("fs/promises");',
      );

      // Replace async fs calls with fsPromises
      content = content.replace(/fs\.readFile\(/g, 'fsPromises.readFile(');
      content = content.replace(/fs\.writeFile\(/g, 'fsPromises.writeFile(');
      content = content.replace(/fs\.mkdir\(/g, 'fsPromises.mkdir(');
    }

    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
    return true;
  }

  return false;
}

// Main execution
const scriptsDir = './scripts';
if (fs.existsSync(scriptsDir)) {
  const jsFiles = findJSFiles(scriptsDir);
  let fixedCount = 0;

  for (const file of jsFiles) {
    if (fixFsImports(file)) {
      fixedCount++;
    }
  }

  console.log(`Fixed fs imports in ${fixedCount} files`);
} else {
  console.log('Scripts directory not found');
}
