#!/usr/bin/env node

/**
 * Script to fix Content Security Policy (CSP) issues
 * This script updates both server and client CSP configurations
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

console.log('Starting CSP fix script...');

// Define paths
const rootDir = path.join(__dirname, '..');
const serverDir = path.join(rootDir, 'server');
const clientDir = path.join(rootDir, 'client-angular');
const serverJsPath = path.join(serverDir, 'server.js');
const clientIndexPath = path.join(clientDir, 'src', 'index.html');

// Function to update server CSP
function updateServerCSP() {
  console.log('\n📋 Updating server CSP configuration...');
  
  try {
    let serverJs = fs.readFileSync(serverJsPath, 'utf8');
    
    // Check if isDevelopment is already defined
    if (!serverJs.includes('const isDevelopment = process.env.NODE_ENV === \'development\';')) {
      // Add isDevelopment definition before helmet configuration
      serverJs = serverJs.replace(
        '// Security middleware',
        '// Security middleware\n// Allow unsafe-eval in development mode for Angular\nconst isDevelopment = process.env.NODE_ENV === \'development\';'
      );
    }
    
    // Update the CSP configuration
    if (serverJs.includes('scriptSrc: [')) {
      // Update existing scriptSrc
      serverJs = serverJs.replace(
        /scriptSrc: \[\s*['"]'self'['"]/,
        'scriptSrc: [\n        \'\\\'self\\\'\',\n        (req, res) => `\\\'nonce-${res.locals.cspNonce}\\\'`,\n        ...(isDevelopment ? ["\\\'unsafe-eval\\\'", "\\\'unsafe-inline\\\'"] : [])'
      );
    }
    
    // Update styleSrc to include unsafe-inline
    if (serverJs.includes('styleSrc: [')) {
      serverJs = serverJs.replace(
        /styleSrc: \[\s*['"]'self'['"]/,
        'styleSrc: [\n        \'\\\'self\\\'\',\n        (req, res) => `\\\'nonce-${res.locals.cspNonce}\\\'`,\n        "\\\'unsafe-inline\\\'"'
      );
    }
    
    // Update connectSrc to include localhost in development
    if (serverJs.includes('connectSrc: [')) {
      serverJs = serverJs.replace(
        /connectSrc: \[\s*['"]'self'['"]/,
        'connectSrc: [\n        \'\\\'self\\\'\',\n        "wss:",\n        "ws:",\n        "https://api.stripe.com",\n        ...(isDevelopment ? ["http://localhost:*", "ws://localhost:*"] : [])'
      );
    }
    
    // Write the updated file
    fs.writeFileSync(serverJsPath, serverJs, 'utf8');
    console.log('Server CSP configuration updated successfully!');
  } catch (error) {
    console.error('Error updating server CSP configuration:', error.message);
  }
}

// Function to update client CSP
function updateClientCSP() {
  console.log('\n📋 Updating client CSP configuration...');
  
  try {
    let clientIndex = fs.readFileSync(clientIndexPath, 'utf8');
    
    // Define the CSP directive
    const cspDirective = "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://*.googleapis.com; connect-src 'self' ws: wss: http://localhost:* ws://localhost:*; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'";
    
    // Check if CSP meta tag already exists
    if (clientIndex.includes('<meta http-equiv="Content-Security-Policy"')) {
      // Update existing CSP meta tag
      clientIndex = clientIndex.replace(
        /<meta http-equiv="Content-Security-Policy"[^>]*>/,
        `<meta http-equiv="Content-Security-Policy" content="${cspDirective}">`
      );
    } else {
      // Add CSP meta tag after charset meta tag
      clientIndex = clientIndex.replace(
        '<meta charset="utf-8">',
        `<meta charset="utf-8">\n  <meta http-equiv="Content-Security-Policy" content="${cspDirective}">`
      );
    }
    
    // Write the updated file
    fs.writeFileSync(clientIndexPath, clientIndex, 'utf8');
    console.log('Client CSP configuration updated successfully!');
  } catch (error) {
    console.error('Error updating client CSP configuration:', error.message);
  }
}

// Update both server and client CSP
updateServerCSP();
updateClientCSP();

// Restart the application if requested
const shouldRestart = process.argv.includes('--restart');
if (shouldRestart) {
  console.log('\n📋 Restarting the application...');
  try {
    execSync('npm run dev', { stdio: 'inherit', cwd: rootDir });
  } catch (error) {
    console.error('Error restarting the application:', error.message);
  }
}

console.log('\n✅ CSP fix script completed!');
console.log('\nTo apply the changes, restart the application:');
console.log('  npm run dev');