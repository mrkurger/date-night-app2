# Workflow Error Monitoring System

This document describes the workflow error monitoring system implemented in the Date Night App project.

## Overview

The workflow error monitoring system automatically collects logs from failed GitHub Actions workflows, analyzes them for common error patterns, and generates reports with recommendations for fixing the issues.

## Components

### 1. Log Collection Workflow

The `sync-workflow-errors-fixed.yml` workflow is responsible for collecting logs from failed workflows:

- **Trigger**: Runs after any workflow completes, on a schedule (every 6 hours), or manually
- **Permissions**: Requires `contents: write` and `actions: read` permissions
- **Process**:
  - Fetches metadata for all workflows in the repository
  - Identifies failed, cancelled, or timed-out workflow runs from the past 30 days
  - Downloads logs for all failed jobs
  - Stores logs in a structured format in the `workflow-error-logs` directory
  - Commits and pushes the logs to the repository

### 2. Error Analysis Tool

The `scripts/analyze-workflow-errors.js` script analyzes the collected logs:

- **Input**: Logs stored in the `workflow-error-logs` directory
- **Process**:
  - Scans all log files for common error patterns
  - Extracts context around each error
  - Groups errors by workflow and job
  - Generates a comprehensive report with recommendations
- **Output**: Generates a markdown report at `workflow-error-report.md`

### 3. Error Patterns Database

The error analysis tool includes a database of common error patterns:

- **NPM Errors**: Package not found, file not found, connection timeout, lifecycle script errors
- **Node.js Errors**: Module not found, memory limit exceeded
- **Build Errors**: TypeScript errors, JavaScript syntax errors
- **System Errors**: Disk space issues, file system limits
- **Tool-specific Errors**: Husky not found, etc.

Each error pattern includes:

- A regular expression to identify the error
- A name and description of the error
- A recommendation for fixing the issue

## Usage

### Viewing Error Logs

Error logs are stored in the `workflow-error-logs` directory with the following structure:

```
workflow-error-logs/
├── {workflow-name}/
│   ├── {date}_{run-id}/
│   │   ├── metadata.json       # Run metadata
│   │   ├── jobs.json           # Jobs metadata
│   │   ├── {job-name}/
│   │   │   ├── job-metadata.json  # Job metadata
│   │   │   └── logs.txt           # Job logs
│   │   └── ...
│   └── ...
└── ...
```

### Analyzing Error Logs

To analyze the error logs and generate a report:

```bash
node scripts/analyze-workflow-errors.js
```

This will create a report at `workflow-error-report.md` with:

- A table of contents organized by workflow
- Sections for each workflow and job
- Details of each error detected, including:
  - Error type and description
  - Recommendation for fixing the issue
  - Context around the error (5 lines before and after)
- A summary of error types and their frequency

### Manually Triggering Log Collection

You can manually trigger the log collection workflow:

1. Go to the "Actions" tab in the GitHub repository
2. Select the "Sync Workflow Error Logs" workflow (using the fixed version)
3. Click "Run workflow"
4. Select the branch and click "Run workflow"

## Extending the System

### Adding New Error Patterns

To add a new error pattern to the analysis tool, edit the `ERROR_PATTERNS` array in `scripts/analyze-workflow-errors.js`:

```javascript
const ERROR_PATTERNS = [
  // Existing patterns...

  // Add your new pattern here
  {
    pattern: /your regex pattern/i,
    name: 'Error Name',
    description: 'Description of the error',
    recommendation: 'How to fix the error',
  },
];
```

### Customizing the Report

To customize the report format, modify the `generateReport` function in `scripts/analyze-workflow-errors.js`.

## Best Practices

1. **Regular Review**: Regularly review the error reports to identify and fix recurring issues
2. **Pattern Updates**: Update the error patterns database as new types of errors are encountered
3. **Fix Documentation**: Document fixes for common errors in the project documentation
4. **Proactive Monitoring**: Use the error reports to proactively fix issues before they affect more workflows

## Troubleshooting

### Log Collection Issues

If the log collection workflow fails:

1. Check the workflow permissions in the repository settings
2. Ensure the GitHub token has sufficient permissions
3. Check for rate limiting issues in the workflow logs

### Analysis Issues

If the error analysis tool fails:

1. Ensure the `workflow-error-logs` directory exists and contains logs
2. Check for syntax errors in the script
3. Verify that the error patterns are valid regular expressions
