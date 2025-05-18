# Script Documentation

### handle-workflow-errors.js
/**
 * handle-workflow-errors.js
 *
 * This script processes a GitHub workflow_run event payload and writes a detailed error report as a JSON file.
 * It also attempts to extract job/step errors for deeper diagnostics.
 * Usage: import handleError from './.github/scripts/handle-workflow-errors.js'; await handleError(context.payload.workflow_run, context);
 */

### generate-ci-report.js
/**
 * generate-ci-report.js
 * 
 * This script generates a summary markdown report of recent CI runs and their status.
 * It fetches workflow runs and highlights failures and durations for CI visibility.
 * 
 * Usage: node .github/scripts/generate-ci-report.js
 */

### run-trivy-scan.js
/**
 * run-trivy-scan.js
 * 
 * This script runs Trivy for code scanning and outputs a summary report.
 * Requires Trivy installed on the runner.
 * 
 * Usage: node .github/scripts/run-trivy-scan.js
 */

### generate-docs.js
/**
 * generate-docs.js
 * 
 * This script generates markdown documentation for all scripts in the .github/scripts directory.
 * It extracts JSDoc-style comments from each script and builds a summary file.
 * 
 * Usage: node .github/scripts/generate-docs.js
 */

### run-pentest.sh
# run-pentest.sh
# This script runs a basic OWASP ZAP scan against a given URL and stores the HTML report.
# Usage: ./run-pentest.sh https://your-app-url.com

### generate-ui-screenshots.js
/**
 * generate-ui-screenshots.js
 *
 * Uses Puppeteer to generate screenshots of key user journeys or paths in your web app.
 * Usage: node .github/scripts/generate-ui-screenshots.js
 */

### verify-lockfiles.js
/**
 * verify-lockfiles.js
 *
 * This script checks all package-lock.json files in the repo for validity and reports any issues.
 * Usage: node .github/scripts/verify-lockfiles.js
 */