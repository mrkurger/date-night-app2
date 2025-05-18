/**
 * verify-lockfiles.js
 *
 * This script checks all package-lock.json files in the repo for validity and reports any issues.
 * Usage: node .github/scripts/verify-lockfiles.js
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * Recursively find all package-lock.json files.
 */
async function findLockfiles(dir) {
  let files = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files = files.concat(await findLockfiles(fullPath));
    else if (entry.name === 'package-lock.json') files.push(fullPath);
  }
  return files;
}

export default async function verifyLockfiles(baseDir = '.') {
  const lockfiles = await findLockfiles(baseDir);
  let allValid = true;
  for (const file of lockfiles) {
    try {
      JSON.parse(await fs.readFile(file, 'utf8'));
      console.log(`[verifyLockfiles] ${file}: OK`);
    } catch (err) {
      console.error(`[verifyLockfiles] ${file}: INVALID JSON`);
      allValid = false;
    }
  }
  if (!allValid) {
    throw new Error('One or more lockfiles are invalid!');
  }
}