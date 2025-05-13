
// This script runs the tests with the custom module loader

// Load the custom module loader
require('./src/babel-runtime-loader');

// Run the tests
require('@angular/cli/bin/ng');
