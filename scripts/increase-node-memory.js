/**
 * This script modifies the Angular test command to increase the Node.js heap memory limit
 * to prevent "JavaScript heap out of memory" errors during testing.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Define paths - ES module compatible way
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the client-angular package.json
const packageJsonPath = path.join(__dirname, '..', 'client-angular', 'package.json');

try {
  // Read the package.json file
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Update the test script to include the --max_old_space_size flag
  if (packageJson.scripts && packageJson.scripts.test) {
    // Check if the script already has the max_old_space_size flag
    if (!packageJson.scripts.test.includes('--max_old_space_size')) {
      // Add the flag to increase heap memory to 4GB
      packageJson.scripts.test =
        'node --max_old_space_size=4096 ./node_modules/@angular/cli/bin/ng test client-angular';

      // Write the updated package.json back to the file
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

      console.log('✅ Successfully increased Node.js heap memory for Angular tests to 4GB');
    } else {
      console.log('ℹ️ Node.js heap memory flag is already set for Angular tests');
    }
  } else {
    console.error('❌ Could not find the test script in client-angular/package.json');
  }
} catch (error) {
  console.error('❌ Error updating package.json:', error.message);
}
