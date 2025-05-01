#!/usr/bin/env node

/**
 * Create Decentralized Documentation Script
 * 
 * This script creates a decentralized documentation structure with:
 * 1. CHANGELOG.md and AILESSONS.md files in each code folder
 * 2. A central HTML documentation system that aggregates these files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Configuration
const config = {
  // Target directories for decentralized documentation
  targetDirs: [
    // Server components
    { path: 'server/components/ads', name: 'Ads Server Component' },
    { path: 'server/components/auth', name: 'Auth Server Component' },
    { path: 'server/components/chat', name: 'Chat Server Component' },
    { path: 'server/components/users', name: 'Users Server Component' },
    
    // Server controllers
    { path: 'server/controllers', name: 'Server Controllers' },
    
    // Server models
    { path: 'server/models', name: 'Server Models' },
    
    // Server services
    { path: 'server/services', name: 'Server Services' },
    
    // Server middleware
    { path: 'server/middleware', name: 'Server Middleware' },
    
    // Server routes
    { path: 'server/routes', name: 'Server Routes' },
    
    // Client features
    { path: 'client-angular/src/app/features/ad-browser', name: 'Ad Browser Feature' },
    { path: 'client-angular/src/app/features/ad-details', name: 'Ad Details Feature' },
    { path: 'client-angular/src/app/features/ad-management', name: 'Ad Management Feature' },
    { path: 'client-angular/src/app/features/admin', name: 'Admin Feature' },
    { path: 'client-angular/src/app/features/auth', name: 'Auth Feature' },
    { path: 'client-angular/src/app/features/chat', name: 'Chat Feature' },
    { path: 'client-angular/src/app/features/favorites', name: 'Favorites Feature' },
    { path: 'client-angular/src/app/features/profile', name: 'Profile Feature' },
    { path: 'client-angular/src/app/features/reviews', name: 'Reviews Feature' },
    { path: 'client-angular/src/app/features/touring', name: 'Touring Feature' },
    { path: 'client-angular/src/app/features/wallet', name: 'Wallet Feature' },
    
    // Client shared components
    { path: 'client-angular/src/app/shared/components', name: 'Shared Components' },
    
    // Client emerald components
    { path: 'client-angular/src/app/shared/emerald', name: 'Emerald UI Components' },
    
    // Client core services
    { path: 'client-angular/src/app/core/services', name: 'Core Services' },
    
    // Client core models
    { path: 'client-angular/src/app/core/models', name: 'Core Models' },
    
    // Client core design
    { path: 'client-angular/src/app/core/design', name: 'Core Design System' },
  ],
  
  // HTML documentation directory
  htmlDocsDir: 'docs/html-docs',
  
  // Template files
  templates: {
    changelog: 'scripts/templates/CHANGELOG.md.template',
    ailessons: 'scripts/templates/AILESSONS.md.template',
    indexHtml: 'docs/html-docs/templates/index.html',
    pageHtml: 'docs/html-docs/templates/page.html',
    stylesCss: 'docs/html-docs/templates/styles.css'
  }
};

/**
 * Creates the directory structure for the HTML documentation
 */
function createHtmlDocsStructure() {
  console.log('Creating HTML documentation structure...');
  
  // Create the HTML docs directory if it doesn't exist
  if (!fs.existsSync(config.htmlDocsDir)) {
    fs.mkdirSync(config.htmlDocsDir, { recursive: true });
  }
  
  // Create templates directory
  const templatesDir = path.join(config.htmlDocsDir, 'templates');
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }
  
  // Create directories for each section
  const sections = [
    'server',
    'client',
    'features',
    'components',
    'services',
    'models',
    'design'
  ];
  
  for (const section of sections) {
    const sectionDir = path.join(config.htmlDocsDir, section);
    if (!fs.existsSync(sectionDir)) {
      fs.mkdirSync(sectionDir, { recursive: true });
    }
  }
  
  console.log('HTML documentation structure created.');
}

/**
 * Creates template files for the HTML documentation
 */
function createTemplateFiles() {
  console.log('Creating template files...');
  
  // Create templates directory if it doesn't exist
  const templatesDir = path.join(rootDir, 'scripts', 'templates');
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }
  
  // Create CHANGELOG.md template
  const changelogTemplate = `# Changelog for {{component_name}}

## [Unreleased]

### Added
- Initial changelog file

### Changed
- None

### Fixed
- None

## How to use this file

When making changes to this component, add an entry to the "Unreleased" section above.
When a release is made, create a new version section and move the unreleased entries there.

Example:

## [1.0.0] - YYYY-MM-DD

### Added
- Feature X
- Feature Y

### Changed
- Updated component Z

### Fixed
- Bug in function A
`;

  // Create AILESSONS.md template
  const ailessonsTemplate = `# AI Lessons for {{component_name}}

This document contains lessons learned and best practices specific to this component.

## Best Practices

- [Add best practices specific to this component]

## Common Patterns

- [Add common patterns used in this component]

## Known Issues

- [Add known issues or challenges with this component]

## Implementation Notes

- [Add implementation notes or decisions made for this component]

## How to use this file

When discovering new patterns, best practices, or lessons related to this component, add them to this file.
This helps maintain knowledge about the component and guides future development.
`;

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
          <li><a href="/docs/html-docs/server/index.html">Server</a></li>
          <li><a href="/docs/html-docs/client/index.html">Client</a></li>
          <li><a href="/docs/html-docs/features/index.html">Features</a></li>
          <li><a href="/docs/html-docs/components/index.html">Components</a></li>
          <li><a href="/docs/html-docs/services/index.html">Services</a></li>
          <li><a href="/docs/html-docs/models/index.html">Models</a></li>
          <li><a href="/docs/html-docs/design/index.html">Design</a></li>
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
          <li><a href="/docs/html-docs/server/index.html">Server</a></li>
          <li><a href="/docs/html-docs/client/index.html">Client</a></li>
          <li><a href="/docs/html-docs/features/index.html">Features</a></li>
          <li><a href="/docs/html-docs/components/index.html">Components</a></li>
          <li><a href="/docs/html-docs/services/index.html">Services</a></li>
          <li><a href="/docs/html-docs/models/index.html">Models</a></li>
          <li><a href="/docs/html-docs/design/index.html">Design</a></li>
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
        
        <h3>Documentation Types</h3>
        <ul>
          <li><a href="{{componentPath}}/index.html">Overview</a></li>
          <li><a href="{{componentPath}}/changelog.html">Changelog</a></li>
          <li><a href="{{componentPath}}/ailessons.html">AI Lessons</a></li>
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
  margin-bottom: 2rem;
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

/* Component cards */
.component-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.component-card {
  background-color: var(--background-alt);
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.component-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.component-card h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.component-card p {
  color: var(--text-light);
  margin-bottom: 1rem;
}

.component-card .links {
  display: flex;
  gap: 1rem;
}

.component-card .links a {
  display: inline-block;
  font-size: 0.875rem;
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
  
  header nav ul {
    flex-wrap: wrap;
  }
}`;

  // Write template files
  fs.writeFileSync(path.join(templatesDir, 'CHANGELOG.md.template'), changelogTemplate);
  fs.writeFileSync(path.join(templatesDir, 'AILESSONS.md.template'), ailessonsTemplate);
  fs.writeFileSync(path.join(config.htmlDocsDir, 'templates', 'index.html'), indexHtml);
  fs.writeFileSync(path.join(config.htmlDocsDir, 'templates', 'page.html'), pageHtml);
  fs.writeFileSync(path.join(config.htmlDocsDir, 'templates', 'styles.css'), stylesCss);
  
  console.log('Template files created.');
}

/**
 * Creates decentralized documentation files for a component
 * @param {Object} component - The component configuration
 */
function createComponentDocs(component) {
  console.log(`Creating documentation for ${component.name}...`);
  
  const componentPath = path.join(rootDir, component.path);
  
  // Skip if the component directory doesn't exist
  if (!fs.existsSync(componentPath)) {
    console.log(`  Skipping ${component.name} - directory doesn't exist`);
    return;
  }
  
  // Create CHANGELOG.md
  const changelogPath = path.join(componentPath, 'CHANGELOG.md');
  if (!fs.existsSync(changelogPath)) {
    const changelogTemplate = fs.readFileSync(path.join(rootDir, 'scripts', 'templates', 'CHANGELOG.md.template'), 'utf8');
    const changelog = changelogTemplate.replace(/{{component_name}}/g, component.name);
    fs.writeFileSync(changelogPath, changelog);
    console.log(`  Created ${changelogPath}`);
  } else {
    console.log(`  ${changelogPath} already exists, skipping`);
  }
  
  // Create AILESSONS.md
  const ailessonsPath = path.join(componentPath, 'AILESSONS.md');
  if (!fs.existsSync(ailessonsPath)) {
    const ailessonsTemplate = fs.readFileSync(path.join(rootDir, 'scripts', 'templates', 'AILESSONS.md.template'), 'utf8');
    const ailessons = ailessonsTemplate.replace(/{{component_name}}/g, component.name);
    fs.writeFileSync(ailessonsPath, ailessons);
    console.log(`  Created ${ailessonsPath}`);
  } else {
    console.log(`  ${ailessonsPath} already exists, skipping`);
  }
}

/**
 * Determines the section for a component based on its path
 * @param {string} componentPath - The component path
 * @returns {string} - The section name
 */
function getSectionForComponent(componentPath) {
  if (componentPath.includes('server/components')) return 'server';
  if (componentPath.includes('server/controllers')) return 'server';
  if (componentPath.includes('server/models')) return 'models';
  if (componentPath.includes('server/services')) return 'services';
  if (componentPath.includes('server/middleware')) return 'server';
  if (componentPath.includes('server/routes')) return 'server';
  if (componentPath.includes('features')) return 'features';
  if (componentPath.includes('shared/components')) return 'components';
  if (componentPath.includes('shared/emerald')) return 'components';
  if (componentPath.includes('core/services')) return 'services';
  if (componentPath.includes('core/models')) return 'models';
  if (componentPath.includes('core/design')) return 'design';
  return 'client';
}

/**
 * Creates HTML documentation for a component
 * @param {Object} component - The component configuration
 */
function createComponentHtmlDocs(component) {
  console.log(`Creating HTML documentation for ${component.name}...`);
  
  const componentPath = path.join(rootDir, component.path);
  
  // Skip if the component directory doesn't exist
  if (!fs.existsSync(componentPath)) {
    console.log(`  Skipping ${component.name} - directory doesn't exist`);
    return;
  }
  
  // Determine the section for this component
  const section = getSectionForComponent(component.path);
  
  // Create the component directory in the HTML docs
  const htmlComponentDir = path.join(config.htmlDocsDir, section, path.basename(component.path));
  if (!fs.existsSync(htmlComponentDir)) {
    fs.mkdirSync(htmlComponentDir, { recursive: true });
  }
  
  // Create index.html
  const indexPath = path.join(htmlComponentDir, 'index.html');
  const indexTemplate = fs.readFileSync(path.join(config.htmlDocsDir, 'templates', 'page.html'), 'utf8');
  
  // Generate sidebar links for this section
  const sidebarLinks = config.targetDirs
    .filter(c => getSectionForComponent(c.path) === section)
    .map(c => `<li><a href="/docs/html-docs/${section}/${path.basename(c.path)}/index.html">${c.name}</a></li>`)
    .join('\n');
  
  // Create the index content
  const indexContent = `
<p>This is the documentation for the ${component.name}.</p>

<h2>Overview</h2>

<p>Add an overview of this component here.</p>

<h2>Documentation</h2>

<ul>
  <li><a href="changelog.html">Changelog</a> - History of changes to this component</li>
  <li><a href="ailessons.html">AI Lessons</a> - Lessons learned and best practices</li>
</ul>
`;
  
  // Replace placeholders in the template
  let indexHtml = indexTemplate
    .replace(/{{title}}/g, component.name)
    .replace(/{{sectionTitle}}/g, `${section.charAt(0).toUpperCase() + section.slice(1)} Components`)
    .replace(/{{sidebarLinks}}/g, sidebarLinks)
    .replace(/{{componentPath}}/g, `/docs/html-docs/${section}/${path.basename(component.path)}`)
    .replace(/{{content}}/g, indexContent);
  
  fs.writeFileSync(indexPath, indexHtml);
  console.log(`  Created ${indexPath}`);
  
  // Create changelog.html
  const changelogPath = path.join(componentPath, 'CHANGELOG.md');
  if (fs.existsSync(changelogPath)) {
    const changelogHtmlPath = path.join(htmlComponentDir, 'changelog.html');
    const changelogContent = fs.readFileSync(changelogPath, 'utf8');
    
    // Convert markdown to HTML (simple implementation)
    const changelogHtml = markdownToHtml(changelogContent);
    
    // Replace placeholders in the template
    let changelogPageHtml = indexTemplate
      .replace(/{{title}}/g, `${component.name} Changelog`)
      .replace(/{{sectionTitle}}/g, `${section.charAt(0).toUpperCase() + section.slice(1)} Components`)
      .replace(/{{sidebarLinks}}/g, sidebarLinks)
      .replace(/{{componentPath}}/g, `/docs/html-docs/${section}/${path.basename(component.path)}`)
      .replace(/{{content}}/g, changelogHtml);
    
    fs.writeFileSync(changelogHtmlPath, changelogPageHtml);
    console.log(`  Created ${changelogHtmlPath}`);
  }
  
  // Create ailessons.html
  const ailessonsPath = path.join(componentPath, 'AILESSONS.md');
  if (fs.existsSync(ailessonsPath)) {
    const ailessonsHtmlPath = path.join(htmlComponentDir, 'ailessons.html');
    const ailessonsContent = fs.readFileSync(ailessonsPath, 'utf8');
    
    // Convert markdown to HTML (simple implementation)
    const ailessonsHtml = markdownToHtml(ailessonsContent);
    
    // Replace placeholders in the template
    let ailessonsPageHtml = indexTemplate
      .replace(/{{title}}/g, `${component.name} AI Lessons`)
      .replace(/{{sectionTitle}}/g, `${section.charAt(0).toUpperCase() + section.slice(1)} Components`)
      .replace(/{{sidebarLinks}}/g, sidebarLinks)
      .replace(/{{componentPath}}/g, `/docs/html-docs/${section}/${path.basename(component.path)}`)
      .replace(/{{content}}/g, ailessonsHtml);
    
    fs.writeFileSync(ailessonsHtmlPath, ailessonsPageHtml);
    console.log(`  Created ${ailessonsHtmlPath}`);
  }
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
 * Creates section index files
 */
function createSectionIndexFiles() {
  console.log('Creating section index files...');
  
  // Create index files for each section
  const sections = [
    { id: 'server', name: 'Server Components' },
    { id: 'client', name: 'Client Components' },
    { id: 'features', name: 'Features' },
    { id: 'components', name: 'UI Components' },
    { id: 'services', name: 'Services' },
    { id: 'models', name: 'Data Models' },
    { id: 'design', name: 'Design System' }
  ];
  
  for (const section of sections) {
    const indexPath = path.join(config.htmlDocsDir, section.id, 'index.html');
    const indexTemplate = fs.readFileSync(path.join(config.htmlDocsDir, 'templates', 'index.html'), 'utf8');
    
    // Get components for this section
    const sectionComponents = config.targetDirs.filter(c => getSectionForComponent(c.path) === section.id);
    
    // Create component cards
    let componentCards = '';
    for (const component of sectionComponents) {
      componentCards += `
<div class="component-card">
  <h3>${component.name}</h3>
  <p>Documentation for the ${component.name}</p>
  <div class="links">
    <a href="/docs/html-docs/${section.id}/${path.basename(component.path)}/index.html">Overview</a>
    <a href="/docs/html-docs/${section.id}/${path.basename(component.path)}/changelog.html">Changelog</a>
    <a href="/docs/html-docs/${section.id}/${path.basename(component.path)}/ailessons.html">AI Lessons</a>
  </div>
</div>`;
    }
    
    // Create the index content
    const indexContent = `
<p>This section contains documentation for ${section.name.toLowerCase()} in the Date Night App.</p>

<div class="component-grid">
  ${componentCards}
</div>
`;
    
    // Replace placeholders in the template
    let indexHtml = indexTemplate
      .replace(/{{title}}/g, section.name)
      .replace(/{{content}}/g, indexContent);
    
    fs.writeFileSync(indexPath, indexHtml);
    console.log(`  Created ${indexPath}`);
  }
}

/**
 * Creates the main index file for the documentation
 */
function createMainIndex() {
  console.log('Creating main index file...');
  
  const indexPath = path.join(config.htmlDocsDir, 'index.html');
  const indexTemplate = fs.readFileSync(path.join(config.htmlDocsDir, 'templates', 'index.html'), 'utf8');
  
  // Create the index content
  const indexContent = `
<p>Welcome to the Date Night App documentation. This site provides comprehensive documentation for all aspects of the Date Night App project.</p>

<h2>Documentation Sections</h2>

<div class="component-grid">
  <div class="component-card">
    <h3>Server Components</h3>
    <p>Documentation for server-side components</p>
    <div class="links">
      <a href="/docs/html-docs/server/index.html">View Documentation</a>
    </div>
  </div>
  
  <div class="component-card">
    <h3>Client Components</h3>
    <p>Documentation for client-side components</p>
    <div class="links">
      <a href="/docs/html-docs/client/index.html">View Documentation</a>
    </div>
  </div>
  
  <div class="component-card">
    <h3>Features</h3>
    <p>Documentation for application features</p>
    <div class="links">
      <a href="/docs/html-docs/features/index.html">View Documentation</a>
    </div>
  </div>
  
  <div class="component-card">
    <h3>UI Components</h3>
    <p>Documentation for UI components</p>
    <div class="links">
      <a href="/docs/html-docs/components/index.html">View Documentation</a>
    </div>
  </div>
  
  <div class="component-card">
    <h3>Services</h3>
    <p>Documentation for services</p>
    <div class="links">
      <a href="/docs/html-docs/services/index.html">View Documentation</a>
    </div>
  </div>
  
  <div class="component-card">
    <h3>Data Models</h3>
    <p>Documentation for data models</p>
    <div class="links">
      <a href="/docs/html-docs/models/index.html">View Documentation</a>
    </div>
  </div>
  
  <div class="component-card">
    <h3>Design System</h3>
    <p>Documentation for the design system</p>
    <div class="links">
      <a href="/docs/html-docs/design/index.html">View Documentation</a>
    </div>
  </div>
</div>

<h2>How to Use This Documentation</h2>

<p>Each component in the Date Night App has its own documentation, including:</p>

<ul>
  <li><strong>Overview</strong> - General information about the component</li>
  <li><strong>Changelog</strong> - History of changes to the component</li>
  <li><strong>AI Lessons</strong> - Lessons learned and best practices for the component</li>
</ul>

<p>The documentation is organized by component type, making it easy to find information about specific parts of the application.</p>

<h2>Contributing to Documentation</h2>

<p>To contribute to the documentation:</p>

<ol>
  <li>Find the relevant component directory in the codebase</li>
  <li>Update the CHANGELOG.md or AILESSONS.md file in that directory</li>
  <li>Run the documentation generation script to update the HTML documentation</li>
</ol>

<p>For more information, see the <a href="/docs/DOCUMENTATION_STYLE_GUIDE.MD">Documentation Style Guide</a>.</p>
`;
  
  // Replace placeholders in the template
  let indexHtml = indexTemplate
    .replace(/{{title}}/g, 'Date Night App Documentation')
    .replace(/{{content}}/g, indexContent);
  
  fs.writeFileSync(indexPath, indexHtml);
  
  console.log(`Main index file created: ${indexPath}`);
}

/**
 * Creates a README file for the HTML documentation
 */
function createReadme() {
  console.log('Creating README file...');
  
  const readmePath = path.join(config.htmlDocsDir, 'README.md');
  const readmeContent = `# Date Night App HTML Documentation

This directory contains the HTML documentation for the Date Night App project.

## Overview

The documentation is organized by component, with each component having its own:

- **Overview** - General information about the component
- **Changelog** - History of changes to the component
- **AI Lessons** - Lessons learned and best practices for the component

## Directory Structure

- \`/server/\` - Documentation for server-side components
- \`/client/\` - Documentation for client-side components
- \`/features/\` - Documentation for application features
- \`/components/\` - Documentation for UI components
- \`/services/\` - Documentation for services
- \`/models/\` - Documentation for data models
- \`/design/\` - Documentation for the design system
- \`/templates/\` - HTML templates and CSS styles

## Viewing the Documentation

You can view the documentation by opening the \`index.html\` file in your browser.

## Updating the Documentation

The HTML documentation is generated from the CHANGELOG.md and AILESSONS.md files in each component directory. To update the documentation:

1. Update the relevant CHANGELOG.md or AILESSONS.md file in the component directory
2. Run the documentation generation script:

\`\`\`bash
node scripts/create_decentralized_docs.mjs --update-html
\`\`\`

This will regenerate the HTML documentation for all components.
`;
  
  fs.writeFileSync(readmePath, readmeContent);
  
  console.log(`README file created: ${readmePath}`);
}

/**
 * Main function to execute the script
 */
async function main() {
  try {
    console.log('Starting decentralized documentation creation...');
    
    // Create templates directory if it doesn't exist
    const templatesDir = path.join(rootDir, 'scripts', 'templates');
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
    }
    
    // Create HTML documentation structure
    createHtmlDocsStructure();
    
    // Create template files
    createTemplateFiles();
    
    // Create decentralized documentation files for each component
    for (const component of config.targetDirs) {
      createComponentDocs(component);
    }
    
    // Create HTML documentation for each component
    for (const component of config.targetDirs) {
      createComponentHtmlDocs(component);
    }
    
    // Create section index files
    createSectionIndexFiles();
    
    // Create main index file
    createMainIndex();
    
    // Create README file
    createReadme();
    
    console.log('Decentralized documentation creation completed successfully.');
    
    // Add instructions for updating the documentation
    console.log('\nTo update the HTML documentation after changing CHANGELOG.md or AILESSONS.md files:');
    console.log('node scripts/create_decentralized_docs.mjs --update-html');
    
  } catch (error) {
    console.error('Error creating decentralized documentation:', error);
    process.exit(1);
  }
}

// Check if we're updating HTML only
const updateHtmlOnly = process.argv.includes('--update-html');

if (updateHtmlOnly) {
  console.log('Updating HTML documentation only...');
  
  // Create HTML documentation structure
  createHtmlDocsStructure();
  
  // Create template files
  createTemplateFiles();
  
  // Create HTML documentation for each component
  for (const component of config.targetDirs) {
    createComponentHtmlDocs(component);
  }
  
  // Create section index files
  createSectionIndexFiles();
  
  // Create main index file
  createMainIndex();
  
  console.log('HTML documentation updated successfully.');
} else {
  // Execute the full script
  main();
}
</script>