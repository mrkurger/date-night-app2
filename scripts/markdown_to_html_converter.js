#!/usr/bin/env node

/**
 * Markdown to HTML Converter
 *
 * This script converts Markdown files to HTML using the project's documentation template.
 * It also adds tooltips and links to function/method references.
 *
 * Usage:
 *   node markdown_to_html_converter.js <markdown-file> <output-html-file> [--add-tooltips]
 */

import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import { fileURLToPath } from 'url';
import { addTooltipsAndLinks, extractGlossaryEntries } from './tooltip_helper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  rootDir: path.resolve(__dirname, '..'),
  templatesDir: path.join(__dirname, 'templates'),
};

// Command line arguments
const args = process.argv.slice(2);
const markdownFile = args[0];
const outputHtmlFile = args[1];
const addTooltips = args.includes('--add-tooltips');

if (!markdownFile || !outputHtmlFile) {
  console.log(`
Markdown to HTML Converter

Usage:
  node markdown_to_html_converter.js <markdown-file> <output-html-file> [--add-tooltips]
  `);
  process.exit(1);
}

/**
 * Reads the HTML template file
 * @returns {string} The template content
 */
function readTemplate() {
  const templatePath = path.join(config.templatesDir, 'doc_template.html');
  return fs.readFileSync(templatePath, 'utf8');
}

/**
 * Converts Markdown content to HTML
 * @param {string} markdown - The Markdown content
 * @returns {string} The HTML content
 */
function convertMarkdownToHtml(markdown) {
  // Configure marked options if needed
  marked.setOptions({
    gfm: true,
    breaks: true,
    smartLists: true,
    smartypants: true,
    highlight: function (code, lang) {
      // You could add syntax highlighting here if desired
      return code;
    },
  });

  return marked.parse(markdown);
}

/**
 * Main function to convert a Markdown file to HTML
 */
function convertFile() {
  const absoluteMarkdownPath = path.resolve(config.rootDir, markdownFile);
  const absoluteOutputPath = path.resolve(config.rootDir, outputHtmlFile);

  if (!fs.existsSync(absoluteMarkdownPath)) {
    console.error(`Markdown file does not exist: ${absoluteMarkdownPath}`);
    process.exit(1);
  }

  // Read the Markdown file
  const markdown = fs.readFileSync(absoluteMarkdownPath, 'utf8');

  // Convert to HTML
  let html = convertMarkdownToHtml(markdown);

  // Add tooltips and links if requested
  if (addTooltips) {
    const outputDir = path.dirname(absoluteOutputPath);
    const glossaryPath = path.join(outputDir, 'GLOSSARY.html');

    if (fs.existsSync(glossaryPath)) {
      const glossaryHtml = fs.readFileSync(glossaryPath, 'utf8');
      const glossaryEntries = extractGlossaryEntries(glossaryHtml);

      html = addTooltipsAndLinks(html, glossaryEntries, 'GLOSSARY.html');
    } else {
      console.warn(`Glossary file not found: ${glossaryPath}`);
      console.warn('Tooltips and links will not be added.');
    }
  }

  // Get the title from the Markdown filename
  const title = path
    .basename(absoluteMarkdownPath, path.extname(absoluteMarkdownPath))
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

  // Get the folder name for navigation
  const folderName = path
    .basename(path.dirname(absoluteOutputPath))
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

  // Read the template
  const template = readTemplate();

  // Replace placeholders in the template
  const fullHtml = template
    .replace(/{{TITLE}}/g, title)
    .replace(/{{FOLDER_NAME}}/g, folderName)
    .replace(/{{CONTENT}}/g, html);

  // Create the output directory if it doesn't exist
  const outputDir = path.dirname(absoluteOutputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write the HTML file
  fs.writeFileSync(absoluteOutputPath, fullHtml);

  console.log(`Converted ${absoluteMarkdownPath} to ${absoluteOutputPath}`);
}

// Run the conversion
convertFile();
