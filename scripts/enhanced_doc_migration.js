#!/usr/bin/env node

/**
 * Enhanced Documentation Migration Script
 *
 * This script implements a comprehensive documentation migration and enhancement process:
 * 1. Analyzes and categorizes all documentation sources
 * 2. Maps content to appropriate destinations
 * 3. Merges content from multiple sources
 * 4. Formats content according to HTML standards
 * 5. Applies the component-library template with sidebar navigation
 * 6. Adds tooltips and links to function references
 * 7. Updates indexes and cross-references
 *
 * Usage:
 *   node enhanced_doc_migration.js [--feature <feature-name>] [--all] [--dry-run] [--verbose]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { marked } from 'marked';
import * as cheerio from 'cheerio';
import pkg from 'glob';
const { glob } = pkg;
import { load as yamlLoad, dump as yamlDump } from 'js-yaml';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Configuration
const config = {
  rootDir,
  clientDir: path.join(rootDir, 'client-angular/src/app'),
  serverDir: path.join(rootDir, 'server'),
  docsDir: path.join(rootDir, 'docs'),
  componentLibraryDir: path.join(rootDir, 'docs/component-library'),
  templateFile: path.join(rootDir, 'docs/component-library/templates/component.html'),
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
const featureArg = args.includes('--feature') ? args[args.indexOf('--feature') + 1] : null;
const processAll = args.includes('--all');
const dryRun = args.includes('--dry-run');
const verbose = args.includes('--verbose');

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
 * Creates a documentation mapping for a feature
 * @param {string} featureName - The feature name
 * @param {Object} codeFolders - Object with code folder paths
 * @returns {Object} - The documentation mapping
 */
function createDocumentationMapping(featureName, codeFolders) {
  const mapping = {};

  // Find the feature folder
  let featureFolder = null;
  let featureType = null;

  for (const folder of codeFolders.features) {
    const folderName = path.basename(folder);
    if (folderName.toLowerCase() === featureName.toLowerCase()) {
      featureFolder = folder;
      featureType = 'features';
      break;
    }
  }

  if (!featureFolder) {
    for (const folder of codeFolders.components) {
      const folderName = path.basename(folder);
      if (folderName.toLowerCase() === featureName.toLowerCase()) {
        featureFolder = folder;
        featureType = 'components';
        break;
      }
    }
  }

  if (!featureFolder) {
    for (const folder of codeFolders.services) {
      const folderName = path.basename(folder);
      if (folderName.toLowerCase() === featureName.toLowerCase()) {
        featureFolder = folder;
        featureType = 'services';
        break;
      }
    }
  }

  if (!featureFolder) {
    for (const folder of codeFolders.serverComponents) {
      const folderName = path.basename(folder);
      if (folderName.toLowerCase() === featureName.toLowerCase()) {
        featureFolder = folder;
        featureType = 'serverComponents';
        break;
      }
    }
  }

  if (!featureFolder) {
    console.error(`Feature folder not found for ${featureName}`);
    return mapping;
  }

  // Create the mapping
  mapping[featureName] = {
    folder: featureFolder,
    type: featureType,
    sourceFiles: [],
    destination: path.join(featureFolder, `${featureName.toLowerCase().replace(/_/g, '-')}.html`),
    relatedComponents: [],
  };

  // Find source files
  const sourceFiles = [];

  // Check for README.md in the feature folder
  const readmePath = path.join(featureFolder, 'README.md');
  if (fs.existsSync(readmePath)) {
    sourceFiles.push(readmePath);
  }

  // Check for documentation in the docs folder
  const docsFeaturePath = path.join(config.docsDir, 'features', `${featureName.toUpperCase()}.md`);
  if (fs.existsSync(docsFeaturePath)) {
    sourceFiles.push(docsFeaturePath);
  }

  const docsFeatureFolderPath = path.join(config.docsDir, 'features', featureName.toLowerCase());
  if (fs.existsSync(docsFeatureFolderPath)) {
    try {
      const featureDocs = glob(`${docsFeatureFolderPath}/**/*.md`, { sync: true });
      if (Array.isArray(featureDocs)) {
        sourceFiles.push(...featureDocs);
      } else {
        logVerbose(`Warning: glob did not return an array for ${docsFeatureFolderPath}/**/*.md`);
      }
    } catch (error) {
      logVerbose(`Error getting feature docs: ${error.message}`);
    }
  }

  // Check for API documentation
  const apiDocsPath = path.join(config.docsDir, 'api', `${featureName.toLowerCase()}-api.md`);
  if (fs.existsSync(apiDocsPath)) {
    sourceFiles.push(apiDocsPath);
  }

  // Find related components
  const relatedComponents = [];

  // Look for imports in TypeScript files
  let tsFiles = [];
  try {
    tsFiles = glob(`${featureFolder}/**/*.ts`, { sync: true });
    if (!Array.isArray(tsFiles)) {
      tsFiles = [];
      logVerbose(`Warning: glob did not return an array for ${featureFolder}/**/*.ts`);
    }
  } catch (error) {
    logVerbose(`Error getting TypeScript files: ${error.message}`);
  }

  for (const tsFile of tsFiles) {
    const content = fs.readFileSync(tsFile, 'utf8');

    // Look for component imports
    const importMatches = content.matchAll(/import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g);
    for (const match of importMatches) {
      const imports = match[1].split(',').map(i => i.trim());
      const importPath = match[2];

      if (importPath.includes('shared/components')) {
        for (const importName of imports) {
          if (importName.endsWith('Component')) {
            const componentName = importName.replace(/Component$/, '');
            const kebabCase = componentName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

            if (!relatedComponents.includes(kebabCase)) {
              relatedComponents.push(kebabCase);
            }
          }
        }
      }
    }
  }

  mapping[featureName].sourceFiles = sourceFiles;
  mapping[featureName].relatedComponents = relatedComponents;

  return mapping;
}

/**
 * Analyzes content from source files
 * @param {string[]} sourceFiles - Array of source file paths
 * @returns {Object} - Object with analyzed content
 */
function analyzeContent(sourceFiles) {
  const content = {
    overview: [],
    usage: [],
    api: [],
    examples: [],
    related: [],
  };

  for (const file of sourceFiles) {
    if (!fs.existsSync(file)) {
      logVerbose(`File not found: ${file}`);
      continue;
    }

    const fileContent = fs.readFileSync(file, 'utf8');
    const extension = path.extname(file);

    if (extension === '.md') {
      // Parse Markdown content
      const sections = parseMarkdownSections(fileContent);

      // Add sections to content
      for (const [section, text] of Object.entries(sections)) {
        if (text && text.trim()) {
          content[section].push({
            source: file,
            content: text,
          });
        }
      }
    } else if (extension === '.html') {
      // Parse HTML content
      const sections = parseHtmlSections(fileContent);

      // Add sections to content
      for (const [section, text] of Object.entries(sections)) {
        if (text && text.trim()) {
          content[section].push({
            source: file,
            content: text,
          });
        }
      }
    }
  }

  return content;
}

/**
 * Parses Markdown content into sections
 * @param {string} markdown - The Markdown content
 * @returns {Object} - Object with sections
 */
function parseMarkdownSections(markdown) {
  const sections = {
    overview: '',
    usage: '',
    api: '',
    examples: '',
    related: '',
  };

  // Split the markdown into sections based on headings
  const lines = markdown.split('\n');
  let currentSection = 'overview';
  let sectionContent = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('# ')) {
      // This is a top-level heading, could be the title
      if (i === 0) {
        continue; // Skip the title
      }

      // Save the current section
      sections[currentSection] += sectionContent.join('\n');

      // Determine the new section
      const heading = line.substring(2).toLowerCase();
      if (heading.includes('overview') || heading.includes('introduction')) {
        currentSection = 'overview';
      } else if (heading.includes('usage') || heading.includes('how to use')) {
        currentSection = 'usage';
      } else if (
        heading.includes('api') ||
        heading.includes('interface') ||
        heading.includes('method')
      ) {
        currentSection = 'api';
      } else if (heading.includes('example') || heading.includes('sample')) {
        currentSection = 'examples';
      } else if (heading.includes('related') || heading.includes('see also')) {
        currentSection = 'related';
      } else {
        currentSection = 'overview';
      }

      sectionContent = [line];
    } else if (line.startsWith('## ')) {
      // This is a second-level heading
      const heading = line.substring(3).toLowerCase();

      if (heading.includes('overview') || heading.includes('introduction')) {
        // Save the current section
        sections[currentSection] += sectionContent.join('\n');
        currentSection = 'overview';
        sectionContent = [line];
      } else if (heading.includes('usage') || heading.includes('how to use')) {
        // Save the current section
        sections[currentSection] += sectionContent.join('\n');
        currentSection = 'usage';
        sectionContent = [line];
      } else if (
        heading.includes('api') ||
        heading.includes('interface') ||
        heading.includes('method')
      ) {
        // Save the current section
        sections[currentSection] += sectionContent.join('\n');
        currentSection = 'api';
        sectionContent = [line];
      } else if (heading.includes('example') || heading.includes('sample')) {
        // Save the current section
        sections[currentSection] += sectionContent.join('\n');
        currentSection = 'examples';
        sectionContent = [line];
      } else if (heading.includes('related') || heading.includes('see also')) {
        // Save the current section
        sections[currentSection] += sectionContent.join('\n');
        currentSection = 'related';
        sectionContent = [line];
      } else {
        sectionContent.push(line);
      }
    } else {
      sectionContent.push(line);
    }
  }

  // Save the last section
  sections[currentSection] += sectionContent.join('\n');

  return sections;
}

/**
 * Parses HTML content into sections
 * @param {string} html - The HTML content
 * @returns {Object} - Object with sections
 */
function parseHtmlSections(html) {
  const sections = {
    overview: '',
    usage: '',
    api: '',
    examples: '',
    related: '',
  };

  const $ = cheerio.load(html);

  // Extract sections based on IDs or headings
  const overviewSection = $(
    '#overview, #introduction, section:has(h2:contains("Overview")), section:has(h2:contains("Introduction"))',
  );
  if (overviewSection.length) {
    sections.overview = overviewSection.html() || '';
  }

  const usageSection = $(
    '#usage, #how-to-use, section:has(h2:contains("Usage")), section:has(h2:contains("How to Use"))',
  );
  if (usageSection.length) {
    sections.usage = usageSection.html() || '';
  }

  const apiSection = $(
    '#api, #interface, #methods, section:has(h2:contains("API")), section:has(h2:contains("Interface")), section:has(h2:contains("Methods"))',
  );
  if (apiSection.length) {
    sections.api = apiSection.html() || '';
  }

  const examplesSection = $(
    '#examples, #sample, section:has(h2:contains("Example")), section:has(h2:contains("Sample"))',
  );
  if (examplesSection.length) {
    sections.examples = examplesSection.html() || '';
  }

  const relatedSection = $(
    '#related, #see-also, section:has(h2:contains("Related")), section:has(h2:contains("See Also"))',
  );
  if (relatedSection.length) {
    sections.related = relatedSection.html() || '';
  }

  return sections;
}

/**
 * Merges content from multiple sources
 * @param {Object} contentPieces - Object with content pieces
 * @returns {Object} - Object with merged content
 */
function mergeContent(contentPieces) {
  const merged = {
    overview: '',
    usage: '',
    api: '',
    examples: '',
    related: '',
  };

  // Merge overview sections
  if (contentPieces.overview.length > 0) {
    merged.overview = contentPieces.overview.map(piece => piece.content).join('\n\n');
  }

  // Merge usage sections
  if (contentPieces.usage.length > 0) {
    merged.usage = contentPieces.usage.map(piece => piece.content).join('\n\n');
  }

  // Merge API sections
  if (contentPieces.api.length > 0) {
    merged.api = contentPieces.api.map(piece => piece.content).join('\n\n');
  }

  // Merge examples sections
  if (contentPieces.examples.length > 0) {
    merged.examples = contentPieces.examples.map(piece => piece.content).join('\n\n');
  }

  // Merge related sections
  if (contentPieces.related.length > 0) {
    merged.related = contentPieces.related.map(piece => piece.content).join('\n\n');
  }

  return merged;
}

/**
 * Formats content according to HTML standards
 * @param {Object} mergedContent - Object with merged content
 * @param {string} featureName - The feature name
 * @returns {Object} - Object with formatted content
 */
function formatContent(mergedContent, featureName) {
  const formatted = {
    overview: '',
    usage: '',
    api: '',
    examples: '',
    related: '',
  };

  // Format overview section
  if (mergedContent.overview) {
    const overviewHtml = marked(mergedContent.overview);
    formatted.overview = `
      <section id="overview">
        <h2>Overview</h2>
        ${overviewHtml}
      </section>
    `;
  }

  // Format usage section
  if (mergedContent.usage) {
    const usageHtml = marked(mergedContent.usage);
    formatted.usage = `
      <section id="usage">
        <h2>Usage</h2>
        ${usageHtml}
      </section>
    `;
  }

  // Format API section
  if (mergedContent.api) {
    const apiHtml = marked(mergedContent.api);
    formatted.api = `
      <section id="api">
        <h2>API Reference</h2>
        ${apiHtml}
      </section>
    `;
  }

  // Format examples section
  if (mergedContent.examples) {
    const examplesHtml = marked(mergedContent.examples);
    formatted.examples = `
      <section id="examples">
        <h2>Examples</h2>
        ${examplesHtml}
      </section>
    `;
  }

  // Format related section
  if (mergedContent.related) {
    const relatedHtml = marked(mergedContent.related);
    formatted.related = `
      <section id="related">
        <h2>Related Components</h2>
        ${relatedHtml}
      </section>
    `;
  }

  return formatted;
}

/**
 * Generates sidebar navigation
 * @param {string} featureName - The feature name
 * @param {string[]} relatedComponents - Array of related component names
 * @returns {string} - The sidebar HTML
 */
function generateSidebar(featureName, relatedComponents) {
  const formattedFeatureName = featureName
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, str => str.toUpperCase());

  let sidebar = `
    <aside class="sidebar">
      <h3>${formattedFeatureName}</h3>
      <ul>
        <li><a href="./CHANGELOG.html">Changelog</a></li>
        <li><a href="./AILESSONS.html">AI Lessons</a></li>
        <li><a href="./GLOSSARY.html">Glossary</a></li>
        <li><a href="./${featureName
          .toLowerCase()
          .replace(/_/g, '-')}.html">${formattedFeatureName}</a></li>
      </ul>
  `;

  if (relatedComponents.length > 0) {
    sidebar += `
      <h4>Related Components</h4>
      <ul>
    `;

    for (const component of relatedComponents) {
      const formattedComponentName = component
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      sidebar += `
        <li><a href="/client-angular/src/app/shared/components/${component}/${component}.html">${formattedComponentName}</a></li>
      `;
    }

    sidebar += `
      </ul>
    `;
  }

  sidebar += `
    </aside>
  `;

  return sidebar;
}

/**
 * Applies the HTML template
 * @param {Object} formattedContent - Object with formatted content
 * @param {string} sidebar - The sidebar HTML
 * @param {string} featureName - The feature name
 * @returns {string} - The complete HTML document
 */
function applyTemplate(formattedContent, sidebar, featureName) {
  const formattedFeatureName = featureName
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, str => str.toUpperCase());

  // Load the template
  let template = '';
  if (fs.existsSync(config.templateFile)) {
    template = fs.readFileSync(config.templateFile, 'utf8');
  } else {
    // Use a default template
    template = `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>{{title}} - Date Night App</title>
          <link rel="stylesheet" href="/docs/component-library/styles/style.css" />
          <style>
            .tooltip {
              position: relative;
              display: inline-block;
              border-bottom: 1px dotted #333;
            }
            .tooltip .tooltip-text {
              visibility: hidden;
              width: 300px;
              background-color: #f8f9fa;
              color: #333;
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
            }
            .tooltip:hover .tooltip-text {
              visibility: visible;
              opacity: 1;
            }
            .function-link {
              color: #0366d6;
              text-decoration: none;
              font-family: monospace;
              background-color: #f6f8fa;
              padding: 2px 4px;
              border-radius: 3px;
            }
            .function-link:hover {
              text-decoration: underline;
            }
            code {
              font-family: monospace;
              background-color: #f6f8fa;
              padding: 2px 4px;
              border-radius: 3px;
            }
            pre {
              background-color: #f6f8fa;
              padding: 16px;
              border-radius: 6px;
              overflow: auto;
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
                  <li><a href="index.html">{{feature}} Index</a></li>
                </ul>
              </nav>
            </div>
          </header>
          <main class="container">
            <div class="page-content">
              {{sidebar}}
              <article class="content">
                <h1>{{title}}</h1>
                {{content}}
              </article>
            </div>
          </main>
        </body>
      </html>
    `;
  }

  // Replace placeholders
  let html = template
    .replace(/{{title}}/g, formattedFeatureName)
    .replace(/{{feature}}/g, featureName.toLowerCase())
    .replace(/{{sidebar}}/g, sidebar);

  // Combine content sections
  const content = [
    formattedContent.overview,
    formattedContent.usage,
    formattedContent.api,
    formattedContent.examples,
    formattedContent.related,
  ]
    .filter(Boolean)
    .join('\n');

  html = html.replace(/{{content}}/g, content);

  return html;
}

/**
 * Adds tooltips and links to function references
 * @param {string} htmlContent - The HTML content
 * @param {string} featureFolder - The feature folder path
 * @returns {string} - The HTML content with tooltips and links
 */
function addTooltipsAndLinks(htmlContent, featureFolder) {
  // Load the glossary
  const glossaryPath = path.join(featureFolder, 'GLOSSARY.html');
  if (!fs.existsSync(glossaryPath)) {
    return htmlContent;
  }

  const glossaryContent = fs.readFileSync(glossaryPath, 'utf8');
  const $ = cheerio.load(glossaryContent);

  // Extract function definitions
  const functions = {};
  $('.glossary-entry').each((i, el) => {
    const id = $(el).attr('id');
    const name = $(el).find('h3').text().trim();
    const description = $(el).find('.entry-description p').text().trim();

    if (id && name && description) {
      functions[name] = {
        id,
        description,
      };
    }
  });

  // Add tooltips and links to function references
  let enhancedHtml = htmlContent;

  for (const [funcName, funcInfo] of Object.entries(functions)) {
    const regex = new RegExp(`\\b${funcName}\\b(?![^<]*>|[^<>]*<\\/a>)`, 'g');
    const replacement = `<a href="./GLOSSARY.html#${funcInfo.id}" class="function-link tooltip">${funcName}<span class="tooltip-text">${funcInfo.description}</span></a>`;

    enhancedHtml = enhancedHtml.replace(regex, replacement);
  }

  return enhancedHtml;
}

/**
 * Updates the main index and glossary
 * @param {string} featureName - The feature name
 * @param {string} destinationPath - The destination path
 */
function updateIndexes(featureName, destinationPath) {
  // Update the main index
  const indexPath = path.join(config.rootDir, '_docs_index.html');
  if (fs.existsSync(indexPath)) {
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    const $ = cheerio.load(indexContent);

    // Find the feature section
    const featureSection = $(`#section-features .doc-group h3:contains("${featureName}")`).parent();

    if (featureSection.length) {
      // Add the link to the documentation
      const docLinks = featureSection.find('.doc-links');
      const relativeDestination = path
        .relative(config.rootDir, destinationPath)
        .replace(/\\/g, '/');

      // Check if the link already exists
      const existingLink = docLinks.find(`a[href="/${relativeDestination}"]`);

      if (!existingLink.length) {
        docLinks.append(`<a href="/${relativeDestination}">${featureName}</a>`);

        // Save the updated index
        if (!dryRun) {
          fs.writeFileSync(indexPath, $.html());
          logVerbose(`Updated main index with link to ${featureName} documentation`);
        }
      }
    }
  }
}

/**
 * Migrates documentation for a feature
 * @param {string} featureName - The feature name
 */
async function migrateDocumentation(featureName) {
  console.log(`Migrating documentation for ${featureName}...`);

  // Get code folders
  const codeFolders = getCodeFolders();

  // Create documentation mapping
  const mapping = createDocumentationMapping(featureName, codeFolders);

  if (!mapping[featureName]) {
    console.error(`No mapping found for ${featureName}`);
    return;
  }

  const { folder, sourceFiles, destination, relatedComponents } = mapping[featureName];

  logVerbose(`Feature folder: ${folder}`);
  logVerbose(`Source files: ${sourceFiles.join(', ')}`);
  logVerbose(`Destination: ${destination}`);
  logVerbose(`Related components: ${relatedComponents.join(', ')}`);

  // Analyze content
  const analyzedContent = analyzeContent(sourceFiles);

  // Merge content
  const mergedContent = mergeContent(analyzedContent);

  // Format content
  const formattedContent = formatContent(mergedContent, featureName);

  // Generate sidebar
  const sidebar = generateSidebar(featureName, relatedComponents);

  // Apply template
  let html = applyTemplate(formattedContent, sidebar, featureName);

  // Add tooltips and links
  html = addTooltipsAndLinks(html, folder);

  // Save the HTML file
  if (!dryRun) {
    fs.writeFileSync(destination, html);
    console.log(`Saved documentation to ${destination}`);

    // Update indexes
    updateIndexes(featureName, destination);
  } else {
    console.log(`[DRY RUN] Would save documentation to ${destination}`);
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('Enhanced Documentation Migration');
    console.log('===============================');

    // We'll continue with the dependencies we have

    if (featureArg) {
      // Migrate documentation for a specific feature
      await migrateDocumentation(featureArg);
    } else if (processAll) {
      // Migrate documentation for all features
      const codeFolders = getCodeFolders();

      // Process features
      for (const folder of codeFolders.features) {
        const featureName = path.basename(folder);
        await migrateDocumentation(featureName);
      }

      // Process components
      for (const folder of codeFolders.components) {
        const componentName = path.basename(folder);
        await migrateDocumentation(componentName);
      }

      // Process services
      for (const folder of codeFolders.services) {
        const serviceName = path.basename(folder);
        await migrateDocumentation(serviceName);
      }

      // Process server components
      for (const folder of codeFolders.serverComponents) {
        const componentName = path.basename(folder);
        await migrateDocumentation(componentName);
      }
    } else {
      console.log(
        'Please specify a feature name with --feature or use --all to process all features.',
      );
      console.log('Example: node enhanced_doc_migration.js --feature chat');
      console.log('Example: node enhanced_doc_migration.js --all');
      process.exit(1);
    }

    console.log('\nDocumentation migration completed successfully.');
  } catch (error) {
    console.error('Error migrating documentation:', error);
    process.exit(1);
  }
}

// Execute the script
main();
