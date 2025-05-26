#!/usr/bin/env node

/**
 * Fix TypeScript Errors Script
 * 
 * This script fixes common TypeScript compilation errors:
 * 1. Import statements in wrong places
 * 2. Malformed syntax
 * 3. Template literal issues
 * 4. Missing semicolons and brackets
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
  errorsFixed: 0,
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

// Fix patterns for common TypeScript errors
const fixPatterns = [
  // Fix import statements appearing inside classes
  {
    name: 'Move imports to top',
    pattern: /^(\s*)(import\s+.*?;)$/gm,
    replacement: (match, whitespace, importStatement) => {
      // If this import is not at the beginning of the file, mark it for moving
      return `// MOVED_IMPORT: ${importStatement.trim()}`;
    },
    postProcess: (content) => {
      // Extract moved imports and place them at the top
      const movedImports = [];
      content = content.replace(/\/\/ MOVED_IMPORT: (.*)/g, (match, importStatement) => {
        movedImports.push(importStatement);
        return '';
      });
      
      if (movedImports.length > 0) {
        // Find existing imports at the top
        const lines = content.split('\n');
        let insertIndex = 0;
        
        // Find the last import statement at the top
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].trim().startsWith('import ')) {
            insertIndex = i + 1;
          } else if (lines[i].trim() && !lines[i].trim().startsWith('//') && !lines[i].trim().startsWith('/*')) {
            break;
          }
        }
        
        // Insert moved imports
        lines.splice(insertIndex, 0, ...movedImports);
        content = lines.join('\n');
      }
      
      return content;
    }
  },
  
  // Fix unterminated string literals
  {
    name: 'Fix unterminated strings',
    pattern: /import\s+.*?'[^']*$/gm,
    replacement: (match) => {
      if (!match.endsWith("';")) {
        return match + "';";
      }
      return match;
    }
  },
  
  // Fix malformed import statements
  {
    name: 'Fix malformed imports',
    pattern: /import\s+\{\s*([^}]*)\s*\}\s*from\s*'([^']*)'(?!;)/g,
    replacement: "import { $1 } from '$2';"
  },
  
  // Fix missing semicolons after statements
  {
    name: 'Add missing semicolons',
    pattern: /^(\s*)(.*[^;{}\s])(\s*)$/gm,
    replacement: (match, indent, statement, trailing) => {
      // Don't add semicolons to certain patterns
      if (statement.includes('//') || 
          statement.includes('/*') || 
          statement.includes('*/') ||
          statement.endsWith('{') ||
          statement.endsWith('}') ||
          statement.includes('if (') ||
          statement.includes('else') ||
          statement.includes('for (') ||
          statement.includes('while (') ||
          statement.includes('function') ||
          statement.includes('class ') ||
          statement.includes('interface ') ||
          statement.includes('enum ') ||
          statement.includes('export ') ||
          statement.includes('import ')) {
        return match;
      }
      return `${indent}${statement};${trailing}`;
    }
  },
  
  // Fix template literal issues
  {
    name: 'Fix template literals',
    pattern: /`([^`]*?)$/gm,
    replacement: '`$1`'
  },
  
  // Fix broken comment blocks
  {
    name: 'Fix comment blocks',
    pattern: /\/\*\*[\s\S]*?\*\//g,
    replacement: (match) => {
      // Ensure comment block is properly closed
      if (!match.endsWith('*/')) {
        return match + ' */';
      }
      return match;
    }
  },
  
  // Remove HTML content from TypeScript files
  {
    name: 'Remove HTML content',
    pattern: /<[^>]*>/g,
    replacement: ''
  },
  
  // Fix malformed class declarations
  {
    name: 'Fix class declarations',
    pattern: /^(\s*)(export\s+)?class\s+(\w+)(?!\s*{|\s+extends|\s+implements)/gm,
    replacement: '$1$2class $3 {'
  }
];

// Fix TypeScript errors in a file
function fixTypeScriptErrors(filePath) {
  try {
    stats.filesProcessed++;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let errorCount = 0;
    
    // Apply each fix pattern
    fixPatterns.forEach(pattern => {
      const originalContent = content;
      
      if (pattern.postProcess) {
        // Apply pattern first, then post-process
        content = content.replace(pattern.pattern, pattern.replacement);
        content = pattern.postProcess(content);
      } else {
        content = content.replace(pattern.pattern, pattern.replacement);
      }
      
      if (content !== originalContent) {
        modified = true;
        errorCount++;
        log(`Applied ${pattern.name} in ${filePath}`, 'verbose');
      }
    });
    
    // Additional cleanup
    if (modified) {
      // Remove empty lines at the beginning
      content = content.replace(/^\s*\n+/, '');
      
      // Remove multiple consecutive empty lines
      content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
      
      // Ensure file ends with newline
      if (!content.endsWith('\n')) {
        content += '\n';
      }
    }
    
    if (modified) {
      stats.filesFixed++;
      stats.errorsFixed += errorCount;
      
      if (config.backup) {
        const backupPath = `${filePath}.backup.${Date.now()}`;
        fs.writeFileSync(backupPath, fs.readFileSync(filePath));
        log(`Created backup: ${backupPath}`, 'verbose');
      }
      
      if (!config.dryRun) {
        fs.writeFileSync(filePath, content);
        log(`Fixed ${errorCount} errors in: ${filePath}`, 'success');
      } else {
        log(`[DRY RUN] Would fix ${errorCount} errors in: ${filePath}`, 'verbose');
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
  log(`🚀 Starting TypeScript error fixes`, 'info');
  log(`Configuration: ${JSON.stringify(config, null, 2)}`, 'verbose');
  
  const tsFiles = findFiles();
  log(`Found ${tsFiles.length} TypeScript files`, 'info');
  
  if (config.dryRun) {
    log('🔍 DRY RUN MODE - No files will be modified', 'warning');
  }
  
  tsFiles.forEach(fixTypeScriptErrors);
  
  // Generate summary
  log(`\n📊 TypeScript Error Fix Summary:`, 'info');
  log(`Files processed: ${stats.filesProcessed}`, 'info');
  log(`Files fixed: ${stats.filesFixed}`, 'info');
  log(`Errors fixed: ${stats.errorsFixed}`, 'info');
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
    log('\n✅ TypeScript error fixes complete!', 'success');
    log('\n📋 Next steps:', 'info');
    log('1. Run TypeScript compilation check again', 'info');
    log('2. Fix any remaining specific errors', 'info');
    log('3. Run linting and tests', 'info');
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { fixTypeScriptErrors };
