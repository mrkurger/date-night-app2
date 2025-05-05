#!/usr/bin/env node

/**
 * Install Documentation Dependencies
 * 
 * This script installs the dependencies required for the documentation migration tools.
 */

import { execSync } from "child_process";

console.log("Installing documentation dependencies...");

try {
  execSync("npm install marked@15.0.11 cheerio@1.0.0-rc.12 js-yaml@4.1.0", { stdio: "inherit" });
  console.log("Dependencies installed successfully.");
} catch (error) {
  console.error("Error installing dependencies:", error.message);
  process.exit(1);
}
