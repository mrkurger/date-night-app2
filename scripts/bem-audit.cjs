// File: /Users/oivindlund/date-night-app/scripts/bem-audit.cjs
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all SCSS files
const scssFiles = glob.sync('/Users/oivindlund/date-night-app/client-angular/src/**/*.scss');

// BEM pattern regex
const bemPattern = /\.([\w-]+)(?:__[\w-]+)?(?:--[\w-]+)?/g;
const nonBemPattern = /\.(?![\w-]+(?:__[\w-]+)?(?:--[\w-]+)?)[a-zA-Z][\w-]*(?!__)/g;

const results = {};

scssFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const nonBemMatches = content.match(nonBemPattern);

  if (nonBemMatches && nonBemMatches.length > 0) {
    results[file] = nonBemMatches;
  }
});

console.log('Files with non-BEM compliant class names:');
console.log(JSON.stringify(results, null, 2));
