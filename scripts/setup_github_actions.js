#!/usr/bin/env node

/**
 * Setup GitHub Actions Script
 *
 * This script sets up the GitHub Actions workflow for automatic documentation generation.
 * It creates the necessary workflow file and ensures the scripts are executable.
 *
 * Usage:
 *   node setup_github_actions.js [--dry-run]
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

  // GitHub Actions workflow file
  workflowFile: '.github/workflows/generate-docs.yml',

  // Scripts to make executable
  scripts: [
    'scripts/generate_docs.js',
    'scripts/markdown_to_html.js',
    'scripts/extract_functions.js',
    'scripts/implement_tooltips.js',
    'scripts/audit_documentation.js',
    'scripts/create_doc_structure.js',
    'scripts/migrate_markdown_to_html.js',
    'scripts/decentralize_docs.js',
  ],
};

/**
 * Creates the GitHub Actions workflow file
 */
function createWorkflowFile() {
  const workflowPath = path.join(config.rootDir, config.workflowFile);

  // Create the directory if it doesn't exist
  const workflowDir = path.dirname(workflowPath);
  if (!fs.existsSync(workflowDir)) {
    if (dryRun) {
      console.log(`Would create directory: ${workflowDir}`);
    } else {
      fs.mkdirSync(workflowDir, { recursive: true });
      console.log(`Created directory: ${workflowDir}`);
    }
  }

  // Create the workflow file
  const workflowContent = `name: Generate Documentation

on:
  push:
    branches: [ main ]
    paths:
      - 'client-angular/src/**/*.ts'
      - 'client-angular/src/**/*.js'
      - 'server/**/*.js'
      - 'docs/**/*.md'
      - 'scripts/generate_docs.js'
      - '.github/workflows/generate-docs.yml'
  pull_request:
    branches: [ main ]
    paths:
      - 'client-angular/src/**/*.ts'
      - 'client-angular/src/**/*.js'
      - 'server/**/*.js'
      - 'docs/**/*.md'
      - 'scripts/generate_docs.js'
      - '.github/workflows/generate-docs.yml'
  workflow_dispatch:

jobs:
  generate-docs:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Generate documentation
        run: node scripts/generate_docs.js --verbose
      
      - name: Commit changes
        if: github.event_name != 'pull_request'
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add .
          git diff --quiet && git diff --staged --quiet || git commit -m "Update documentation [skip ci]"
          git push
`;

  if (dryRun) {
    console.log(`Would create file: ${workflowPath}`);
    console.log('Content:');
    console.log(workflowContent);
  } else {
    fs.writeFileSync(workflowPath, workflowContent);
    console.log(`Created file: ${workflowPath}`);
  }
}

/**
 * Makes scripts executable
 */
function makeScriptsExecutable() {
  for (const script of config.scripts) {
    const scriptPath = path.join(config.rootDir, script);

    if (fs.existsSync(scriptPath)) {
      const command = `chmod +x "${scriptPath}"`;

      if (dryRun) {
        console.log(`Would execute: ${command}`);
      } else {
        try {
          execSync(command);
          console.log(`Made executable: ${scriptPath}`);
        } catch (error) {
          console.error(`Error making ${scriptPath} executable:`, error);
        }
      }
    } else {
      console.log(`Script not found: ${scriptPath}`);
    }
  }
}

/**
 * Main function to execute the script
 */
async function main() {
  try {
    console.log('Setting up GitHub Actions workflow...');

    if (dryRun) {
      console.log('Dry run mode - no files will be created or modified');
    }

    // Create the workflow file
    createWorkflowFile();

    // Make scripts executable
    makeScriptsExecutable();

    console.log('\nGitHub Actions workflow setup completed successfully.');
    console.log('\nNext steps:');
    console.log('1. Commit and push the changes to GitHub');
    console.log('2. Verify that the workflow runs successfully');
    console.log('3. Check the generated documentation');
  } catch (error) {
    console.error('Error setting up GitHub Actions workflow:', error);
    process.exit(1);
  }
}

// Execute the script
main();
