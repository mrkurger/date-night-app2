#!/usr/bin/env node

/**
 * Function Extractor Script
 *
 * This script extracts function and method signatures from code files
 * and generates glossary entries.
 *
 * Usage:
 *   node extract_functions.js <directory> [--output <output_file>]
 *
 * Example:
 *   node extract_functions.js /client-angular/src/app/features/chat --output /client-angular/src/app/features/chat/GLOSSARY.html
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: node extract_functions.js <directory> [--output <output_file>]');
  process.exit(1);
}

const directory = path.resolve(args[0]);
let outputFile = null;

// Check for output file
const outputIndex = args.indexOf('--output');
if (outputIndex !== -1 && args.length > outputIndex + 1) {
  outputFile = path.resolve(args[outputIndex + 1]);
}

// Ensure the directory exists
if (!fs.existsSync(directory)) {
  console.error(`Directory not found: ${directory}`);
  process.exit(1);
}

// Configuration
const config = {
  // File extensions to parse
  extensions: ['.js', '.ts', '.jsx', '.tsx'],

  // Exclude patterns for directories
  excludeDirs: ['node_modules', 'dist', 'coverage', 'test-results', '.git'],
};

/**
 * Scans a directory recursively for code files
 * @param {string} dir - The directory to scan
 * @param {string[]} extensions - The file extensions to include
 * @returns {string[]} - Array of file paths
 */
function scanDirectory(dir, extensions) {
  let results = [];

  try {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);

      // Skip excluded directories
      if (stat.isDirectory() && !config.excludeDirs.includes(item)) {
        results = results.concat(scanDirectory(itemPath, extensions));
      } else if (stat.isFile() && extensions.includes(path.extname(itemPath))) {
        results.push(itemPath);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
  }

  return results;
}

/**
 * Extracts function and method signatures from a code file
 * @param {string} filePath - Path to the code file
 * @returns {Object[]} - Array of function/method objects
 */
function extractFunctions(filePath) {
  const functions = [];
  const content = fs.readFileSync(filePath, 'utf8');
  const extension = path.extname(filePath);

  // Extract JSDoc/TSDoc comments and function signatures
  const docCommentRegex =
    /\/\*\*\s*([\s\S]*?)\s*\*\/\s*(?:export\s+)?(?:async\s+)?(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>))/g;

  // Extract class methods
  const methodRegex =
    /\/\*\*\s*([\s\S]*?)\s*\*\/\s*(?:public|private|protected)?\s*(?:async\s+)?(\w+)\s*\([^)]*\)/g;

  let match;

  // Extract standalone functions and function expressions
  while ((match = docCommentRegex.exec(content)) !== null) {
    const docComment = match[1];
    const functionName = match[2] || match[3];

    if (functionName) {
      functions.push({
        name: functionName,
        documentation: parseDocComment(docComment),
        filePath: filePath,
        type: 'function',
      });
    }
  }

  // Extract class methods
  while ((match = methodRegex.exec(content)) !== null) {
    const docComment = match[1];
    const methodName = match[2];

    if (methodName) {
      functions.push({
        name: methodName,
        documentation: parseDocComment(docComment),
        filePath: filePath,
        type: 'method',
      });
    }
  }

  return functions;
}

/**
 * Parses a JSDoc/TSDoc comment
 * @param {string} comment - The doc comment
 * @returns {Object} - Parsed documentation object
 */
function parseDocComment(comment) {
  const lines = comment.split('\n');
  const result = {
    description: '',
    params: [],
    returns: null,
    example: null,
  };

  let currentSection = 'description';

  for (const line of lines) {
    const trimmedLine = line.trim().replace(/^\*\s*/, '');

    if (trimmedLine.startsWith('@param')) {
      const paramMatch = trimmedLine.match(
        /@param\s+(?:{([^}]+)})?\s*(?:\[([^\]]+)\]|(\S+))\s*(.*)/
      );
      if (paramMatch) {
        result.params.push({
          type: paramMatch[1] || '',
          name: paramMatch[2] || paramMatch[3] || '',
          description: paramMatch[4] || '',
        });
      }
      currentSection = 'param';
    } else if (trimmedLine.startsWith('@returns') || trimmedLine.startsWith('@return')) {
      const returnMatch = trimmedLine.match(/@returns?\s+(?:{([^}]+)})?\s*(.*)/);
      if (returnMatch) {
        result.returns = {
          type: returnMatch[1] || '',
          description: returnMatch[2] || '',
        };
      }
      currentSection = 'returns';
    } else if (trimmedLine.startsWith('@example')) {
      result.example = '';
      currentSection = 'example';
    } else if (currentSection === 'description') {
      if (result.description && trimmedLine) {
        result.description += ' ' + trimmedLine;
      } else if (trimmedLine) {
        result.description = trimmedLine;
      }
    } else if (currentSection === 'example') {
      if (result.example && trimmedLine) {
        result.example += '\n' + trimmedLine;
      } else if (trimmedLine) {
        result.example = trimmedLine;
      }
    }
  }

  return result;
}

/**
 * Generates a glossary entry for a function/method
 * @param {Object} func - The function/method object
 * @returns {string} - HTML for the glossary entry
 */
function generateGlossaryEntry(func) {
  const { name, documentation, filePath, type } = func;
  const { description, params, returns, example } = documentation;

  let paramsHtml = '';
  if (params.length > 0) {
    paramsHtml = `
<h4>Parameters</h4>
<table class="params-table">
  <thead>
    <tr>
      <th>Name</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    ${params
      .map(
        param => `
    <tr>
      <td>${param.name}</td>
      <td><code>${param.type}</code></td>
      <td>${param.description}</td>
    </tr>
    `
      )
      .join('')}
  </tbody>
</table>`;
  }

  let returnsHtml = '';
  if (returns) {
    returnsHtml = `
<h4>Returns</h4>
<p><code>${returns.type}</code> - ${returns.description}</p>`;
  }

  let exampleHtml = '';
  if (example) {
    exampleHtml = `
<h4>Example</h4>
<pre><code>${example}</code></pre>`;
  }

  return `
<div class="glossary-entry" id="${name}">
  <h3>${name}</h3>
  <p class="entry-meta">${type} | <a href="${filePath}">Source</a></p>
  <div class="entry-description">
    <p>${description}</p>
  </div>
  ${paramsHtml}
  ${returnsHtml}
  ${exampleHtml}
</div>`;
}

/**
 * Updates a glossary HTML file with function/method entries
 * @param {string} filePath - Path to the glossary file
 * @param {Object[]} functions - Array of function/method objects
 */
function updateGlossaryFile(filePath, functions) {
  if (!fs.existsSync(filePath)) {
    console.error(`Glossary file not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Generate glossary entries
  const entriesHtml = functions.map(generateGlossaryEntry).join('\n');

  // Replace the glossary entries placeholder
  content = content.replace(
    /<div class="glossary-entries">[\s\S]*?<\/div>/,
    `<div class="glossary-entries">\n${entriesHtml}\n</div>`
  );

  fs.writeFileSync(filePath, content);
  console.log(`Updated glossary file: ${filePath}`);
}

/**
 * Main function to execute the script
 */
async function main() {
  try {
    console.log(`Scanning directory: ${directory}`);

    // Scan for code files
    const codeFiles = scanDirectory(directory, config.extensions);
    console.log(`Found ${codeFiles.length} code files`);

    // Extract functions and methods
    const functions = [];
    for (const file of codeFiles) {
      const extracted = extractFunctions(file);
      functions.push(...extracted);
    }

    console.log(`Extracted ${functions.length} functions/methods`);

    // Update glossary file if specified
    if (outputFile) {
      updateGlossaryFile(outputFile, functions);
    } else {
      // Print function information
      for (const func of functions) {
        console.log(`${func.type}: ${func.name}`);
        console.log(`  Description: ${func.documentation.description}`);
        console.log(`  File: ${func.filePath}`);
        console.log('');
      }
    }
  } catch (error) {
    console.error('Error extracting functions:', error);
    process.exit(1);
  }
}

// Execute the script
main();
