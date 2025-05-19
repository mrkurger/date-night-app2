// scripts/check-lockfile-consistency.js
// This script checks that your package-lock.json is consistent with package.json and node_modules.
// It will fail (exit code 1) if there are any inconsistencies detected.
// Uses ESModules syntax (import/export), so ensure your package.json specifies "type": "module".

import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

async function checkLockfileConsistency() {
  try {
    // Run 'npm ci --dry-run' to check for lockfile consistency WITHOUT installing
    const { stdout, stderr } = await execAsync('npm ci --dry-run');
    console.log(stdout);

    // If npm ci --dry-run produces any output on stderr, log it (warnings may appear here)
    if (stderr) {
      console.error(stderr);
    }

    // If it reaches here, lockfile is consistent
    console.log('✅ package-lock.json is consistent with package.json and node_modules.');
    process.exit(0);
  } catch (error) {
    // If npm ci --dry-run fails, there is likely a lockfile inconsistency
    console.error('❌ Lockfile inconsistency detected!');
    if (error.stdout) console.error(error.stdout);
    if (error.stderr) console.error(error.stderr);
    process.exit(1);
  }
}

checkLockfileConsistency();
