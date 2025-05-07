#!/usr/bin/env node

/**
 * Documentation Browser Script
 *
 * This script helps you browse the HTML documentation by:
 * 1. Starting a local web server
 * 2. Opening the documentation index in your default browser
 * 3. Providing a CLI to search and open specific documentation files
 *
 * Usage:
 *   node browse-docs.js [--port 8080] [--search "keyword"]
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
let port = 8080;
let searchTerm = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port' && i + 1 < args.length) {
    port = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--search' && i + 1 < args.length) {
    searchTerm = args[i + 1];
    i++;
  }
}

// MIME types for different file extensions
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// Create a simple HTTP server
const server = https.createServer((req, res) => {
  // Parse the URL to get the pathname
  let pathname = req.url;

  // Default to index.html if the path is '/'
  if (pathname === '/') {
    pathname = '/_docs_index.html';
  }

  // Remove query parameters
  pathname = pathname.split('?')[0];

  // Resolve the file path
  const filePath = path.join(__dirname, decodeURIComponent(pathname));

  // Get the file extension
  const extname = path.extname(filePath);

  // Set the content type based on the file extension
  const contentType = mimeTypes[extname] || 'text/plain';

  // Check file size before reading
  fs.stat(filePath, (err, stats) => {
    if (err) {
      // If the file doesn't exist, return 404
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`<h1>404 Not Found</h1><p>The requested file ${pathname} was not found.</p>`);
        return;
      }

      // For other errors, return 500
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(`<h1>500 Internal Server Error</h1><p>${err.message}</p>`);
      return;
    }

    const fileSizeInMB = stats.size / (1024 * 1024);

    if (fileSizeInMB > 10) {
      res.writeHead(413, { 'Content-Type': 'text/html' });
      res.end(
        `<h1>413 Payload Too Large</h1><p>The requested file ${pathname} exceeds the maximum allowed size of 10 MB.</p>`
      );
      return;
    }

    // Read the file
    fs.readFile(filePath, { encoding: null, flag: 'r' }, (err, data) => {
      if (err) {
        // For other errors, return 500
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`<h1>500 Internal Server Error</h1><p>${err.message}</p>`);
        return;
      }

      // If the file exists, return it with the correct content type
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Documentation server running at http://localhost:${port}/`);
  console.log(`Main documentation index: http://localhost:${port}/_docs_index.html`);
  console.log(`Global glossary: http://localhost:${port}/_glossary.html`);

  // Open the browser
  const url = `http://localhost:${port}/_docs_index.html`;
  const command =
    process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${command} ${url}`);

  // If a search term was provided, search for documentation files
  if (searchTerm) {
    searchDocumentation(searchTerm);
  }

  // Create a readline interface for user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Display the prompt
  displayPrompt(rl);
});

/**
 * Displays the prompt for user input
 * @param {readline.Interface} rl - The readline interface
 */
function displayPrompt(rl) {
  rl.question('\nEnter a command (search <term>, open <file>, list, help, quit): ', input => {
    const [command, ...args] = input.trim().split(' ');

    switch (command.toLowerCase()) {
      case 'search':
        const term = args.join(' ');
        if (term) {
          searchDocumentation(term);
        } else {
          console.log('Please provide a search term.');
        }
        break;

      case 'open':
        const file = args.join(' ');
        if (file) {
          openDocumentation(file);
        } else {
          console.log('Please provide a file to open.');
        }
        break;

      case 'list':
        listDocumentation();
        break;

      case 'help':
        displayHelp();
        break;

      case 'quit':
      case 'exit':
        console.log('Shutting down server...');
        server.close(() => {
          console.log('Server closed.');
          rl.close();
          process.exit(0);
        });
        return;

      default:
        console.log('Unknown command. Type "help" for a list of commands.');
        break;
    }

    // Display the prompt again
    displayPrompt(rl);
  });
}

/**
 * Displays help information
 */
function displayHelp() {
  console.log('\nDocumentation Browser Commands:');
  console.log('  search <term>  - Search for documentation files containing the term');
  console.log('  open <file>    - Open a documentation file in the browser');
  console.log('  list           - List all documentation files');
  console.log('  help           - Display this help information');
  console.log('  quit           - Quit the documentation browser');
}

/**
 * Searches for documentation files containing the search term
 * @param {string} term - The search term
 */
function searchDocumentation(term) {
  console.log(`\nSearching for documentation files containing "${term}"...`);

  // Use grep to search for the term in HTML files
  const findCommand = 'grep';
  const findArgs = ['-l', term, path.join(__dirname, '*.html')];

  execFile(findCommand, findArgs, { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error searching for documentation: ${error.message}`);
      return;
    }

    if (stderr) {
      console.error(`Error: ${stderr}`);
      return;
    }

    const files = stdout.trim().split('\n').filter(Boolean);

    if (files.length === 0) {
      console.log('No documentation files found containing the search term.');
      return;
    }

    console.log(`\nFound ${files.length} documentation files containing "${term}":`);

    files.forEach((file, index) => {
      const relativePath = path.relative(__dirname, file);
      console.log(`  ${index + 1}. ${relativePath}`);
    });

    // Ask the user if they want to open a file
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('\nEnter the number of the file to open (or press Enter to cancel): ', answer => {
      const fileIndex = parseInt(answer, 10) - 1;

      if (!isNaN(fileIndex) && fileIndex >= 0 && fileIndex < files.length) {
        const file = files[fileIndex];
        const relativePath = path.relative(__dirname, file);

        // Open the file in the browser
        const url = `http://localhost:${port}/${relativePath.replace(/\\/g, '/')}`;
        const command =
          process.platform === 'darwin'
            ? 'open'
            : process.platform === 'win32'
              ? 'start'
              : 'xdg-open';

        exec(`${command} ${url}`);
        console.log(`Opening ${relativePath} in the browser...`);
      }

      rl.close();
    });
  });
}

/**
 * Opens a documentation file in the browser
 * @param {string} file - The file to open
 */
function openDocumentation(file) {
  // If the file doesn't have an extension, assume it's an HTML file
  if (!path.extname(file)) {
    file = `${file}.html`;
  }

  // If the file doesn't start with a slash, assume it's relative to the root
  if (!file.startsWith('/')) {
    file = `/${file}`;
  }

  // Open the file in the browser
  const url = `http://localhost:${port}${file}`;
  const command =
    process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';

  exec(`${command} ${url}`);
  console.log(`Opening ${file} in the browser...`);
}

/**
 * Lists all documentation files
 */
function listDocumentation() {
  console.log('\nListing all documentation files...');

  // Use find to list all HTML files
  const command = `find ${__dirname} -name "*.html" -type f | sort`;

  console.log('\nListing all documentation files...');

  // Use find to list all HTML files
  const findCommand = 'find';
  const findArgs = [__dirname, '-name', '*.html', '-type', 'f'];

  execFile(findCommand, findArgs, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error listing documentation: ${error.message}`);
      return;
    }

    const files = stdout.trim().split('\n').filter(Boolean);

    if (files.length === 0) {
      console.log('No documentation files found.');
      return;
    }

    console.log(`\nFound ${files.length} documentation files:`);

    // Group files by directory
    const filesByDir = {};

    files.forEach(file => {
      const relativePath = path.relative(__dirname, file);
      const dir = path.dirname(relativePath);

      if (!filesByDir[dir]) {
        filesByDir[dir] = [];
      }

      filesByDir[dir].push(path.basename(file));
    });

    // Display files grouped by directory
    Object.keys(filesByDir)
      .sort()
      .forEach(dir => {
        console.log(`\n${dir}:`);

        filesByDir[dir].sort().forEach(file => {
          console.log(`  ${file}`);
        });
      });
  });
}
