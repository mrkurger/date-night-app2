// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for test coverage reporting
//
// COMMON CUSTOMIZATIONS:
// - COVERAGE_METRIC: Which metric to display (default: 'statements')
//   Options: 'lines', 'statements', 'functions', 'branches'
// - COVERAGE_PATHS: Paths to coverage summary files
//   Related to: CI workflow files that download artifacts
// ===================================================

/**
 * Script to combine test coverage summaries from Angular and Server tests.
 *
 * Reads coverage percentages from 'coverage-summary.json' files generated
 * by Istanbul (via Karma/Jest) and creates a summary markdown file.
 *
 * Expected input files (paths relative to project root, after artifact download):
 * - downloaded-reports/angular/coverage-summary.json
 * - downloaded-reports/server/coverage-summary.json
 *
 * Output file:
 * - docs/latest-test-results.md
 */

import fs from 'fs';
import path from 'path';

// --- Configuration ---
const angularCoveragePath = path.join('downloaded-reports', 'angular', 'coverage-summary.json');
const serverCoveragePath = path.join('downloaded-reports', 'server', 'coverage-summary.json');
const outputDir = path.join('downloaded-reports', 'testing');
const outputFile = path.join(outputDir, 'coverage-summary.md');
// Choose which coverage metric to display (lines, statements, functions, branches)
const coverageMetric = 'statements'; // 'lines', 'statements', 'functions', or 'branches'
// --- End Configuration ---

/**
 * Reads and parses a coverage-summary.json file.
 * Extracts the percentage for the specified metric from the 'total' object.
 *
 * @param {string} filePath - Path to the coverage-summary.json file.
 * @param {string} metric - The coverage metric to extract ('lines', 'statements', 'functions', 'branches').
 * @returns {number | null} - The coverage percentage or null if not found/error.
 */
function readCoveragePercentage(filePath, metric) {
  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const summary = JSON.parse(fileContent);

      // Use optional chaining for safer access
      const percentage = summary?.total?.[metric]?.pct;

      if (typeof percentage === 'number') {
        return percentage;
      } else {
        console.warn(`Warning: Could not find total.${metric}.pct in ${filePath}`);
        return null;
      }
    } else {
      console.warn(`Warning: Coverage summary file not found: ${filePath}`);
      return null;
    }
  } catch (error) {
    console.error(`Error processing coverage file ${filePath}:`, error);
    return null;
  }
}

/**
 * Formats the coverage percentage for display.
 *
 * @param {number | null} percentage - The coverage percentage.
 * @returns {string} - Formatted string (e.g., "85.2%" or "N/A").
 */
function formatPercentage(percentage) {
  return typeof percentage === 'number' ? `${percentage.toFixed(1)}%` : 'N/A';
}

/**
 * Main function to generate the combined test results report
 */
function generateReport() {
  console.log('Generating combined test results report...');

  const angularCoveragePct = readCoveragePercentage(angularCoveragePath, coverageMetric);
  const serverCoveragePct = readCoveragePercentage(serverCoveragePath, coverageMetric);

  const formattedAngularCoverage = formatPercentage(angularCoveragePct);
  const formattedServerCoverage = formatPercentage(serverCoveragePct);
  const metricName = coverageMetric.charAt(0).toUpperCase() + coverageMetric.slice(1);
  const timestamp = new Date().toISOString();

  console.log(`Using coverage metric: ${coverageMetric} (${metricName})`);
  console.log(`Timestamp: ${timestamp}`);

  // Construct Markdown content
  let markdownContent = `# Latest Test Results\n\n`;
  markdownContent += `*Generated on: ${timestamp}*\n\n`;
  markdownContent += `## Code Coverage Summary (${metricName})\n\n`;
  markdownContent += `| Project         | Coverage (${metricName} %) |\n`;
  markdownContent += `|-----------------|----------------------|\n`;
  markdownContent += `| Client (Angular)| ${formattedAngularCoverage}        |\n`;
  markdownContent += `| Server (Node.js)| ${formattedServerCoverage}        |\n\n`;

  markdownContent += `*Coverage data extracted from \`coverage-summary.json\`.*\n`;
  markdownContent += `*(N/A indicates the coverage report was not found or couldn't be parsed).*\n`;

  // Write the output file
  try {
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      console.log(`Creating output directory: ${outputDir}`);
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputFile, markdownContent);
    console.log(`Successfully generated test results report: ${outputFile}`);
    return true;
  } catch (error) {
    console.error(`Error writing test results report to ${outputFile}:`, error);
    return false;
  }
}

/**
 * Main function that orchestrates the report generation process
 */
function main() {
  try {
    // Generate the combined test results report
    const success = generateReport();

    if (!success) {
      console.error('Failed to generate combined test report');
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error combining test reports:', error);
    process.exit(1);
  }
}

// Execute the main function
main();
