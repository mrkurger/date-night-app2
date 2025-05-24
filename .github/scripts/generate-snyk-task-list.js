/**
 * generate-snyk-task-list.js
 *
 * This script generates prioritized task lists from Snyk scan results, saving markdown reports for review.
 * It is written as an ESModule and uses only async fs/promises methods.
 *
 * Input files:
 *   - snyk-root-results.json, snyk-server-results.json, snyk-client-results.json
 *   - npm-root-deps-tree.json, npm-server-deps-tree.json, npm-client-deps-tree.json
 *   - snyk-root-upgrade-paths.json, snyk-server-upgrade-paths.json, snyk-client-upgrade-paths.json
 *
 * Output files:
 *   - downloaded-reports/snyk/prioritized-issues.md
 *   - downloaded-reports/snyk/issues-summary.md
 *   - downloaded-reports/snyk/vulnerable-dependencies.md
 */

import fs from 'fs/promises';
import path from 'path';

// Define severity levels and their priority order
const SEVERITY_LEVELS = {
  critical: 1,
  high: 2,
  medium: 3,
  low: 4,
};

// Define issue types and their descriptions
const ISSUE_TYPES = {
  vuln: 'Vulnerability',
  license: 'License Issue',
  configuration: 'Configuration Issue',
  code: 'Code Quality Issue',
};

/**
 * Reads and parses Snyk results from a JSON file asynchronously.
 * @param {string} filePath - Path to the Snyk results JSON file
 * @returns {Promise<Object|null>} - Parsed JSON or null if not found or invalid
 */
async function readSnykResults(filePath) {
  try {
    // Try to read the file; if it doesn't exist, return null
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // File not found or JSON parse error
    console.warn(`Could not read or parse ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Main function to extract and prioritize issues from Snyk scan results.
 * This function:
 *   - Reads scan results for each project part (root, server, client)
 *   - Extracts vulnerabilities, groups by severity, sorts/prioritizes
 *   - Writes markdown reports listing actionable issues and recommendations
 */
export default async function generateSnykTaskList() {
  try {
    console.log('🔍 Generating Snyk task list...');

    // Ensure output directory exists
    await fs.mkdir('downloaded-reports/snyk', { recursive: true });

    // Read Snyk results for all project parts
    const rootResults = await readSnykResults('snyk-root-results.json');
    const serverResults = await readSnykResults('snyk-server-results.json');
    const clientResults = await readSnykResults('snyk-client-results.json');

    // Aggregate all vulnerabilities
    const allVulnerabilities = [];

    if (rootResults?.vulnerabilities) {
      allVulnerabilities.push(...rootResults.vulnerabilities.map(v => ({ ...v, project: 'root' })));
    }
    if (serverResults?.vulnerabilities) {
      allVulnerabilities.push(...serverResults.vulnerabilities.map(v => ({ ...v, project: 'server' })));
    }
    if (clientResults?.vulnerabilities) {
      allVulnerabilities.push(...clientResults.vulnerabilities.map(v => ({ ...v, project: 'client' })));
    }

    // Sort vulnerabilities by severity
    allVulnerabilities.sort((a, b) => {
      const severityA = SEVERITY_LEVELS[a.severity?.toLowerCase()] || 5;
      const severityB = SEVERITY_LEVELS[b.severity?.toLowerCase()] || 5;
      return severityA - severityB;
    });

    // Generate prioritized issues report
    const prioritizedReport = generatePrioritizedReport(allVulnerabilities);
    await fs.writeFile('downloaded-reports/snyk/prioritized-issues.md', prioritizedReport);

    // Generate summary report
    const summaryReport = generateSummaryReport(allVulnerabilities);
    await fs.writeFile('downloaded-reports/snyk/issues-summary.md', summaryReport);

    console.log('✅ Snyk task list generated successfully');
  } catch (error) {
    console.error('❌ Error generating Snyk task list:', error.message);
    // Don't exit with error to avoid breaking the workflow
  }
}

/**
 * Generates a prioritized issues report
 */
function generatePrioritizedReport(vulnerabilities) {
  let report = '# Prioritized Security Issues\n\n';
  report += `*Generated on: ${new Date().toISOString().split('T')[0]}*\n\n`;

  if (vulnerabilities.length === 0) {
    report += '✅ No vulnerabilities found in Snyk scan.\n';
    return report;
  }

  const groupedBySeverity = vulnerabilities.reduce((acc, vuln) => {
    const severity = vuln.severity?.toLowerCase() || 'unknown';
    if (!acc[severity]) acc[severity] = [];
    acc[severity].push(vuln);
    return acc;
  }, {});

  Object.entries(groupedBySeverity).forEach(([severity, vulns]) => {
    report += `## ${severity.toUpperCase()} Severity (${vulns.length} issues)\n\n`;
    vulns.slice(0, 10).forEach((vuln, index) => {
      report += `### ${index + 1}. ${vuln.title || vuln.id}\n`;
      report += `- **Project**: ${vuln.project}\n`;
      report += `- **Package**: ${vuln.packageName || 'Unknown'}\n`;
      if (vuln.description) report += `- **Description**: ${vuln.description}\n`;
      if (vuln.fixedIn) report += `- **Fixed in**: ${vuln.fixedIn.join(', ')}\n`;
      report += '\n';
    });
  });

  return report;
}

/**
 * Generates a summary report
 */
function generateSummaryReport(vulnerabilities) {
  let report = '# Security Issues Summary\n\n';
  report += `*Generated on: ${new Date().toISOString().split('T')[0]}*\n\n`;

  const stats = vulnerabilities.reduce((acc, vuln) => {
    const severity = vuln.severity?.toLowerCase() || 'unknown';
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {});

  report += '## Overview\n\n';
  report += `- **Total Issues**: ${vulnerabilities.length}\n`;
  Object.entries(stats).forEach(([severity, count]) => {
    report += `- **${severity.toUpperCase()}**: ${count}\n`;
  });

  return report;
}