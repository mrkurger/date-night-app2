/**
 * generate-docs.js
 * 
 * This script generates markdown documentation for all scripts in the .github/scripts directory.
 * It extracts JSDoc-style comments from each script and builds a summary file.
 * 
 * Usage: node .github/scripts/generate-docs.js
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * Recursively list all JS files in a directory.
 */
async function listJSFiles(dir) {
  let files = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files = files.concat(await listJSFiles(fullPath));
    else if (entry.name.endsWith('.js')) files.push(fullPath);
  }
  return files;
}

/**
 * Extracts top JSDoc-style comment from a JS file.
 */
async function extractDoc(filePath) {
  const src = await fs.readFile(filePath, 'utf8');
  const match = src.match(/\/\*\*([\s\S]*?)\*\//);
  return match ? `### ${path.basename(filePath)}\n${match[0]}` : '';
}

/**
 * Main doc generator.
 */
export default async function generateDocs() {
  const dir = '.github/scripts';
  const files = await listJSFiles(dir);
  let doc = '# Script Documentation\n\n';
  for (const file of files) {
    doc += await extractDoc(file) + '\n\n';
  }
  await fs.writeFile(path.join(dir, 'README.md'), doc, 'utf8');
  console.log('[generateDocs] Documentation generated at .github/scripts/README.md');
}