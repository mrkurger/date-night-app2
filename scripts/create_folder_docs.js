#!/usr/bin/env node

/**
 * Create Folder Documentation
 *
 * This script creates the standard documentation files for a code folder:
 * - index.html
 * - CHANGELOG.html
 * - AILESSONS.html
 * - GLOSSARY.html
 *
 * Usage:
 *   node create_folder_docs.js <folder-path>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  rootDir: path.resolve(__dirname, '..'),
  templatesDir: path.join(__dirname, 'templates'),
  docFiles: {
    index: 'index.html',
    changelog: 'CHANGELOG.html',
    ailessons: 'AILESSONS.html',
    glossary: 'GLOSSARY.html',
  },
};

// Command line arguments
const args = process.argv.slice(2);
const folderPath = args[0];

if (!folderPath) {
  console.log(`
Create Folder Documentation

Usage:
  node create_folder_docs.js <folder-path>
  `);
  process.exit(1);
}

/**
 * Reads the HTML template file
 * @returns {string} The template content
 */
function readTemplate() {
  const templatePath = path.join(config.templatesDir, 'doc_template.html');
  return fs.readFileSync(templatePath, 'utf8');
}

/**
 * Creates an HTML file from the template
 * @param {string} folderPath - The folder path
 * @param {string} fileName - The file name
 * @param {string} title - The document title
 * @param {string} content - The document content
 */
function createHtmlFile(folderPath, fileName, title, content) {
  const filePath = path.join(folderPath, fileName);

  // Don't overwrite existing files
  if (fs.existsSync(filePath)) {
    console.log(`File already exists: ${filePath}`);
    return;
  }

  const template = readTemplate();
  const folderName = path.basename(folderPath);

  let html = template
    .replace(/{{TITLE}}/g, title)
    .replace(/{{FOLDER_NAME}}/g, folderName)
    .replace(/{{CONTENT}}/g, content);

  fs.writeFileSync(filePath, html);
  console.log(`Created file: ${filePath}`);
}

/**
 * Creates the standard documentation files for a folder
 * @param {string} folderPath - The folder path
 */
function createFolderDocs(folderPath) {
  const absolutePath = path.resolve(config.rootDir, folderPath);

  if (!fs.existsSync(absolutePath)) {
    console.error(`Folder does not exist: ${absolutePath}`);
    process.exit(1);
  }

  const folderName = path.basename(absolutePath);
  const title = folderName.charAt(0).toUpperCase() + folderName.slice(1).replace(/-/g, ' ');

  // Create index.html
  createHtmlFile(
    absolutePath,
    config.docFiles.index,
    `${title} Documentation`,
    `<p>This is the documentation index for the ${title} module/component.</p>
    <h2>Documentation Files</h2>
    <ul>
      <li><a href="${config.docFiles.changelog}">Changelog</a> - History of changes to this module/component</li>
      <li><a href="${config.docFiles.ailessons}">AI Lessons</a> - Insights and patterns learned by AI</li>
      <li><a href="${config.docFiles.glossary}">Glossary</a> - Definitions of functions and methods</li>
    </ul>
    
    <h2>Module/Component Documentation</h2>
    <p>Add specific documentation for this module/component here.</p>`
  );

  // Create CHANGELOG.html
  createHtmlFile(
    absolutePath,
    config.docFiles.changelog,
    `${title} Changelog`,
    `<p>This file tracks changes to the ${title} module/component.</p>
    <h2>Unreleased</h2>
    <h3>Added</h3>
    <ul>
      <li>Initial documentation structure</li>
    </ul>`
  );

  // Create AILESSONS.html
  createHtmlFile(
    absolutePath,
    config.docFiles.ailessons,
    `${title} AI Lessons`,
    `<p>This file contains lessons learned and best practices for the ${title} module/component.</p>
    <h2>Best Practices</h2>
    <ul>
      <li>Add best practices specific to this module/component</li>
    </ul>
    <h2>Implementation Patterns</h2>
    <ul>
      <li>Add common implementation patterns used in this module/component</li>
    </ul>
    <h2>Testing</h2>
    <ul>
      <li>Add testing insights for this module/component</li>
    </ul>
    <h2>Dependencies</h2>
    <ul>
      <li>List dependencies used by this module/component with their purpose</li>
    </ul>`
  );

  // Create GLOSSARY.html
  createHtmlFile(
    absolutePath,
    config.docFiles.glossary,
    `${title} Glossary`,
    `<p>This file contains a glossary of functions and methods defined in the ${title} module/component.</p>
    <p>This file is automatically updated by the documentation generation script.</p>
    <div class="glossary-entries">
      <!-- Glossary entries will be generated here -->
    </div>`
  );

  console.log(`Created documentation files in ${absolutePath}`);
}

// Run the script
createFolderDocs(folderPath);
