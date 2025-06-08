// Setup for better TypeScript compilation
import path from 'path';
import url from 'url';
import fs from 'fs';

// Get __dirname equivalent in ES module
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate missing .d.ts files for JS modules
const serverRoot = path.join(__dirname, '..');
const srcDir = path.join(serverRoot, 'src');
const componentsDir = path.join(serverRoot, 'components');
const routesDir = path.join(serverRoot, 'routes');
const controllersDir = path.join(serverRoot, 'controllers');

/**
 * Generate a simple .d.ts file for a JavaScript module
 * @param {string} jsFilePath - Path to the JavaScript file
 */
function generateSimpleDtsFile(jsFilePath) {
  // Skip if it's not a .js file
  if (!jsFilePath.endsWith('.js')) return;

  // Skip if a .d.ts file already exists
  const dtsFilePath = jsFilePath.replace('.js', '.d.ts');
  if (fs.existsSync(dtsFilePath)) return;

  // Get the module name (the filename without extension)
  const moduleName = path.basename(jsFilePath, '.js');

  // Generate a simple declaration file
  const content = `declare const ${moduleName}: any;\nexport default ${moduleName};\n`;

  try {
    fs.writeFileSync(dtsFilePath, content);
    console.log(`Generated ${dtsFilePath}`);
  } catch (err) {
    console.error(`Error generating ${dtsFilePath}:`, err);
  }
}

/**
 * Process a directory recursively
 * @param {string} dir - Directory path
 */
function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.js')) {
      generateSimpleDtsFile(fullPath);
    }
  }
}

// Process directories
console.log('Generating TypeScript declarations for JavaScript modules...');
processDirectory(srcDir);
processDirectory(componentsDir);
processDirectory(routesDir);
processDirectory(controllersDir);
console.log('Done generating declarations.');

// Exit with success
process.exit(0);
