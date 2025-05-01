#!/usr/bin/env node

/**
 * Migrate Markdown to HTML Script
 *
 * This script migrates existing Markdown documentation to HTML.
 * It uses the audit report to map documentation files to code folders.
 *
 * Usage:
 *   node migrate_markdown_to_html.js [--audit-file <audit_file>] [--dry-run]
 *
 * Example:
 *   node migrate_markdown_to_html.js --audit-file /docs/DOCUMENTATION_AUDIT.md
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
let auditFile = null;

// Check for audit file
const auditIndex = args.indexOf('--audit-file');
if (auditIndex !== -1 && args.length > auditIndex + 1) {
  auditFile = path.resolve(args[auditIndex + 1]);
}

// Configuration
const config = {
  // Root directory of the repository
  rootDir: path.resolve(__dirname, '..'),

  // Documentation file names
  docFiles: {
    changelog: 'CHANGELOG.html',
    ailessons: 'AILESSONS.html',
    glossary: 'GLOSSARY.html',
  },

  // Global documentation files
  globalDocs: {
    index: '_docs_index.html',
    glossary: '_glossary.html',
  },

  // Templates directory
  templatesDir: 'scripts/templates',

  // Default audit file
  defaultAuditFile: 'docs/DOCUMENTATION_AUDIT.md',
};

/**
 * Parses the audit report to get documentation-to-code mappings
 * @param {string} auditFile - Path to the audit report file
 * @returns {Object[]} - Array of documentation-to-code mappings
 */
function parseAuditReport(auditFile) {
  if (!fs.existsSync(auditFile)) {
    console.error(`Audit file not found: ${auditFile}`);
    process.exit(1);
  }

  const content = fs.readFileSync(auditFile, 'utf8');
  const mappings = [];

  // Extract mappings from the table
  const tableRegex = /\| (.*?) \| (.*?) \| (.*?) \|/g;
  let match;

  // Skip the header and separator rows
  let skipCount = 2;

  while ((match = tableRegex.exec(content)) !== null) {
    if (skipCount > 0) {
      skipCount--;
      continue;
    }

    const docFile = match[1].trim();
    const codeFolder = match[2].trim();
    const status = match[3].trim();

    if (docFile !== 'Documentation File' && codeFolder !== 'Code Folder') {
      mappings.push({
        docFile: path.join(config.rootDir, docFile),
        codeFolder: codeFolder === 'N/A' ? null : path.join(config.rootDir, codeFolder),
        status,
      });
    }
  }

  return mappings;
}

/**
 * Determines the target HTML file for a Markdown file
 * @param {string} markdownFile - Path to the Markdown file
 * @param {string} codeFolder - Path to the code folder
 * @returns {Object} - Target file information
 */
function determineTargetFile(markdownFile, codeFolder) {
  const fileName = path.basename(markdownFile, path.extname(markdownFile));
  const fileNameLower = fileName.toLowerCase();

  // Determine the target file type
  let targetType = null;

  if (fileNameLower.includes('changelog') || fileNameLower === 'changelog') {
    targetType = 'changelog';
  } else if (fileNameLower.includes('ailessons') || fileNameLower === 'ailessons') {
    targetType = 'ailessons';
  } else {
    // Default to AILESSONS.html for other files
    targetType = 'ailessons';
  }

  // Determine the target file path
  let targetPath = null;

  if (codeFolder) {
    targetPath = path.join(codeFolder, config.docFiles[targetType]);
  } else {
    // For global documentation, create a special file in the docs directory
    const targetDir = path.join(config.rootDir, 'docs', 'html');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    targetPath = path.join(targetDir, `${fileName}.html`);
  }

  return {
    type: targetType,
    path: targetPath,
  };
}

/**
 * Converts a Markdown file to HTML
 * @param {string} markdownFile - Path to the Markdown file
 * @param {string} htmlFile - Path to the HTML file
 * @param {string} componentName - The component name
 */
function convertMarkdownToHtml(markdownFile, htmlFile, componentName) {
  const command = `node ${path.join(config.rootDir, 'scripts', 'markdown_to_html.js')} "${markdownFile}" "${htmlFile}" "${componentName}"`;

  if (dryRun) {
    console.log(`Would execute: ${command}`);
  } else {
    try {
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      console.error(`Error converting ${markdownFile} to HTML:`, error);
    }
  }
}

/**
 * Updates the global documentation index
 */
function updateGlobalIndex() {
  const command = `node ${path.join(config.rootDir, 'scripts', 'generate_docs.js')} --update-only`;

  if (dryRun) {
    console.log(`Would execute: ${command}`);
  } else {
    try {
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      console.error('Error updating global documentation index:', error);
    }
  }
}

/**
 * Main function to execute the script
 */
async function main() {
  try {
    console.log('Starting Markdown to HTML migration...');

    if (dryRun) {
      console.log('Dry run mode - no files will be created or modified');
    }

    // Use the specified audit file or the default
    const auditFilePath = auditFile || path.join(config.rootDir, config.defaultAuditFile);

    // If the audit file doesn't exist, run the audit script
    if (!fs.existsSync(auditFilePath)) {
      console.log(`Audit file not found: ${auditFilePath}`);
      console.log('Running audit script...');

      const auditCommand = `node ${path.join(config.rootDir, 'scripts', 'audit_documentation.js')} --output "${auditFilePath}"`;

      if (dryRun) {
        console.log(`Would execute: ${auditCommand}`);
      } else {
        try {
          execSync(auditCommand, { stdio: 'inherit' });
        } catch (error) {
          console.error('Error running audit script:', error);
          process.exit(1);
        }
      }
    }

    // Parse the audit report
    const mappings = parseAuditReport(auditFilePath);
    console.log(`Found ${mappings.length} documentation files in audit report`);

    // Process each mapping
    for (const mapping of mappings) {
      const { docFile, codeFolder } = mapping;

      // Skip files that don't exist
      if (!fs.existsSync(docFile)) {
        console.log(`File not found: ${docFile}`);
        continue;
      }

      // Determine the target file
      const target = determineTargetFile(docFile, codeFolder);

      // Get the component name
      let componentName = 'Global';
      if (codeFolder) {
        const folderName = path.basename(codeFolder);
        componentName = folderName.charAt(0).toUpperCase() + folderName.slice(1).replace(/-/g, ' ');
      }

      console.log(`Converting ${docFile} to ${target.path}`);
      convertMarkdownToHtml(docFile, target.path, componentName);
    }

    // Update the global documentation index
    console.log('\nUpdating global documentation index...');
    updateGlobalIndex();

    console.log('\nMarkdown to HTML migration completed successfully.');
  } catch (error) {
    console.error('Error migrating Markdown to HTML:', error);
    process.exit(1);
  }
}

// Execute the script
main();
