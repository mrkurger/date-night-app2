# Security Alerts Workflow Guide

This document explains the two approaches we've implemented for generating security alerts reports in the project.

## Approach 1: Using GitHub Dependabot API (Requires Special Permissions)

The first approach uses the GitHub Dependabot API to fetch security alerts directly from GitHub. This is implemented in `.github/workflows/security-alerts-report.yml`.

### Requirements

- A Personal Access Token (PAT) with the following permissions:
  - `repo` (all)
  - `security_events` (read)
  - `dependabot` (if available)

### How It Works

1. The workflow uses the GitHub API to fetch Dependabot alerts
2. It organizes alerts by severity (critical, high, medium, low)
3. It generates a markdown report with details about each alert
4. The report is committed to the repository in `docs/security-alerts.md`

### Limitations

- Requires special permissions that may not be available to all users
- May fail with "Resource not accessible by integration" errors
- GitHub's API for Dependabot alerts is subject to change

## Approach 2: Using npm audit (Alternative Approach)

The second approach uses npm's built-in audit functionality to scan dependencies directly. This is implemented in `.github/workflows/security-alerts-report-alt.yml`.

### Requirements

- No special permissions required beyond basic repository access
- Node.js and npm installed in the workflow environment

### How It Works

1. The workflow runs `npm audit` on each package directory (client, server)
2. It also runs `npm-check` to identify outdated dependencies
3. It generates both markdown and HTML reports
4. The reports are committed to the repository in:
   - `docs/security-alerts.md` (markdown summary)
   - `docs/security-reports/` (detailed HTML reports)

### Advantages

- Works without special GitHub permissions
- Provides more detailed information about vulnerabilities
- Includes information about outdated dependencies
- Generates visual HTML reports

## Which Approach to Use

### Use Approach 1 (Dependabot API) if:

- You have the necessary permissions
- You want to see alerts exactly as they appear in GitHub's security tab
- You prefer a simpler report focused only on security vulnerabilities

### Use Approach 2 (npm audit) if:

- You encounter permission issues with the Dependabot API
- You want more detailed information about dependencies
- You want HTML reports with visual representations of issues
- You want to check for outdated dependencies in addition to security issues

## Setting Up the Workflows

Both workflows are already configured in the repository. If you encounter permission issues with the first approach, you can disable it and rely on the alternative approach:

1. Go to your GitHub repository
2. Navigate to **Actions** > **Security Alerts Report**
3. Click the three dots menu (⋮) and select **Disable workflow**
4. Then go to **Security Alerts Report (Alternative)**
5. If it's disabled, click **Enable workflow**

## Customizing the Reports

### Customizing the Dependabot API Report

Edit `.github/workflows/security-alerts-report.yml` and modify the JavaScript code in the `script` section to change:

- The report format
- The information included
- The categorization of alerts

### Customizing the npm audit Report

Edit `.github/workflows/security-alerts-report-alt.yml` and modify:

- The shell script in the `Generate Combined Report` step to change the report format
- The `npm-check` and `npm audit` commands to adjust the scanning parameters

## Troubleshooting

### "Resource not accessible by integration" Error

If you see this error with the Dependabot API approach:

1. Check that your PAT has the necessary permissions
2. Verify that Dependabot is enabled for the repository
3. Consider switching to the alternative approach

### Empty or Incomplete Reports

If the reports are empty or incomplete:

1. Check that the package directories exist and contain valid package.json files
2. Verify that the workflow can access the necessary files
3. Check the workflow logs for any errors during the scanning process
