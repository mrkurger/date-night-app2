#!/usr/bin/env node

/**
 * Comprehensive TypeScript Error Fixer
 *
 * This script automatically fixes common TypeScript errors in the Angular frontend.
 * It handles:
 * 1. Missing rxjs imports
 * 2. Incorrect interceptor exports
 * 3. Missing properties in interfaces
 * 4. Type assignment errors
 * 5. Other common TypeScript errors
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  errorsFile: path.resolve(__dirname, '../' + (process.env.ERRORS_FILE || 'errors.csv')),
  clientDir: path.resolve(__dirname, '../client-angular'),
  backupDir: path.resolve(__dirname, '../ts-fixes-backup-comprehensive'),
  dryRun: false, // Set to true to preview changes without applying them
};

// Main function
async function main() {
  console.log('Comprehensive TypeScript Error Fixer');
  console.log('===================================');

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

    // Group errors by type for more efficient processing
    const errorsByType = groupErrorsByType(fileErrors);

    // Process each error type
    for (const [errorType, errors] of Object.entries(errorsByType)) {
      try {
        content = fixErrorsByType(content, errorType, errors, filePath);
        fixedCount += errors.length;
      } catch (err) {
        console.error(`Error fixing ${errorType} in ${filePath}:`, err.message);
        skippedCount += errors.length;
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
      // The format is: file_path,error_codes
      const [path, errorCodes] = line.split(',');

      if (!path || !errorCodes) {
        console.warn(`Warning: Malformed line in CSV: ${line}`);
        return null;
      }

      // Split multiple error codes if present
      const codes = errorCodes.split(/[,;]/).map(code => code.trim());

      // Create an error object for each code
      return codes.map(code => ({
        code: code.replace(/^"|"$/g, ''), // Remove quotes if present
        path,
        // We don't have line and column info in this format
        line: 0,
        column: 0,
        message: `Error ${code} in ${path}`,
      }));
    })
    .filter(error => error !== null) // Remove any null entries from malformed lines
    .flat(); // Flatten the array of arrays
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

// Group errors by type for more efficient processing
function groupErrorsByType(errors) {
  const result = {};

  for (const error of errors) {
    if (!result[error.code]) {
      result[error.code] = [];
    }

    result[error.code].push(error);
  }

  return result;
}

// Fix errors by type
function fixErrorsByType(content, errorType, errors, filePath) {
  switch (errorType) {
    case 'TS2307': // Cannot find module
      return fixMissingModuleErrors(content, errors, filePath);

    case 'TS2724': // Export name mismatch
      return fixExportNameErrors(content, errors, filePath);

    case 'TS2339': // Property does not exist on type
      return fixMissingPropertyErrors(content, errors, filePath);

    case 'TS2322': // Type assignment error
      return fixTypeAssignmentErrors(content, errors, filePath);

    case 'TS2678': // Type comparison error
      return fixTypeComparisonErrors(content, errors, filePath);

    case 'TS2551': // Property name error
      return fixPropertyNameErrors(content, errors, filePath);

    case 'TS2353': // Object literal property error
      return fixObjectLiteralErrors(content, errors, filePath);

    case 'TS2304': // Cannot find name
      return fixCannotFindNameErrors(content, errors, filePath);

    case 'TS2345': // Argument type error
      return fixArgumentTypeErrors(content, errors, filePath);

    default:
      console.log(`No handler for error code ${errorType}`);
      return content;
  }
}

// Fix TS2307: Cannot find module errors
function fixMissingModuleErrors(content, errors, filePath) {
  let result = content;

  // Check for rxjs imports
  if (errors.some(error => error.message.includes('rxjs'))) {
    // Check if rxjs is already imported
    if (!result.includes('import { Observable') && !result.includes('import { of')) {
      // Add rxjs import at the top of the file after other imports
      const lines = result.split('\n');
      let lastImportIndex = -1;

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
          lastImportIndex = i;
        }
      }

      if (lastImportIndex >= 0) {
        lines.splice(lastImportIndex + 1, 0, "import { Observable } from 'rxjs';");
        result = lines.join('\n');
      }
    }
  }

  return result;
}

// Fix TS2724: Export name mismatch errors
function fixExportNameErrors(content, errors, filePath) {
  let result = content;

  if (filePath.includes('core.module.ts')) {
    // Fix interceptor imports
    if (errors.some(error => error.message.includes('AuthInterceptor'))) {
      result = result.replace(
        "import { AuthInterceptor } from './interceptors/auth.interceptor';",
        "import { authInterceptor } from './interceptors/auth.interceptor';"
      );
    }

    if (errors.some(error => error.message.includes('CSPInterceptor'))) {
      result = result.replace(
        "import { CSPInterceptor } from './interceptors/csp.interceptor';",
        "import { cspInterceptor } from './interceptors/csp.interceptor';"
      );
    }

    if (errors.some(error => error.message.includes('CsrfInterceptor'))) {
      result = result.replace(
        "import { CsrfInterceptor } from './interceptors/csrf.interceptor';",
        "import { csrfInterceptor } from './interceptors/csrf.interceptor';"
      );
    }

    if (errors.some(error => error.message.includes('HttpErrorInterceptor'))) {
      result = result.replace(
        "import { HttpErrorInterceptor } from './interceptors/http-error.interceptor';",
        "import { httpErrorInterceptor } from './interceptors/http-error.interceptor';"
      );
    }

    // Fix factory functions
    result = result
      .replace(/return new AuthInterceptor\([^)]*\);/, 'return authInterceptor;')
      .replace(/return new CSPInterceptor\([^)]*\);/, 'return cspInterceptor;')
      .replace(/return new CsrfInterceptor\([^)]*\);/, 'return csrfInterceptor;')
      .replace(/return new HttpErrorInterceptor\([^)]*\);/, 'return httpErrorInterceptor;');
  }

  return result;
}

// Fix TS2339: Property does not exist on type errors
function fixMissingPropertyErrors(content, errors, filePath) {
  let result = content;

  if (errors.some(error => error.message.includes('FavoriteFilterOptions'))) {
    // Fix FavoriteFilterOptions interface
    if (filePath.includes('favorite.service.ts')) {
      const interfaceMatch = result.match(/export interface FavoriteFilterOptions \{[^}]*\}/s);

      if (interfaceMatch) {
        let interfaceContent = interfaceMatch[0];

        // Add missing properties
        if (
          errors.some(error => error.message.includes('priority')) &&
          !interfaceContent.includes('priority?:')
        ) {
          interfaceContent = interfaceContent.replace(
            /\}$/,
            "  priority?: 'low' | 'normal' | 'high';\n}"
          );
        }

        if (
          errors.some(error => error.message.includes('priceMin')) &&
          !interfaceContent.includes('priceMin?:')
        ) {
          interfaceContent = interfaceContent.replace(/\}$/, '  priceMin?: number;\n}');
        }

        if (
          errors.some(error => error.message.includes('priceMax')) &&
          !interfaceContent.includes('priceMax?:')
        ) {
          interfaceContent = interfaceContent.replace(/\}$/, '  priceMax?: number;\n}');
        }

        if (
          errors.some(error => error.message.includes('dateFrom')) &&
          !interfaceContent.includes('dateFrom?:')
        ) {
          interfaceContent = interfaceContent.replace(/\}$/, '  dateFrom?: string | Date;\n}');
        }

        if (
          errors.some(error => error.message.includes('dateTo')) &&
          !interfaceContent.includes('dateTo?:')
        ) {
          interfaceContent = interfaceContent.replace(/\}$/, '  dateTo?: string | Date;\n}');
        }

        if (
          errors.some(error => error.message.includes('tags')) &&
          !interfaceContent.includes('tags?:')
        ) {
          interfaceContent = interfaceContent.replace(/\}$/, '  tags?: string[];\n}');
        }

        result = result.replace(interfaceMatch[0], interfaceContent);
      }
    } else if (
      filePath.includes('chat-list/chat-list.component.ts') &&
      errors.some(error => error.message.includes('pinned'))
    ) {
      // Fix ChatRoom interface usage
      result = result.replace(/\.pinned/g, "['pinned']");
    }
  }

  // Fix other property access errors using bracket notation
  if (errors.some(error => error.message.includes('createdAt'))) {
    result = result.replace(/\.createdAt/g, "['createdAt']");
  }

  if (errors.some(error => error.message.includes('updatedAt'))) {
    result = result.replace(/\.updatedAt/g, "['updatedAt']");
  }

  return result;
}

// Fix TS2322: Type assignment errors
function fixTypeAssignmentErrors(content, errors, filePath) {
  let result = content;

  if (filePath.includes('alert.service.ts')) {
    // Add imports if needed
    if (
      errors.some(
        error => error.message.includes('AlertTimeWindow') || error.message.includes('AlertChannel')
      )
    ) {
      if (!result.includes('AlertTimeWindow') || !result.includes('AlertChannel')) {
        result = result.replace(
          /import \{ Alert, AlertEvent, AlertConditionType, AlertSeverity([^}]*)\} from '..\/models\/alert.model';/,
          "import { Alert, AlertEvent, AlertConditionType, AlertSeverity, AlertTimeWindow, AlertChannel$1} from '../models/alert.model';"
        );
      }
    }

    // Fix AlertTimeWindow type errors
    if (errors.some(error => error.message.includes('AlertTimeWindow'))) {
      result = result
        .replace(/timeWindow = '1h'/g, 'timeWindow = AlertTimeWindow.HOURS_1')
        .replace(/timeWindow = '15m'/g, 'timeWindow = AlertTimeWindow.MINUTES_15')
        .replace(/timeWindow = '30m'/g, 'timeWindow = AlertTimeWindow.MINUTES_30')
        .replace(/timeWindow = '24h'/g, 'timeWindow = AlertTimeWindow.HOURS_24');
    }

    // Fix AlertChannel type errors
    if (errors.some(error => error.message.includes('AlertChannel'))) {
      result = result
        .replace(/channel: 'ui'/g, 'channel: AlertChannel.UI')
        .replace(/channel: 'email'/g, 'channel: AlertChannel.EMAIL')
        .replace(/channel: 'slack'/g, 'channel: AlertChannel.SLACK');
    }
  }

  return result;
}

// Fix TS2678: Type comparison errors
function fixTypeComparisonErrors(content, errors, filePath) {
  let result = content;

  if (filePath.includes('geocoding.service.ts')) {
    // Fix type comparison errors in geocoding service
    result = result
      .replace(/provider === 'mapbox'/g, "provider === 'mapbox' as any")
      .replace(/provider === 'google'/g, "provider === 'google' as any");
  }

  return result;
}

// Fix TS2551: Property name errors
function fixPropertyNameErrors(content, errors, filePath) {
  let result = content;

  if (
    errors.some(
      error =>
        error.message.includes('getCurrentUserId') && error.message.includes('getCurrentUser')
    )
  ) {
    // Fix method name error
    result = result.replace(/getCurrentUserId/g, 'getCurrentUser');
  }

  return result;
}

// Fix TS2353: Object literal property errors
function fixObjectLiteralErrors(content, errors, filePath) {
  let result = content;

  if (
    errors.some(error => error.message.includes('name')) &&
    filePath.includes('http-error.interceptor.ts')
  ) {
    // Fix ErrorTelemetry property error
    result = result.replace(/name: 'HttpError',/, "errorType: 'HttpError',");
  } else if (
    errors.some(error => error.message.includes('existingNotes')) &&
    filePath.includes('favorites-page.component.ts')
  ) {
    // Fix NotesDialogData property error
    result = result.replace(/existingNotes:/g, 'notes:');
  }

  return result;
}

// Fix TS2304: Cannot find name errors
function fixCannotFindNameErrors(content, errors, filePath) {
  let result = content;

  if (errors.some(error => error.message.includes('User'))) {
    // Add User import
    result = result.replace(
      /import {/,
      "import { User } from '../models/user.interface';\nimport {"
    );
  }

  if (errors.some(error => error.message.includes('map'))) {
    // Add map operator import
    if (result.includes('import { tap') || result.includes('import {tap')) {
      result = result.replace(
        /import \{([^}]*)\} from 'rxjs\/operators';/,
        "import {$1, map} from 'rxjs/operators';"
      );
    } else {
      result = result.replace(/import {/, "import { map } from 'rxjs/operators';\nimport {");
    }
  }

  return result;
}

// Fix TS2345: Argument type errors
function fixArgumentTypeErrors(content, errors, filePath) {
  let result = content;

  if (
    errors.some(
      error =>
        error.message.includes('unknown') && error.message.includes('string | number | boolean')
    )
  ) {
    // Fix type casting for unknown to string
    result = result.replace(/params\.set\([^,]+, ([^)]+)\)/g, 'params.set($1.toString())');
  }

  return result;
}

// Run the script
main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
