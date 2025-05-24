#!/usr/bin/env node

/**
 * validate-workflow-scripts.js
 * 
 * This script validates that all required workflow scripts exist and are functional.
 * It checks for missing dependencies and provides helpful error messages.
 */

import fs from 'fs/promises';
import path from 'path';

const REQUIRED_SCRIPTS = [
  'disable-husky-in-ci.js',
  'generate-snyk-task-list.js',
  'process-workflow-errors.js',
  'analyze-workflow-errors.js',
  'fetch-workflow-logs.js',
  'validate-error-patterns.js',
  'test-error-analyzer.js'
];

async function validateScript(scriptName) {
  try {
    const scriptPath = path.join(process.cwd(), '.github/scripts', scriptName);
    await fs.access(scriptPath);
    
    // Try to import the script to check for syntax errors
    try {
      await import(scriptPath);
      console.log(`✅ ${scriptName} - OK`);
      return true;
    } catch (importError) {
      console.log(`⚠️  ${scriptName} - Syntax/Import Error: ${importError.message}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${scriptName} - Missing`);
    return false;
  }
}

async function validateAllScripts() {
  console.log('🔍 Validating workflow scripts...\n');
  
  let allValid = true;
  
  for (const script of REQUIRED_SCRIPTS) {
    const isValid = await validateScript(script);
    if (!isValid) allValid = false;
  }
  
  console.log('\n📋 Validation Summary:');
  if (allValid) {
    console.log('✅ All workflow scripts are valid and functional');
  } else {
    console.log('⚠️  Some workflow scripts have issues - workflows may fail');
    console.log('💡 Consider fixing the issues above or disabling problematic workflows');
  }
  
  return allValid;
}

// Run validation if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateAllScripts().catch(console.error);
}

export default validateAllScripts;
