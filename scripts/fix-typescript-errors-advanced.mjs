#!/usr/bin/env node

/**
 * Advanced TypeScript Error Fixer
 *
 * This script uses ts-morph to perform more accurate TypeScript transformations
 * to fix common errors in the Angular frontend.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  errorsFile: path.resolve(__dirname, '../errors.csv'),
  clientDir: path.resolve(__dirname, '../client-angular'),
  backupDir: path.resolve(__dirname, '../ts-fixes-backup-advanced'),
  dryRun: false, // Set to true to preview changes without applying them
  tsConfigPath: path.resolve(__dirname, '../client-angular/tsconfig.json'),
};

// Main function
async function main() {
  console.log('Advanced TypeScript Error Fixer');
  console.log('==============================');

  // Check if ts-morph is installed
  try {
    await import('ts-morph');
  } catch (err) {
    console.log('Installing ts-morph...');
    execSync('npm install --no-save ts-morph', { stdio: 'inherit' });
  }

  // Import ts-morph dynamically
  const { Project, SyntaxKind } = await import('ts-morph');

  // Create backup directory if it doesn't exist
  if (!fs.existsSync(CONFIG.backupDir)) {
    fs.mkdirSync(CONFIG.backupDir, { recursive: true });
  }

  // Read errors from CSV file
  const errors = readErrorsFromCSV(CONFIG.errorsFile);
  console.log(`Found ${errors.length} errors to fix`);

  // Group errors by file for more efficient processing
  const errorsByFile = groupErrorsByFile(errors);

  // Initialize ts-morph project
  const project = new Project({
    tsConfigFilePath: CONFIG.tsConfigPath,
    skipAddingFilesFromTsConfig: true,
  });

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
    const relativePath = path.relative(CONFIG.clientDir, fullPath);
    const backupPath = path.join(CONFIG.backupDir, relativePath);
    const backupDir = path.dirname(backupPath);

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    fs.copyFileSync(fullPath, backupPath);

    // Add file to project
    const sourceFile = project.addSourceFileAtPath(fullPath);
    let fileModified = false;

    // Process each error in the file
    for (const error of fileErrors) {
      try {
        const fixed = fixError(sourceFile, error, SyntaxKind);

        if (fixed) {
          fileModified = true;
          fixedCount++;
        } else {
          skippedCount++;
        }
      } catch (err) {
        console.error(`Error fixing ${error.code} in ${filePath}:`, err.message);
        skippedCount++;
      }
    }

    // Save changes if file was modified
    if (fileModified && !CONFIG.dryRun) {
      sourceFile.saveSync();
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

// Fix a specific error in a source file
function fixError(sourceFile, error, SyntaxKind) {
  switch (error.code) {
    case 'TS2307': // Cannot find module
      return fixMissingModuleError(sourceFile, error);

    case 'TS2724': // Export name mismatch
      return fixExportNameError(sourceFile, error, SyntaxKind);

    case 'TS2339': // Property does not exist on type
      return fixMissingPropertyError(sourceFile, error, SyntaxKind);

    case 'TS2322': // Type assignment error
      return fixTypeAssignmentError(sourceFile, error, SyntaxKind);

    case 'TS2678': // Type comparison error
      return fixTypeComparisonError(sourceFile, error, SyntaxKind);

    case 'TS2551': // Property name error
      return fixPropertyNameError(sourceFile, error, SyntaxKind);

    case 'TS2353': // Object literal property error
      return fixObjectLiteralError(sourceFile, error, SyntaxKind);

    case 'TS2304': // Cannot find name
      return fixCannotFindNameError(sourceFile, error);

    case 'TS2345': // Argument type error
      return fixArgumentTypeError(sourceFile, error, SyntaxKind);

    default:
      console.log(`No handler for error code ${error.code}`);
      return false;
  }
}

// Fix TS2307: Cannot find module 'rxjs' or its corresponding type declarations
function fixMissingModuleError(sourceFile, error) {
  if (error.message.includes('rxjs')) {
    // Check if rxjs is already imported
    const hasRxjsImport = sourceFile
      .getImportDeclarations()
      .some(importDecl => importDecl.getModuleSpecifierValue() === 'rxjs');

    if (!hasRxjsImport) {
      // Add rxjs import
      sourceFile.addImportDeclaration({
        moduleSpecifier: 'rxjs',
        namedImports: ['Observable'],
      });

      return true;
    }
  }

  return false;
}

// Fix TS2724: Export name mismatch
function fixExportNameError(sourceFile, error, SyntaxKind) {
  if (sourceFile.getBaseName() === 'core.module.ts') {
    // Fix interceptor imports
    const importDeclarations = sourceFile.getImportDeclarations();

    for (const importDecl of importDeclarations) {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();

      if (
        error.message.includes('AuthInterceptor') &&
        moduleSpecifier.includes('auth.interceptor')
      ) {
        importDecl.setModuleSpecifier('./interceptors/auth.interceptor');
        importDecl.getNamedImports()[0].setName('authInterceptor');
        return true;
      } else if (
        error.message.includes('CSPInterceptor') &&
        moduleSpecifier.includes('csp.interceptor')
      ) {
        importDecl.setModuleSpecifier('./interceptors/csp.interceptor');
        importDecl.getNamedImports()[0].setName('cspInterceptor');
        return true;
      }
    }

    // Also update factory functions
    const functions = sourceFile.getFunctions();

    for (const func of functions) {
      const funcName = func.getName();

      if (funcName === 'cspInterceptorFactory') {
        const returnStatement = func.getDescendantsOfKind(SyntaxKind.ReturnStatement)[0];
        if (returnStatement) {
          returnStatement.replaceWithText('return cspInterceptor;');
          return true;
        }
      } else if (funcName === 'authInterceptorFactory') {
        const returnStatement = func.getDescendantsOfKind(SyntaxKind.ReturnStatement)[0];
        if (returnStatement) {
          returnStatement.replaceWithText('return authInterceptor;');
          return true;
        }
      }
    }
  }

  return false;
}

// Fix TS2339: Property does not exist on type
function fixMissingPropertyError(sourceFile, error, SyntaxKind) {
  if (error.message.includes('FavoriteFilterOptions')) {
    // Find the FavoriteFilterOptions interface
    const interfaces = sourceFile.getInterfaces();
    const favoriteFilterOptions = interfaces.find(i => i.getName() === 'FavoriteFilterOptions');

    if (favoriteFilterOptions) {
      // Add missing properties
      if (error.message.includes('priority') && !favoriteFilterOptions.getProperty('priority')) {
        favoriteFilterOptions.addProperty({
          name: 'priority',
          type: "'low' | 'normal' | 'high'",
          hasQuestionToken: true,
        });
        return true;
      }

      if (error.message.includes('priceMin') && !favoriteFilterOptions.getProperty('priceMin')) {
        favoriteFilterOptions.addProperty({
          name: 'priceMin',
          type: 'number',
          hasQuestionToken: true,
        });
        return true;
      }

      if (error.message.includes('priceMax') && !favoriteFilterOptions.getProperty('priceMax')) {
        favoriteFilterOptions.addProperty({
          name: 'priceMax',
          type: 'number',
          hasQuestionToken: true,
        });
        return true;
      }

      if (error.message.includes('dateFrom') && !favoriteFilterOptions.getProperty('dateFrom')) {
        favoriteFilterOptions.addProperty({
          name: 'dateFrom',
          type: 'string | Date',
          hasQuestionToken: true,
        });
        return true;
      }

      if (error.message.includes('dateTo') && !favoriteFilterOptions.getProperty('dateTo')) {
        favoriteFilterOptions.addProperty({
          name: 'dateTo',
          type: 'string | Date',
          hasQuestionToken: true,
        });
        return true;
      }

      if (error.message.includes('tags') && !favoriteFilterOptions.getProperty('tags')) {
        favoriteFilterOptions.addProperty({
          name: 'tags',
          type: 'string[]',
          hasQuestionToken: true,
        });
        return true;
      }
    }
  } else if (
    sourceFile.getBaseName().includes('chat-list.component.ts') &&
    error.message.includes('pinned')
  ) {
    // Fix ChatRoom interface usage by using bracket notation
    const propertyAccesses = sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression);

    for (const propAccess of propertyAccesses) {
      if (propAccess.getName() === 'pinned') {
        propAccess.replaceWithText(`${propAccess.getExpression().getText()}['pinned']`);
        return true;
      }
    }
  } else if (
    error.message.includes('createdAt') &&
    sourceFile.getBaseName().includes('chat-list.component.ts')
  ) {
    // Fix missing createdAt property access
    const propertyAccesses = sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression);

    for (const propAccess of propertyAccesses) {
      if (propAccess.getName() === 'createdAt') {
        propAccess.replaceWithText(`${propAccess.getExpression().getText()}['createdAt']`);
        return true;
      }
    }
  }

  return false;
}

// Fix TS2322: Type assignment errors
function fixTypeAssignmentError(sourceFile, error, SyntaxKind) {
  if (sourceFile.getBaseName() === 'alert.service.ts') {
    // Import AlertTimeWindow and AlertChannel if needed
    const hasAlertModelImport = sourceFile
      .getImportDeclarations()
      .some(
        importDecl =>
          importDecl.getModuleSpecifierValue().includes('alert.model') &&
          importDecl
            .getNamedImports()
            .some(
              namedImport =>
                namedImport.getName() === 'AlertTimeWindow' ||
                namedImport.getName() === 'AlertChannel'
            )
      );

    if (!hasAlertModelImport) {
      // Update the import to include AlertTimeWindow and AlertChannel
      const alertModelImport = sourceFile
        .getImportDeclarations()
        .find(importDecl => importDecl.getModuleSpecifierValue().includes('alert.model'));

      if (alertModelImport) {
        const namedImports = alertModelImport.getNamedImports().map(ni => ni.getName());

        if (!namedImports.includes('AlertTimeWindow')) {
          namedImports.push('AlertTimeWindow');
        }

        if (!namedImports.includes('AlertChannel')) {
          namedImports.push('AlertChannel');
        }

        alertModelImport.setNamedImports(namedImports);
      }
    }

    if (error.message.includes('AlertTimeWindow')) {
      // Fix AlertTimeWindow type errors
      const stringLiterals = sourceFile.getDescendantsOfKind(SyntaxKind.StringLiteral);

      for (const literal of stringLiterals) {
        const parent = literal.getParent();

        if (parent && parent.getKind() === SyntaxKind.BinaryExpression) {
          continue; // Skip string literals in comparisons
        }

        const text = literal.getText();

        if (text === "'1h'" || text === '"1h"') {
          literal.replaceWithText('AlertTimeWindow.HOURS_1');
          return true;
        } else if (text === "'15m'" || text === '"15m"') {
          literal.replaceWithText('AlertTimeWindow.MINUTES_15');
          return true;
        } else if (text === "'30m'" || text === '"30m"') {
          literal.replaceWithText('AlertTimeWindow.MINUTES_30');
          return true;
        } else if (text === "'24h'" || text === '"24h"') {
          literal.replaceWithText('AlertTimeWindow.HOURS_24');
          return true;
        }
      }
    } else if (error.message.includes('AlertChannel')) {
      // Fix AlertChannel type errors
      const stringLiterals = sourceFile.getDescendantsOfKind(SyntaxKind.StringLiteral);

      for (const literal of stringLiterals) {
        const parent = literal.getParent();
        const text = literal.getText();

        if (
          parent &&
          parent.getKind() === SyntaxKind.PropertyAssignment &&
          parent.getName() === 'channel'
        ) {
          if (text === "'ui'" || text === '"ui"') {
            literal.replaceWithText('AlertChannel.UI');
            return true;
          } else if (text === "'email'" || text === '"email"') {
            literal.replaceWithText('AlertChannel.EMAIL');
            return true;
          } else if (text === "'slack'" || text === '"slack"') {
            literal.replaceWithText('AlertChannel.SLACK');
            return true;
          }
        }
      }
    }
  }

  return false;
}

// Fix TS2678: Type comparison errors
function fixTypeComparisonError(sourceFile, error, SyntaxKind) {
  if (sourceFile.getBaseName() === 'geocoding.service.ts') {
    // Fix type comparison errors in geocoding service
    const binaryExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.BinaryExpression);

    for (const expr of binaryExpressions) {
      const left = expr.getLeft().getText();
      const right = expr.getRight().getText();

      if (left === 'provider' && (right === "'mapbox'" || right === "'google'")) {
        expr.replaceWithText(`${left} === ${right} as any`);
        return true;
      }
    }
  }

  return false;
}

// Fix TS2551: Property name errors
function fixPropertyNameError(sourceFile, error, SyntaxKind) {
  if (error.message.includes('getCurrentUserId') && error.message.includes('getCurrentUser')) {
    // Fix method name error
    const propertyAccesses = sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression);

    for (const propAccess of propertyAccesses) {
      if (propAccess.getName() === 'getCurrentUserId') {
        propAccess.replaceWithText(`${propAccess.getExpression().getText()}.getCurrentUser`);
        return true;
      }
    }
  }

  return false;
}

// Fix TS2353: Object literal property errors
function fixObjectLiteralError(sourceFile, error, SyntaxKind) {
  if (error.message.includes('name') && sourceFile.getBaseName() === 'http-error.interceptor.ts') {
    // Fix ErrorTelemetry property error
    const objectLiterals = sourceFile.getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression);

    for (const objLiteral of objectLiterals) {
      const properties = objLiteral.getProperties();

      for (const prop of properties) {
        if (
          prop.getKind() === SyntaxKind.PropertyAssignment &&
          prop.getName() === 'name' &&
          prop.getInitializer().getText() === "'HttpError'"
        ) {
          prop.rename('errorType');
          return true;
        }
      }
    }
  } else if (
    error.message.includes('existingNotes') &&
    sourceFile.getBaseName().includes('favorites-page.component.ts')
  ) {
    // Fix NotesDialogData property error
    const objectLiterals = sourceFile.getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression);

    for (const objLiteral of objectLiterals) {
      const properties = objLiteral.getProperties();

      for (const prop of properties) {
        if (
          prop.getKind() === SyntaxKind.PropertyAssignment &&
          prop.getName() === 'existingNotes'
        ) {
          prop.rename('notes');
          return true;
        }
      }
    }
  }

  return false;
}

// Fix TS2304: Cannot find name errors
function fixCannotFindNameError(sourceFile, error) {
  if (error.message.includes('User')) {
    // Add User import
    sourceFile.addImportDeclaration({
      moduleSpecifier: '../models/user.interface',
      namedImports: ['User'],
    });

    return true;
  } else if (error.message.includes('map')) {
    // Add map operator import
    const rxjsOperatorsImport = sourceFile
      .getImportDeclarations()
      .find(importDecl => importDecl.getModuleSpecifierValue() === 'rxjs/operators');

    if (rxjsOperatorsImport) {
      const namedImports = rxjsOperatorsImport.getNamedImports().map(ni => ni.getName());

      if (!namedImports.includes('map')) {
        namedImports.push('map');
        rxjsOperatorsImport.setNamedImports(namedImports);
        return true;
      }
    } else {
      sourceFile.addImportDeclaration({
        moduleSpecifier: 'rxjs/operators',
        namedImports: ['map'],
      });

      return true;
    }
  }

  return false;
}

// Fix TS2345: Argument type errors
function fixArgumentTypeError(sourceFile, error, SyntaxKind) {
  if (error.message.includes('unknown') && error.message.includes('string | number | boolean')) {
    // Fix type casting for unknown to string
    const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);

    for (const callExpr of callExpressions) {
      if (callExpr.getExpression().getText().includes('params.set')) {
        const args = callExpr.getArguments();

        if (args.length >= 2) {
          const secondArg = args[1];

          if (!secondArg.getText().includes('toString()')) {
            secondArg.replaceWithText(`${secondArg.getText()}.toString()`);
            return true;
          }
        }
      }
    }
  }

  return false;
}

// Run the script
main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
