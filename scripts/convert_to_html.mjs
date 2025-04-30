#!/usr/bin/env node

/**
 * Convert Markdown to HTML Script
 * 
 * This script converts markdown files to HTML using the templates
 * in the /docs/html-docs/templates directory.
 * 
 * Usage:
 *   node convert_to_html.mjs <source_file> <target_file> <section_title> [sidebar_links]
 * 
 * Example:
 *   node convert_to_html.mjs /docs/html-docs/lessons/error-handling.md /docs/html-docs/lessons/error-handling.html "Lessons" "error-handling.html:Error Handling,testing.html:Testing"
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
if (args.length < 3) {
  console.error('Usage: node convert_to_html.mjs <source_file> <target_file> <section_title> [sidebar_links]');
  process.exit(1);
}

const sourceFile = path.resolve(rootDir, args[0]);
const targetFile = path.resolve(rootDir, args[1]);
const sectionTitle = args[2];
const sidebarLinks = args[3] || '';

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

// Load the template
const templateFile = path.resolve(rootDir, 'docs', 'html-docs', 'templates', 'page.html');
if (!fs.existsSync(templateFile)) {
  console.error(`Template file not found: ${templateFile}`);
  process.exit(1);
}

const template = fs.readFileSync(templateFile, 'utf8');

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
  // This is a simple implementation. In a real-world scenario,
  // you would use a proper Markdown parser like marked or remark.
  
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
 * Generates sidebar links HTML
 * @param {string} links - The links in format "url1:text1,url2:text2"
 * @returns {string} - The HTML for the sidebar links
 */
function generateSidebarLinks(links) {
  if (!links) return '';
  
  const linkArray = links.split(',');
  let html = '';
  
  for (const link of linkArray) {
    const [url, text] = link.split(':');
    html += `<li><a href="${url}">${text}</a></li>\n`;
  }
  
  return html;
}

/**
 * Converts a markdown file to HTML
 * @param {string} sourceFile - The source file path
 * @param {string} targetFile - The target file path
 * @param {string} sectionTitle - The section title for the sidebar
 * @param {string} sidebarLinks - The sidebar links
 */
function convertMarkdownToHtml(sourceFile, targetFile, sectionTitle, sidebarLinks) {
  console.log(`Converting file: ${sourceFile}`);
  console.log(`Target file: ${targetFile}`);
  
  // Read the source file
  const sourceContent = fs.readFileSync(sourceFile, 'utf8');
  
  // Extract the title
  const title = extractTitle(sourceContent);
  
  // Convert markdown to HTML
  const htmlContent = markdownToHtml(sourceContent);
  
  // Generate sidebar links
  const sidebarLinksHtml = generateSidebarLinks(sidebarLinks);
  
  // Replace template placeholders
  let html = template
    .replace(/{{title}}/g, title)
    .replace(/{{sectionTitle}}/g, sectionTitle)
    .replace(/{{sidebarLinks}}/g, sidebarLinksHtml)
    .replace(/{{content}}/g, htmlContent);
  
  // Write the HTML file
  fs.writeFileSync(targetFile, html);
  
  console.log(`Conversion complete: ${targetFile}`);
}

// Execute the script
try {
  convertMarkdownToHtml(sourceFile, targetFile, sectionTitle, sidebarLinks);
} catch (error) {
  console.error('Error converting markdown to HTML:', error);
  process.exit(1);
}
</script>