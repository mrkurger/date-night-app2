/**
 * Script to fix safety validator compatibility issues
 *
 * This script creates and modifies necessary files to ensure proper compatibility
 * between JavaScript and TypeScript safety validator implementations.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get server root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, '..');
const distDir = path.join(serverRoot, 'dist');

// Paths
const routesSafetyValidatorPath = path.join(distDir, 'routes', 'validators', 'safety.validator.js');
const middlewareSafetyValidatorPath = path.join(
  distDir,
  'middleware',
  'validators',
  'safety.validator.js'
);
const safetyValidatorCompatPath = path.join(
  distDir,
  'middleware',
  'validators',
  'safety-validator-compat.js'
);

// Create compatibility layer in dist/middleware/validators/safety-validator-compat.js
function createSafetyValidatorCompat() {
  console.log('Creating safety validator compatibility layer...');

  const compatContent = `/**
 * Safety validator compatibility layer
 * 
 * This file provides compatibility between JavaScript and TypeScript safety validator implementations.
 */

import { safetySchemas } from './safety.validator.js';

// Create compatibility export for JavaScript files that import 'SafetySchemas'
export const SafetySchemas = safetySchemas;

// Export default for CommonJS compatibility
export default SafetySchemas;
`;

  fs.writeFileSync(safetyValidatorCompatPath, compatContent, 'utf8');
  console.log(`Created ${safetyValidatorCompatPath}`);
}

// Update routes validator stub to import from compatibility layer
function updateRoutesValidatorStub() {
  console.log('Updating routes validator stub...');

  // Create updated stub that re-exports from the compatibility layer
  const stubContent = `/**
 * Safety validator stub (auto-generated)
 * 
 * This file re-exports from the safety validator compatibility layer.
 */
import { SafetySchemas } from '../../middleware/validators/safety-validator-compat.js';

export { SafetySchemas };
export default SafetySchemas;
`;

  fs.writeFileSync(routesSafetyValidatorPath, stubContent, 'utf8');
  console.log(`Updated ${routesSafetyValidatorPath}`);
}

// Update safety routes to use the correct import
function updateSafetyRoutes() {
  const safetyRoutesPath = path.join(distDir, 'routes', 'safety.routes.js');

  if (fs.existsSync(safetyRoutesPath)) {
    console.log('Updating safety routes...');
    let content = fs.readFileSync(safetyRoutesPath, 'utf8');

    // Fix import in safety.routes.js
    content = content.replace(
      /import\s+{\s*SafetySchemas\s*}\s+from\s+['"]\.\.\/middleware\/validators\/safety\.validator\.ts['"]/,
      "import { SafetySchemas } from '../middleware/validators/safety-validator-compat.js'"
    );

    // Fix import if it uses ./validators/safety.validator.js
    content = content.replace(
      /import\s+{\s*safetySchemas\s*}\s+from\s+['"]\.\/validators\/safety\.validator\.js['"]/,
      "import { SafetySchemas as safetySchemas } from './validators/safety.validator.js'"
    );

    fs.writeFileSync(safetyRoutesPath, content, 'utf8');
    console.log(`Updated ${safetyRoutesPath}`);
  }
}

// Main function to run all fixes
function main() {
  console.log('Fixing safety validator compatibility issues...');

  // Create directories if they don't exist
  const routesValidatorsDir = path.join(distDir, 'routes', 'validators');
  if (!fs.existsSync(routesValidatorsDir)) {
    fs.mkdirSync(routesValidatorsDir, { recursive: true });
  }

  // Run fixes
  createSafetyValidatorCompat();
  updateRoutesValidatorStub();
  updateSafetyRoutes();

  console.log('Safety validator compatibility fixes completed!');
}

main();
