#!/usr/bin/env node

/**
 * Documentation Restructuring Script
 * 
 * This script restructures the documentation in the repository to follow
 * the HTML-based approach used in the component-library.
 * 
 * It creates a new documentation structure that:
 * 1. Uses HTML files for all documentation
 * 2. Splits large documentation files into smaller, more focused files
 * 3. Organizes documentation by feature/component
 * 4. Creates a central documentation index
 * 5. Ensures documentation is accessible from GitHub and as a website
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
  // Source directories to scan for markdown files
  sourceDirs: [
    path.join(rootDir, 'docs'),
    path.join(rootDir, 'server', 'docs'),
    path.join(rootDir, 'client-angular', 'src', 'app')
  ],
  
  // Target directory for the new documentation structure
  targetDir: path.join(rootDir, 'docs', 'html-docs'),
  
  // Files to split into smaller files
  filesToSplit: [
    {
      source: path.join(rootDir, 'docs', 'AILESSONS.MD'),
      targetDir: 'lessons',
      splitBy: '## ', // Split by second-level headings
      indexTitle: 'AI Lessons Learned'
    },
    {
      source: path.join(rootDir, 'docs', 'CHANGELOG.MD'),
      targetDir: 'changelog',
      splitBy: '## ', // Split by second-level headings
      indexTitle: 'Change Log'
    }
  ],
  
  // Template files
  templates: {
    indexHtml: path.join(rootDir, 'docs', 'html-docs', 'templates', 'index.html'),
    pageHtml: path.join(rootDir, 'docs', 'html-docs', 'templates', 'page.html'),
    stylesCss: path.join(rootDir, 'docs', 'html-docs', 'templates', 'styles.css')
  }
};

/**
 * Creates the directory structure for the new documentation
 */
function createDirectoryStructure() {
  console.log('Creating directory structure...');
  
  // Create the target directory if it doesn't exist
  if (!fs.existsSync(config.targetDir)) {
    fs.mkdirSync(config.targetDir, { recursive: true });
  }
  
  // Create templates directory
  const templatesDir = path.join(config.targetDir, 'templates');
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }
  
  // Create directories for split files
  for (const file of config.filesToSplit) {
    const targetDir = path.join(config.targetDir, file.targetDir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
  }
  
  // Create feature directories
  const featureDirs = [
    'components',
    'server',
    'features',
    'guides',
    'api',
    'lessons',
    'changelog'
  ];
  
  for (const dir of featureDirs) {
    const targetDir = path.join(config.targetDir, dir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
  }
  
  console.log('Directory structure created.');
}

/**
 * Creates template files for the new documentation
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
  
  console.log('Template files created.');
}

/**
 * Converts a Markdown file to HTML
 * @param {string} markdown - The markdown content
 * @returns {string} - The HTML content
 */
function markdownToHtml(markdown) {
  // This is a simple implementation. In a real-world scenario,
  // you would use a proper Markdown parser like marked or remark.
  
  // Convert headings
  let html = markdown
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
    .replace(/^##### (.*$)/gm, '<h5>$1</h5>')
    .replace(/^###### (.*$)/gm, '<h6>$1</h6>');
  
  // Convert bold and italic
  html = html
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    .replace(/_(.*?)_/g, '<em>$1</em>');
  
  // Convert links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
  
  // Convert code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  
  // Convert inline code
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');
  
  // Convert lists
  html = html.replace(/^\* (.*$)/gm, '<li>$1</li>');
  html = html.replace(/^- (.*$)/gm, '<li>$1</li>');
  html = html.replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>');
  
  // Wrap lists
  html = html.replace(/<li>([\s\S]*?)<li>/g, '<ul><li>$1<li>');
  html = html.replace(/<\/li>([\s\S]*?)<\/ul>/g, '</li>$1</ul>');
  
  // Convert paragraphs
  html = html.replace(/^(?!<[a-z])(.*$)/gm, '<p>$1</p>');
  
  // Remove empty paragraphs
  html = html.replace(/<p><\/p>/g, '');
  
  return html;
}

/**
 * Splits a large markdown file into smaller files
 * @param {Object} fileConfig - Configuration for the file to split
 */
function splitMarkdownFile(fileConfig) {
  console.log(`Splitting file: ${fileConfig.source}`);
  
  // Read the source file
  const sourceContent = fs.readFileSync(fileConfig.source, 'utf8');
  
  // Split the content by the specified delimiter
  const sections = sourceContent.split(new RegExp(`(?=${fileConfig.splitBy})`, 'g'));
  
  // Extract the main title and introduction
  const mainTitle = sections[0].match(/^# (.*$)/m)[1];
  const introduction = sections[0].replace(/^# .*$/m, '').trim();
  
  // Create an index file
  let indexContent = `# ${fileConfig.indexTitle}\n\n${introduction}\n\n## Contents\n\n`;
  
  // Process each section
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    
    // Extract the section title
    const titleMatch = section.match(/^## (.*$)/m);
    if (!titleMatch) continue;
    
    const sectionTitle = titleMatch[1];
    const sectionId = sectionTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const fileName = `${sectionId}.md`;
    
    // Add to the index
    indexContent += `- [${sectionTitle}](${fileName})\n`;
    
    // Write the section to a file
    const sectionContent = `# ${sectionTitle}\n\n${section.replace(/^## .*$/m, '').trim()}\n\n[Back to Index](index.md)`;
    fs.writeFileSync(path.join(config.targetDir, fileConfig.targetDir, fileName), sectionContent);
    
    console.log(`  Created section file: ${fileName}`);
  }
  
  // Write the index file
  fs.writeFileSync(path.join(config.targetDir, fileConfig.targetDir, 'index.md'), indexContent);
  
  console.log(`  Created index file: index.md`);
}

/**
 * Creates the main index file for the documentation
 */
function createMainIndex() {
  console.log('Creating main index file...');
  
  const indexContent = `# Date Night App Documentation

Welcome to the Date Night App documentation. This site provides comprehensive documentation for all aspects of the Date Night App project.

## Documentation Sections

- [Components](/docs/html-docs/components/index.html) - Documentation for UI components
- [Server](/docs/html-docs/server/index.html) - Documentation for server-side code
- [Features](/docs/html-docs/features/index.html) - Documentation for application features
- [Guides](/docs/html-docs/guides/index.html) - Development and usage guides
- [API](/docs/html-docs/api/index.html) - API documentation
- [Lessons](/docs/html-docs/lessons/index.html) - Lessons learned during development
- [Changelog](/docs/html-docs/changelog/index.html) - History of changes to the project

## Getting Started

If you're new to the project, we recommend starting with the following guides:

- [Setup Guide](/docs/html-docs/guides/setup.html) - How to set up the development environment
- [Architecture Overview](/docs/html-docs/guides/architecture.html) - Overview of the system architecture
- [Contributing Guide](/docs/html-docs/guides/contributing.html) - How to contribute to the project

## Recent Updates

- **2025-04-25**: SCSS Build Fixes
- **2025-04-24**: TypeScript Type Safety Improvements
- **2025-04-20**: Added End-to-End Encryption for Chat
- **2025-04-15**: Implemented User Preferences System
`;

  fs.writeFileSync(path.join(config.targetDir, 'index.md'), indexContent);
  
  console.log('Main index file created.');
}

/**
 * Main function to execute the script
 */
async function main() {
  try {
    console.log('Starting documentation restructuring...');
    
    // Create directory structure
    createDirectoryStructure();
    
    // Create template files
    createTemplateFiles();
    
    // Split large markdown files
    for (const fileConfig of config.filesToSplit) {
      splitMarkdownFile(fileConfig);
    }
    
    // Create main index
    createMainIndex();
    
    console.log('Documentation restructuring completed successfully.');
  } catch (error) {
    console.error('Error restructuring documentation:', error);
    process.exit(1);
  }
}

// Execute the script
main();
</script>