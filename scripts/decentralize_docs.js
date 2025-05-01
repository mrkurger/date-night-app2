#!/usr/bin/env node

/**
 * Documentation Decentralization Master Script
 *
 * This script orchestrates the entire documentation decentralization process.
 * It runs all the necessary scripts in the correct order.
 *
 * Usage:
 *   node decentralize_docs.js [--phase <phase_number>] [--dry-run]
 *
 * Example:
 *   node decentralize_docs.js --phase 1
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
let phase = null;

// Check for phase
const phaseIndex = args.indexOf('--phase');
if (phaseIndex !== -1 && args.length > phaseIndex + 1) {
  phase = parseInt(args[phaseIndex + 1]);
}

// Configuration
const config = {
  // Root directory of the repository
  rootDir: path.resolve(__dirname, '..'),

  // Phases of the decentralization process
  phases: [
    {
      name: 'Audit and Planning',
      scripts: [
        {
          name: 'Audit Documentation',
          command: 'node scripts/audit_documentation.js --output docs/DOCUMENTATION_AUDIT.md',
        },
      ],
    },
    {
      name: 'Infrastructure Setup',
      scripts: [
        {
          name: 'Create Documentation Structure',
          command: 'node scripts/create_doc_structure.js',
        },
      ],
    },
    {
      name: 'Content Migration',
      scripts: [
        {
          name: 'Migrate Markdown to HTML',
          command: 'node scripts/migrate_markdown_to_html.js',
        },
      ],
    },
    {
      name: 'Glossary Implementation',
      scripts: [
        {
          name: 'Generate Glossaries',
          command: 'node scripts/generate_docs.js --update-only',
        },
      ],
    },
    {
      name: 'Integration and Finalization',
      scripts: [
        {
          name: 'Generate Documentation',
          command: 'node scripts/generate_docs.js',
        },
      ],
    },
  ],
};

/**
 * Executes a command
 * @param {string} command - The command to execute
 * @param {string} name - The name of the script
 */
function executeCommand(command, name) {
  console.log(`\nExecuting ${name}...`);

  if (dryRun) {
    console.log(`Would execute: ${command}`);
  } else {
    try {
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      console.error(`Error executing ${name}:`, error);
      process.exit(1);
    }
  }
}

/**
 * Main function to execute the script
 */
async function main() {
  try {
    console.log('Starting Documentation Decentralization Process...');

    if (dryRun) {
      console.log('Dry run mode - commands will be displayed but not executed');
    }

    // Execute all phases or just the specified one
    if (phase !== null) {
      if (phase < 1 || phase > config.phases.length) {
        console.error(
          `Invalid phase number: ${phase}. Valid phases are 1-${config.phases.length}.`
        );
        process.exit(1);
      }

      const phaseConfig = config.phases[phase - 1];
      console.log(`\n=== Phase ${phase}: ${phaseConfig.name} ===\n`);

      for (const script of phaseConfig.scripts) {
        executeCommand(script.command, script.name);
      }
    } else {
      // Execute all phases
      for (let i = 0; i < config.phases.length; i++) {
        const phaseConfig = config.phases[i];
        console.log(`\n=== Phase ${i + 1}: ${phaseConfig.name} ===\n`);

        for (const script of phaseConfig.scripts) {
          executeCommand(script.command, script.name);
        }
      }
    }

    console.log('\nDocumentation Decentralization Process completed successfully.');
  } catch (error) {
    console.error('Error in Documentation Decentralization Process:', error);
    process.exit(1);
  }
}

// Execute the script
main();
