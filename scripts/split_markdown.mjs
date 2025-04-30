#!/usr/bin/env node

/**
 * Split Markdown Script
 * 
 * This script splits large markdown files into smaller, more focused files.
 * It's designed to work with files like AILESSONS.MD and CHANGELOG.MD.
 * 
 * Usage:
 *   node split_markdown.mjs <source_file> <target_dir> <split_by> <index_title>
 * 
 * Example:
 *   node split_markdown.mjs /docs/AILESSONS.MD /docs/html-docs/lessons "## " "AI Lessons Learned"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length < 4) {
  console.error('Usage: node split_markdown.mjs <source_file> <target_dir> <split_by> <index_title>');
  process.exit(1);
}

const sourceFile = path.resolve(rootDir, args[0]);
const targetDir = path.resolve(rootDir, args[1]);
const splitBy = args[2];
const indexTitle = args[3];

// Ensure the source file exists
if (!fs.existsSync(sourceFile)) {
  console.error(`Source file not found: ${sourceFile}`);
  process.exit(1);
}

// Ensure the target directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

/**
 * Extracts the title from a markdown section
 * @param {string} section - The markdown section
 * @param {string} prefix - The heading prefix (e.g., "## ")
 * @returns {string} - The extracted title
 */
function extractTitle(section, prefix) {
  const titleMatch = section.match(new RegExp(`^${prefix.trim()}\\s*(.*)$`, 'm'));
  return titleMatch ? titleMatch[1].trim() : 'Untitled Section';
}

/**
 * Generates a filename from a title
 * @param {string} title - The title
 * @returns {string} - The generated filename
 */
function generateFilename(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') + '.md';
}

/**
 * Splits a markdown file into sections
 * @param {string} sourceFile - The source file path
 * @param {string} targetDir - The target directory path
 * @param {string} splitBy - The delimiter to split by
 * @param {string} indexTitle - The title for the index file
 */
function splitMarkdownFile(sourceFile, targetDir, splitBy, indexTitle) {
  console.log(`Splitting file: ${sourceFile}`);
  console.log(`Target directory: ${targetDir}`);
  console.log(`Split by: "${splitBy}"`);
  console.log(`Index title: "${indexTitle}"`);
  
  // Read the source file
  const sourceContent = fs.readFileSync(sourceFile, 'utf8');
  
  // Split the content by the specified delimiter
  const sections = sourceContent.split(new RegExp(`(?=${splitBy})`, 'g'));
  
  // Extract the main title and introduction
  const mainTitleMatch = sections[0].match(/^# (.*$)/m);
  const mainTitle = mainTitleMatch ? mainTitleMatch[1].trim() : indexTitle;
  const introduction = sections[0].replace(/^# .*$/m, '').trim();
  
  // Create an index file
  let indexContent = `# ${indexTitle}\n\n${introduction}\n\n## Contents\n\n`;
  
  // Process each section
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    
    // Extract the section title
    const sectionTitle = extractTitle(section, splitBy);
    const fileName = generateFilename(sectionTitle);
    
    // Add to the index
    indexContent += `- [${sectionTitle}](${fileName})\n`;
    
    // Write the section to a file
    const sectionContent = `# ${sectionTitle}\n\n${section.replace(new RegExp(`^${splitBy.trim()}\\s*.*$`, 'm'), '').trim()}\n\n[Back to Index](index.md)`;
    fs.writeFileSync(path.join(targetDir, fileName), sectionContent);
    
    console.log(`  Created section file: ${fileName}`);
  }
  
  // Write the index file
  fs.writeFileSync(path.join(targetDir, 'index.md'), indexContent);
  
  console.log(`  Created index file: index.md`);
  console.log(`Split complete. ${sections.length - 1} sections created.`);
}

// Execute the script
try {
  splitMarkdownFile(sourceFile, targetDir, splitBy, indexTitle);
} catch (error) {
  console.error('Error splitting markdown file:', error);
  process.exit(1);
}
</script>