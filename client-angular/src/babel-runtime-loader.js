/**
 * Custom module loader to handle the missing @babel/runtime/helpers/asyncToGenerator.js
 * It intercepts require calls for the missing module and returns the actual implementation
 *
 * @fileoverview Node.js script that overrides the require function to handle missing Babel runtime helpers
 * @global require - The require function is available in Node.js
 * @global __dirname - The directory name is available in Node.js
 * @global console - The console object is available in Node.js
 */

/* global require, __dirname, console */
/* eslint-disable @typescript-eslint/no-require-imports */

const Module = require('module');
const path = require('path');

// Store the original require function
const originalRequire = Module.prototype.require;

// The path to the actual implementation
const actualImplementationPath = path.resolve(
  __dirname,
  '../../node_modules/@babel/runtime/helpers/asyncToGenerator.js',
);

// The path that tests are trying to load
const missingModulePath =
  '/Users/oivindlund/date-night-app/node_modules/@angular-devkit/build-angular/node_modules/@babel/runtime/helpers/asyncToGenerator.js';

/**
 * Override the require function to intercept requests for the missing module
 * @param {string} id - The module ID to require
 * @returns {*} - The required module
 */
Module.prototype.require = function (id) {
  // If the requested module is the missing one, return the actual implementation
  if (id === missingModulePath) {
    console.log(
      'Intercepted request for missing Babel runtime helper, redirecting to actual implementation',
    );
    return originalRequire.call(this, actualImplementationPath);
  }

  // Otherwise, use the original require function
  return originalRequire.call(this, id);
};

// Log that the loader is active
console.log('Babel runtime helper loader is active');
