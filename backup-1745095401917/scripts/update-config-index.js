#!/usr/bin/env node

/**
 * Configuration Index Generator
 *
 * This script scans the project for configuration files and generates
 * a comprehensive index in docs/CONFIG_INDEX.MD.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const CONFIG_INDEX_FILE = path.join(ROOT_DIR, 'docs', 'CONFIG_INDEX.MD');
const EXCLUDED_DIRS = ['node_modules', '.git', 'dist', 'coverage', 'tmp'];

// Configuration file patterns to look for
const CONFIG_PATTERNS = [
  // JavaScript/TypeScript configuration
  '.eslintrc.js',
  '.eslintrc.json',
  '.eslintrc',
  '.eslintignore',
  'tsconfig.json',
  'tsconfig.*.json',
  'babel.config.js',
  '.babelrc',
  '.babelrc.js',
  'jest.config.js',
  'jest.setup.js',

  // Package management
  'package.json',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  '.npmrc',
  '.yarnrc',
  '.nvmrc',

  // Build tools
  'angular.json',
  'nx.json',
  'webpack.config.js',
  'rollup.config.js',
  'vite.config.js',
  'gulpfile.js',
  'gruntfile.js',

  // CI/CD
  '.github/workflows/*.yml',
  '.gitlab-ci.yml',
  '.travis.yml',
  '.circleci/config.yml',
  'Jenkinsfile',
  'azure-pipelines.yml',

  // Docker
  'Dockerfile',
  'docker-compose.yml',
  '.dockerignore',

  // Environment
  '.env.example',
  '.env.template',
  '.env.sample',

  // Editor
  '.editorconfig',
  '.vscode/settings.json',
  '.vscode/launch.json',
  '.idea/*.xml',
  '.idea/*.iml',

  // Git
  '.gitignore',
  '.gitattributes',
  '.github/CODEOWNERS',

  // Linting and formatting
  '.prettierrc',
  '.prettierrc.js',
  '.prettierignore',
  '.stylelintrc',
  '.stylelintrc.js',

  // Testing
  'cypress.json',
  'cypress.config.js',
  'playwright.config.js',

  // Miscellaneous
  'browserslist',
  '.browserslistrc',
  'postcss.config.js',
  'tailwind.config.js',
  '.commitlintrc.js',
  'renovate.json',
];

// Helper function to find configuration files
function findConfigFiles() {
  const configFiles = [];

  // Use find command for more efficient file discovery
  try {
    const findCommand = `find ${ROOT_DIR} -type f \\( ${CONFIG_PATTERNS.map(pattern => {
      // Handle glob patterns
      if (pattern.includes('*')) {
        const dir = path.dirname(pattern);
        const base = path.basename(pattern);
        return `-path "${ROOT_DIR}/${dir}/*" -name "${base}"`;
      }
      return `-name "${pattern}"`;
    }).join(' -o ')} \\) ${EXCLUDED_DIRS.map(dir => `-not -path "*/${dir}/*"`).join(' ')}`;

    const result = execSync(findCommand, { encoding: 'utf8' });
    const files = result.trim().split('\n').filter(Boolean);

    files.forEach(file => {
      configFiles.push({
        path: file,
        relativePath: file.replace(ROOT_DIR + '/', ''),
        name: path.basename(file),
        type: getConfigType(file),
      });
    });
  } catch (error) {
    console.error('Error finding configuration files:', error.message);

    // Fallback to manual directory traversal if find command fails
    console.log('Falling back to manual directory traversal...');
    manualFindConfigFiles(ROOT_DIR, configFiles);
  }

  return configFiles;
}

// Fallback function for manual directory traversal
function manualFindConfigFiles(dir, configFiles = []) {
  if (EXCLUDED_DIRS.includes(path.basename(dir))) {
    return configFiles;
  }

  try {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);

      try {
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          manualFindConfigFiles(filePath, configFiles);
        } else {
          // Check if the file matches any of our patterns
          const relativePath = filePath.replace(ROOT_DIR + '/', '');

          for (const pattern of CONFIG_PATTERNS) {
            if (pattern.includes('*')) {
              // Handle glob patterns
              const patternDir = path.dirname(pattern);
              const patternBase = path.basename(pattern);
              const fileDir = path.dirname(relativePath);

              if (
                fileDir.startsWith(patternDir.replace('*', '')) &&
                minimatch(path.basename(file), patternBase)
              ) {
                configFiles.push({
                  path: filePath,
                  relativePath,
                  name: file,
                  type: getConfigType(filePath),
                });
                break;
              }
            } else if (file === pattern || relativePath === pattern) {
              configFiles.push({
                path: filePath,
                relativePath,
                name: file,
                type: getConfigType(filePath),
              });
              break;
            }
          }
        }
      } catch (error) {
        console.warn(`Warning: Could not access ${filePath}: ${error.message}`);
      }
    });
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dir}: ${error.message}`);
  }

  return configFiles;
}

// Simple minimatch-like function for basic glob matching
function minimatch(string, pattern) {
  if (pattern === '*') return true;

  if (pattern.startsWith('*') && pattern.endsWith('*')) {
    return string.includes(pattern.slice(1, -1));
  } else if (pattern.startsWith('*')) {
    return string.endsWith(pattern.slice(1));
  } else if (pattern.endsWith('*')) {
    return string.startsWith(pattern.slice(0, -1));
  }

  return string === pattern;
}

// Determine the type of configuration file
function getConfigType(filePath) {
  const fileName = path.basename(filePath);
  const ext = path.extname(filePath);

  if (fileName.includes('eslint')) return 'Linting';
  if (fileName.includes('prettier')) return 'Formatting';
  if (fileName.includes('tsconfig')) return 'TypeScript';
  if (fileName.includes('babel')) return 'Transpilation';
  if (fileName.includes('jest') || fileName.includes('cypress') || fileName.includes('playwright'))
    return 'Testing';
  if (fileName === 'package.json' || fileName === 'package-lock.json' || fileName === 'yarn.lock')
    return 'Package Management';
  if (fileName === 'angular.json') return 'Angular Configuration';
  if (fileName.includes('webpack') || fileName.includes('rollup') || fileName.includes('vite'))
    return 'Build Tools';
  if (fileName.includes('docker')) return 'Docker';
  if (fileName.includes('.env')) return 'Environment';
  if (fileName.includes('.git') || fileName === '.gitignore' || fileName === '.gitattributes')
    return 'Git';
  if (fileName.includes('.vscode') || fileName.includes('.idea') || fileName === '.editorconfig')
    return 'Editor';
  if (filePath.includes('.github/workflows') || fileName.includes('ci')) return 'CI/CD';

  return 'Other';
}

// Generate the configuration index markdown
function generateConfigIndex(configFiles) {
  // Group files by type
  const filesByType = {};
  configFiles.forEach(file => {
    if (!filesByType[file.type]) {
      filesByType[file.type] = [];
    }
    filesByType[file.type].push(file);
  });

  let markdown = `# Configuration Files Index\n\n`;
  markdown += `This document provides a comprehensive index of all configuration files in the DateNight.io project.\n\n`;
  markdown += `*Last updated: ${new Date().toISOString().split('T')[0]}*\n\n`;

  // Table of contents
  markdown += `## Table of Contents\n\n`;
  Object.keys(filesByType)
    .sort()
    .forEach(type => {
      markdown += `- [${type}](#${type.toLowerCase().replace(/\s+/g, '-')})\n`;
    });
  markdown += `\n`;

  // File listings by type
  Object.keys(filesByType)
    .sort()
    .forEach(type => {
      markdown += `## ${type}\n\n`;

      // Create a table for each type
      markdown += `| File | Description | Location |\n`;
      markdown += `| ---- | ----------- | -------- |\n`;

      filesByType[type]
        .sort((a, b) => a.relativePath.localeCompare(b.relativePath))
        .forEach(file => {
          const description = getFileDescription(file);
          markdown += `| \`${file.name}\` | ${description} | \`${file.relativePath}\` |\n`;
        });

      markdown += `\n`;
    });

  return markdown;
}

// Get a description for each file type
function getFileDescription(file) {
  const fileName = file.name;

  // Common configuration files
  const descriptions = {
    '.eslintrc.js': 'ESLint configuration for JavaScript/TypeScript linting',
    '.eslintrc.json': 'ESLint configuration for JavaScript/TypeScript linting',
    '.eslintignore': 'Files to be ignored by ESLint',
    'tsconfig.json': 'TypeScript compiler configuration',
    'babel.config.js': 'Babel configuration for JavaScript transpilation',
    '.babelrc': 'Babel configuration for JavaScript transpilation',
    'jest.config.js': 'Jest testing framework configuration',
    'package.json': 'NPM package definition and scripts',
    'package-lock.json': 'NPM dependency lock file',
    'yarn.lock': 'Yarn dependency lock file',
    '.npmrc': 'NPM configuration',
    '.yarnrc': 'Yarn configuration',
    '.nvmrc': 'Node.js version specification',
    'angular.json': 'Angular CLI configuration',
    'webpack.config.js': 'Webpack bundler configuration',
    'rollup.config.js': 'Rollup bundler configuration',
    'vite.config.js': 'Vite build tool configuration',
    Dockerfile: 'Docker container definition',
    'docker-compose.yml': 'Docker Compose services configuration',
    '.dockerignore': 'Files to be ignored by Docker',
    '.env.example': 'Example environment variables',
    '.editorconfig': 'Editor configuration for consistent coding styles',
    '.gitignore': 'Files to be ignored by Git',
    '.gitattributes': 'Git attributes configuration',
    '.prettierrc': 'Prettier code formatter configuration',
    '.prettierignore': 'Files to be ignored by Prettier',
    'cypress.json': 'Cypress end-to-end testing configuration',
    'playwright.config.js': 'Playwright end-to-end testing configuration',
    'tailwind.config.js': 'Tailwind CSS configuration',
    '.browserslistrc': 'Target browsers configuration',
  };

  // Return the description if it exists, otherwise provide a generic one
  if (descriptions[fileName]) {
    return descriptions[fileName];
  }

  // Generate descriptions for common patterns
  if (fileName.startsWith('tsconfig.') && fileName.endsWith('.json')) {
    const environment = fileName.replace('tsconfig.', '').replace('.json', '');
    return `TypeScript configuration for ${environment} environment`;
  }

  if (fileName.endsWith('.yml') && file.relativePath.includes('.github/workflows')) {
    return `GitHub Actions workflow for CI/CD`;
  }

  if (fileName.includes('.vscode')) {
    if (fileName === 'settings.json') return 'VS Code editor settings';
    if (fileName === 'launch.json') return 'VS Code debugger configuration';
    return 'VS Code editor configuration';
  }

  // Default description
  return `Configuration file for ${file.type.toLowerCase()}`;
}

// Main execution
function main() {
  console.log('Scanning for configuration files...');
  const configFiles = findConfigFiles();
  console.log(`Found ${configFiles.length} configuration files.`);

  console.log('Generating configuration index...');
  const markdown = generateConfigIndex(configFiles);

  console.log(`Writing to ${CONFIG_INDEX_FILE}...`);
  fs.writeFileSync(CONFIG_INDEX_FILE, markdown);

  console.log('Configuration index generated successfully!');
}

main();
