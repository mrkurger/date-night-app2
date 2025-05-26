#!/usr/bin/env node

/**
 * Fix Merge Conflicts Script
 * 
 * This script automatically resolves Git merge conflicts by:
 * 1. Detecting merge conflict markers
 * 2. Choosing the appropriate version (usually HEAD)
 * 3. Cleaning up the files
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const config = {
  srcPath: 'src',
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
  backup: process.argv.includes('--backup'),
};

// Statistics
const stats = {
  filesProcessed: 0,
  filesFixed: 0,
  conflictsResolved: 0,
  errors: [],
};

// Logging utility
function log(message, type = 'info') {
  const prefix = {
    info: '📝',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    verbose: '🔍'
  }[type] || '📝';
  
  if (type === 'verbose' && !config.verbose) return;
  console.log(`${prefix} ${message}`);
}

// Merge conflict patterns
const conflictPatterns = {
  start: /^<<<<<<< HEAD$/m,
  separator: /^=======$/m,
  end: /^>>>>>>> .+$/m,
  fullConflict: /^<<<<<<< HEAD\n([\s\S]*?)\n=======\n([\s\S]*?)\n>>>>>>> .+$/gm
};

// Fix merge conflicts in a file
function fixMergeConflicts(filePath) {
  try {
    stats.filesProcessed++;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let conflictCount = 0;
    
    // Check if file has merge conflicts
    if (!conflictPatterns.start.test(content)) {
      return; // No conflicts in this file
    }
    
    log(`Processing merge conflicts in: ${filePath}`, 'verbose');
    
    // Strategy: Choose HEAD version (first part) in most cases
    content = content.replace(conflictPatterns.fullConflict, (match, headContent, incomingContent) => {
      conflictCount++;
      
      // Analyze which version to keep
      const headLines = headContent.trim().split('\n');
      const incomingLines = incomingContent.trim().split('\n');
      
      // If HEAD version is empty or just whitespace, use incoming
      if (!headContent.trim()) {
        log(`  Conflict ${conflictCount}: Using incoming version (HEAD was empty)`, 'verbose');
        return incomingContent.trim();
      }
      
      // If incoming version is empty, use HEAD
      if (!incomingContent.trim()) {
        log(`  Conflict ${conflictCount}: Using HEAD version (incoming was empty)`, 'verbose');
        return headContent.trim();
      }
      
      // If both have content, prefer HEAD but check for imports
      if (headContent.includes('import') && !incomingContent.includes('import')) {
        log(`  Conflict ${conflictCount}: Using HEAD version (has imports)`, 'verbose');
        return headContent.trim();
      }
      
      if (incomingContent.includes('import') && !headContent.includes('import')) {
        log(`  Conflict ${conflictCount}: Using incoming version (has imports)`, 'verbose');
        return incomingContent.trim();
      }
      
      // Default: use HEAD version
      log(`  Conflict ${conflictCount}: Using HEAD version (default)`, 'verbose');
      return headContent.trim();
    });
    
    if (conflictCount > 0) {
      modified = true;
      stats.filesFixed++;
      stats.conflictsResolved += conflictCount;
      
      if (config.backup) {
        const backupPath = `${filePath}.backup.${Date.now()}`;
        fs.writeFileSync(backupPath, fs.readFileSync(filePath));
        log(`Created backup: ${backupPath}`, 'verbose');
      }
      
      if (!config.dryRun) {
        fs.writeFileSync(filePath, content);
        log(`Fixed ${conflictCount} conflicts in: ${filePath}`, 'success');
      } else {
        log(`[DRY RUN] Would fix ${conflictCount} conflicts in: ${filePath}`, 'verbose');
      }
    }
    
  } catch (error) {
    stats.errors.push({ file: filePath, error: error.message });
    log(`Error processing ${filePath}: ${error.message}`, 'error');
  }
}

// Find all TypeScript files
function findFiles() {
  const pattern = path.join(config.srcPath, '**/*.ts');
  return glob.sync(pattern);
}

// Main execution
function main() {
  log(`🚀 Starting merge conflict resolution`, 'info');
  log(`Configuration: ${JSON.stringify(config, null, 2)}`, 'verbose');
  
  const tsFiles = findFiles();
  log(`Found ${tsFiles.length} TypeScript files`, 'info');
  
  if (config.dryRun) {
    log('🔍 DRY RUN MODE - No files will be modified', 'warning');
  }
  
  tsFiles.forEach(fixMergeConflicts);
  
  // Generate summary
  log(`\n📊 Merge Conflict Resolution Summary:`, 'info');
  log(`Files processed: ${stats.filesProcessed}`, 'info');
  log(`Files fixed: ${stats.filesFixed}`, 'info');
  log(`Conflicts resolved: ${stats.conflictsResolved}`, 'info');
  log(`Errors: ${stats.errors.length}`, stats.errors.length > 0 ? 'error' : 'info');
  
  if (stats.errors.length > 0) {
    log('\n❌ Errors encountered:', 'error');
    stats.errors.forEach(({ file, error }) => {
      log(`  ${file}: ${error}`, 'error');
    });
  }
  
  if (config.dryRun) {
    log('\n⚠️  This was a dry run. No files were actually modified.', 'warning');
    log('Remove --dry-run flag to apply changes.', 'warning');
  } else {
    log('\n✅ Merge conflict resolution complete!', 'success');
    log('\n📋 Next steps:', 'info');
    log('1. Run TypeScript compilation check', 'info');
    log('2. Fix remaining syntax errors', 'info');
    log('3. Run linting and tests', 'info');
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { fixMergeConflicts };
