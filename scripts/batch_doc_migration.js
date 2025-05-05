#!/usr/bin/env node

/**
 * Batch Documentation Migration Script
 *
 * This script processes documentation migration in batches, prioritizing
 * features and components based on importance and usage.
 *
 * Usage:
 *   node batch_doc_migration.js [--priority <high|medium|low>] [--dry-run] [--verbose]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync, spawn } from 'child_process';
import { createInterface } from 'readline';
import * as globModule from 'glob';
const glob = globModule.glob || globModule.default || globModule;

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Command line arguments
const args = process.argv.slice(2);
const priorityArg = args.includes('--priority') ? args[args.indexOf('--priority') + 1] : 'all';
const dryRun = args.includes('--dry-run');
const verbose = args.includes('--verbose');

// Priority definitions
const priorities = {
  high: ['auth', 'chat', 'profile', 'browse', 'user-settings', 'payment'],
  medium: [
    'advertiser-profile',
    'ads',
    'reviews',
    'favorites',
    'gallery',
    'location-matching',
    'wallet',
  ],
  low: [
    'accessibility-demo',
    'ad-browser',
    'ad-details',
    'ad-management',
    'admin',
    'design-system-demo',
    'list-view',
    'micro-interactions-demo',
    'netflix-view',
    'preferences-demo',
    'telemetry',
    'tinder',
    'tinder-card',
    'touring',
  ],
};

// Component priorities
const componentPriorities = {
  high: ['button', 'input', 'select', 'checkbox', 'main-layout', 'chat-message'],
  medium: [
    'ad-card',
    'alert-notifications',
    'chat-settings',
    'favorite-dialog',
    'map',
    'review-display',
  ],
  low: ['skeleton-loader', 'tags-dialog', 'theme-toggle'],
};

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
 * Gets all code folders that should have documentation
 * @returns {Object} - Object with folder paths grouped by type
 */
function getCodeFolders() {
  const clientDir = path.join(rootDir, 'client-angular/src/app');
  const serverDir = path.join(rootDir, 'server');
  const excludeDirs = [
    'node_modules',
    'dist',
    'coverage',
    'test-results',
    '.git',
    'e2e',
    'assets',
    'environments',
  ];

  const folders = {
    features: [],
    components: [],
    services: [],
    serverComponents: [],
  };

  // Get feature folders
  const featuresDir = path.join(clientDir, 'features');
  folders.features = fs
    .readdirSync(featuresDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && !excludeDirs.includes(dirent.name))
    .map(dirent => ({
      name: dirent.name,
      path: path.join(featuresDir, dirent.name),
      type: 'feature',
      priority: priorities.high.includes(dirent.name)
        ? 'high'
        : priorities.medium.includes(dirent.name)
          ? 'medium'
          : 'low',
    }));

  // Get component folders
  const componentsDir = path.join(clientDir, 'shared/components');
  folders.components = fs
    .readdirSync(componentsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && !excludeDirs.includes(dirent.name))
    .map(dirent => ({
      name: dirent.name,
      path: path.join(componentsDir, dirent.name),
      type: 'component',
      priority: componentPriorities.high.includes(dirent.name)
        ? 'high'
        : componentPriorities.medium.includes(dirent.name)
          ? 'medium'
          : 'low',
    }));

  // Get service folders
  const servicesDir = path.join(clientDir, 'core/services');
  folders.services = fs
    .readdirSync(servicesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && !excludeDirs.includes(dirent.name))
    .map(dirent => ({
      name: dirent.name,
      path: path.join(servicesDir, dirent.name),
      type: 'service',
      priority: 'medium', // Default priority for services
    }));

  // Get server component folders
  const serverComponentsDir = path.join(serverDir, 'components');
  if (fs.existsSync(serverComponentsDir)) {
    folders.serverComponents = fs
      .readdirSync(serverComponentsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && !excludeDirs.includes(dirent.name))
      .map(dirent => ({
        name: dirent.name,
        path: path.join(serverComponentsDir, dirent.name),
        type: 'serverComponent',
        priority: 'medium', // Default priority for server components
      }));
  }

  return folders;
}

/**
 * Gets all documentation files
 * @returns {Object} - Object with documentation files
 */
function getDocumentationFiles() {
  const docsDir = path.join(rootDir, 'docs');
  const docs = {
    markdown: [],
    html: [],
  };

  // Find all Markdown files
  const markdownFiles = execSync(`find ${docsDir} -name "*.md"`, { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(Boolean);

  docs.markdown = markdownFiles.map(file => ({
    path: file,
    name: path.basename(file, '.md'),
    directory: path.dirname(file),
    type: path.dirname(file).includes('api')
      ? 'api'
      : path.dirname(file).includes('features')
        ? 'feature'
        : path.dirname(file).includes('components')
          ? 'component'
          : 'other',
  }));

  // Find all HTML files
  const htmlFiles = execSync(`find ${docsDir} -name "*.html"`, { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(Boolean);

  docs.html = htmlFiles.map(file => ({
    path: file,
    name: path.basename(file, '.html'),
    directory: path.dirname(file),
    type: path.dirname(file).includes('api')
      ? 'api'
      : path.dirname(file).includes('features')
        ? 'feature'
        : path.dirname(file).includes('components')
          ? 'component'
          : 'other',
  }));

  return docs;
}

/**
 * Analyzes documentation coverage
 * @param {Object} codeFolders - Object with code folder paths
 * @param {Object} docFiles - Object with documentation files
 * @returns {Object} - Object with documentation coverage analysis
 */
function analyzeDocumentationCoverage(codeFolders, docFiles) {
  const coverage = {
    features: [],
    components: [],
    services: [],
    serverComponents: [],
  };

  // Analyze features
  for (const feature of codeFolders.features) {
    const featureName = feature.name;
    const featurePath = feature.path;

    // Check if the feature has documentation
    const hasReadme = fs.existsSync(path.join(featurePath, 'README.md'));
    const hasChangelog = fs.existsSync(path.join(featurePath, 'CHANGELOG.html'));
    const hasAiLessons = fs.existsSync(path.join(featurePath, 'AILESSONS.html'));
    const hasGlossary = fs.existsSync(path.join(featurePath, 'GLOSSARY.html'));
    const hasHtmlDoc = fs.existsSync(
      path.join(featurePath, `${featureName.toLowerCase().replace(/_/g, '-')}.html`)
    );

    // Check if there are Markdown docs for this feature
    const relatedMarkdownDocs = docFiles.markdown.filter(
      doc =>
        doc.name.toLowerCase() === featureName.toLowerCase() ||
        doc.name.toLowerCase().includes(featureName.toLowerCase())
    );

    coverage.features.push({
      name: featureName,
      path: featurePath,
      priority: feature.priority,
      hasReadme,
      hasChangelog,
      hasAiLessons,
      hasGlossary,
      hasHtmlDoc,
      relatedMarkdownDocs,
      completeness: calculateCompleteness(
        hasReadme,
        hasChangelog,
        hasAiLessons,
        hasGlossary,
        hasHtmlDoc
      ),
    });
  }

  // Analyze components
  for (const component of codeFolders.components) {
    const componentName = component.name;
    const componentPath = component.path;

    // Check if the component has documentation
    const hasReadme = fs.existsSync(path.join(componentPath, 'README.md'));
    const hasChangelog = fs.existsSync(path.join(componentPath, 'CHANGELOG.html'));
    const hasAiLessons = fs.existsSync(path.join(componentPath, 'AILESSONS.html'));
    const hasGlossary = fs.existsSync(path.join(componentPath, 'GLOSSARY.html'));
    const hasHtmlDoc = fs.existsSync(
      path.join(componentPath, `${componentName.toLowerCase().replace(/_/g, '-')}.html`)
    );

    // Check if there are Markdown docs for this component
    const relatedMarkdownDocs = docFiles.markdown.filter(
      doc =>
        doc.name.toLowerCase() === componentName.toLowerCase() ||
        doc.name.toLowerCase().includes(componentName.toLowerCase())
    );

    coverage.components.push({
      name: componentName,
      path: componentPath,
      priority: component.priority,
      hasReadme,
      hasChangelog,
      hasAiLessons,
      hasGlossary,
      hasHtmlDoc,
      relatedMarkdownDocs,
      completeness: calculateCompleteness(
        hasReadme,
        hasChangelog,
        hasAiLessons,
        hasGlossary,
        hasHtmlDoc
      ),
    });
  }

  // Similar analysis for services and server components...

  return coverage;
}

/**
 * Calculates documentation completeness
 * @param {boolean} hasReadme - Whether the folder has a README.md file
 * @param {boolean} hasChangelog - Whether the folder has a CHANGELOG.html file
 * @param {boolean} hasAiLessons - Whether the folder has an AILESSONS.html file
 * @param {boolean} hasGlossary - Whether the folder has a GLOSSARY.html file
 * @param {boolean} hasHtmlDoc - Whether the folder has an HTML documentation file
 * @returns {number} - Completeness percentage (0-100)
 */
function calculateCompleteness(hasReadme, hasChangelog, hasAiLessons, hasGlossary, hasHtmlDoc) {
  let score = 0;
  let total = 5;

  if (hasReadme) score++;
  if (hasChangelog) score++;
  if (hasAiLessons) score++;
  if (hasGlossary) score++;
  if (hasHtmlDoc) score++;

  return Math.round((score / total) * 100);
}

/**
 * Prioritizes documentation migration
 * @param {Object} coverage - Object with documentation coverage analysis
 * @param {string} priorityLevel - Priority level to process
 * @returns {Array} - Array of items to process
 */
function prioritizeMigration(coverage, priorityLevel) {
  const allItems = [
    ...coverage.features,
    ...coverage.components,
    ...coverage.services,
    ...coverage.serverComponents,
  ];

  // Filter by priority if specified
  const filteredItems =
    priorityLevel === 'all' ? allItems : allItems.filter(item => item.priority === priorityLevel);

  // Sort by completeness (ascending) and priority
  return filteredItems.sort((a, b) => {
    // First sort by completeness (less complete first)
    if (a.completeness !== b.completeness) {
      return a.completeness - b.completeness;
    }

    // Then by priority (high, medium, low)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Processes documentation migration for an item
 * @param {Object} item - The item to process
 * @returns {Promise<boolean>} - Whether the migration was successful
 */
async function processMigration(item) {
  return new Promise((resolve, reject) => {
    console.log(
      `\nProcessing ${item.name} (${item.priority} priority, ${item.completeness}% complete)...`
    );

    // Skip if already complete
    if (item.completeness === 100) {
      console.log(`${item.name} documentation is already complete.`);
      return resolve(true);
    }

    // Create missing files
    if (!item.hasChangelog) {
      console.log(`Creating CHANGELOG.html for ${item.name}...`);
      if (!dryRun) {
        const changelogContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Changelog: ${item.name} - Date Night App</title>
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
          <li><a href="index.html">${item.name} Index</a></li>
        </ul>
      </nav>
    </div>
  </header>
  
  <main class="container">
    <div class="page-content">
      <aside class="sidebar">
        <h3>${item.name}</h3>
        <ul>
          <li><a href="./CHANGELOG.html">Changelog</a></li>
          <li><a href="./AILESSONS.html">AI Lessons</a></li>
          <li><a href="./GLOSSARY.html">Glossary</a></li>
        </ul>
      </aside>
      
      <article class="content">
        <h1>Changelog: ${item.name}</h1>
        
        <p>This file tracks changes to the ${item.name} component/feature.</p>
        
        <h2>Unreleased</h2>
        <ul>
          <li>Initial documentation setup</li>
        </ul>
      </article>
    </div>
  </main>
</body>
</html>`;

        fs.writeFileSync(path.join(item.path, 'CHANGELOG.html'), changelogContent);
      } else {
        logVerbose(`[DRY RUN] Would create CHANGELOG.html for ${item.name}`);
      }
    }

    if (!item.hasAiLessons) {
      console.log(`Creating AILESSONS.html for ${item.name}...`);
      if (!dryRun) {
        const aiLessonsContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Lessons: ${item.name} - Date Night App</title>
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
          <li><a href="index.html">${item.name} Index</a></li>
        </ul>
      </nav>
    </div>
  </header>
  
  <main class="container">
    <div class="page-content">
      <aside class="sidebar">
        <h3>${item.name}</h3>
        <ul>
          <li><a href="./CHANGELOG.html">Changelog</a></li>
          <li><a href="./AILESSONS.html">AI Lessons</a></li>
          <li><a href="./GLOSSARY.html">Glossary</a></li>
        </ul>
      </aside>
      
      <article class="content">
        <h1>AI Lessons: ${item.name}</h1>
        
        <p>This file documents lessons learned during AI-assisted development of the ${item.name} component/feature.</p>
        
        <h2>Design Patterns</h2>
        <p>Document design patterns used in this component/feature.</p>
        
        <h2>Performance Considerations</h2>
        <p>Document performance considerations for this component/feature.</p>
        
        <h2>Testing Insights</h2>
        <p>Document testing insights for this component/feature.</p>
        
        <h2>Accessibility Considerations</h2>
        <p>Document accessibility considerations for this component/feature.</p>
      </article>
    </div>
  </main>
</body>
</html>`;

        fs.writeFileSync(path.join(item.path, 'AILESSONS.html'), aiLessonsContent);
      } else {
        logVerbose(`[DRY RUN] Would create AILESSONS.html for ${item.name}`);
      }
    }

    // Run the enhanced migration script
    console.log(`Running enhanced migration for ${item.name}...`);

    if (!dryRun) {
      const args = ['scripts/enhanced_doc_migration.js', '--feature', item.name];
      if (verbose) args.push('--verbose');

      const child = spawn('node', args, {
        stdio: 'inherit',
        cwd: rootDir,
      });

      child.on('close', code => {
        if (code === 0) {
          console.log(`Successfully migrated documentation for ${item.name}`);
          resolve(true);
        } else {
          console.error(`Failed to migrate documentation for ${item.name}`);
          resolve(false);
        }
      });

      child.on('error', error => {
        console.error(`Error running migration for ${item.name}:`, error);
        resolve(false);
      });
    } else {
      logVerbose(`[DRY RUN] Would run enhanced migration for ${item.name}`);
      resolve(true);
    }
  });
}

/**
 * Processes documentation migration in batches
 * @param {Array} items - Array of items to process
 * @param {number} batchSize - Number of items to process in each batch
 * @returns {Promise<void>} - Promise that resolves when all batches are processed
 */
async function processBatches(items, batchSize = 5) {
  const totalItems = items.length;
  const batches = Math.ceil(totalItems / batchSize);

  console.log(`Processing ${totalItems} items in ${batches} batches of ${batchSize}...`);

  for (let i = 0; i < batches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, totalItems);
    const batch = items.slice(start, end);

    console.log(`\nProcessing batch ${i + 1} of ${batches} (items ${start + 1}-${end})...`);

    // Process items in parallel
    const results = await Promise.all(batch.map(item => processMigration(item)));

    const successful = results.filter(Boolean).length;
    console.log(`Batch ${i + 1} complete: ${successful}/${batch.length} successful`);

    // Continue to the next batch automatically
    if (i < batches - 1) {
      console.log(`Continuing to batch ${i + 2}...`);
    }
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('Batch Documentation Migration');
    console.log('============================');
    console.log(`Priority: ${priorityArg}`);
    console.log(`Dry run: ${dryRun ? 'Yes' : 'No'}`);
    console.log(`Verbose: ${verbose ? 'Yes' : 'No'}`);
    console.log('');

    // Get code folders
    console.log('Getting code folders...');
    const codeFolders = getCodeFolders();

    // Get documentation files
    console.log('Getting documentation files...');
    const docFiles = getDocumentationFiles();

    // Analyze documentation coverage
    console.log('Analyzing documentation coverage...');
    const coverage = analyzeDocumentationCoverage(codeFolders, docFiles);

    // Prioritize migration
    console.log('Prioritizing migration...');
    const prioritizedItems = prioritizeMigration(coverage, priorityArg);

    // Print summary
    console.log('\nDocumentation Coverage Summary:');
    console.log(`Features: ${coverage.features.length} total`);
    console.log(`  Complete: ${coverage.features.filter(f => f.completeness === 100).length}`);
    console.log(
      `  Partial: ${coverage.features.filter(f => f.completeness > 0 && f.completeness < 100).length}`
    );
    console.log(`  Missing: ${coverage.features.filter(f => f.completeness === 0).length}`);

    console.log(`Components: ${coverage.components.length} total`);
    console.log(`  Complete: ${coverage.components.filter(c => c.completeness === 100).length}`);
    console.log(
      `  Partial: ${coverage.components.filter(c => c.completeness > 0 && c.completeness < 100).length}`
    );
    console.log(`  Missing: ${coverage.components.filter(c => c.completeness === 0).length}`);

    console.log(`Services: ${coverage.services.length} total`);
    console.log(`  Complete: ${coverage.services.filter(s => s.completeness === 100).length}`);
    console.log(
      `  Partial: ${coverage.services.filter(s => s.completeness > 0 && s.completeness < 100).length}`
    );
    console.log(`  Missing: ${coverage.services.filter(s => s.completeness === 0).length}`);

    console.log(`Server Components: ${coverage.serverComponents.length} total`);
    console.log(
      `  Complete: ${coverage.serverComponents.filter(s => s.completeness === 100).length}`
    );
    console.log(
      `  Partial: ${coverage.serverComponents.filter(s => s.completeness > 0 && s.completeness < 100).length}`
    );
    console.log(`  Missing: ${coverage.serverComponents.filter(s => s.completeness === 0).length}`);

    console.log(`\nPrioritized ${prioritizedItems.length} items for migration.`);

    // Process batches
    if (prioritizedItems.length > 0) {
      console.log(`Starting batch processing for ${prioritizedItems.length} items...`);
      await processBatches(prioritizedItems);
    } else {
      console.log('No items to process.');
    }

    console.log('\nBatch documentation migration completed.');
  } catch (error) {
    console.error('Error in batch documentation migration:', error);
    process.exit(1);
  }
}

// Execute the script
main();
