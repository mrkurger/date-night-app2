#!/usr/bin/env node

/**
 * Validator Integration Script
 * 
 * This script combines all validator fixes into one comprehensive solution.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverRoot = path.join(__dirname, '..');
const distDir = path.join(serverRoot, 'dist');

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  } catch (error) {
    if (error.code !== 'EEXIST') {
      console.error(`❌ Failed to create directory: ${error.message}`);
      throw error;
    }
  }
}

async function fixValidatorImports() {
  console.log('🔍 Finding and fixing validator imports in compiled JavaScript...');
  
  // Find all JS files in dist
  const files = await glob(`${distDir}/**/*.js`, { ignore: '**/node_modules/**' });
  let fixedFiles = 0;
  
  for (const file of files) {
    try {
      // Skip validator files themselves
      if (file.endsWith('validator.js') && 
         (file.includes('/middleware/validator.js') || 
          file.includes('/middleware/validator-compat.js') || 
          file.includes('/middleware/enhanced-validator.js'))) {
        continue;
      }
      
      const content = await fs.readFile(file, 'utf8');
      let modifiedContent = content;
      
      // Fix direct imports from validator.js
      modifiedContent = modifiedContent.replace(
        /imports*{s*validateWithZods*}s*froms*['"]([./]+)middleware/validator.js['"]/g,
        (match, path) => `import { legacyValidateWithZod as validateWithZod } from '${path}middleware/validator-compat.js'`
      );
      
      // Fix imports from enhanced-validator.ts
      modifiedContent = modifiedContent.replace(
        /imports*{s*validateWithZods*}s*froms*['"]([./]+)middleware/enhanced-validator.js['"]/g,
        (match, path) => `import { enhancedValidateWithZod as validateWithZod } from '${path}middleware/validator-compat.js'`
      );
      
      // Fix named validators
      const validatorImports = [
        'UserValidator', 
        'AdValidator', 
        'AuthValidator', 
        'PaymentValidator',
        'TravelValidator',
        'ReviewValidator',
        'LocationValidator',
        'SafetyValidator'
      ];
      
      for (const validatorName of validatorImports) {
        modifiedContent = modifiedContent.replace(
          new RegExp(`${validatorName}\.validateWithZod\b`, 'g'),
          `${validatorName}.legacyValidateWithZod`
        );
      }
      
      // Only write if changes were made
      if (modifiedContent !== content) {
        await fs.writeFile(file, modifiedContent);
        console.log(`✅ Updated imports in: ${path.relative(serverRoot, file)}`);
        fixedFiles++;
      }
    } catch (error) {
      console.error(`❌ Failed to process file: ${file} - ${error.message}`);
    }
  }
  
  console.log(`✅ Fixed imports in ${fixedFiles} files`);
}

// Copy the compatibility files to the dist directory
async function copyCompatFilesToDist() {
  console.log('📁 Copying compatibility files to dist...');
  
  try {
    // Ensure middleware directory exists in dist
    await ensureDir(path.join(distDir, 'middleware'));
    
    // Copy validator-compat.js
    const validatorCompatSrc = path.join(serverRoot, 'middleware', 'validator-compat.js');
    const validatorCompatDest = path.join(distDir, 'middleware', 'validator-compat.js');
    
    await fs.copyFile(validatorCompatSrc, validatorCompatDest);
    console.log(`✅ Copied validator-compat.js to ${validatorCompatDest}`);
    
    // Copy validator.js
    const validatorSrc = path.join(serverRoot, 'middleware', 'validator.js');
    const validatorDest = path.join(distDir, 'middleware', 'validator.js');
    
    await fs.copyFile(validatorSrc, validatorDest);
    console.log(`✅ Copied validator.js to ${validatorDest}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Failed to copy compatibility files: ${error.message}`);
    return false;
  }
}

async function main() {
  try {
    console.log('🚀 Starting validator integration...');
    
    // Copy compatibility files to dist
    await copyCompatFilesToDist();
    
    // Fix validator imports
    await fixValidatorImports();
    
    console.log('✅ Validator integration completed successfully!');
  } catch (error) {
    console.error(`❌ Validator integration failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main();
