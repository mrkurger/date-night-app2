#!/usr/bin/env node

/**
 * Workflow Error Analysis Tool
 *
 * This script analyzes workflow error logs collected by the sync-workflow-errors.yml workflow
 * and provides insights and recommendations for fixing the issues.
 */

import fs from 'fs/promises';
import path from 'path';
import util from 'util';

const LOGS_DIR = path.join(__dirname, '..', 'workflow-error-logs');
const REPORT_FILE = path.join(__dirname, '..', 'workflow-error-report.md');

// Common error patterns to look for
const ERROR_PATTERNS = [
  {
    pattern: /npm ERR! code E404/i,
    name: 'Package Not Found',
    description: 'A package dependency could not be found in the npm registry',
    recommendation: 'Check package.json for typos in package names or update to available versions',
  },
  {
    pattern: /npm ERR! code ENOENT/i,
    name: 'File Not Found',
    description: 'npm could not find a file it was looking for',
    recommendation: 'Check file paths and ensure all required files exist',
  },
  {
    pattern: /npm ERR! code ETIMEDOUT/i,
    name: 'Connection Timeout',
    description: 'Connection to npm registry timed out',
    recommendation: 'This is likely a temporary network issue. Retry the workflow.',
  },
  {
    pattern: /npm ERR! code ELIFECYCLE/i,
    name: 'Lifecycle Script Error',
    description: 'A npm script in package.json failed to execute',
    recommendation: 'Check the error message for details on which script failed and why',
  },
  {
    pattern: /husky: not found/i,
    name: 'Husky Not Found',
    description: 'The husky package is not installed or not accessible',
    recommendation:
      'Update prepare script to skip husky in CI: "prepare": "[ -n \"$CI\" ] || husky"',
  },
  {
    pattern: /Error: Cannot find module/i,
    name: 'Module Not Found',
    description: 'A required Node.js module could not be found',
    recommendation:
      'Ensure the module is listed in dependencies or devDependencies and run npm install',
  },
  {
    pattern: /FATAL ERROR: Reached heap limit/i,
    name: 'Memory Limit Exceeded',
    description: 'The Node.js process ran out of memory',
    recommendation:
      'Optimize memory usage or increase memory limit with NODE_OPTIONS="--max-old-space-size=4096"',
  },
  {
    pattern: /error TS\d+:/i,
    name: 'TypeScript Error',
    description: 'TypeScript compilation failed',
    recommendation: 'Fix the TypeScript errors reported in the logs',
  },
  {
    pattern: /error ENOSPC/i,
    name: 'No Space Left',
    description: 'The disk is full or inotify watch limit is reached',
    recommendation:
      'For watch limit: echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p',
  },
  {
    pattern: /error Unexpected token/i,
    name: 'JavaScript Syntax Error',
    description: 'There is a syntax error in JavaScript code',
    recommendation: 'Fix the syntax error reported in the logs',
  },
];

// Function to recursively find all log files
function findLogFiles(dir) {
  let results = [];

  // Check if directory exists
  if (!fs.existsSync(dir)) {
    return results;
  }

  const list = fs.readdirSync(dir);

  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results = results.concat(findLogFiles(filePath));
    } else if (file === 'logs.txt') {
      // Always include the main logs.txt file
      results.push(filePath);
    } else if (file.endsWith('.txt') && file !== 'error.txt' && file !== 'extract-error.txt') {
      // Also include other text files that might have been extracted from zip archives
      // but exclude error files
      results.push(filePath);
    }
  }

  return results;
}

// Function to analyze a log file for common errors
function analyzeLogFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const errors = [];

  for (const errorPattern of ERROR_PATTERNS) {
    if (errorPattern.pattern.test(content)) {
      // Extract context around the error
      const lines = content.split('\n');
      let errorLine = -1;

      for (let i = 0; i < lines.length; i++) {
        if (errorPattern.pattern.test(lines[i])) {
          errorLine = i;
          break;
        }
      }

      let context = '';
      if (errorLine >= 0) {
        const startLine = Math.max(0, errorLine - 5);
        const endLine = Math.min(lines.length, errorLine + 5);
        context = lines.slice(startLine, endLine).join('\n');
      }

      errors.push({
        type: errorPattern.name,
        description: errorPattern.description,
        recommendation: errorPattern.recommendation,
        context,
      });
    }
  }

  // Get workflow and job info from the file path
  const pathParts = filePath.split(path.sep);

  // Handle both standard logs.txt and extracted files from zip archives
  let workflowName, runId, jobName;

  if (pathParts[pathParts.length - 1] === 'logs.txt') {
    // Standard logs.txt file
    workflowName = pathParts[pathParts.length - 4];
    runId = pathParts[pathParts.length - 3].split('_')[1];
    jobName = pathParts[pathParts.length - 2];
  } else {
    // Extracted file from zip archive
    workflowName = pathParts[pathParts.length - 5];
    runId = pathParts[pathParts.length - 4].split('_')[1];
    jobName = pathParts[pathParts.length - 3] + ' (' + pathParts[pathParts.length - 1] + ')';
  }

  return {
    workflowName,
    runId,
    jobName,
    filePath,
    errors,
  };
}

// Function to generate a markdown report
function generateReport(analysisResults) {
  let report = '# Workflow Error Analysis Report\n\n';
  report += `Generated on: ${new Date().toISOString()}\n\n`;

  // Group by workflow
  const workflowGroups = {};
  for (const result of analysisResults) {
    if (!workflowGroups[result.workflowName]) {
      workflowGroups[result.workflowName] = [];
    }
    workflowGroups[result.workflowName].push(result);
  }

  // Generate TOC
  report += '## Table of Contents\n\n';
  for (const workflow in workflowGroups) {
    report += `- [${workflow}](#${workflow.toLowerCase().replace(/[^a-z0-9]+/g, '-')})\n`;
  }
  report += '\n';

  // Generate workflow sections
  for (const workflow in workflowGroups) {
    report += `## ${workflow}\n\n`;

    for (const result of workflowGroups[workflow]) {
      report += `### Job: ${result.jobName} (Run ID: ${result.runId})\n\n`;

      if (result.errors.length === 0) {
        report += 'No common errors detected in this job.\n\n';
      } else {
        for (const error of result.errors) {
          report += `#### ${error.type}\n\n`;
          report += `**Description**: ${error.description}\n\n`;
          report += `**Recommendation**: ${error.recommendation}\n\n`;
          report += '**Error Context**:\n\n```\n' + error.context + '\n```\n\n';
        }
      }
    }
  }

  // Add summary
  report += '## Summary\n\n';

  // Count errors by type
  const errorCounts = {};
  for (const result of analysisResults) {
    for (const error of result.errors) {
      if (!errorCounts[error.type]) {
        errorCounts[error.type] = 0;
      }
      errorCounts[error.type]++;
    }
  }

  report += '### Error Types\n\n';
  for (const errorType in errorCounts) {
    report += `- **${errorType}**: ${errorCounts[errorType]} occurrences\n`;
  }

  return report;
}

// Main function
function main() {
  console.log('Analyzing workflow error logs...');

  if (!fs.existsSync(LOGS_DIR)) {
    console.error(`Error: Logs directory not found at ${LOGS_DIR}`);
    console.log('Run the sync-workflow-errors.yml workflow first to collect logs.');
    process.exit(1);
  }

  const logFiles = findLogFiles(LOGS_DIR);
  console.log(`Found ${logFiles.length} log files to analyze.`);

  if (logFiles.length === 0) {
    console.log('No log files found. Run the sync-workflow-errors.yml workflow first.');
    process.exit(0);
  }

  const analysisResults = logFiles.map(analyzeLogFile);

  // Filter out results with no errors
  const resultsWithErrors = analysisResults.filter(result => result.errors.length > 0);

  console.log(`Found ${resultsWithErrors.length} jobs with common errors.`);

  const report = generateReport(analysisResults);
  fs.writeFileSync(REPORT_FILE, report);

  console.log(`Report generated at ${REPORT_FILE}`);
}

// Run the main function
main();
