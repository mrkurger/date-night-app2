// scripts/upgrade-deprecated-deps.js
// This script checks for deprecated dependencies using 'npm outdated' and 'npm audit', and suggests upgrades.
// It will print upgrade recommendations for deprecated or unsupported dependencies.
// Uses ESModules syntax (import/export), so ensure your package.json specifies "type": "module".

import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

async function upgradeDeprecatedDeps() {
  try {
    // Run 'npm outdated' to check for outdated dependencies
    const { stdout: outdatedStdout } = await execAsync('npm outdated || true');
    console.log('--- Outdated Dependencies ---');
    console.log(outdatedStdout);

    // Run 'npm audit' to check for deprecated/unsupported and vulnerable packages
    const { stdout: auditStdout } = await execAsync('npm audit --audit-level=low --json || true');
    const auditReport = JSON.parse(auditStdout);

    // Parse advisories for deprecations (if present)
    if (auditReport.advisories) {
      const deprecated = Object.values(auditReport.advisories).filter(
        advisory => advisory.title && advisory.title.toLowerCase().includes('deprecated'),
      );
      if (deprecated.length > 0) {
        console.log('\n--- Deprecated Packages Found ---');
        deprecated.forEach(dep => {
          console.log(`- ${dep.module_name}: ${dep.title} (${dep.severity})`);
        });
      } else {
        console.log('\nNo deprecated packages found in advisories.');
      }
    } else {
      console.log('\nNo advisories found.');
    }

    // Suggest upgrade command for each outdated dependency
    if (outdatedStdout.trim()) {
      console.log('\nTo upgrade all outdated dependencies, you can run:');
      console.log('npm update');
    } else {
      console.log('\nAll dependencies are up-to-date.');
    }

    // TODO: Add more sophisticated upgrade suggestions if needed.
  } catch (error) {
    console.error('❌ Error checking for deprecated dependencies!');
    if (error.stdout) console.error(error.stdout);
    if (error.stderr) console.error(error.stderr);
    process.exit(1);
  }
}

upgradeDeprecatedDeps();
