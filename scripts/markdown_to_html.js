#!/usr/bin/env node

/**
 * Markdown to HTML Converter
 *
 * This script converts Markdown files to HTML using the templates
 * in the scripts/templates directory.
 *
 * Usage:
 *   node markdown_to_html.js <source_file> <target_file> <component_name>
 *
 * Example:
 *   node markdown_to_html.js /docs/AILESSONS.MD /client-angular/src/app/features/chat/AILESSONS.html "Chat Feature"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length < 3) {
  console.error('Usage: node markdown_to_html.js <source_file> <target_file> <component_name>');
  process.exit(1);
}

const sourceFile = path.resolve(args[0]);
const targetFile = path.resolve(args[1]);
const componentName = args[2];

// Ensure the source file exists
if (!fs.existsSync(sourceFile)) {
  console.error(`Source file not found: ${sourceFile}`);
  process.exit(1);
}

// Ensure the target directory exists
const targetDir = path.dirname(targetFile);
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Determine the template to use
const templateName = path.basename(targetFile).toUpperCase().replace('.HTML', '.html.template');
let templateFile = path.resolve(__dirname, 'templates', templateName);

// If specific template doesn't exist, use the generic template
if (!fs.existsSync(templateFile)) {
  console.log(`Specific template not found: ${templateName}, using generic template instead.`);
  templateFile = path.resolve(__dirname, 'templates', 'GENERIC.html.template');

  if (!fs.existsSync(templateFile)) {
    console.error(`Generic template not found: ${templateFile}`);
    process.exit(1);
  }
}

// Read the source file and template
const sourceContent = fs.readFileSync(sourceFile, 'utf8');
const templateContent = fs.readFileSync(templateFile, 'utf8');

/**
 * Extracts the title from a markdown file
 * @param {string} markdown - The markdown content
 * @returns {string} - The extracted title
 */
function extractTitle(markdown) {
  const titleMatch = markdown.match(/^# (.*$)/m);
  return titleMatch ? titleMatch[1].trim() : 'Untitled';
}

/**
 * Converts a Markdown file to HTML
 * @param {string} markdown - The markdown content
 * @returns {string} - The HTML content
 */
function markdownToHtml(markdown) {
  // Convert headings
  let html = markdown
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
    .replace(/^##### (.*$)/gm, '<h5>$1</h5>')
    .replace(/^###### (.*$)/gm, '<h6>$1</h6>');

  // Convert bold and italic
  html = html
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    .replace(/_(.*?)_/g, '<em>$1</em>');

  // Convert links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

  // Convert code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

  // Convert inline code
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');

  // Convert lists
  html = html.replace(/^\* (.*$)/gm, '<li>$1</li>');
  html = html.replace(/^- (.*$)/gm, '<li>$1</li>');
  html = html.replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>');

  // Wrap lists
  html = html.replace(/<li>([\s\S]*?)<li>/g, '<ul><li>$1<li>');
  html = html.replace(/<\/li>([\s\S]*?)<\/ul>/g, '</li>$1</ul>');

  // Convert paragraphs
  html = html.replace(/^(?!<[a-z])(.*$)/gm, '<p>$1</p>');

  // Remove empty paragraphs
  html = html.replace(/<p><\/p>/g, '');

  return html;
}

/**
 * Converts a markdown file to HTML using a template
 * @param {string} sourceContent - The source markdown content
 * @param {string} templateContent - The template content
 * @param {string} componentName - The component name
 * @returns {string} - The HTML content
 */
function convertMarkdownToHtml(sourceContent, templateContent, componentName) {
  // Extract the title
  const title = extractTitle(sourceContent);

  // Convert markdown to HTML
  const htmlContent = markdownToHtml(sourceContent);

  // Replace template placeholders
  let html = templateContent
    .replace(/{{component_name}}/g, componentName)
    .replace(/{{title}}/g, title)
    .replace(
      /<!-- Glossary entries will be generated here -->/g,
      '<!-- Glossary entries will be generated here -->'
    );

  // For CHANGELOG.html and AILESSONS.html, replace the content
  if (templateName === 'CHANGELOG.HTML.TEMPLATE' || templateName === 'AILESSONS.HTML.TEMPLATE') {
    html = html.replace(
      /<article class="content">[\s\S]*?<\/article>/g,
      `<article class="content">\n        <h1>${title}</h1>\n        \n        ${htmlContent}\n      </article>`
    );
  }

  return html;
}

// Convert the markdown to HTML
const htmlContent = convertMarkdownToHtml(sourceContent, templateContent, componentName);

// Write the HTML file
fs.writeFileSync(targetFile, htmlContent);
console.log(`Converted ${sourceFile} to ${targetFile}`);
