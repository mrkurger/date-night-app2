// File: /Users/oivindlund/date-night-app/scripts/token-audit.cjs
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all SCSS files
const scssFiles = glob.sync('/Users/oivindlund/date-night-app/client-angular/src/**/*.scss');

// Common hardcoded values to check for
const hardcodedValues = [
  /#[0-9a-fA-F]{3,6}/g, // Hex colors
  /rgba?\([^)]+\)/g, // RGB/RGBA colors
  /\b\d+px\b/g, // Pixel values
  /\b\d+rem\b/g, // Rem values
  /\b\d+em\b/g, // Em values
];

const results = {};

scssFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const matches = [];

  hardcodedValues.forEach(pattern => {
    const found = content.match(pattern);
    if (found) {
      matches.push(...found);
    }
  });

  if (matches.length > 0) {
    results[file] = matches;
  }
});

console.log('Files with hardcoded values:');
console.log(JSON.stringify(results, null, 2));
