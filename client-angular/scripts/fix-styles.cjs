#!/usr/bin/env node
// @ts-check

/**
 * This script fixes styles.scss issues in the Angular client
 * It removes references to eva-icons.css and adds CSS variables for Nebular theme
 */

const fs = require('fs');
const path = require('path');

// Get the project root directory
const projectRoot = path.resolve(__dirname, '..');
const stylesPath = path.join(projectRoot, 'src', 'styles.scss');

// Read the styles.scss file
if (!fs.existsSync(stylesPath)) {
  console.error(`Styles file not found: ${stylesPath}`);
  process.exit(1);
}

let stylesContent = fs.readFileSync(stylesPath, 'utf8');

// Remove any reference to eva-icons.css
if (stylesContent.includes("@import './node_modules/eva-icons/style/eva-icons.css';")) {
  console.log('Removing eva-icons.css import...');
  stylesContent = stylesContent.replace(
    "@import './node_modules/eva-icons/style/eva-icons.css';",
    '/* Eva Icons are now loaded via CDN in index.html */',
  );
}

// Add CSS variables for Nebular theme if they don't exist
if (!stylesContent.includes(':root {')) {
  console.log('Adding CSS variables for Nebular theme...');

  const cssVariables = `
:root {
  --nb-theme-margin: 1rem;
  --nb-theme-margin-lg: 1.5rem;
  --nb-theme-margin-xs: 0.25rem;
  --nb-theme-spacing: 0.5rem;
  --nb-theme-form-field-spacing: 0.75rem;
  --nb-theme-card-margin-bottom: 1.5rem;
  --nb-theme-card-border-radius: 0.5rem;
  --nb-theme-card-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  --nb-theme-card-shadow-hover: 0 4px 8px rgba(0, 0, 0, 0.15);
  --nb-theme-transition-duration: 0.2s;
  --nb-theme-transition-timing-function: ease-in-out;
  --nb-theme-button-border-radius: 0.25rem;
  --nb-theme-button-padding: 0.5rem 1rem;
  --nb-theme-border-radius: 0.25rem;
  --nb-theme-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  --nb-theme-padding: 1rem;
  --color-danger-default: #ff3d71;
  --color-primary-default: #3366ff;
  --color-basic-600: #8f9bb3;
}
`;

  // Add the CSS variables after the imports
  const lastImportIndex = stylesContent.lastIndexOf('@use');
  const lastImportEndIndex = stylesContent.indexOf(';', lastImportIndex) + 1;

  if (lastImportEndIndex > 0) {
    stylesContent =
      stylesContent.substring(0, lastImportEndIndex) +
      '\n' +
      cssVariables +
      stylesContent.substring(lastImportEndIndex);
  } else {
    // If no imports found, add at the beginning
    stylesContent = cssVariables + stylesContent;
  }
}

// Write the updated content back to the file
fs.writeFileSync(stylesPath, stylesContent);
console.log('styles.scss updated successfully!');
