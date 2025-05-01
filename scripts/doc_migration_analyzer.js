#!/usr/bin/env node

/**
 * Documentation Migration Analyzer
 *
 * This script analyzes the codebase to:
 * 1. Identify all code folders that need documentation
 * 2. Check which folders already have documentation files
 * 3. Create missing documentation files
 * 4. Generate a mapping of Markdown files to their corresponding HTML destinations
 * 5. Provide a prioritized list of files to migrate
 *
 * Usage:
 *   node doc_migration_analyzer.js analyze
 *   node doc_migration_analyzer.js create-missing-docs
 *   node doc_migration_analyzer.js generate-mapping
 *   node doc_migration_analyzer.js prioritize
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  rootDir: path.resolve(__dirname, '..'),
  docsDir: path.join(path.resolve(__dirname, '..'), 'docs'),
  clientDir: path.join(path.resolve(__dirname, '..'), 'client-angular/src/app'),
  serverDir: path.join(path.resolve(__dirname, '..'), 'server'),
  docFiles: ['index.html', 'CHANGELOG.html', 'AILESSONS.html', 'GLOSSARY.html'],
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
  markdownExtensions: ['.md', '.MD'],
  migrationPlanFile: 'DOCUMENTATION_MIGRATION_PLAN.html',
};

// Command line arguments
const args = process.argv.slice(2);
const command = args[0];

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
 * Checks if a folder has all required documentation files
 * @param {string} folderPath - The folder path
 * @returns {Object} - Object with missing files
 */
function checkFolderDocumentation(folderPath) {
  const result = {
    folderPath,
    folderName: path.basename(folderPath),
    missingFiles: [],
    hasAllFiles: true,
  };

  for (const docFile of config.docFiles) {
    const filePath = path.join(folderPath, docFile);
    if (!fs.existsSync(filePath)) {
      result.missingFiles.push(docFile);
      result.hasAllFiles = false;
    }
  }

  return result;
}

/**
 * Gets all Markdown files in the docs directory
 * @returns {string[]} - Array of Markdown file paths
 */
function getMarkdownFiles() {
  const markdownFiles = [];

  function scanDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      return;
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name);

      if (entry.isDirectory() && !config.excludeDirs.includes(entry.name)) {
        scanDirectory(entryPath);
      } else if (entry.isFile() && config.markdownExtensions.includes(path.extname(entry.name))) {
        markdownFiles.push(entryPath);
      }
    }
  }

  scanDirectory(config.docsDir);

  return markdownFiles;
}

/**
 * Maps Markdown files to their corresponding HTML destinations
 * @param {string[]} markdownFiles - Array of Markdown file paths
 * @param {Object} codeFolders - Object with code folder paths
 * @returns {Object[]} - Array of mapping objects
 */
function mapMarkdownToHtml(markdownFiles, codeFolders) {
  const mappings = [];

  // Helper function to find the best matching folder for a Markdown file
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

  // Process each Markdown file
  for (const mdFile of markdownFiles) {
    const relativeMdFile = path.relative(config.rootDir, mdFile);
    const mdFileName = path.basename(mdFile, path.extname(mdFile));

    // Find the best matching folder
    const match = findMatchingFolder(mdFile, codeFolders);

    if (match) {
      const { folder, type } = match;
      const htmlFileName = `${mdFileName.toLowerCase().replace(/_/g, '-')}.html`;
      const htmlFilePath = path.join(folder, htmlFileName);
      const relativeHtmlFile = path.relative(config.rootDir, htmlFilePath);

      mappings.push({
        markdownFile: relativeMdFile,
        htmlFile: relativeHtmlFile,
        folderPath: folder,
        folderName: path.basename(folder),
        type,
        priority:
          config.featureTypes[
            type === 'feature'
              ? 'features'
              : type === 'component'
                ? 'components'
                : type === 'service'
                  ? 'services'
                  : 'serverComponents'
          ].priority,
        status: fs.existsSync(htmlFilePath) ? 'Completed' : 'Pending',
      });
    } else {
      // If no match found, map to a general documentation folder
      let htmlFilePath;
      let type;

      if (relativeMdFile.includes('features/')) {
        // Feature documentation without a specific folder
        htmlFilePath = path.join(
          config.rootDir,
          'docs-html',
          'features',
          `${mdFileName.toLowerCase().replace(/_/g, '-')}.html`
        );
        type = 'generalFeature';
      } else if (relativeMdFile.includes('components/')) {
        // Component documentation without a specific folder
        htmlFilePath = path.join(
          config.rootDir,
          'docs-html',
          'components',
          `${mdFileName.toLowerCase().replace(/_/g, '-')}.html`
        );
        type = 'generalComponent';
      } else {
        // General documentation
        htmlFilePath = path.join(
          config.rootDir,
          'docs-html',
          'general',
          `${mdFileName.toLowerCase().replace(/_/g, '-')}.html`
        );
        type = 'general';
      }

      const relativeHtmlFile = path.relative(config.rootDir, htmlFilePath);

      mappings.push({
        markdownFile: relativeMdFile,
        htmlFile: relativeHtmlFile,
        folderPath: path.dirname(htmlFilePath),
        folderName: path.basename(path.dirname(htmlFilePath)),
        type,
        priority: 5, // Lower priority for general documentation
        status: fs.existsSync(htmlFilePath) ? 'Completed' : 'Pending',
      });
    }
  }

  return mappings;
}

/**
 * Prioritizes the mappings based on importance
 * @param {Object[]} mappings - Array of mapping objects
 * @returns {Object[]} - Prioritized array of mapping objects
 */
function prioritizeMappings(mappings) {
  // Sort by priority (lower number = higher priority)
  return mappings.sort((a, b) => {
    // First sort by status (Pending before Completed)
    if (a.status === 'Pending' && b.status === 'Completed') {
      return -1;
    }
    if (a.status === 'Completed' && b.status === 'Pending') {
      return 1;
    }

    // Then sort by priority
    return a.priority - b.priority;
  });
}

/**
 * Updates the migration plan file with the mappings
 * @param {Object[]} mappings - Array of mapping objects
 */
function updateMigrationPlan(mappings) {
  const migrationPlanPath = path.join(config.rootDir, config.migrationPlanFile);

  if (!fs.existsSync(migrationPlanPath)) {
    console.error(`Migration plan file not found: ${migrationPlanPath}`);
    return;
  }

  let content = fs.readFileSync(migrationPlanPath, 'utf8');

  // Find the table body
  const tableBodyRegex = /<tbody>([\s\S]*?)<\/tbody>/;
  const tableBodyMatch = content.match(tableBodyRegex);

  if (!tableBodyMatch) {
    console.error('Could not find table body in migration plan file');
    return;
  }

  // Create new table rows
  let newTableBody = '<tbody>\n';

  for (const mapping of mappings) {
    newTableBody += `            <tr>
              <td><code>${mapping.markdownFile}</code></td>
              <td><code>${mapping.htmlFile}</code></td>
              <td>${mapping.status}</td>
            </tr>\n`;
  }

  newTableBody += '          </tbody>';

  // Update the content
  content = content.replace(tableBodyRegex, newTableBody);

  // Update the progress bar
  const progressRegex = /<div class="progress" style="width: (\d+)%">(\d+)%<\/div>/;
  const progressMatch = content.match(progressRegex);

  if (progressMatch) {
    // Calculate the progress percentage
    const completedCount = mappings.filter(m => m.status === 'Completed').length;
    const totalCount = mappings.length;
    const progressPercent = Math.round((completedCount / totalCount) * 100);

    // Update the progress bar
    content = content.replace(
      progressRegex,
      `<div class="progress" style="width: ${progressPercent}%">${progressPercent}%</div>`
    );
  }

  // Write the updated content
  fs.writeFileSync(migrationPlanPath, content);

  console.log(`Updated migration plan with ${mappings.length} mappings`);
}

/**
 * Creates missing documentation files for a folder
 * @param {string} folderPath - The folder path
 * @param {string[]} missingFiles - Array of missing file names
 */
function createMissingDocs(folderPath, missingFiles) {
  // Use the create_folder_docs.js script to create missing files
  const createFolderDocsScript = path.join(__dirname, 'create_folder_docs.js');

  if (!fs.existsSync(createFolderDocsScript)) {
    console.error(`Create folder docs script not found: ${createFolderDocsScript}`);
    return;
  }

  try {
    execSync(`node ${createFolderDocsScript} ${folderPath}`, { stdio: 'inherit' });
    console.log(`Created missing documentation files for ${folderPath}`);
  } catch (error) {
    console.error(`Error creating documentation files for ${folderPath}: ${error.message}`);
  }
}

/**
 * Analyzes the codebase and prints a report
 */
function analyzeCodebase() {
  console.log('Analyzing codebase...');

  // Get all code folders
  const codeFolders = getCodeFolders();
  const allFolders = [
    ...codeFolders.features,
    ...codeFolders.components,
    ...codeFolders.services,
    ...codeFolders.serverComponents,
  ];

  console.log(`Found ${allFolders.length} code folders that should have documentation`);
  console.log(`- ${codeFolders.features.length} feature folders`);
  console.log(`- ${codeFolders.components.length} component folders`);
  console.log(`- ${codeFolders.services.length} service folders`);
  console.log(`- ${codeFolders.serverComponents.length} server component folders`);

  // Check which folders have documentation
  const folderDocs = allFolders.map(folder => checkFolderDocumentation(folder));
  const foldersWithAllDocs = folderDocs.filter(result => result.hasAllFiles);
  const foldersWithMissingDocs = folderDocs.filter(result => !result.hasAllFiles);

  console.log(`\n${foldersWithAllDocs.length} folders have all required documentation files`);
  console.log(`${foldersWithMissingDocs.length} folders are missing documentation files`);

  // Get all Markdown files
  const markdownFiles = getMarkdownFiles();
  console.log(`\nFound ${markdownFiles.length} Markdown files in the docs directory`);

  // Map Markdown files to HTML destinations
  const mappings = mapMarkdownToHtml(markdownFiles, codeFolders);
  const completedMappings = mappings.filter(mapping => mapping.status === 'Completed');
  const pendingMappings = mappings.filter(mapping => mapping.status === 'Pending');

  console.log(`\nGenerated ${mappings.length} mappings from Markdown to HTML`);
  console.log(`- ${completedMappings.length} mappings are completed`);
  console.log(`- ${pendingMappings.length} mappings are pending`);

  // Prioritize mappings
  const prioritizedMappings = prioritizeMappings(mappings);

  console.log('\nTop 10 files to migrate next:');
  for (let i = 0; i < Math.min(10, prioritizedMappings.length); i++) {
    const mapping = prioritizedMappings[i];
    if (mapping.status === 'Pending') {
      console.log(`${i + 1}. ${mapping.markdownFile} -> ${mapping.htmlFile} (${mapping.type})`);
    }
  }

  return {
    codeFolders,
    folderDocs,
    foldersWithMissingDocs,
    markdownFiles,
    mappings,
    prioritizedMappings,
  };
}

/**
 * Creates missing documentation files for all folders
 */
function createAllMissingDocs() {
  console.log('Creating missing documentation files...');

  // Get all code folders
  const codeFolders = getCodeFolders();
  const allFolders = [
    ...codeFolders.features,
    ...codeFolders.components,
    ...codeFolders.services,
    ...codeFolders.serverComponents,
  ];

  // Check which folders have documentation
  const folderDocs = allFolders.map(folder => checkFolderDocumentation(folder));
  const foldersWithMissingDocs = folderDocs.filter(result => !result.hasAllFiles);

  console.log(`Found ${foldersWithMissingDocs.length} folders with missing documentation files`);

  // Create missing documentation files
  for (const folderDoc of foldersWithMissingDocs) {
    createMissingDocs(folderDoc.folderPath, folderDoc.missingFiles);
  }

  console.log(`Created missing documentation files for ${foldersWithMissingDocs.length} folders`);
}

/**
 * Generates a mapping of Markdown files to HTML destinations
 */
function generateMapping() {
  console.log('Generating mapping of Markdown files to HTML destinations...');

  // Get all code folders
  const codeFolders = getCodeFolders();

  // Get all Markdown files
  const markdownFiles = getMarkdownFiles();

  // Map Markdown files to HTML destinations
  const mappings = mapMarkdownToHtml(markdownFiles, codeFolders);

  // Update the migration plan
  updateMigrationPlan(mappings);
}

/**
 * Prints a prioritized list of files to migrate
 */
function printPrioritizedList() {
  console.log('Generating prioritized list of files to migrate...');

  // Get all code folders
  const codeFolders = getCodeFolders();

  // Get all Markdown files
  const markdownFiles = getMarkdownFiles();

  // Map Markdown files to HTML destinations
  const mappings = mapMarkdownToHtml(markdownFiles, codeFolders);

  // Prioritize mappings
  const prioritizedMappings = prioritizeMappings(mappings);

  console.log('\nPrioritized list of files to migrate:');
  for (let i = 0; i < Math.min(20, prioritizedMappings.length); i++) {
    const mapping = prioritizedMappings[i];
    if (mapping.status === 'Pending') {
      console.log(`${i + 1}. ${mapping.markdownFile} -> ${mapping.htmlFile} (${mapping.type})`);
    }
  }
}

// Main execution
if (command === 'analyze') {
  analyzeCodebase();
} else if (command === 'create-missing-docs') {
  createAllMissingDocs();
} else if (command === 'generate-mapping') {
  generateMapping();
} else if (command === 'prioritize') {
  printPrioritizedList();
} else {
  console.log(`
Documentation Migration Analyzer

Usage:
  node doc_migration_analyzer.js analyze
  node doc_migration_analyzer.js create-missing-docs
  node doc_migration_analyzer.js generate-mapping
  node doc_migration_analyzer.js prioritize
  `);
}
