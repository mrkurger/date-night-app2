#!/usr/bin/env node

/**
 * Documentation Generation Script
 *
 * This script implements the documentation decentralization project by:
 * 1. Scanning the repository for code folders
 * 2. Creating/updating HTML documentation files in each folder
 * 3. Extracting function/method signatures and documentation
 * 4. Generating glossary entries
 * 5. Building documentation indexes
 * 6. Converting Markdown documentation to HTML
 * 7. Adding tooltips and links to function references
 *
 * Usage:
 *   node generate_docs.js [--scan-only] [--update-only] [--verbose] [--migrate-docs]
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  // Root directory of the repository
  rootDir: path.resolve(__dirname, '..'),

  // Directories to scan for code
  codeDirs: [
    // Angular features
    'client-angular/src/app/features',
    // Shared components
    'client-angular/src/app/shared/components',
    // Core services
    'client-angular/src/app/core/services',
    // Server modules
    'server/components',
    'server/controllers',
    'server/models',
    'server/services',
    'server/middleware',
    'server/routes',
  ],

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

  // File extensions to parse for function/method extraction
  codeExtensions: ['.js', '.ts', '.jsx', '.tsx'],

  // Exclude patterns for directories
  excludeDirs: ['node_modules', 'dist', 'coverage', 'test-results', '.git'],
};

// Command line arguments
const args = process.argv.slice(2);
const scanOnly = args.includes('--scan-only');
const updateOnly = args.includes('--update-only');
const verbose = args.includes('--verbose');
const migrateDocs = args.includes('--migrate-docs');

/**
 * Logs a message if verbose mode is enabled
 * @param {string} message - The message to log
 */
function logVerbose(message) {
  if (verbose) {
    console.log(message);
  }
}

/**
 * Scans a directory recursively for code files
 * @param {string} dir - The directory to scan
 * @param {string[]} extensions - The file extensions to include
 * @returns {string[]} - Array of file paths
 */
function scanDirectory(dir, extensions) {
  let results = [];

  try {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);

      // Skip excluded directories
      if (stat.isDirectory() && !config.excludeDirs.includes(item)) {
        results = results.concat(scanDirectory(itemPath, extensions));
      } else if (stat.isFile() && extensions.includes(path.extname(itemPath))) {
        results.push(itemPath);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
  }

  return results;
}

/**
 * Extracts function and method signatures from a code file
 * @param {string} filePath - Path to the code file
 * @returns {Object[]} - Array of function/method objects
 */
function extractFunctions(filePath) {
  const functions = [];
  const content = fs.readFileSync(filePath, 'utf8');
  const extension = path.extname(filePath);

  // Extract JSDoc/TSDoc comments and function signatures
  const docCommentRegex =
    /\/\*\*\s*([\s\S]*?)\s*\*\/\s*(?:export\s+)?(?:async\s+)?(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>))/g;

  // Extract class methods
  const methodRegex =
    /\/\*\*\s*([\s\S]*?)\s*\*\/\s*(?:public|private|protected)?\s*(?:async\s+)?(\w+)\s*\([^)]*\)/g;

  let match;

  // Extract standalone functions and function expressions
  while ((match = docCommentRegex.exec(content)) !== null) {
    const docComment = match[1];
    const functionName = match[2] || match[3];

    if (functionName) {
      functions.push({
        name: functionName,
        documentation: parseDocComment(docComment),
        filePath: path.relative(config.rootDir, filePath),
        type: 'function',
      });
    }
  }

  // Extract class methods
  while ((match = methodRegex.exec(content)) !== null) {
    const docComment = match[1];
    const methodName = match[2];

    if (methodName) {
      functions.push({
        name: methodName,
        documentation: parseDocComment(docComment),
        filePath: path.relative(config.rootDir, filePath),
        type: 'method',
      });
    }
  }

  return functions;
}

/**
 * Parses a JSDoc/TSDoc comment
 * @param {string} comment - The doc comment
 * @returns {Object} - Parsed documentation object
 */
function parseDocComment(comment) {
  const lines = comment.split('\n');
  const result = {
    description: '',
    params: [],
    returns: null,
    example: null,
  };

  let currentSection = 'description';

  for (const line of lines) {
    const trimmedLine = line.trim().replace(/^\*\s*/, '');

    if (trimmedLine.startsWith('@param')) {
      const paramMatch = trimmedLine.match(
        /@param\s+(?:{([^}]+)})?\s*(?:\[([^\]]+)\]|(\S+))\s*(.*)/
      );
      if (paramMatch) {
        result.params.push({
          type: paramMatch[1] || '',
          name: paramMatch[2] || paramMatch[3] || '',
          description: paramMatch[4] || '',
        });
      }
      currentSection = 'param';
    } else if (trimmedLine.startsWith('@returns') || trimmedLine.startsWith('@return')) {
      const returnMatch = trimmedLine.match(/@returns?\s+(?:{([^}]+)})?\s*(.*)/);
      if (returnMatch) {
        result.returns = {
          type: returnMatch[1] || '',
          description: returnMatch[2] || '',
        };
      }
      currentSection = 'returns';
    } else if (trimmedLine.startsWith('@example')) {
      result.example = '';
      currentSection = 'example';
    } else if (currentSection === 'description') {
      if (result.description && trimmedLine) {
        result.description += ' ' + trimmedLine;
      } else if (trimmedLine) {
        result.description = trimmedLine;
      }
    } else if (currentSection === 'example') {
      if (result.example && trimmedLine) {
        result.example += '\n' + trimmedLine;
      } else if (trimmedLine) {
        result.example = trimmedLine;
      }
    }
  }

  return result;
}

/**
 * Creates a stub HTML documentation file
 * @param {string} targetDir - The directory to create the file in
 * @param {string} fileName - The name of the file to create
 * @param {string} title - The title for the document
 * @param {string} content - The content for the document
 */
function createStubDocFile(targetDir, fileName, title, content) {
  const filePath = path.join(targetDir, fileName);

  // Don't overwrite existing files
  if (fs.existsSync(filePath)) {
    logVerbose(`File already exists: ${filePath}`);
    return;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="/docs/component-library/styles/style.css">
</head>
<body>
  <header>
    <div class="container">
      <h1>Date Night App Documentation</h1>
      <nav>
        <ul>
          <li><a href="/_docs_index.html">Home</a></li>
          <li><a href="/_glossary.html">Glossary</a></li>
        </ul>
      </nav>
    </div>
  </header>
  
  <main class="container">
    <h1>${title}</h1>
    
    ${content}
  </main>
  
  <footer>
    <div class="container">
      <p>&copy; 2025 Date Night App. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>`;

  fs.writeFileSync(filePath, html);
  console.log(`Created file: ${filePath}`);
}

/**
 * Creates stub documentation files for a directory
 * @param {string} dir - The directory to create files in
 */
function createStubDocFiles(dir) {
  const dirName = path.basename(dir);
  const title = dirName.charAt(0).toUpperCase() + dirName.slice(1).replace(/-/g, ' ');

  // Create CHANGELOG.html
  createStubDocFile(
    dir,
    config.docFiles.changelog,
    `Changelog: ${title}`,
    `<p>This file tracks changes to the ${title} component/module.</p>
<h2>Unreleased</h2>
<h3>Added</h3>
<ul>
  <li>Initial documentation structure</li>
</ul>`
  );

  // Create AILESSONS.html
  createStubDocFile(
    dir,
    config.docFiles.ailessons,
    `AI Lessons: ${title}`,
    `<p>This file contains lessons learned and best practices for the ${title} component/module.</p>
<h2>Best Practices</h2>
<ul>
  <li>Add best practices specific to this component/module</li>
</ul>
<h2>Implementation Patterns</h2>
<ul>
  <li>Add common implementation patterns used in this component/module</li>
</ul>`
  );

  // Create GLOSSARY.html
  createStubDocFile(
    dir,
    config.docFiles.glossary,
    `Glossary: ${title}`,
    `<p>This file contains a glossary of functions and methods defined in the ${title} component/module.</p>
<p>This file is automatically generated. Do not edit it directly.</p>
<div class="glossary-entries">
  <!-- Glossary entries will be generated here -->
</div>`
  );
}

/**
 * Generates a glossary entry for a function/method
 * @param {Object} func - The function/method object
 * @returns {string} - HTML for the glossary entry
 */
function generateGlossaryEntry(func) {
  const { name, documentation, filePath, type } = func;
  const { description, params, returns, example } = documentation;

  let paramsHtml = '';
  if (params.length > 0) {
    paramsHtml = `
<h4>Parameters</h4>
<table class="params-table">
  <thead>
    <tr>
      <th>Name</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    ${params
      .map(
        param => `
    <tr>
      <td>${param.name}</td>
      <td><code>${param.type}</code></td>
      <td>${param.description}</td>
    </tr>
    `
      )
      .join('')}
  </tbody>
</table>`;
  }

  let returnsHtml = '';
  if (returns) {
    returnsHtml = `
<h4>Returns</h4>
<p><code>${returns.type}</code> - ${returns.description}</p>`;
  }

  let exampleHtml = '';
  if (example) {
    exampleHtml = `
<h4>Example</h4>
<pre><code>${example}</code></pre>`;
  }

  return `
<div class="glossary-entry" id="${name}">
  <h3>${name}</h3>
  <p class="entry-meta">${type} | <a href="/${filePath}">Source</a></p>
  <div class="entry-description">
    <p>${description}</p>
  </div>
  ${paramsHtml}
  ${returnsHtml}
  ${exampleHtml}
</div>`;
}

/**
 * Updates the glossary file for a directory
 * @param {string} dir - The directory to update
 * @param {Object[]} functions - Array of function/method objects
 */
function updateGlossaryFile(dir, functions) {
  const glossaryPath = path.join(dir, config.docFiles.glossary);

  if (!fs.existsSync(glossaryPath)) {
    console.log(`Glossary file not found: ${glossaryPath}`);
    return;
  }

  let content = fs.readFileSync(glossaryPath, 'utf8');

  // Generate glossary entries
  const entriesHtml = functions.map(generateGlossaryEntry).join('\n');

  // Replace the glossary entries placeholder
  content = content.replace(
    /<div class="glossary-entries">[\s\S]*?<\/div>/,
    `<div class="glossary-entries">\n${entriesHtml}\n</div>`
  );

  fs.writeFileSync(glossaryPath, content);
  console.log(`Updated glossary file: ${glossaryPath}`);
}

/**
 * Creates or updates the global glossary file
 * @param {Object} allFunctions - Object mapping directories to functions
 */
function updateGlobalGlossary(allFunctions) {
  const globalGlossaryPath = path.join(config.rootDir, config.globalDocs.glossary);

  let content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Global Glossary - Date Night App</title>
  <link rel="stylesheet" href="/docs/component-library/styles/style.css">
  <style>
    .glossary-section {
      margin-bottom: 2rem;
    }
    .glossary-entry {
      margin-bottom: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }
    .entry-meta {
      color: var(--text-light);
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }
    .params-table {
      width: 100%;
      margin-bottom: 1rem;
    }
    .tooltip {
      position: relative;
      display: inline-block;
      border-bottom: 1px dotted var(--text-color);
    }
    .tooltip .tooltip-text {
      visibility: hidden;
      width: 300px;
      background-color: var(--background-alt);
      color: var(--text-color);
      text-align: left;
      border-radius: 6px;
      padding: 10px;
      position: absolute;
      z-index: 1;
      bottom: 125%;
      left: 50%;
      margin-left: -150px;
      opacity: 0;
      transition: opacity 0.3s;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      font-size: 0.9rem;
    }
    .tooltip:hover .tooltip-text {
      visibility: visible;
      opacity: 1;
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <h1>Date Night App Documentation</h1>
      <nav>
        <ul>
          <li><a href="/_docs_index.html">Home</a></li>
          <li><a href="/_glossary.html">Glossary</a></li>
        </ul>
      </nav>
    </div>
  </header>
  
  <main class="container">
    <h1>Global Glossary</h1>
    
    <p>This glossary contains all functions and methods defined in the Date Night App codebase.</p>
    
    <div class="search-container">
      <input type="text" id="glossary-search" placeholder="Search glossary...">
    </div>
    
    <div class="glossary-container">`;

  // Add sections for each directory
  for (const dir in allFunctions) {
    const functions = allFunctions[dir];
    if (functions.length === 0) continue;

    const relativePath = path.relative(config.rootDir, dir);
    const dirName = path.basename(dir);
    const title = dirName.charAt(0).toUpperCase() + dirName.slice(1).replace(/-/g, ' ');

    content += `
      <div class="glossary-section" id="section-${dirName}">
        <h2>${title}</h2>
        <p><a href="/${relativePath}/${config.docFiles.glossary}">View local glossary</a></p>`;

    // Add entries for each function
    for (const func of functions) {
      const { name, documentation, filePath, type } = func;
      const { description } = documentation;

      content += `
        <div class="glossary-entry" id="${name}">
          <h3>${name}</h3>
          <p class="entry-meta">${type} | <a href="/${filePath}">Source</a> | <a href="/${relativePath}/${config.docFiles.glossary}#${name}">Details</a></p>
          <div class="entry-description">
            <p>${description}</p>
          </div>
        </div>`;
    }

    content += `
      </div>`;
  }

  content += `
    </div>
  </main>
  
  <footer>
    <div class="container">
      <p>&copy; 2025 Date Night App. All rights reserved.</p>
    </div>
  </footer>
  
  <script>
    // Search functionality
    document.getElementById('glossary-search').addEventListener('input', function(e) {
      const searchTerm = e.target.value.toLowerCase();
      const entries = document.querySelectorAll('.glossary-entry');
      
      entries.forEach(entry => {
        const name = entry.querySelector('h3').textContent.toLowerCase();
        const description = entry.querySelector('.entry-description').textContent.toLowerCase();
        
        if (name.includes(searchTerm) || description.includes(searchTerm)) {
          entry.style.display = '';
        } else {
          entry.style.display = 'none';
        }
      });
    });
  </script>
</body>
</html>`;

  fs.writeFileSync(globalGlossaryPath, content);
  console.log(`Updated global glossary file: ${globalGlossaryPath}`);
}

/**
 * Creates or updates the global documentation index
 * @param {string[]} directories - Array of directories with documentation
 */
function updateGlobalIndex(directories) {
  const globalIndexPath = path.join(config.rootDir, config.globalDocs.index);

  // Group directories by type
  const groups = {
    features: [],
    components: [],
    services: [],
    server: [],
  };

  for (const dir of directories) {
    const relativePath = path.relative(config.rootDir, dir);

    if (relativePath.includes('features')) {
      groups.features.push(dir);
    } else if (relativePath.includes('components')) {
      groups.components.push(dir);
    } else if (relativePath.includes('services')) {
      groups.services.push(dir);
    } else if (relativePath.includes('server')) {
      groups.server.push(dir);
    }
  }

  let content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Documentation Index - Date Night App</title>
  <link rel="stylesheet" href="/docs/component-library/styles/style.css">
  <style>
    .doc-section {
      margin-bottom: 2rem;
    }
    .doc-group {
      margin-bottom: 1rem;
    }
    .doc-links {
      display: flex;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <h1>Date Night App Documentation</h1>
      <nav>
        <ul>
          <li><a href="/_docs_index.html">Home</a></li>
          <li><a href="/_glossary.html">Glossary</a></li>
        </ul>
      </nav>
    </div>
  </header>
  
  <main class="container">
    <h1>Documentation Index</h1>
    
    <p>This index provides links to all documentation in the Date Night App codebase.</p>
    
    <div class="search-container">
      <input type="text" id="docs-search" placeholder="Search documentation...">
    </div>`;

  // Add sections for each group
  if (groups.features.length > 0) {
    content += `
    <div class="doc-section" id="section-features">
      <h2>Features</h2>`;

    for (const dir of groups.features) {
      const relativePath = path.relative(config.rootDir, dir);
      const dirName = path.basename(dir);
      const title = dirName.charAt(0).toUpperCase() + dirName.slice(1).replace(/-/g, ' ');

      content += `
      <div class="doc-group">
        <h3>${title}</h3>
        <div class="doc-links">
          <a href="/${relativePath}/${config.docFiles.changelog}">Changelog</a>
          <a href="/${relativePath}/${config.docFiles.ailessons}">AI Lessons</a>
          <a href="/${relativePath}/${config.docFiles.glossary}">Glossary</a>
        </div>
      </div>`;
    }

    content += `
    </div>`;
  }

  if (groups.components.length > 0) {
    content += `
    <div class="doc-section" id="section-components">
      <h2>Components</h2>`;

    for (const dir of groups.components) {
      const relativePath = path.relative(config.rootDir, dir);
      const dirName = path.basename(dir);
      const title = dirName.charAt(0).toUpperCase() + dirName.slice(1).replace(/-/g, ' ');

      content += `
      <div class="doc-group">
        <h3>${title}</h3>
        <div class="doc-links">
          <a href="/${relativePath}/${config.docFiles.changelog}">Changelog</a>
          <a href="/${relativePath}/${config.docFiles.ailessons}">AI Lessons</a>
          <a href="/${relativePath}/${config.docFiles.glossary}">Glossary</a>
        </div>
      </div>`;
    }

    content += `
    </div>`;
  }

  if (groups.services.length > 0) {
    content += `
    <div class="doc-section" id="section-services">
      <h2>Services</h2>`;

    for (const dir of groups.services) {
      const relativePath = path.relative(config.rootDir, dir);
      const dirName = path.basename(dir);
      const title = dirName.charAt(0).toUpperCase() + dirName.slice(1).replace(/-/g, ' ');

      content += `
      <div class="doc-group">
        <h3>${title}</h3>
        <div class="doc-links">
          <a href="/${relativePath}/${config.docFiles.changelog}">Changelog</a>
          <a href="/${relativePath}/${config.docFiles.ailessons}">AI Lessons</a>
          <a href="/${relativePath}/${config.docFiles.glossary}">Glossary</a>
        </div>
      </div>`;
    }

    content += `
    </div>`;
  }

  if (groups.server.length > 0) {
    content += `
    <div class="doc-section" id="section-server">
      <h2>Server</h2>`;

    for (const dir of groups.server) {
      const relativePath = path.relative(config.rootDir, dir);
      const dirName = path.basename(dir);
      const title = dirName.charAt(0).toUpperCase() + dirName.slice(1).replace(/-/g, ' ');

      content += `
      <div class="doc-group">
        <h3>${title}</h3>
        <div class="doc-links">
          <a href="/${relativePath}/${config.docFiles.changelog}">Changelog</a>
          <a href="/${relativePath}/${config.docFiles.ailessons}">AI Lessons</a>
          <a href="/${relativePath}/${config.docFiles.glossary}">Glossary</a>
        </div>
      </div>`;
    }

    content += `
    </div>`;
  }

  content += `
  </main>
  
  <footer>
    <div class="container">
      <p>&copy; 2025 Date Night App. All rights reserved.</p>
    </div>
  </footer>
  
  <script>
    // Search functionality
    document.getElementById('docs-search').addEventListener('input', function(e) {
      const searchTerm = e.target.value.toLowerCase();
      const groups = document.querySelectorAll('.doc-group');
      
      groups.forEach(group => {
        const title = group.querySelector('h3').textContent.toLowerCase();
        
        if (title.includes(searchTerm)) {
          group.style.display = '';
        } else {
          group.style.display = 'none';
        }
      });
    });
  </script>
</body>
</html>`;

  fs.writeFileSync(globalIndexPath, content);
  console.log(`Updated global index file: ${globalIndexPath}`);
}

/**
 * Creates a redirect file in the old docs directory
 */
function createDocsRedirect() {
  const redirectPath = path.join(config.rootDir, 'docs', 'index.html');

  const content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=/_docs_index.html">
  <title>Redirecting...</title>
</head>
<body>
  <p>Redirecting to <a href="/_docs_index.html">new documentation</a>...</p>
</body>
</html>`;

  fs.writeFileSync(redirectPath, content);
  console.log(`Created redirect file: ${redirectPath}`);
}

/**
 * Main function to execute the script
 */
async function main() {
  try {
    console.log('Starting documentation generation...');

    // Step 1: Scan code directories
    console.log('\nScanning code directories...');
    const allFunctions = {};
    const directories = [];

    for (const codeDir of config.codeDirs) {
      const fullPath = path.join(config.rootDir, codeDir);

      if (!fs.existsSync(fullPath)) {
        console.log(`Directory not found: ${fullPath}`);
        continue;
      }

      // Get subdirectories
      const items = fs.readdirSync(fullPath);
      for (const item of items) {
        const itemPath = path.join(fullPath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory() && !config.excludeDirs.includes(item)) {
          directories.push(itemPath);

          // Scan for code files
          const codeFiles = scanDirectory(itemPath, config.codeExtensions);
          logVerbose(`Found ${codeFiles.length} code files in ${itemPath}`);

          // Extract functions and methods
          const functions = [];
          for (const file of codeFiles) {
            const extracted = extractFunctions(file);
            functions.push(...extracted);
          }

          allFunctions[itemPath] = functions;
          logVerbose(`Extracted ${functions.length} functions/methods from ${itemPath}`);

          // Create stub documentation files if they don't exist
          if (!scanOnly && !updateOnly) {
            createStubDocFiles(itemPath);
          }

          // Update glossary file
          if (!scanOnly) {
            updateGlossaryFile(itemPath, functions);
          }
        }
      }
    }

    // Step 2: Update global documentation files
    if (!scanOnly) {
      console.log('\nUpdating global documentation files...');
      updateGlobalGlossary(allFunctions);
      updateGlobalIndex(directories);
      createDocsRedirect();
    }

    console.log('\nDocumentation generation completed successfully.');

    // Migrate Markdown documentation to HTML if requested
    if (migrateDocs) {
      console.log('\nMigrating Markdown documentation to HTML...');

      try {
        // Run the doc_migration_analyzer.js script to analyze the codebase
        console.log('Analyzing codebase...');
        execSync('node scripts/doc_migration_analyzer.js analyze', { stdio: 'inherit' });

        // Create missing documentation files
        console.log('\nCreating missing documentation files...');
        execSync('node scripts/doc_migration_analyzer.js create-missing-docs', {
          stdio: 'inherit',
        });

        // Generate mapping of Markdown files to HTML destinations
        console.log('\nGenerating mapping of Markdown files to HTML destinations...');
        execSync('node scripts/doc_migration_analyzer.js generate-mapping', { stdio: 'inherit' });

        // Get prioritized list of files to migrate
        console.log('\nGetting prioritized list of files to migrate...');
        const prioritizedOutput = execSync(
          'node scripts/doc_migration_analyzer.js prioritize'
        ).toString();

        // Extract the top 5 files to migrate
        const filesToMigrate = [];
        const lines = prioritizedOutput.split('\n');
        for (const line of lines) {
          const match = line.match(/\d+\.\s+([^\s]+)\s+->\s+([^\s]+)/);
          if (match) {
            filesToMigrate.push({
              markdownFile: match[1],
              htmlFile: match[2],
            });

            if (filesToMigrate.length >= 5) {
              break;
            }
          }
        }

        // Migrate the top 5 files
        console.log('\nMigrating the top 5 files...');
        for (const file of filesToMigrate) {
          console.log(`\nMigrating ${file.markdownFile} to ${file.htmlFile}...`);
          try {
            execSync(
              `node scripts/doc_migration_executor.js ${file.markdownFile} ${file.htmlFile}`,
              { stdio: 'inherit' }
            );
          } catch (error) {
            console.error(`Error migrating ${file.markdownFile} to ${file.htmlFile}:`, error);
          }
        }

        console.log('\nMarkdown migration completed successfully.');
      } catch (error) {
        console.error('Error migrating Markdown documentation:', error);
      }
    }
  } catch (error) {
    console.error('Error generating documentation:', error);
    process.exit(1);
  }
}

// Execute the script
main();
