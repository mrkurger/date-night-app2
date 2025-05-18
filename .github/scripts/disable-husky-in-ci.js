import { writeFileSync, chmodSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Creates or updates .huskyrc to disable hooks in CI environments
 * @returns {void}
 */
function disableHuskyInCI() {
  const huskyRcContent = `#!/bin/sh
# Skip husky hooks in CI environments
if [ -n "$CI" ]; then
  echo "CI environment detected, skipping Husky hooks"
  exit 0
fi
`;

  try {
    const huskyRcPath = join(process.cwd(), '.huskyrc');
    
    // Create .huskyrc if it doesn't exist
    if (!existsSync(huskyRcPath)) {
      writeFileSync(huskyRcPath, huskyRcContent);
      chmodSync(huskyRcPath, '755');
      console.log('✅ Created .huskyrc for CI environments');
    }

    // Also disable husky in package.json scripts if present
    const packageJsonPath = join(process.cwd(), 'package.json');
    if (existsSync(packageJsonPath)) {
      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      
      // Add prepare script to handle husky
      if (!pkg.scripts) pkg.scripts = {};
      pkg.scripts.prepare = 'node .github/scripts/disable-husky-in-ci.js';
      
      writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
      console.log('✅ Updated package.json prepare script');
    }
  } catch (error) {
    console.error('❌ Failed to configure Husky:', error.message);
    process.exit(1);
  }
}

// Run if this script is called directly
if (require.main === module) {
  disableHuskyInCI();
}