#!/usr/bin/env node

/**
 * This script disables husky in CI environments by creating a .huskyrc.json file
 * that sets the HUSKY environment variable to 0 and configures hooks.
 *
 * It's used in the preinstall script in package.json to ensure Husky doesn't
 * run in CI environments, which can cause issues with Git hooks.
 */

import fs from 'fs/promises';
import path from 'path';

const huskyConfig = {
  hooks: {
    'pre-commit': 'npm run lint && npm run test',
    'pre-push': 'npm run build',
  },
  skipCI: true,
};

async function main() {
  if (process.env.CI === 'true') {
    console.log('CI environment detected - configuring Husky to skip hooks');
    try {
      // Write .huskyrc.json
      await fs.writeFile(
        path.join(process.cwd(), '.huskyrc.json'),
        JSON.stringify(huskyConfig, null, 2),
      );

      // Set HUSKY=0 environment variable to disable hooks
      process.env.HUSKY = '0';

      console.log('Successfully configured Husky for CI environment');
    } catch (error) {
      console.error('Error configuring Husky:', error);
      process.exit(1);
    }
  } else {
    console.log('Not in CI environment - Husky will run normally');
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
