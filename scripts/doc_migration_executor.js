#!/usr/bin/env node

/**
 * Documentation Migration Executor
 *
 * This script executes the migration of a Markdown file to HTML:
 * 1. Converts Markdown to HTML with proper formatting
 * 2. Adds tooltips and links to function references
 * 3. Updates the migration checklist
 * 4. Updates the folder's index.html, CHANGELOG.html, and AILESSONS.html
 *
 * Usage:
 *   node doc_migration_executor.js <markdown-file> <output-html-file>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import { execSync } from 'child_process';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  rootDir: path.resolve(__dirname, '..'),
  templatesDir: path.join(__dirname, 'templates'),
  migrationPlanFile: 'DOCUMENTATION_MIGRATION_PLAN.html',
  docFiles: {
    index: 'index.html',
    changelog: 'CHANGELOG.html',
    ailessons: 'AILESSONS.html',
    glossary: 'GLOSSARY.html',
  },
};

// Command line arguments
const args = process.argv.slice(2);
const markdownFile = args[0];
const outputHtmlFile = args[1];

if (!markdownFile || !outputHtmlFile) {
  console.log(`
Documentation Migration Executor

Usage:
  node doc_migration_executor.js <markdown-file> <output-html-file>
  `);
  process.exit(1);
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Reads the HTML template file
 * @returns {string} The template content
 */
function readTemplate() {
  const templatePath = path.join(config.templatesDir, 'doc_template.html');
  if (!fs.existsSync(templatePath)) {
    console.error(`Template file not found: ${templatePath}`);
    process.exit(1);
  }
  return fs.readFileSync(templatePath, 'utf8');
}

/**
 * Converts Markdown content to HTML
 * @param {string} markdown - The Markdown content
 * @returns {string} The HTML content
 */
function convertMarkdownToHtml(markdown) {
  // Configure marked options
  marked.setOptions({
    gfm: true,
    breaks: true,
    smartLists: true,
    smartypants: true,
    highlight: function (code, lang) {
      // You could add syntax highlighting here if desired
      return code;
    },
  });

  return marked.parse(markdown);
}

/**
 * Extracts function names from a code folder
 * @param {string} folderPath - The folder path
 * @returns {Object} - Object mapping function names to their descriptions
 */
function extractFunctionNames(folderPath) {
  const functions = {};

  // Get all JavaScript and TypeScript files in the folder
  const files = [];
  function scanDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      return;
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        scanDirectory(entryPath);
      } else if (
        entry.isFile() &&
        ['.js', '.ts', '.jsx', '.tsx'].includes(path.extname(entry.name))
      ) {
        files.push(entryPath);
      }
    }
  }

  scanDirectory(folderPath);

  // Extract function names and descriptions from files
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');

    // Match function declarations
    const functionRegex =
      /(?:function|const|let|var)\s+([a-zA-Z0-9_]+)\s*(?:=\s*(?:function|\([^)]*\)\s*=>)|[({])/g;
    let match;

    while ((match = functionRegex.exec(content)) !== null) {
      const functionName = match[1];

      // Look for JSDoc comment above the function
      const lines = content.substring(0, match.index).split('\n');
      let description = '';

      // Check for JSDoc comment
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();

        if (line.startsWith('/**') || line.startsWith('/*')) {
          // Found the start of a comment, collect the description
          for (let j = i + 1; j < lines.length; j++) {
            const commentLine = lines[j].trim();
            if (commentLine.startsWith('*/')) {
              break;
            }

            // Remove comment markers and param/return tags
            let cleanLine = commentLine.replace(/^\s*\*\s*/, '');
            if (!cleanLine.startsWith('@')) {
              description += cleanLine + ' ';
            }
          }
          break;
        } else if (line !== '') {
          // Found non-empty line that's not a comment, stop looking
          break;
        }
      }

      // If no description found, use a generic one
      if (!description) {
        description = `Function defined in ${path.basename(file)}`;
      }

      functions[functionName] = {
        description: description.trim(),
        file: path.relative(folderPath, file),
      };
    }

    // Match class methods
    const methodRegex =
      /class\s+[a-zA-Z0-9_]+\s*{[\s\S]*?(?:async\s+)?([a-zA-Z0-9_]+)\s*\([^)]*\)\s*{/g;

    while ((match = methodRegex.exec(content)) !== null) {
      const methodName = match[1];

      // Skip constructor
      if (methodName === 'constructor') {
        continue;
      }

      // Look for JSDoc comment above the method
      const methodStart = match.index;
      const beforeMethod = content.substring(0, methodStart);
      const lines = beforeMethod.split('\n');
      let description = '';

      // Check for JSDoc comment
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();

        if (line.startsWith('/**') || line.startsWith('/*')) {
          // Found the start of a comment, collect the description
          for (let j = i + 1; j < lines.length; j++) {
            const commentLine = lines[j].trim();
            if (commentLine.startsWith('*/')) {
              break;
            }

            // Remove comment markers and param/return tags
            let cleanLine = commentLine.replace(/^\s*\*\s*/, '');
            if (!cleanLine.startsWith('@')) {
              description += cleanLine + ' ';
            }
          }
          break;
        } else if (line !== '' && !line.match(/^\s*\/\//)) {
          // Found non-empty line that's not a comment, stop looking
          break;
        }
      }

      // If no description found, use a generic one
      if (!description) {
        description = `Method defined in ${path.basename(file)}`;
      }

      functions[methodName] = {
        description: description.trim(),
        file: path.relative(folderPath, file),
      };
    }
  }

  return functions;
}

/**
 * Adds tooltips and links to function references in HTML content
 * @param {string} html - The HTML content
 * @param {Object} functions - Object mapping function names to their descriptions
 * @returns {string} - HTML with tooltips and links added
 */
function addTooltipsAndLinks(html, functions) {
  // Find function references in the HTML
  // This regex looks for words that might be function names (camelCase or snake_case)
  const functionRegex =
    /\b([a-z][a-zA-Z0-9]*(?:[A-Z][a-zA-Z0-9]*)*|[a-z][a-z0-9]*(?:_[a-z][a-z0-9]*)*)\b/g;

  // Skip words inside code blocks, links, and existing tooltips
  const skipRegex = /<(code|pre|a|span class="tooltip")[\s\S]*?<\/\1>/g;

  // Split HTML into parts to skip and parts to process
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = skipRegex.exec(html)) !== null) {
    // Add the part before the match
    if (match.index > lastIndex) {
      parts.push({
        text: html.substring(lastIndex, match.index),
        process: true,
      });
    }

    // Add the match (to be skipped)
    parts.push({
      text: match[0],
      process: false,
    });

    lastIndex = match.index + match[0].length;
  }

  // Add the remaining part
  if (lastIndex < html.length) {
    parts.push({
      text: html.substring(lastIndex),
      process: true,
    });
  }

  // Process each part
  const processedParts = parts.map(part => {
    if (!part.process) {
      return part.text;
    }

    // Add tooltips and links to function references
    return part.text.replace(functionRegex, match => {
      if (functions[match]) {
        const description = functions[match].description;
        const shortDesc =
          description.length > 100 ? description.substring(0, 100) + '...' : description;

        return `<span class="tooltip function-link" onclick="window.location.href='${config.docFiles.glossary}#${match}'">
          ${match}
          <span class="tooltip-text">${shortDesc}</span>
        </span>`;
      }

      return match;
    });
  });

  return processedParts.join('');
}

/**
 * Updates the glossary file with function entries
 * @param {string} folderPath - The folder path
 * @param {Object} functions - Object mapping function names to their descriptions
 */
function updateGlossary(folderPath, functions) {
  const glossaryPath = path.join(folderPath, config.docFiles.glossary);

  if (!fs.existsSync(glossaryPath)) {
    console.log(`Glossary file not found: ${glossaryPath}`);
    return;
  }

  let content = fs.readFileSync(glossaryPath, 'utf8');

  // Find the glossary entries section
  const entriesRegex = /<div class="glossary-entries">([\s\S]*?)<\/div>/;
  const entriesMatch = content.match(entriesRegex);

  if (!entriesMatch) {
    console.log('Could not find glossary entries section');
    return;
  }

  // Create new entries
  let newEntries = '<div class="glossary-entries">\n';

  for (const [name, info] of Object.entries(functions)) {
    newEntries += `      <div class="glossary-entry" id="${name}">
        <h3>${name}</h3>
        <div class="entry-description">
          <p>${info.description}</p>
        </div>
        <div class="entry-source">
          <p>Defined in: <code>${info.file}</code></p>
        </div>
      </div>\n`;
  }

  newEntries += '    </div>';

  // Update the content
  content = content.replace(entriesRegex, newEntries);

  // Write the updated content
  fs.writeFileSync(glossaryPath, content);

  console.log(`Updated glossary with ${Object.keys(functions).length} function entries`);
}

/**
 * Updates the index.html file to link to the new documentation
 * @param {string} folderPath - The folder path
 * @param {string} htmlFile - The HTML file path
 * @param {string} title - The document title
 */
function updateIndex(folderPath, htmlFile, title) {
  const indexPath = path.join(folderPath, config.docFiles.index);

  if (!fs.existsSync(indexPath)) {
    console.log(`Index file not found: ${indexPath}`);
    return;
  }

  let content = fs.readFileSync(indexPath, 'utf8');

  // Find the module/component documentation section
  const sectionRegex = /<h2>Module\/Component Documentation<\/h2>([\s\S]*?)(?:<h2>|<\/main>)/;
  const sectionMatch = content.match(sectionRegex);

  if (!sectionMatch) {
    console.log('Could not find module/component documentation section');
    return;
  }

  const htmlFileName = path.basename(htmlFile);
  const htmlFileTitle = title || path.basename(htmlFile, '.html').replace(/-/g, ' ');

  // Check if the link already exists
  const linkRegex = new RegExp(`<a href="${htmlFileName}">`);
  if (linkRegex.test(content)) {
    console.log(`Link to ${htmlFileName} already exists in index.html`);
    return;
  }

  // Create new section content
  let newSection = '<h2>Module/Component Documentation</h2>\n    <ul>\n';

  // Add existing links
  const linkMatches = sectionMatch[1].match(/<li><a href="[^"]+">.*?<\/a>.*?<\/li>/g) || [];
  for (const linkMatch of linkMatches) {
    newSection += `      ${linkMatch}\n`;
  }

  // Add new link
  newSection += `      <li><a href="${htmlFileName}">${htmlFileTitle}</a> - Migrated from Markdown</li>\n`;
  newSection += '    </ul>';

  // Update the content
  content = content.replace(sectionRegex, newSection);

  // Write the updated content
  fs.writeFileSync(indexPath, content);

  console.log(`Updated index.html with link to ${htmlFileName}`);
}

/**
 * Updates the CHANGELOG.html file to document the migration
 * @param {string} folderPath - The folder path
 * @param {string} markdownFile - The Markdown file path
 * @param {string} htmlFile - The HTML file path
 */
function updateChangelog(folderPath, markdownFile, htmlFile) {
  const changelogPath = path.join(folderPath, config.docFiles.changelog);

  if (!fs.existsSync(changelogPath)) {
    console.log(`Changelog file not found: ${changelogPath}`);
    return;
  }

  let content = fs.readFileSync(changelogPath, 'utf8');

  // Find the unreleased section
  const unreleasedRegex = /<h2>Unreleased<\/h2>([\s\S]*?)(?:<h2>|<\/article>)/;
  const unreleasedMatch = content.match(unreleasedRegex);

  if (!unreleasedMatch) {
    console.log('Could not find unreleased section in changelog');
    return;
  }

  // Find the added section
  const addedRegex = /<h3>Added<\/h3>([\s\S]*?)(?:<h3>|<\/article>)/;
  const addedMatch = unreleasedMatch[1].match(addedRegex);

  if (!addedMatch) {
    console.log('Could not find added section in changelog');
    return;
  }

  const markdownFileName = path.basename(markdownFile);
  const htmlFileName = path.basename(htmlFile);

  // Check if the migration is already documented
  const migrationRegex = new RegExp(`Migrated ${markdownFileName}`);
  if (migrationRegex.test(content)) {
    console.log(`Migration of ${markdownFileName} already documented in changelog`);
    return;
  }

  // Create new added section
  let newAdded = '<h3>Added</h3>\n        <ul>\n';

  // Add existing items
  const itemMatches = addedMatch[1].match(/<li>.*?<\/li>/g) || [];
  for (const itemMatch of itemMatches) {
    newAdded += `          ${itemMatch}\n`;
  }

  // Add new item
  newAdded += `          <li>Migrated ${markdownFileName} to ${htmlFileName}</li>\n`;
  newAdded += '        </ul>';

  // Update the content
  content = content.replace(addedRegex, newAdded);

  // Write the updated content
  fs.writeFileSync(changelogPath, content);

  console.log(`Updated changelog with migration of ${markdownFileName}`);
}

/**
 * Updates the AILESSONS.html file to document the migration process
 * @param {string} folderPath - The folder path
 * @param {string} markdownFile - The Markdown file path
 * @param {string} htmlFile - The HTML file path
 */
function updateAiLessons(folderPath, markdownFile, htmlFile) {
  const aiLessonsPath = path.join(folderPath, config.docFiles.ailessons);

  if (!fs.existsSync(aiLessonsPath)) {
    console.log(`AI Lessons file not found: ${aiLessonsPath}`);
    return;
  }

  let content = fs.readFileSync(aiLessonsPath, 'utf8');

  // Check if the documentation migration section exists
  const sectionRegex = /<h2>Documentation Migration<\/h2>/;
  const sectionExists = sectionRegex.test(content);

  const markdownFileName = path.basename(markdownFile);
  const htmlFileName = path.basename(htmlFile);

  if (sectionExists) {
    // Find the documentation migration section
    const sectionContentRegex = /<h2>Documentation Migration<\/h2>([\s\S]*?)(?:<h2>|<\/article>)/;
    const sectionMatch = content.match(sectionContentRegex);

    if (!sectionMatch) {
      console.log('Could not find documentation migration section content');
      return;
    }

    // Check if the migration is already documented
    const migrationRegex = new RegExp(`${markdownFileName}`);
    if (migrationRegex.test(content)) {
      console.log(`Migration of ${markdownFileName} already documented in AI Lessons`);
      return;
    }

    // Create new section content
    let newSection = '<h2>Documentation Migration</h2>\n        <ul>\n';

    // Add existing items
    const itemMatches = sectionMatch[1].match(/<li>.*?<\/li>/g) || [];
    for (const itemMatch of itemMatches) {
      newSection += `          ${itemMatch}\n`;
    }

    // Add new item
    newSection += `          <li>Migrated ${markdownFileName} to ${htmlFileName}</li>\n`;
    newSection += '        </ul>';

    // Update the content
    content = content.replace(sectionContentRegex, newSection);
  } else {
    // Add new section before the "How to use this file" section
    const howToUseRegex = /<h2>How to use this file<\/h2>/;
    const howToUseMatch = content.match(howToUseRegex);

    if (!howToUseMatch) {
      console.log('Could not find "How to use this file" section');
      return;
    }

    // Create new section
    const newSection = `<h2>Documentation Migration</h2>
        <ul>
          <li>Migrated ${markdownFileName} to ${htmlFileName}</li>
        </ul>
        
        `;

    // Update the content
    content = content.replace(howToUseRegex, newSection + '<h2>How to use this file</h2>');
  }

  // Write the updated content
  fs.writeFileSync(aiLessonsPath, content);

  console.log(`Updated AI Lessons with migration of ${markdownFileName}`);
}

/**
 * Updates the migration checklist with the new mapping
 * @param {string} markdownFile - The Markdown file path
 * @param {string} htmlFile - The HTML file path
 * @param {string} status - The migration status
 */
function updateMigrationChecklist(markdownFile, htmlFile, status) {
  const updateScript = path.join(__dirname, 'update_migration_checklist.js');

  if (!fs.existsSync(updateScript)) {
    console.error(`Update migration checklist script not found: ${updateScript}`);
    return;
  }

  try {
    execSync(`node ${updateScript} ${markdownFile} ${htmlFile} ${status}`, { stdio: 'inherit' });
    console.log(
      `Updated migration checklist with mapping: ${markdownFile} -> ${htmlFile} (${status})`
    );
  } catch (error) {
    console.error(`Error updating migration checklist: ${error.message}`);
  }
}

/**
 * Main function to execute the migration
 */
async function executeMigration() {
  console.log(`Migrating ${markdownFile} to ${outputHtmlFile}...`);

  // Resolve file paths
  const absoluteMarkdownPath = path.resolve(config.rootDir, markdownFile);
  const absoluteOutputPath = path.resolve(config.rootDir, outputHtmlFile);
  const outputDir = path.dirname(absoluteOutputPath);

  // Check if files exist
  if (!fs.existsSync(absoluteMarkdownPath)) {
    console.error(`Markdown file not found: ${absoluteMarkdownPath}`);
    process.exit(1);
  }

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Created directory: ${outputDir}`);
  }

  // Check if output file already exists
  if (fs.existsSync(absoluteOutputPath)) {
    const answer = await new Promise(resolve => {
      rl.question(`Output file already exists: ${absoluteOutputPath}. Overwrite? (y/n) `, resolve);
    });

    if (answer.toLowerCase() !== 'y') {
      console.log('Migration aborted');
      rl.close();
      process.exit(0);
    }
  }

  // Read the Markdown file
  const markdown = fs.readFileSync(absoluteMarkdownPath, 'utf8');

  // Convert to HTML
  let html = convertMarkdownToHtml(markdown);

  // Extract function names from the output directory
  const functions = extractFunctionNames(outputDir);
  console.log(`Extracted ${Object.keys(functions).length} function names from ${outputDir}`);

  // Add tooltips and links
  html = addTooltipsAndLinks(html, functions);

  // Get the title from the Markdown content
  let title = '';
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    title = titleMatch[1];
  } else {
    title = path
      .basename(absoluteMarkdownPath, path.extname(absoluteMarkdownPath))
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  // Get the folder name for navigation
  const folderName = path.basename(outputDir);

  // Read the template
  const template = readTemplate();

  // Replace placeholders in the template
  const fullHtml = template
    .replace(/{{TITLE}}/g, title)
    .replace(/{{FOLDER_NAME}}/g, folderName)
    .replace(/{{CONTENT}}/g, html);

  // Write the HTML file
  fs.writeFileSync(absoluteOutputPath, fullHtml);
  console.log(`Converted ${absoluteMarkdownPath} to ${absoluteOutputPath}`);

  // Update the glossary
  updateGlossary(outputDir, functions);

  // Update the index.html
  updateIndex(outputDir, absoluteOutputPath, title);

  // Update the CHANGELOG.html
  updateChangelog(outputDir, markdownFile, outputHtmlFile);

  // Update the AILESSONS.html
  updateAiLessons(outputDir, markdownFile, outputHtmlFile);

  // Update the migration checklist
  const relativeMarkdownPath = path.relative(config.rootDir, absoluteMarkdownPath);
  const relativeOutputPath = path.relative(config.rootDir, absoluteOutputPath);
  updateMigrationChecklist(relativeMarkdownPath, relativeOutputPath, 'Completed');

  console.log(`Migration of ${markdownFile} to ${outputHtmlFile} completed successfully`);
  rl.close();
}

// Run the migration
executeMigration();
