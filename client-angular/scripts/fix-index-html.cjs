#!/usr/bin/env node
// @ts-check
 

/**
 * This script fixes the index.html file to include Eva Icons CSS
 * and updates the Content Security Policy to allow loading from CDNs
 */

const fs = require('fs');
const path = require('path');

// Get the project root directory
const projectRoot = path.resolve(__dirname, '..');
const indexPath = path.join(projectRoot, 'src', 'index.html');

// Read the index.html file
if (!fs.existsSync(indexPath)) {
  console.error(`Index file not found: ${indexPath}`);
  process.exit(1);
}

let indexContent = fs.readFileSync(indexPath, 'utf8');

// Add Eva Icons CSS if not already present
if (!indexContent.includes('eva-icons')) {
  console.log('Adding Eva Icons CSS to index.html...');
  indexContent = indexContent.replace(
    '</head>',
    '  <link rel="stylesheet" href="https://unpkg.com/eva-icons@1.1.3/style/eva-icons.css">\n</head>',
  );
}

// First, check for and remove any duplicate CSP meta tags
const cspMatches = indexContent.match(/<meta\s+http-equiv="Content-Security-Policy"[^>]*>/g);
if (cspMatches && cspMatches.length > 1) {
  console.log(`Found ${cspMatches.length} CSP meta tags. Removing duplicates...`);

  // Keep only the most comprehensive CSP tag (usually the longest one)
  const cspTags = [];
  const cspRegex = /<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"/g;
  let match;

  while ((match = cspRegex.exec(indexContent)) !== null) {
    cspTags.push({
      fullTag: match[0],
      content: match[1],
      length: match[1].length,
    });
  }

  // Sort by length (most comprehensive first)
  cspTags.sort((a, b) => b.length - a.length);

  // Keep only the first (most comprehensive) CSP tag
  for (let i = 1; i < cspTags.length; i++) {
    indexContent = indexContent.replace(
      cspTags[i].fullTag,
      '<!-- Removed duplicate CSP meta tag -->',
    );
  }

  // Now we have only one CSP meta tag
}

// Update Content Security Policy to allow loading from CDNs
if (indexContent.includes('<meta http-equiv="Content-Security-Policy"')) {
  console.log('Updating Content Security Policy...');

  // Extract current CSP
  const cspMatch = indexContent.match(
    /<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"/,
  );
  if (cspMatch) {
    let csp = cspMatch[1];

    // Add unpkg.com to style-src if not already present
    if (!csp.includes('style-src') || !csp.includes('unpkg.com')) {
      if (csp.includes('style-src')) {
        csp = csp.replace(/style-src\s+([^;]+)/, 'style-src $1 https://unpkg.com');
      } else {
        csp += "; style-src 'self' 'unsafe-inline' https://unpkg.com";
      }
    }

    // Add unpkg.com to font-src if not already present
    if (!csp.includes('font-src') || !csp.includes('unpkg.com')) {
      if (csp.includes('font-src')) {
        csp = csp.replace(/font-src\s+([^;]+)/, 'font-src $1 https://unpkg.com');
      } else {
        csp += "; font-src 'self' https://unpkg.com data:";
      }
    }

    // Update the CSP in the index.html content
    indexContent = indexContent.replace(
      /<meta\s+http-equiv="Content-Security-Policy"\s+content="[^"]+"/,
      `<meta http-equiv="Content-Security-Policy" content="${csp}"`,
    );
  }
} else {
  console.log('Adding Content Security Policy...');

  // Add a new CSP meta tag
  const csp =
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://unpkg.com; font-src 'self' https://unpkg.com data:; connect-src 'self' ws: wss:";

  indexContent = indexContent.replace(
    '<head>',
    `<head>\n  <meta http-equiv="Content-Security-Policy" content="${csp}">`,
  );
}

// Write the updated content back to the file
fs.writeFileSync(indexPath, indexContent);
console.log('index.html updated successfully!');
