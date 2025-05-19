// Import necessary modules for file and path operations using ESModules syntax
import { writeFileSync, chmodSync, existsSync, readFileSync } from 'fs'; // File system utilities
import { join } from 'path'; // Path module for path manipulation

/**
 * Disables Husky hooks in CI environments by:
 * 1. Creating or updating a `.huskyrc` file to skip hooks in a CI environment.
 * 2. Updating `package.json` to ensure Husky is disabled during CI runs.
 * 
 * This ensures that Husky does not interfere with CI/CD pipelines.
 * 
 * @returns {void}
 */
function disableHuskyInCI() {
  // Content for the `.huskyrc` file to skip hooks in CI
  const huskyRcContent = `#!/bin/sh
# Skip Husky hooks in CI environments
if [ -n "$CI" ]; then
  echo "CI environment detected, skipping Husky hooks"
  exit 0
fi
`;

  try {
    // Path to the `.huskyrc` file in the current working directory
    const huskyRcPath = join(process.cwd(), '.huskyrc');
    
    // Check if the `.huskyrc` file exists; if not, create it
    if (!existsSync(huskyRcPath)) {
      writeFileSync(huskyRcPath, huskyRcContent); // Write the content to `.huskyrc`
      chmodSync(huskyRcPath, '755'); // Ensure the file is executable
      console.log('✅ Created .huskyrc for CI environments');
    } else {
      console.log('ℹ️ .huskyrc file already exists, skipping creation');
    }

    // Path to the `package.json` file in the current working directory
    const packageJsonPath = join(process.cwd(), 'package.json');

    // Check if the `package.json` file exists
    if (existsSync(packageJsonPath)) {
      // Read and parse the `package.json` file
      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

      // Ensure the `scripts` section exists in `package.json`
      if (!pkg.scripts) pkg.scripts = {};

      // Add or update the `prepare` script to disable Husky in CI
      const prepareScript = 'node .github/scripts/disable-husky-in-ci.js';
      if (pkg.scripts.prepare !== prepareScript) {
        pkg.scripts.prepare = prepareScript;

        // Write the updated `package.json` back to the file system
        writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
        console.log('✅ Updated package.json prepare script to ensure Husky is disabled in CI');
      } else {
        console.log('ℹ️ Prepare script in package.json is already correctly configured');
      }
    } else {
      console.error('❌ package.json file not found. Skipping updates to prepare script.');
    }
  } catch (error) {
    // Log an error message if any operation fails
    console.error('❌ Failed to configure Husky:', error.message);
    process.exit(1); // Exit with a non-zero status code
  }
}

// If this script is executed directly, run the `disableHuskyInCI` function
if (import.meta.url === `file://${process.argv[1]}`) {
  disableHuskyInCI();
}