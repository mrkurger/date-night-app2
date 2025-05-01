#!/usr/bin/env node

/**
 * Markdown Migration Script
 *
 * This script helps with the migration of a specific Markdown file to HTML.
 * It analyzes the codebase, finds the best destination for the Markdown file,
 * and executes the migration.
 *
 * Usage:
 *   node migrate_markdown.js <markdown-file>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  rootDir: path.resolve(__dirname, '..'),
  clientDir: path.join(path.resolve(__dirname, '..'), 'client-angular/src/app'),
  serverDir: path.join(path.resolve(__dirname, '..'), 'server'),
  excludeDirs: [
    'node_modules',
    'dist',
    'coverage',
    'test-results',
    '.git',
    'e2e',
    'assets',
    'environments',
  ],
  featureTypes: {
    features: {
      dir: 'features',
      priority: 1,
    },
    components: {
      dir: 'shared/components',
      priority: 2,
    },
    services: {
      dir: 'core/services',
      priority: 3,
    },
    serverComponents: {
      dir: 'components',
      basePath: 'server',
      priority: 4,
    },
  },
};

// Command line arguments
const args = process.argv.slice(2);
const markdownFile = args[0];

if (!markdownFile) {
  console.log(`
Markdown Migration Script

Usage:
  node migrate_markdown.js <markdown-file>
  `);
  process.exit(1);
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Gets all directories in a given path
 * @param {string} dirPath - The directory path
 * @param {string[]} excludeDirs - Directories to exclude
 * @returns {string[]} - Array of directory paths
 */
function getDirectories(dirPath, excludeDirs = []) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && !excludeDirs.includes(dirent.name))
    .map(dirent => path.join(dirPath, dirent.name));
}

/**
 * Gets all code folders that should have documentation
 * @returns {Object} - Object with folder paths grouped by type
 */
function getCodeFolders() {
  const folders = {
    features: [],
    components: [],
    services: [],
    serverComponents: [],
  };

  // Get feature folders
  const featuresDir = path.join(config.clientDir, config.featureTypes.features.dir);
  folders.features = getDirectories(featuresDir, config.excludeDirs);

  // Get component folders
  const componentsDir = path.join(config.clientDir, config.featureTypes.components.dir);
  folders.components = getDirectories(componentsDir, config.excludeDirs);

  // Get service folders
  const servicesDir = path.join(config.clientDir, config.featureTypes.services.dir);
  folders.services = getDirectories(servicesDir, config.excludeDirs);

  // Get server component folders
  const serverComponentsDir = path.join(config.serverDir, config.featureTypes.serverComponents.dir);
  folders.serverComponents = getDirectories(serverComponentsDir, config.excludeDirs);

  return folders;
}

/**
 * Finds the best matching folder for a Markdown file
 * @param {string} mdFile - The Markdown file path
 * @param {Object} folders - Object with code folder paths
 * @returns {Object} - The best matching folder and type
 */
function findMatchingFolder(mdFile, folders) {
  const mdFileName = path.basename(mdFile, path.extname(mdFile)).toLowerCase();
  const mdFileDir = path.dirname(mdFile);

  // Check if the file is in a feature-specific directory
  if (mdFileDir.includes('features')) {
    // Try to find a matching feature folder
    for (const folder of folders.features) {
      const folderName = path.basename(folder).toLowerCase();
      if (
        mdFileName === folderName ||
        mdFileName.replace(/-/g, '') === folderName.replace(/-/g, '')
      ) {
        return {
          folder,
          type: 'feature',
        };
      }
    }
  }

  // Check if the file is about a component
  if (mdFileDir.includes('components') || mdFileName.includes('component')) {
    // Try to find a matching component folder
    for (const folder of folders.components) {
      const folderName = path.basename(folder).toLowerCase();
      if (
        mdFileName === folderName ||
        mdFileName.replace(/-/g, '') === folderName.replace(/-/g, '')
      ) {
        return {
          folder,
          type: 'component',
        };
      }
    }
  }

  // Check if the file is about a service
  if (mdFileName.includes('service')) {
    // Try to find a matching service folder
    for (const folder of folders.services) {
      const folderName = path.basename(folder).toLowerCase();
      if (
        mdFileName === folderName ||
        mdFileName.replace(/-/g, '') === folderName.replace(/-/g, '')
      ) {
        return {
          folder,
          type: 'service',
        };
      }
    }
  }

  // Check if the file is about a server component
  if (
    mdFileName.includes('api') ||
    mdFileName.includes('server') ||
    mdFileName.includes('database')
  ) {
    // Try to find a matching server component folder
    for (const folder of folders.serverComponents) {
      const folderName = path.basename(folder).toLowerCase();
      if (
        mdFileName === folderName ||
        mdFileName.replace(/-/g, '') === folderName.replace(/-/g, '')
      ) {
        return {
          folder,
          type: 'serverComponent',
        };
      }
    }
  }

  // If no match found, return null
  return null;
}

/**
 * Gets the title from a Markdown file
 * @param {string} filePath - The Markdown file path
 * @returns {string} - The title
 */
function getTitleFromMarkdown(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const titleMatch = content.match(/^#\s+(.+)$/m);

    if (titleMatch) {
      return titleMatch[1];
    }

    return path
      .basename(filePath, path.extname(filePath))
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  } catch (error) {
    console.error(`Error reading file ${filePath}: ${error.message}`);
    return path
      .basename(filePath, path.extname(filePath))
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }
}

/**
 * Main function to migrate a Markdown file
 */
async function migrateMarkdownFile() {
  console.log(`Migrating Markdown file: ${markdownFile}`);

  // Resolve the Markdown file path
  const absoluteMarkdownPath = path.resolve(config.rootDir, markdownFile);

  // Check if the file exists
  if (!fs.existsSync(absoluteMarkdownPath)) {
    console.error(`Markdown file not found: ${absoluteMarkdownPath}`);
    process.exit(1);
  }

  // Get the title from the Markdown file
  const title = getTitleFromMarkdown(absoluteMarkdownPath);
  console.log(`Title: ${title}`);

  // Get all code folders
  const codeFolders = getCodeFolders();

  // Find the best matching folder
  const match = findMatchingFolder(absoluteMarkdownPath, codeFolders);

  if (match) {
    const { folder, type } = match;
    console.log(`Found matching folder: ${folder} (${type})`);

    // Generate the HTML file path
    const mdFileName = path.basename(absoluteMarkdownPath, path.extname(absoluteMarkdownPath));
    const htmlFileName = `${mdFileName.toLowerCase().replace(/_/g, '-')}.html`;
    const htmlFilePath = path.join(folder, htmlFileName);
    const relativeHtmlFile = path.relative(config.rootDir, htmlFilePath);

    console.log(`HTML file path: ${relativeHtmlFile}`);

    // Ask for confirmation
    const answer = await new Promise(resolve => {
      rl.question(`Do you want to migrate ${markdownFile} to ${relativeHtmlFile}? (y/n) `, resolve);
    });

    if (answer.toLowerCase() === 'y') {
      // Execute the migration
      try {
        console.log(`Executing migration...`);
        execSync(
          `node ${path.join(__dirname, 'doc_migration_executor.js')} ${markdownFile} ${relativeHtmlFile}`,
          { stdio: 'inherit' }
        );
        console.log(`Migration completed successfully.`);
      } catch (error) {
        console.error(`Error executing migration: ${error.message}`);
      }
    } else {
      console.log('Migration aborted.');
    }
  } else {
    console.log('No matching folder found.');

    // Ask for a custom destination
    const answer = await new Promise(resolve => {
      rl.question('Do you want to specify a custom destination? (y/n) ', resolve);
    });

    if (answer.toLowerCase() === 'y') {
      const customDestination = await new Promise(resolve => {
        rl.question(
          'Enter the destination HTML file path (relative to the repository root): ',
          resolve
        );
      });

      // Execute the migration
      try {
        console.log(`Executing migration...`);
        execSync(
          `node ${path.join(__dirname, 'doc_migration_executor.js')} ${markdownFile} ${customDestination}`,
          { stdio: 'inherit' }
        );
        console.log(`Migration completed successfully.`);
      } catch (error) {
        console.error(`Error executing migration: ${error.message}`);
      }
    } else {
      console.log('Migration aborted.');
    }
  }

  rl.close();
}

// Run the script
migrateMarkdownFile();
