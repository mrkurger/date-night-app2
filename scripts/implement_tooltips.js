#!/usr/bin/env node

/**
 * Tooltip Implementation Script
 *
 * This script adds tooltips to function/method references in HTML documentation.
 * It scans HTML files for function/method names and adds tooltip markup.
 *
 * Usage:
 *   node implement_tooltips.js <html_file> <glossary_file>
 *
 * Example:
 *   node implement_tooltips.js /client-angular/src/app/features/chat/AILESSONS.html /client-angular/src/app/features/chat/GLOSSARY.html
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node implement_tooltips.js <html_file> <glossary_file>');
  process.exit(1);
}

const htmlFile = path.resolve(args[0]);
const glossaryFile = path.resolve(args[1]);

// Ensure the files exist
if (!fs.existsSync(htmlFile)) {
  console.error(`HTML file not found: ${htmlFile}`);
  process.exit(1);
}

if (!fs.existsSync(glossaryFile)) {
  console.error(`Glossary file not found: ${glossaryFile}`);
  process.exit(1);
}

/**
 * Extracts function/method names and descriptions from a glossary file
 * @param {string} glossaryFile - Path to the glossary file
 * @returns {Object} - Map of function/method names to descriptions
 */
function extractGlossaryEntries(glossaryFile) {
  const content = fs.readFileSync(glossaryFile, 'utf8');
  const entries = {};

  // Extract glossary entries
  const entryRegex =
    /<div class="glossary-entry" id="([^"]+)">[^<]*<h3>([^<]+)<\/h3>[^<]*<p class="entry-meta">[^<]*<\/p>[^<]*<div class="entry-description">[^<]*<p>([^<]+)<\/p>/g;

  let match;
  while ((match = entryRegex.exec(content)) !== null) {
    const id = match[1];
    const name = match[2];
    const description = match[3];

    entries[name] = {
      id,
      description,
    };
  }

  return entries;
}

/**
 * Adds tooltips to function/method references in HTML content
 * @param {string} content - The HTML content
 * @param {Object} entries - Map of function/method names to descriptions
 * @returns {string} - The HTML content with tooltips
 */
function addTooltips(content, entries) {
  let result = content;

  // Add tooltips to function/method references
  for (const name in entries) {
    const { id, description } = entries[name];

    // Create a regular expression to match the function/method name
    // but not inside HTML tags or existing tooltips
    const regex = new RegExp(`(?<!<[^>]*|class="tooltip">)\\b(${name})\\b(?![^<]*>|</span>)`, 'g');

    // Replace with tooltip markup
    result = result.replace(
      regex,
      `<span class="tooltip">$1<span class="tooltip-text">${description}</span></span>`
    );
  }

  return result;
}

/**
 * Main function to execute the script
 */
async function main() {
  try {
    console.log(`Processing file: ${htmlFile}`);

    // Extract glossary entries
    const entries = extractGlossaryEntries(glossaryFile);
    console.log(`Extracted ${Object.keys(entries).length} glossary entries`);

    // Read the HTML file
    const content = fs.readFileSync(htmlFile, 'utf8');

    // Add tooltips
    const updatedContent = addTooltips(content, entries);

    // Write the updated HTML file
    fs.writeFileSync(htmlFile, updatedContent);
    console.log(`Added tooltips to ${htmlFile}`);
  } catch (error) {
    console.error('Error implementing tooltips:', error);
    process.exit(1);
  }
}

// Execute the script
main();
