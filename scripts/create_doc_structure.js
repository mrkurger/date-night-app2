#!/usr/bin/env node

/**
 * Create Documentation Structure Script
 *
 * This script creates the initial documentation structure for the decentralization project.
 * It scans the repository for code folders and creates stub documentation files.
 *
 * Usage:
 *   node create_doc_structure.js [--dry-run]
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

  // Exclude patterns for directories
  excludeDirs: ['node_modules', 'dist', 'coverage', 'test-results', '.git'],
};

/**
 * Creates a stub HTML documentation file
 * @param {string} targetDir - The directory to create the file in
 * @param {string} fileName - The name of the file to create
 * @param {string} templateName - The name of the template to use
 * @param {string} componentName - The name of the component
 */
function createStubDocFile(targetDir, fileName, templateName, componentName) {
  const filePath = path.join(targetDir, fileName);

  // Don't overwrite existing files
  if (fs.existsSync(filePath)) {
    console.log(`File already exists: ${filePath}`);
    return;
  }

  // Read the template
  const templatePath = path.join(config.rootDir, config.templatesDir, templateName);
  if (!fs.existsSync(templatePath)) {
    console.error(`Template not found: ${templatePath}`);
    return;
  }

  let content = fs.readFileSync(templatePath, 'utf8');

  // Replace template placeholders
  content = content.replace(/{{component_name}}/g, componentName);

  if (dryRun) {
    console.log(`Would create file: ${filePath}`);
  } else {
    fs.writeFileSync(filePath, content);
    console.log(`Created file: ${filePath}`);
  }
}

/**
 * Creates stub documentation files for a directory
 * @param {string} dir - The directory to create files in
 */
function createStubDocFiles(dir) {
  const dirName = path.basename(dir);
  const title = dirName.charAt(0).toUpperCase() + dirName.slice(1).replace(/-/g, ' ');

  // Create CHANGELOG.html
  createStubDocFile(dir, config.docFiles.changelog, 'CHANGELOG.html.template', title);

  // Create AILESSONS.html
  createStubDocFile(dir, config.docFiles.ailessons, 'AILESSONS.html.template', title);

  // Create GLOSSARY.html
  createStubDocFile(dir, config.docFiles.glossary, 'GLOSSARY.html.template', title);
}

/**
 * Creates the global documentation files
 */
function createGlobalDocFiles() {
  // Create _docs_index.html
  const indexPath = path.join(config.rootDir, config.globalDocs.index);

  if (!fs.existsSync(indexPath)) {
    const indexContent = `<!DOCTYPE html>
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
    </div>
    
    <div class="doc-sections">
      <!-- Documentation sections will be generated here -->
    </div>
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

    if (dryRun) {
      console.log(`Would create file: ${indexPath}`);
    } else {
      fs.writeFileSync(indexPath, indexContent);
      console.log(`Created file: ${indexPath}`);
    }
  }

  // Create _glossary.html
  const glossaryPath = path.join(config.rootDir, config.globalDocs.glossary);

  if (!fs.existsSync(glossaryPath)) {
    const glossaryContent = `<!DOCTYPE html>
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
    
    <div class="glossary-container">
      <!-- Glossary sections will be generated here -->
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

    if (dryRun) {
      console.log(`Would create file: ${glossaryPath}`);
    } else {
      fs.writeFileSync(glossaryPath, glossaryContent);
      console.log(`Created file: ${glossaryPath}`);
    }
  }
}

/**
 * Creates a redirect file in the old docs directory
 */
function createDocsRedirect() {
  const redirectPath = path.join(config.rootDir, 'docs', 'index.html');

  if (!fs.existsSync(redirectPath)) {
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

    if (dryRun) {
      console.log(`Would create file: ${redirectPath}`);
    } else {
      fs.writeFileSync(redirectPath, content);
      console.log(`Created file: ${redirectPath}`);
    }
  }
}

/**
 * Main function to execute the script
 */
async function main() {
  try {
    console.log('Starting documentation structure creation...');

    if (dryRun) {
      console.log('Dry run mode - no files will be created');
    }

    // Create global documentation files
    console.log('\nCreating global documentation files...');
    createGlobalDocFiles();
    createDocsRedirect();

    // Scan code directories and create stub documentation files
    console.log('\nScanning code directories...');

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
          console.log(`Processing directory: ${itemPath}`);
          createStubDocFiles(itemPath);
        }
      }
    }

    console.log('\nDocumentation structure creation completed successfully.');
  } catch (error) {
    console.error('Error creating documentation structure:', error);
    process.exit(1);
  }
}

// Execute the script
main();
