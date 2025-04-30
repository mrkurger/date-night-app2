#!/usr/bin/env node

/**
 * Restructure All Documentation Script
 * 
 * This script executes all the steps needed to restructure the documentation
 * in the Date Night App repository to follow the HTML-based approach.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Configuration
const config = {
  // Files to split
  filesToSplit: [
    {
      source: 'docs/AILESSONS.MD',
      targetDir: 'docs/html-docs/lessons',
      splitBy: '## ',
      indexTitle: 'AI Lessons Learned'
    },
    {
      source: 'docs/CHANGELOG.MD',
      targetDir: 'docs/html-docs/changelog',
      splitBy: '## ',
      indexTitle: 'Change Log'
    }
  ],
  
  // Markdown files to convert to HTML
  filesToConvert: [
    {
      source: 'docs/ARCHITECTURE.MD',
      target: 'docs/html-docs/guides/architecture.html',
      section: 'Guides',
      sidebarLinks: 'setup.html:Setup,architecture.html:Architecture,contributing.html:Contributing'
    },
    {
      source: 'docs/SETUP.MD',
      target: 'docs/html-docs/guides/setup.html',
      section: 'Guides',
      sidebarLinks: 'setup.html:Setup,architecture.html:Architecture,contributing.html:Contributing'
    },
    {
      source: 'CONTRIBUTING.md',
      target: 'docs/html-docs/guides/contributing.html',
      section: 'Guides',
      sidebarLinks: 'setup.html:Setup,architecture.html:Architecture,contributing.html:Contributing'
    },
    {
      source: 'server/docs/api.md',
      target: 'docs/html-docs/api/endpoints.html',
      section: 'API',
      sidebarLinks: 'endpoints.html:API Endpoints,authentication.html:Authentication'
    },
    {
      source: 'server/docs/travel-module.md',
      target: 'docs/html-docs/api/travel-module.html',
      section: 'API',
      sidebarLinks: 'endpoints.html:API Endpoints,travel-module.html:Travel Module'
    }
  ]
};

/**
 * Executes a script with the given arguments
 * @param {string} script - The script to execute
 * @param {string[]} args - The arguments to pass to the script
 */
function executeScript(script, args) {
  const scriptPath = path.join(__dirname, script);
  const command = `node ${scriptPath} ${args.join(' ')}`;
  
  console.log(`Executing: ${command}`);
  
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error executing script ${script}:`, error);
    process.exit(1);
  }
}

/**
 * Main function to execute the script
 */
async function main() {
  try {
    console.log('Starting documentation restructuring...');
    
    // Step 1: Create HTML documentation structure
    console.log('\n=== Step 1: Creating HTML documentation structure ===\n');
    executeScript('create_html_docs_structure.mjs', []);
    
    // Step 2: Split large markdown files
    console.log('\n=== Step 2: Splitting large markdown files ===\n');
    for (const file of config.filesToSplit) {
      executeScript('split_markdown.mjs', [
        file.source,
        file.targetDir,
        `"${file.splitBy}"`,
        `"${file.indexTitle}"`
      ]);
    }
    
    // Step 3: Convert markdown files to HTML
    console.log('\n=== Step 3: Converting markdown files to HTML ===\n');
    for (const file of config.filesToConvert) {
      executeScript('convert_to_html.mjs', [
        file.source,
        file.target,
        `"${file.section}"`,
        `"${file.sidebarLinks}"`
      ]);
    }
    
    // Step 4: Create README with instructions
    console.log('\n=== Step 4: Creating README with instructions ===\n');
    
    const readmeContent = `# HTML Documentation

This directory contains the HTML-based documentation for the Date Night App project.

## Viewing the Documentation

You can view the documentation in two ways:

1. **On GitHub**: Browse the HTML files directly on GitHub
2. **As a Website**: Clone the repository and open the \`index.html\` file in your browser

## Directory Structure

- \`/templates/\`: HTML templates and CSS styles
- \`/components/\`: UI component documentation
- \`/server/\`: Server-side code documentation
- \`/features/\`: Feature documentation
- \`/guides/\`: Development and usage guides
- \`/api/\`: API documentation
- \`/lessons/\`: Lessons learned during development
- \`/changelog/\`: History of changes to the project

## Contributing to Documentation

When adding or updating documentation:

1. Use the appropriate template from the \`/templates/\` directory
2. Place the documentation in the appropriate section directory
3. Update any relevant index files
4. Test the documentation by viewing it in a browser

For more information, see the [Documentation Restructuring Plan](/docs/DOCUMENTATION_RESTRUCTURING_PLAN.MD).
`;
    
    fs.writeFileSync(path.join(rootDir, 'docs', 'html-docs', 'README.md'), readmeContent);
    
    console.log('Documentation restructuring completed successfully.');
    console.log('\nNext steps:');
    console.log('1. Review the generated HTML documentation');
    console.log('2. Continue migrating additional documentation');
    console.log('3. Update internal links to point to the new documentation structure');
    
  } catch (error) {
    console.error('Error restructuring documentation:', error);
    process.exit(1);
  }
}

// Execute the script
main();
</script>