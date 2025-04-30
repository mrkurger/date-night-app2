#!/usr/bin/env node

/**
 * Create HTML Documentation Structure Script
 * 
 * This script creates the initial directory structure and template files
 * for the HTML-based documentation system.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Configuration
const config = {
  // Target directory for the new documentation structure
  targetDir: path.join(rootDir, 'docs', 'html-docs'),
  
  // Directories to create
  directories: [
    'templates',
    'components',
    'server',
    'features',
    'guides',
    'api',
    'lessons',
    'changelog'
  ]
};

/**
 * Creates the directory structure for the HTML documentation
 */
function createDirectoryStructure() {
  console.log('Creating directory structure...');
  
  // Create the target directory if it doesn't exist
  if (!fs.existsSync(config.targetDir)) {
    fs.mkdirSync(config.targetDir, { recursive: true });
  }
  
  // Create subdirectories
  for (const dir of config.directories) {
    const targetDir = path.join(config.targetDir, dir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log(`  Created directory: ${targetDir}`);
    }
  }
  
  console.log('Directory structure created.');
}

/**
 * Creates template files for the HTML documentation
 */
function createTemplateFiles() {
  console.log('Creating template files...');
  
  // Create index.html template
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}} - Date Night App Documentation</title>
  <link rel="stylesheet" href="/docs/html-docs/templates/styles.css">
</head>
<body>
  <header>
    <div class="container">
      <h1>Date Night App Documentation</h1>
      <nav>
        <ul>
          <li><a href="/docs/html-docs/index.html">Home</a></li>
          <li><a href="/docs/html-docs/components/index.html">Components</a></li>
          <li><a href="/docs/html-docs/server/index.html">Server</a></li>
          <li><a href="/docs/html-docs/features/index.html">Features</a></li>
          <li><a href="/docs/html-docs/guides/index.html">Guides</a></li>
          <li><a href="/docs/html-docs/api/index.html">API</a></li>
          <li><a href="/docs/html-docs/lessons/index.html">Lessons</a></li>
          <li><a href="/docs/html-docs/changelog/index.html">Changelog</a></li>
        </ul>
      </nav>
    </div>
  </header>
  
  <main class="container">
    <h1>{{title}}</h1>
    
    {{content}}
  </main>
  
  <footer>
    <div class="container">
      <p>&copy; 2025 Date Night App. All rights reserved.</p>
    </div>
  </footer>
  
  <script>
    // Add any JavaScript needed for the documentation site
  </script>
</body>
</html>`;

  // Create page.html template
  const pageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}} - Date Night App Documentation</title>
  <link rel="stylesheet" href="/docs/html-docs/templates/styles.css">
</head>
<body>
  <header>
    <div class="container">
      <h1>Date Night App Documentation</h1>
      <nav>
        <ul>
          <li><a href="/docs/html-docs/index.html">Home</a></li>
          <li><a href="/docs/html-docs/components/index.html">Components</a></li>
          <li><a href="/docs/html-docs/server/index.html">Server</a></li>
          <li><a href="/docs/html-docs/features/index.html">Features</a></li>
          <li><a href="/docs/html-docs/guides/index.html">Guides</a></li>
          <li><a href="/docs/html-docs/api/index.html">API</a></li>
          <li><a href="/docs/html-docs/lessons/index.html">Lessons</a></li>
          <li><a href="/docs/html-docs/changelog/index.html">Changelog</a></li>
        </ul>
      </nav>
    </div>
  </header>
  
  <main class="container">
    <div class="page-content">
      <aside class="sidebar">
        <h3>{{sectionTitle}}</h3>
        <ul>
          {{sidebarLinks}}
        </ul>
      </aside>
      
      <article class="content">
        <h1>{{title}}</h1>
        
        {{content}}
      </article>
    </div>
  </main>
  
  <footer>
    <div class="container">
      <p>&copy; 2025 Date Night App. All rights reserved.</p>
    </div>
  </footer>
  
  <script>
    // Add any JavaScript needed for the documentation site
  </script>
</body>
</html>`;

  // Create styles.css template
  const stylesCss = `/* Base styles */
:root {
  --primary-color: #3b82f6;
  --primary-dark: #2563eb;
  --primary-light: #60a5fa;
  --secondary-color: #f59e0b;
  --text-color: #1f2937;
  --text-light: #6b7280;
  --background-color: #ffffff;
  --background-alt: #f3f4f6;
  --border-color: #e5e7eb;
  --success-color: #10b981;
  --error-color: #ef4444;
  --warning-color: #f59e0b;
  --info-color: #3b82f6;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --primary-color: #3b82f6;
    --primary-dark: #1d4ed8;
    --primary-light: #93c5fd;
    --secondary-color: #f59e0b;
    --text-color: #f3f4f6;
    --text-light: #9ca3af;
    --background-color: #1f2937;
    --background-alt: #111827;
    --border-color: #374151;
    --success-color: #10b981;
    --error-color: #ef4444;
    --warning-color: #f59e0b;
    --info-color: #3b82f6;
  }
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  line-height: 1.6;
  color: var(--text-color);
  background-color: var(--background-color);
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Header */
header {
  background-color: var(--primary-color);
  color: white;
  padding: 1rem 0;
}

header h1 {
  margin: 0;
  font-size: 1.5rem;
}

header nav ul {
  display: flex;
  list-style: none;
  margin-top: 0.5rem;
}

header nav ul li {
  margin-right: 1rem;
}

header nav ul li a {
  color: white;
  text-decoration: none;
}

header nav ul li a:hover {
  text-decoration: underline;
}

/* Main content */
main {
  padding: 2rem 0;
}

.page-content {
  display: flex;
  gap: 2rem;
}

.sidebar {
  width: 250px;
  flex-shrink: 0;
}

.sidebar h3 {
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.sidebar ul {
  list-style: none;
}

.sidebar ul li {
  margin-bottom: 0.5rem;
}

.sidebar ul li a {
  color: var(--primary-color);
  text-decoration: none;
}

.sidebar ul li a:hover {
  text-decoration: underline;
}

.content {
  flex-grow: 1;
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  margin-bottom: 1rem;
  line-height: 1.2;
}

h1 {
  font-size: 2.5rem;
}

h2 {
  font-size: 2rem;
  margin-top: 2rem;
}

h3 {
  font-size: 1.5rem;
  margin-top: 1.5rem;
}

p {
  margin-bottom: 1rem;
}

a {
  color: var(--primary-color);
}

/* Code blocks */
pre {
  background-color: var(--background-alt);
  padding: 1rem;
  border-radius: 0.25rem;
  overflow-x: auto;
  margin-bottom: 1rem;
}

code {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 0.9rem;
}

/* Tables */
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

th, td {
  padding: 0.5rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

th {
  background-color: var(--background-alt);
}

/* Footer */
footer {
  background-color: var(--background-alt);
  padding: 1rem 0;
  margin-top: 2rem;
  color: var(--text-light);
}

/* Responsive */
@media (max-width: 768px) {
  .page-content {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    margin-bottom: 2rem;
  }
}`;

  // Write template files
  fs.writeFileSync(path.join(config.targetDir, 'templates', 'index.html'), indexHtml);
  fs.writeFileSync(path.join(config.targetDir, 'templates', 'page.html'), pageHtml);
  fs.writeFileSync(path.join(config.targetDir, 'templates', 'styles.css'), stylesCss);
  
  console.log('Template files created:');
  console.log(`  ${path.join(config.targetDir, 'templates', 'index.html')}`);
  console.log(`  ${path.join(config.targetDir, 'templates', 'page.html')}`);
  console.log(`  ${path.join(config.targetDir, 'templates', 'styles.css')}`);
}

/**
 * Creates the main index file for the documentation
 */
function createMainIndex() {
  console.log('Creating main index file...');
  
  const indexContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Date Night App Documentation</title>
  <link rel="stylesheet" href="/docs/html-docs/templates/styles.css">
</head>
<body>
  <header>
    <div class="container">
      <h1>Date Night App Documentation</h1>
      <nav>
        <ul>
          <li><a href="/docs/html-docs/index.html">Home</a></li>
          <li><a href="/docs/html-docs/components/index.html">Components</a></li>
          <li><a href="/docs/html-docs/server/index.html">Server</a></li>
          <li><a href="/docs/html-docs/features/index.html">Features</a></li>
          <li><a href="/docs/html-docs/guides/index.html">Guides</a></li>
          <li><a href="/docs/html-docs/api/index.html">API</a></li>
          <li><a href="/docs/html-docs/lessons/index.html">Lessons</a></li>
          <li><a href="/docs/html-docs/changelog/index.html">Changelog</a></li>
        </ul>
      </nav>
    </div>
  </header>
  
  <main class="container">
    <h1>Date Night App Documentation</h1>
    
    <p>Welcome to the Date Night App documentation. This site provides comprehensive documentation for all aspects of the Date Night App project.</p>
    
    <h2>Documentation Sections</h2>
    
    <div class="doc-sections">
      <div class="doc-section">
        <h3><a href="/docs/html-docs/components/index.html">Components</a></h3>
        <p>Documentation for UI components used in the application.</p>
      </div>
      
      <div class="doc-section">
        <h3><a href="/docs/html-docs/server/index.html">Server</a></h3>
        <p>Documentation for server-side code and APIs.</p>
      </div>
      
      <div class="doc-section">
        <h3><a href="/docs/html-docs/features/index.html">Features</a></h3>
        <p>Documentation for application features and functionality.</p>
      </div>
      
      <div class="doc-section">
        <h3><a href="/docs/html-docs/guides/index.html">Guides</a></h3>
        <p>Development and usage guides for the application.</p>
      </div>
      
      <div class="doc-section">
        <h3><a href="/docs/html-docs/api/index.html">API</a></h3>
        <p>API documentation and reference.</p>
      </div>
      
      <div class="doc-section">
        <h3><a href="/docs/html-docs/lessons/index.html">Lessons</a></h3>
        <p>Lessons learned during development.</p>
      </div>
      
      <div class="doc-section">
        <h3><a href="/docs/html-docs/changelog/index.html">Changelog</a></h3>
        <p>History of changes to the project.</p>
      </div>
    </div>
    
    <h2>Getting Started</h2>
    
    <p>If you're new to the project, we recommend starting with the following guides:</p>
    
    <ul>
      <li><a href="/docs/html-docs/guides/setup.html">Setup Guide</a> - How to set up the development environment</li>
      <li><a href="/docs/html-docs/guides/architecture.html">Architecture Overview</a> - Overview of the system architecture</li>
      <li><a href="/docs/html-docs/guides/contributing.html">Contributing Guide</a> - How to contribute to the project</li>
    </ul>
    
    <h2>Recent Updates</h2>
    
    <ul>
      <li><strong>2025-04-25</strong>: SCSS Build Fixes</li>
      <li><strong>2025-04-24</strong>: TypeScript Type Safety Improvements</li>
      <li><strong>2025-04-20</strong>: Added End-to-End Encryption for Chat</li>
      <li><strong>2025-04-15</strong>: Implemented User Preferences System</li>
    </ul>
  </main>
  
  <footer>
    <div class="container">
      <p>&copy; 2025 Date Night App. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>`;

  fs.writeFileSync(path.join(config.targetDir, 'index.html'), indexContent);
  
  console.log(`Main index file created: ${path.join(config.targetDir, 'index.html')}`);
}

/**
 * Creates section index files
 */
function createSectionIndexFiles() {
  console.log('Creating section index files...');
  
  // Create index files for each section
  for (const dir of config.directories) {
    if (dir === 'templates') continue; // Skip templates directory
    
    const indexContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${dir.charAt(0).toUpperCase() + dir.slice(1)} - Date Night App Documentation</title>
  <link rel="stylesheet" href="/docs/html-docs/templates/styles.css">
</head>
<body>
  <header>
    <div class="container">
      <h1>Date Night App Documentation</h1>
      <nav>
        <ul>
          <li><a href="/docs/html-docs/index.html">Home</a></li>
          <li><a href="/docs/html-docs/components/index.html">Components</a></li>
          <li><a href="/docs/html-docs/server/index.html">Server</a></li>
          <li><a href="/docs/html-docs/features/index.html">Features</a></li>
          <li><a href="/docs/html-docs/guides/index.html">Guides</a></li>
          <li><a href="/docs/html-docs/api/index.html">API</a></li>
          <li><a href="/docs/html-docs/lessons/index.html">Lessons</a></li>
          <li><a href="/docs/html-docs/changelog/index.html">Changelog</a></li>
        </ul>
      </nav>
    </div>
  </header>
  
  <main class="container">
    <h1>${dir.charAt(0).toUpperCase() + dir.slice(1)} Documentation</h1>
    
    <p>This section contains documentation for ${dir} in the Date Night App.</p>
    
    <div class="doc-list">
      <!-- Content will be added as documentation is migrated -->
      <p>Documentation is being migrated to this new format. Check back soon for more content.</p>
    </div>
  </main>
  
  <footer>
    <div class="container">
      <p>&copy; 2025 Date Night App. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>`;

    fs.writeFileSync(path.join(config.targetDir, dir, 'index.html'), indexContent);
    
    console.log(`  Created section index file: ${path.join(config.targetDir, dir, 'index.html')}`);
  }
}

/**
 * Main function to execute the script
 */
async function main() {
  try {
    console.log('Starting HTML documentation structure creation...');
    
    // Create directory structure
    createDirectoryStructure();
    
    // Create template files
    createTemplateFiles();
    
    // Create main index file
    createMainIndex();
    
    // Create section index files
    createSectionIndexFiles();
    
    console.log('HTML documentation structure created successfully.');
  } catch (error) {
    console.error('Error creating HTML documentation structure:', error);
    process.exit(1);
  }
}

// Execute the script
main();
</script>