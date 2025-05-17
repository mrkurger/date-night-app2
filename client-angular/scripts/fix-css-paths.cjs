#!/usr/bin/env node
// @ts-check

/**
 * This script fixes CSS path issues in the Angular client
 * It creates placeholder CSS files for eva-icons and nebular themes
 * to prevent compilation errors
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the project root directory
const projectRoot = path.resolve(__dirname, '..');
const nodeModulesDir = path.join(projectRoot, 'node_modules');

// Create directories if they don't exist
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Create a placeholder CSS file
function createPlaceholderCssFile(filePath, content = '') {
  ensureDirectoryExists(path.dirname(filePath));

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`Created placeholder CSS file: ${filePath}`);
  } else {
    console.log(`CSS file already exists: ${filePath}`);
  }
}

// Create Eva Icons CSS placeholder
const evaIconsDir = path.join(nodeModulesDir, 'eva-icons', 'style');
const evaIconsCssPath = path.join(evaIconsDir, 'eva-icons.css');

// Create Nebular theme CSS placeholders
const nebularThemeDir = path.join(nodeModulesDir, '@nebular', 'theme', 'styles', 'prebuilt');
const nebularDefaultCssPath = path.join(nebularThemeDir, 'default.css');
const nebularDarkCssPath = path.join(nebularThemeDir, 'dark.css');
const nebularCosmicCssPath = path.join(nebularThemeDir, 'cosmic.css');
const nebularCorporateCssPath = path.join(nebularThemeDir, 'corporate.css');

// Create placeholder files
createPlaceholderCssFile(evaIconsCssPath, '/* Eva Icons CSS Placeholder */');
createPlaceholderCssFile(nebularDefaultCssPath, '/* Nebular Default Theme CSS Placeholder */');
createPlaceholderCssFile(nebularDarkCssPath, '/* Nebular Dark Theme CSS Placeholder */');
createPlaceholderCssFile(nebularCosmicCssPath, '/* Nebular Cosmic Theme CSS Placeholder */');
createPlaceholderCssFile(nebularCorporateCssPath, '/* Nebular Corporate Theme CSS Placeholder */');

// Update styles.scss to use CDN for Eva Icons
const stylesPath = path.join(projectRoot, 'src', 'styles.scss');

if (fs.existsSync(stylesPath)) {
  let stylesContent = fs.readFileSync(stylesPath, 'utf8');

  // Replace local Eva Icons import with CDN import
  if (stylesContent.includes("@import './node_modules/eva-icons/style/eva-icons.css';")) {
    stylesContent = stylesContent.replace(
      "@import './node_modules/eva-icons/style/eva-icons.css';",
      '/* Eva Icons from CDN */',
    );

    // Add CDN import to index.html
    const indexPath = path.join(projectRoot, 'src', 'index.html');
    if (fs.existsSync(indexPath)) {
      let indexContent = fs.readFileSync(indexPath, 'utf8');

      if (!indexContent.includes('https://unpkg.com/eva-icons')) {
        indexContent = indexContent.replace(
          '</head>',
          '  <link rel="stylesheet" href="https://unpkg.com/eva-icons@1.1.3/style/eva-icons.css">\n</head>',
        );

        fs.writeFileSync(indexPath, indexContent);
        console.log('Added Eva Icons CDN to index.html');
      }
    }

    fs.writeFileSync(stylesPath, stylesContent);
    console.log('Updated styles.scss to use Eva Icons from CDN');
  }
}

console.log('CSS path fixes completed successfully!');
