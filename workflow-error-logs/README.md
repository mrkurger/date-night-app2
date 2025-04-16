# Workflow Error Logs

This directory contains logs from failed GitHub Actions workflow runs. These logs are automatically collected by the "Sync Workflow Error Logs" workflow.

## Directory Structure

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

## Using These Logs

These logs can be used to diagnose and fix issues with GitHub Actions workflows. Look for error messages, failed steps, and other indicators of problems.

## Automatic Analysis

You can analyze the logs using the provided script:

```bash
node scripts/analyze-workflow-errors.js
```

This will generate a report at `workflow-error-report.md` with:

- Common error patterns detected
- Recommendations for fixing the issues
- Context around each error

## Automatic Collection

Logs are collected:

- After any workflow completes
- Every 6 hours via scheduled run
- Manually via workflow dispatch

## Retention

Only logs from the past 30 days are collected.
