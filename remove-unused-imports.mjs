// remove-unused-imports.mjs
// Usage: node remove-unused-imports.mjs [rootDir]

import fs from 'fs/promises';
import path from 'path';

const ROOT = process.argv[2] || './client-angular/src/app';

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function processFile(file) {
  let content = await fs.readFile(file, 'utf8');
  let original = content;
  let changed = false;

  // Find imports array
  const importsRegex = /imports\s*:\s*\[([^\]]*)\]/gs;
  let match;
  while ((match = importsRegex.exec(content)) !== null) {
    const importsArr = match[1];
    const importLines = importsArr
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    let newImportsArr = [];
    for (const imp of importLines) {
      // Ignore spreads and config objects
      if (imp.startsWith('...') || imp.includes('(') || imp.includes('{')) {
        newImportsArr.push(imp);
        continue;
      }
      // Check if used elsewhere in the file (outside the imports array)
      const fileWithoutImportsArr = content.replace(importsArr, '');
      const usageRegex = new RegExp(`\\b${escapeRegExp(imp)}\\b`, 'g');
      if (usageRegex.test(fileWithoutImportsArr)) {
        newImportsArr.push(imp);
      } else {
        changed = true;
        console.log(`Removed unused import "${imp}" from ${file}`);
      }
    }
    // Replace the old imports array with the new one
    const newArrString = newImportsArr.join(',\n    ');
    content = content.replace(importsArr, newArrString);
  }

  if (changed && content !== original) {
    await fs.writeFile(file, content, 'utf8');
    console.log(`Cleaned: ${file}`);
  }
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      await processFile(fullPath);
    }
  }
}

(async () => {
  await walk(ROOT);
  console.log('✅ Unused imports removal complete.');
})();
