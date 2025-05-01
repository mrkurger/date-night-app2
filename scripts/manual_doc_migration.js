#!/usr/bin/env node

/**
 * Manual Documentation Migration Helper
 *
 * This script assists with the manual migration of Markdown documentation to HTML.
 * It provides utilities for:
 * 1. Converting Markdown to HTML
 * 2. Creating folder-level documentation files
 * 3. Generating tooltips and links for functions/methods
 * 4. Updating the central documentation index
 *
 * Usage:
 *   node manual_doc_migration.js --create-folder-docs <folder-path>
 *   node manual_doc_migration.js --convert-md-to-html <markdown-file> <output-html-file>
 *   node manual_doc_migration.js --update-index
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  // Root directory of the repository
  rootDir: path.resolve(__dirname, '..'),

  // Documentation file names
  docFiles: {
    index: 'index.html',
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
  templatesDir: path.join(__dirname, 'templates'),

  // File extensions to parse for function/method extraction
  codeExtensions: ['.js', '.ts', '.jsx', '.tsx'],

  // Exclude patterns for directories
  excludeDirs: ['node_modules', 'dist', 'coverage', 'test-results', '.git'],
};

// Command line arguments
const args = process.argv.slice(2);
const command = args[0];

/**
 * Reads the HTML template file
 * @returns {string} The template content
 */
function readTemplate() {
  const templatePath = path.join(config.templatesDir, 'doc_template.html');
  return fs.readFileSync(templatePath, 'utf8');
}

/**
 * Converts Markdown content to HTML
 * @param {string} markdown - The Markdown content
 * @returns {string} The HTML content
 */
function convertMarkdownToHtml(markdown) {
  return marked.parse(markdown);
}

/**
 * Creates folder-level documentation files
 * @param {string} folderPath - The folder path
 */
function createFolderDocs(folderPath) {
  const absolutePath = path.resolve(config.rootDir, folderPath);

  if (!fs.existsSync(absolutePath)) {
    console.error(`Folder does not exist: ${absolutePath}`);
    return;
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
    </ul>`
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
 * Converts a Markdown file to HTML
 * @param {string} markdownPath - The Markdown file path
 * @param {string} htmlPath - The output HTML file path
 */
function convertMdFileToHtml(markdownPath, htmlPath) {
  const absoluteMarkdownPath = path.resolve(config.rootDir, markdownPath);
  const absoluteHtmlPath = path.resolve(config.rootDir, htmlPath);

  if (!fs.existsSync(absoluteMarkdownPath)) {
    console.error(`Markdown file does not exist: ${absoluteMarkdownPath}`);
    return;
  }

  const markdown = fs.readFileSync(absoluteMarkdownPath, 'utf8');
  const html = convertMarkdownToHtml(markdown);

  const title = path
    .basename(absoluteMarkdownPath, '.md')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

  const folderName = path.basename(path.dirname(absoluteHtmlPath));

  const template = readTemplate();
  const fullHtml = template
    .replace(/{{TITLE}}/g, title)
    .replace(/{{FOLDER_NAME}}/g, folderName)
    .replace(/{{CONTENT}}/g, html);

  // Create directory if it doesn't exist
  const htmlDir = path.dirname(absoluteHtmlPath);
  if (!fs.existsSync(htmlDir)) {
    fs.mkdirSync(htmlDir, { recursive: true });
  }

  fs.writeFileSync(absoluteHtmlPath, fullHtml);
  console.log(`Converted ${absoluteMarkdownPath} to ${absoluteHtmlPath}`);
}

/**
 * Updates the central documentation index
 */
function updateIndex() {
  // This function would scan the repository for documentation files
  // and update the central index (_docs_index.html)
  console.log('Updating central documentation index...');
  // Implementation would go here
}

// Main execution
if (command === '--create-folder-docs' && args[1]) {
  createFolderDocs(args[1]);
} else if (command === '--convert-md-to-html' && args[1] && args[2]) {
  convertMdFileToHtml(args[1], args[2]);
} else if (command === '--update-index') {
  updateIndex();
} else {
  console.log(`
Manual Documentation Migration Helper

Usage:
  node manual_doc_migration.js --create-folder-docs <folder-path>
  node manual_doc_migration.js --convert-md-to-html <markdown-file> <output-html-file>
  node manual_doc_migration.js --update-index
  `);
}
