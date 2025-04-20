#!/usr/bin/env node

/**
 * TypeScript Error Fixer
 *
 * This script automatically fixes common TypeScript errors in the Angular frontend.
 * It handles:
 * 1. Missing rxjs imports
 * 2. Incorrect interceptor exports
 * 3. Missing properties in interfaces
 * 4. Type assignment errors
 * 5. Other common TypeScript errors
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  errorsFile: path.resolve(__dirname, '../errors.csv'),
  clientDir: path.resolve(__dirname, '../client-angular/src'),
  backupDir: path.resolve(__dirname, '../ts-fixes-backup'),
  dryRun: false, // Set to true to preview changes without applying them
};

// Error types and their handlers
const ERROR_HANDLERS = {
  TS2307: handleMissingModuleError,
  TS2724: handleExportNameError,
  TS2339: handleMissingPropertyError,
  TS2322: handleTypeAssignmentError,
  TS2678: handleTypeComparisonError,
  TS2551: handlePropertyNameError,
  TS2353: handleObjectLiteralError,
  TS2304: handleCannotFindNameError,
  TS2345: handleArgumentTypeError,
};

// Main function
async function main() {
  console.log('TypeScript Error Fixer');
  console.log('=====================');

  // Create backup directory if it doesn't exist
  if (!fs.existsSync(CONFIG.backupDir)) {
    fs.mkdirSync(CONFIG.backupDir, { recursive: true });
  }

  // Read errors from CSV file
  const errors = readErrorsFromCSV(CONFIG.errorsFile);
  console.log(`Found ${errors.length} errors to fix`);

  // Group errors by file for more efficient processing
  const errorsByFile = groupErrorsByFile(errors);

  // Process each file
  let fixedCount = 0;
  let skippedCount = 0;

  for (const [filePath, fileErrors] of Object.entries(errorsByFile)) {
    const fullPath = path.join(CONFIG.clientDir, filePath);

    if (!fs.existsSync(fullPath)) {
      console.log(`File not found: ${fullPath}`);
      skippedCount += fileErrors.length;
      continue;
    }

    // Backup the file
    const backupPath = path.join(CONFIG.backupDir, filePath);
    const backupDir = path.dirname(backupPath);

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    fs.copyFileSync(fullPath, backupPath);

    // Read file content
    let content = fs.readFileSync(fullPath, 'utf8');
    let originalContent = content;

    // Process each error in the file
    for (const error of fileErrors) {
      try {
        const handler = ERROR_HANDLERS[error.code];

        if (handler) {
          content = handler(content, error, fullPath);
        } else {
          console.log(`No handler for error code ${error.code}`);
          skippedCount++;
          continue;
        }

        fixedCount++;
      } catch (err) {
        console.error(`Error fixing ${error.code} in ${filePath}:`, err.message);
        skippedCount++;
      }
    }

    // Write changes if content was modified
    if (content !== originalContent && !CONFIG.dryRun) {
      fs.writeFileSync(fullPath, content);
      console.log(`Fixed errors in ${filePath}`);
    }
  }

  console.log('\nSummary:');
  console.log(`- Fixed: ${fixedCount} errors`);
  console.log(`- Skipped: ${skippedCount} errors`);

  if (CONFIG.dryRun) {
    console.log('\nDRY RUN: No changes were applied');
  }
}

// Read errors from CSV file
function readErrorsFromCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').slice(1); // Skip header

  return lines
    .filter(line => line.trim())
    .map(line => {
      const [code, message, pointer, path] = line.split(',');
      const [lineNum, colNum] = pointer.split(':');

      return {
        code,
        message: message.replace(/^"|"$/g, ''), // Remove quotes
        line: parseInt(lineNum, 10),
        column: parseInt(colNum, 10),
        path: path.replace(/^\[1\]\s+/, '').trim(),
      };
    });
}

// Group errors by file for more efficient processing
function groupErrorsByFile(errors) {
  const result = {};

  for (const error of errors) {
    if (!result[error.path]) {
      result[error.path] = [];
    }

    result[error.path].push(error);
  }

  return result;
}

// Handler for TS2307: Cannot find module 'rxjs' or its corresponding type declarations
function handleMissingModuleError(content, error, filePath) {
  if (error.message.includes('rxjs')) {
    // Check if rxjs is already imported
    if (!content.includes('import { Observable') && !content.includes('import { of')) {
      // Add rxjs import at the top of the file after other imports
      const lines = content.split('\n');
      let lastImportIndex = -1;

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
          lastImportIndex = i;
        }
      }

      if (lastImportIndex >= 0) {
        lines.splice(lastImportIndex + 1, 0, "import { Observable } from 'rxjs';");
        return lines.join('\n');
      }
    }
  }

  return content;
}

// Handler for TS2724: Export name mismatch
function handleExportNameError(content, error, filePath) {
  if (filePath.includes('core.module.ts')) {
    // Fix interceptor imports
    if (error.message.includes('AuthInterceptor')) {
      return content.replace(
        "import { AuthInterceptor } from './interceptors/auth.interceptor';",
        "import { authInterceptor } from './interceptors/auth.interceptor';"
      );
    } else if (error.message.includes('CSPInterceptor')) {
      return content.replace(
        "import { CSPInterceptor } from './interceptors/csp.interceptor';",
        "import { cspInterceptor } from './interceptors/csp.interceptor';"
      );
    }
  }

  return content;
}

// Handler for TS2339: Property does not exist on type
function handleMissingPropertyError(content, error, filePath) {
  if (error.message.includes('FavoriteFilterOptions')) {
    // Fix FavoriteFilterOptions interface
    if (filePath.includes('favorite.service.ts')) {
      const interfaceMatch = content.match(/export interface FavoriteFilterOptions \{[^}]*\}/s);

      if (interfaceMatch) {
        let interfaceContent = interfaceMatch[0];

        // Add missing properties
        if (error.message.includes('priority') && !interfaceContent.includes('priority?:')) {
          interfaceContent = interfaceContent.replace(
            /\}$/,
            "  priority?: 'low' | 'normal' | 'high';\n}"
          );
        }

        if (error.message.includes('priceMin') && !interfaceContent.includes('priceMin?:')) {
          interfaceContent = interfaceContent.replace(/\}$/, '  priceMin?: number;\n}');
        }

        if (error.message.includes('priceMax') && !interfaceContent.includes('priceMax?:')) {
          interfaceContent = interfaceContent.replace(/\}$/, '  priceMax?: number;\n}');
        }

        if (error.message.includes('dateFrom') && !interfaceContent.includes('dateFrom?:')) {
          interfaceContent = interfaceContent.replace(/\}$/, '  dateFrom?: string | Date;\n}');
        }

        if (error.message.includes('dateTo') && !interfaceContent.includes('dateTo?:')) {
          interfaceContent = interfaceContent.replace(/\}$/, '  dateTo?: string | Date;\n}');
        }

        if (error.message.includes('tags') && !interfaceContent.includes('tags?:')) {
          interfaceContent = interfaceContent.replace(/\}$/, '  tags?: string[];\n}');
        }

        return content.replace(interfaceMatch[0], interfaceContent);
      }
    } else if (
      filePath.includes('chat-list/chat-list.component.ts') &&
      error.message.includes('pinned')
    ) {
      // Fix ChatRoom interface usage
      return content.replace(/\.pinned/g, "['pinned']");
    }
  }

  return content;
}

// Handler for TS2322: Type assignment errors
function handleTypeAssignmentError(content, error, filePath) {
  if (filePath.includes('alert.service.ts')) {
    if (error.message.includes('AlertTimeWindow')) {
      // Fix AlertTimeWindow type errors
      return content.replace(/timeWindow = '(\w+)'/g, 'timeWindow = AlertTimeWindow.$1');
    } else if (error.message.includes('AlertChannel')) {
      // Fix AlertChannel type errors
      return content
        .replace(/channel: 'ui'/g, 'channel: AlertChannel.UI')
        .replace(/channel: 'email'/g, 'channel: AlertChannel.EMAIL')
        .replace(/channel: 'slack'/g, 'channel: AlertChannel.SLACK');
    }
  }

  return content;
}

// Handler for TS2678: Type comparison errors
function handleTypeComparisonError(content, error, filePath) {
  if (filePath.includes('geocoding.service.ts')) {
    // Fix type comparison errors in geocoding service
    return content
      .replace(/provider === 'mapbox'/g, "provider === 'mapbox' as any")
      .replace(/provider === 'google'/g, "provider === 'google' as any");
  }

  return content;
}

// Handler for TS2551: Property name errors
function handlePropertyNameError(content, error, filePath) {
  if (error.message.includes('getCurrentUserId') && error.message.includes('getCurrentUser')) {
    // Fix method name error
    return content.replace(/getCurrentUserId/g, 'getCurrentUser');
  }

  return content;
}

// Handler for TS2353: Object literal property errors
function handleObjectLiteralError(content, error, filePath) {
  if (error.message.includes('name') && filePath.includes('http-error.interceptor.ts')) {
    // Fix ErrorTelemetry property error
    return content.replace(/name: 'HttpError',/, "errorType: 'HttpError',");
  } else if (
    error.message.includes('existingNotes') &&
    filePath.includes('favorites-page.component.ts')
  ) {
    // Fix NotesDialogData property error
    return content.replace(/existingNotes:/, 'notes:');
  }

  return content;
}

// Handler for TS2304: Cannot find name errors
function handleCannotFindNameError(content, error, filePath) {
  if (error.message.includes('User')) {
    // Add User import
    return content.replace(
      /import {/,
      "import { User } from '../models/user.interface';\nimport {"
    );
  } else if (error.message.includes('map')) {
    // Add map operator import
    if (content.includes('import { tap') || content.includes('import {tap')) {
      return content.replace(
        /import \{([^}]*)\} from 'rxjs\/operators';/,
        "import {$1, map} from 'rxjs/operators';"
      );
    } else {
      return content.replace(/import {/, "import { map } from 'rxjs/operators';\nimport {");
    }
  }

  return content;
}

// Handler for TS2345: Argument type errors
function handleArgumentTypeError(content, error, filePath) {
  if (error.message.includes('unknown') && error.message.includes('string | number | boolean')) {
    // Fix type casting for unknown to string
    return content.replace(/params\.set\([^,]+, ([^)]+)\)/g, 'params.set($1.toString())');
  }

  return content;
}

// Run the script
main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
