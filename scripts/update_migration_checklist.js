#!/usr/bin/env node

/**
 * Update Migration Checklist
 *
 * This script updates the documentation migration checklist with the status of migrated files.
 *
 * Usage:
 *   node update_migration_checklist.js <markdown-file> <html-file> <status>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  rootDir: path.resolve(__dirname, '..'),
  checklistFile: 'DOCUMENTATION_MIGRATION_PLAN.html',
};

// Command line arguments
const args = process.argv.slice(2);
const markdownFile = args[0];
const htmlFile = args[1];
const status = args[2] || 'Completed';

if (!markdownFile || !htmlFile) {
  console.log(`
Update Migration Checklist

Usage:
  node update_migration_checklist.js <markdown-file> <html-file> <status>
  `);
  process.exit(1);
}

/**
 * Updates the migration checklist with a new file mapping
 * @param {string} markdownFile - The Markdown file path
 * @param {string} htmlFile - The HTML file path
 * @param {string} status - The migration status
 */
function updateChecklist(markdownFile, htmlFile, status) {
  const checklistPath = path.join(config.rootDir, config.checklistFile);

  if (!fs.existsSync(checklistPath)) {
    console.error(`Checklist file does not exist: ${checklistPath}`);
    process.exit(1);
  }

  let content = fs.readFileSync(checklistPath, 'utf8');

  // Find the table body
  const tableBodyRegex = /<tbody>([\s\S]*?)<\/tbody>/;
  const tableBodyMatch = content.match(tableBodyRegex);

  if (!tableBodyMatch) {
    console.error('Could not find table body in checklist file');
    process.exit(1);
  }

  // Check if the mapping already exists
  const existingEntryRegex = new RegExp(
    `<td><code>${markdownFile.replace(/\//g, '\\/')}</code></td>`
  );
  if (existingEntryRegex.test(content)) {
    console.log(`Mapping for ${markdownFile} already exists in checklist`);
    return;
  }

  // Create a new table row
  const newRow = `
          <tr>
            <td><code>${markdownFile}</code></td>
            <td><code>${htmlFile}</code></td>
            <td>${status}</td>
          </tr>`;

  // Add the new row to the table
  const newTableBody = `<tbody>${tableBodyMatch[1]}${newRow}
        </tbody>`;

  // Update the content
  content = content.replace(tableBodyRegex, newTableBody);

  // Update the progress bar
  const progressRegex = /<div class="progress" style="width: (\d+)%">(\d+)%<\/div>/;
  const progressMatch = content.match(progressRegex);

  if (progressMatch) {
    // Count the number of completed items
    const completedRegex = /<td>Completed<\/td>/g;
    const completedMatches = content.match(completedRegex) || [];
    const completedCount = completedMatches.length + (status === 'Completed' ? 1 : 0);

    // Count the total number of items
    const totalRegex = /<tr>\s*<td><code>/g;
    const totalMatches = content.match(totalRegex) || [];
    const totalCount = totalMatches.length + 1; // +1 for the new row

    // Calculate the progress percentage
    const progressPercent = Math.round((completedCount / totalCount) * 100);

    // Update the progress bar
    content = content.replace(
      progressRegex,
      `<div class="progress" style="width: ${progressPercent}%">${progressPercent}%</div>`
    );
  }

  // Write the updated content
  fs.writeFileSync(checklistPath, content);

  console.log(`Updated checklist with mapping: ${markdownFile} -> ${htmlFile} (${status})`);
}

// Run the script
updateChecklist(markdownFile, htmlFile, status);
