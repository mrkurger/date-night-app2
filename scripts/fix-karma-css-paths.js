#!/usr/bin/env node

/**
 * This script fixes the CSS path resolution issues in Karma tests
 * by creating symbolic links to the required CSS files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const clientAngularDir = path.join(rootDir, 'client-angular');

// Create the node_modules directory structure in client-angular if it doesn't exist
const clientNodeModulesDir = path.join(clientAngularDir, 'node_modules');
if (!fs.existsSync(clientNodeModulesDir)) {
  fs.mkdirSync(clientNodeModulesDir, { recursive: true });
  console.log(`Created directory: ${clientNodeModulesDir}`);
}

// Create symbolic links for @nebular/theme
const nebularThemeDir = path.join(clientNodeModulesDir, '@nebular', 'theme');
const nebularThemeStylesDir = path.join(nebularThemeDir, 'styles');
const nebularThemePrebuiltDir = path.join(nebularThemeStylesDir, 'prebuilt');

// Create the directory structure
fs.mkdirSync(path.join(clientNodeModulesDir, '@nebular'), { recursive: true });
fs.mkdirSync(nebularThemeDir, { recursive: true });
fs.mkdirSync(nebularThemeStylesDir, { recursive: true });
fs.mkdirSync(nebularThemePrebuiltDir, { recursive: true });

// Create a symbolic link to the actual default.css file in the root node_modules
const defaultCssPath = path.join(nebularThemePrebuiltDir, 'default.css');
const actualDefaultCssPath = path.join(
  rootDir,
  'node_modules',
  '@nebular',
  'theme',
  'styles',
  'prebuilt',
  'default.css',
);

if (fs.existsSync(actualDefaultCssPath)) {
  try {
    // If the file already exists, remove it first
    if (fs.existsSync(defaultCssPath)) {
      fs.unlinkSync(defaultCssPath);
    }

    // Create a symbolic link to the actual CSS file
    fs.copyFileSync(actualDefaultCssPath, defaultCssPath);
    console.log(`Created copy of actual CSS file: ${defaultCssPath}`);
  } catch (error) {
    console.error(`Error creating symbolic link: ${error.message}`);

    // Fallback to creating a placeholder file
    const defaultCssContent = `
    /* This is a placeholder CSS file created by the fix-karma-css-paths.js script */
    /* It's used to prevent Karma test failures due to missing CSS files */
    `;
    fs.writeFileSync(defaultCssPath, defaultCssContent);
    console.log(`Created placeholder CSS file (fallback): ${defaultCssPath}`);
  }
} else {
  // If the actual CSS file doesn't exist, create a placeholder
  const defaultCssContent = `
  /* This is a placeholder CSS file created by the fix-karma-css-paths.js script */
  /* It's used to prevent Karma test failures due to missing CSS files */
  `;
  fs.writeFileSync(defaultCssPath, defaultCssContent);
  console.log(`Created placeholder CSS file (actual file not found): ${defaultCssPath}`);
}

// Create symbolic links for PrimeIcons
const primeIconsDir = path.join(clientNodeModulesDir, 'primeicons');

// Create the directory structure
fs.mkdirSync(primeIconsDir, { recursive: true });

// Create a symbolic link to the actual primeicons.css file in the root node_modules
const primeIconsCssPath = path.join(primeIconsDir, 'primeicons.css');
const actualPrimeIconsCssPath = path.join(
  rootDir,
  'node_modules',
  'primeicons',
  'primeicons.css',
);

if (fs.existsSync(actualPrimeIconsCssPath)) {
  try {
    // If the file already exists, remove it first
    if (fs.existsSync(primeIconsCssPath)) {
      fs.unlinkSync(primeIconsCssPath);
    }

    // Create a symbolic link to the actual CSS file
    fs.copyFileSync(actualPrimeIconsCssPath, primeIconsCssPath);
    console.log(`Created copy of actual CSS file: ${primeIconsCssPath}`);
  } catch (error) {
    console.error(`Error creating symbolic link: ${error.message}`);

    // Fallback to creating a placeholder file
    const primeIconsCssContent = `
    /* This is a placeholder CSS file created by the fix-karma-css-paths.js script */
    /* It's used to prevent Karma test failures due to missing CSS files */
    `;
    fs.writeFileSync(primeIconsCssPath, primeIconsCssContent);
    console.log(`Created placeholder CSS file (fallback): ${primeIconsCssPath}`);
  }
} else {
  // If the actual CSS file doesn't exist, create a placeholder
  const primeIconsCssContent = `
  /* This is a placeholder CSS file created by the fix-karma-css-paths.js script */
  /* It's used to prevent Karma test failures due to missing CSS files */
  `;
  fs.writeFileSync(primeIconsCssPath, primeIconsCssContent);
  console.log(`Created placeholder CSS file (actual file not found): ${primeIconsCssPath}`);
}

// Update the karma.conf.js file to use the correct paths
const karmaConfigPath = path.join(clientAngularDir, 'karma.conf.js');

if (fs.existsSync(karmaConfigPath)) {
  let karmaConfig = fs.readFileSync(karmaConfigPath, 'utf8');

  // Update the files section to include the CSS files
  if (!karmaConfig.includes('node_modules/@nebular/theme/styles/prebuilt/default.css')) {
    karmaConfig = karmaConfig.replace(
      /files: \[/,
      `files: [
      { pattern: 'node_modules/@nebular/theme/styles/prebuilt/default.css', included: true },
      { pattern: 'node_modules/primeicons/primeicons.css', included: true },`,
    );

    fs.writeFileSync(karmaConfigPath, karmaConfig);
    console.log(`Updated Karma config to include CSS files: ${karmaConfigPath}`);
  } else {
    console.log(`Karma config already includes CSS files: ${karmaConfigPath}`);
  }
} else {
  console.log(`Karma config not found: ${karmaConfigPath}`);

  // Create a basic karma.conf.js file
  const basicKarmaConfig = `
// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        // you can add configuration options for Jasmine here
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        // for example, you can disable the random execution with \`random: false\`
        // or set a specific seed with \`seed: 4321\`
      },
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' }
      ]
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true,
    files: [
      { pattern: 'node_modules/@nebular/theme/styles/prebuilt/default.css', included: true },
      { pattern: 'node_modules/primeicons/primeicons.css', included: true },
    ]
  });
};
`;

  fs.writeFileSync(karmaConfigPath, basicKarmaConfig);
  console.log(`Created basic Karma config with CSS files: ${karmaConfigPath}`);
}

console.log('CSS path fix completed successfully');
