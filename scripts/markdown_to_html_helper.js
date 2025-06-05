#!/usr/bin/env node

/**
 * Markdown to HTML Helper Script
 *
 * This script helps with the manual migration of Markdown files to HTML.
 * It converts Markdown content to HTML and applies the appropriate template.
 *
 * Usage:
 *   node markdown_to_html_helper.js --input path/to/markdown.md --output path/to/output.html --template template_name
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  // Root directory of the repository
  rootDir: path.resolve(__dirname, '..'),

  // Templates directory
  templatesDir: 'scripts/templates',
};

// Parse command line arguments
const args = process.argv.slice(2);
const inputArg = args.indexOf('--input');
const outputArg = args.indexOf('--output');
const templateArg = args.indexOf('--template');

if (inputArg === -1 || outputArg === -1) {
  console.error(
    'Usage: node markdown_to_html_helper.js --input path/to/markdown.md --output path/to/output.html [--template template_name]',
  );
  process.exit(1);
}

const inputFile = args[inputArg + 1];
const outputFile = args[outputArg + 1];
const templateName = templateArg !== -1 ? args[templateArg + 1] : 'GENERIC.html.template';

/**
 * Reads a template file and returns its content
 * @param {string} templateName - The name of the template file
 * @returns {string} - The template content
 */
function readTemplate(templateName) {
  const templatePath = path.join(config.rootDir, config.templatesDir, templateName);
  try {
    return fs.readFileSync(templatePath, 'utf8');
  } catch (error) {
    console.error(`Error reading template ${templateName}:`, error);
    return '';
  }
}

/**
 * Converts Markdown content to HTML
 * @param {string} markdown - The Markdown content
 * @returns {Promise<string>} - The HTML content
 */
async function convertMarkdownToHtml(markdown) {
  return await marked.parse(markdown);
}

/**
 * Extracts the title from Markdown content
 * @param {string} markdown - The Markdown content
 * @returns {string} - The title
 */
function extractTitle(markdown) {
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  return titleMatch ? titleMatch[1] : 'Untitled Document';
}

/**
 * Extracts the component name from the output file path
 * @param {string} outputPath - The output file path
 * @returns {string} - The component name
 */
function extractComponentName(outputPath) {
  const dir = path.dirname(outputPath);
  const componentDir = path.basename(dir);
  return componentDir.charAt(0).toUpperCase() + componentDir.slice(1).replace(/-/g, ' ');
}

/**
 * Main function
 */
async function main() {
  try {
    // Read the input Markdown file
    const markdownContent = fs.readFileSync(path.join(config.rootDir, inputFile), 'utf8');

    // Convert Markdown to HTML
    const htmlContent = await convertMarkdownToHtml(markdownContent);

    // Extract title and component name
    const title = extractTitle(markdownContent);
    const componentName = extractComponentName(outputFile);

    // Read the template
    const template = readTemplate(templateName);

    // Replace template variables
    let output = template;
    output = output.replace(/{{title}}/g, title);
    output = output.replace(/{{component_name}}/g, componentName);
    output = output.replace(/{{content}}/g, htmlContent);

    // Create the output directory if it doesn't exist
    const outputDir = path.dirname(path.join(config.rootDir, outputFile));
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write the output file
    fs.writeFileSync(path.join(config.rootDir, outputFile), output);

    console.log(`Successfully converted ${inputFile} to ${outputFile}`);
  } catch (error) {
    console.error('Error converting Markdown to HTML:', error);
    process.exit(1);
  }
}

// Run the main function
main();
