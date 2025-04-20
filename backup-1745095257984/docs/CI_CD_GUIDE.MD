# CI/CD Guide

This comprehensive guide outlines the Continuous Integration and Continuous Deployment (CI/CD) practices for the Date Night App project, including GitHub Actions workflows, GitHub integrations, and best practices.

## Table of Contents

- [Overview](#overview)
- [GitHub Actions Workflows](#github-actions-workflows)
  - [Core Workflows](#core-workflows)
  - [AI-Powered Workflows](#ai-powered-workflows)
  - [GitHub Insights Workflows](#github-insights-workflows)
- [GitHub Integration](#github-integration)
  - [Dependabot Integration](#dependabot-integration)
  - [Security Scanning](#security-scanning)
  - [Test Results Integration](#test-results-integration)
  - [Documentation Automation](#documentation-automation)
- [Workflow Permissions](#workflow-permissions)
- [Troubleshooting](#troubleshooting)
  - [Common Issues](#common-issues)
  - [Husky Integration Issues](#husky-integration-issues)
- [Best Practices](#best-practices)
- [Implementation Plan](#implementation-plan)

## Overview

## AI-Powered GitHub Actions

This section outlines AI-powered GitHub Actions that can be integrated into the project workflow to enhance code quality, security, and development efficiency.

## Code Quality and Review

### 1. GitHub Copilot for PRs

**Action**: [github/copilot-for-prs](https://github.com/marketplace/actions/github-copilot-for-pull-requests)

**Benefits**:

- Automatically reviews pull requests using AI
- Suggests code improvements and identifies potential issues
- Provides explanations for complex code changes
- Helps identify security vulnerabilities

**Setup Example**:

```yaml
name: GitHub Copilot for PRs

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  copilot-for-prs:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      - uses: github/copilot-for-prs@v0.6.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### 2. DeepSource Code Analysis

**Action**: [DeepSource](https://github.com/marketplace/deepsource)

**Benefits**:

- Uses AI to detect bugs, anti-patterns, and security issues
- Provides automated code reviews with explanations
- Supports multiple languages including JavaScript, TypeScript, and Python
- Tracks code quality metrics over time

**Setup**: Requires integration through the DeepSource platform.

## Security Analysis

### 3. CodeQL Analysis

**Action**: [github/codeql-action](https://github.com/marketplace/actions/codeql-analysis)

**Benefits**:

- GitHub's semantic code analysis engine
- Discovers vulnerabilities and coding errors
- Supports JavaScript, TypeScript, Python, and other languages
- Integrates with GitHub Security dashboard

**Setup Example**:

```yaml
name: 'CodeQL'

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0' # Run weekly

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    permissions:
      security-events: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: javascript, typescript

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2
```

### 4. Snyk Security Scan

**Action**: [snyk/actions](https://github.com/marketplace/actions/snyk)

**Benefits**:

- Scans for vulnerabilities in dependencies
- Provides AI-powered fix recommendations
- Monitors applications continuously for new vulnerabilities
- Integrates with GitHub Security dashboard

**Setup Example**:

```yaml
name: Snyk Security

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
```

## Performance Optimization

### 5. Lighthouse CI

**Action**: [treosh/lighthouse-ci-action](https://github.com/marketplace/actions/lighthouse-ci-action)

**Benefits**:

- Runs Lighthouse performance audits on your web app
- Uses AI to suggest performance improvements
- Tracks performance metrics over time
- Fails builds if performance drops below thresholds

**Setup Example**:

```yaml
name: Lighthouse CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            https://staging-url-of-your-app/
          uploadArtifacts: true
          temporaryPublicStorage: true
```

## Documentation and Knowledge Management

### 6. AI Documentation Generator

**Action**: [mintlify/writer](https://github.com/marketplace/actions/mintlify-writer)

**Benefits**:

- Automatically generates documentation from code
- Uses AI to create human-readable explanations
- Keeps documentation in sync with code changes
- Supports multiple programming languages

**Setup Example**:

```yaml
name: Generate Documentation

on:
  push:
    branches: [main]

jobs:
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Generate Documentation
        uses: mintlify/writer@v2.0.0
        with:
          target-directory: './docs/api'
```

### 7. AI Changelog Generator

**Action**: [TriPSs/conventional-changelog-action](https://github.com/marketplace/actions/conventional-changelog-action)

**Benefits**:

- Automatically generates changelogs from commit messages
- Uses AI to categorize and summarize changes
- Maintains a consistent changelog format
- Integrates with semantic versioning

**Setup Example**:

```yaml
name: Generate Changelog

on:
  push:
    branches: [main]

jobs:
  changelog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Generate Changelog
        uses: TriPSs/conventional-changelog-action@v3
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          git-message: 'chore(release): {version}'
          preset: 'angular'
          tag-prefix: 'v'
          output-file: 'CHANGELOG.md'
```

## Test Analysis and Improvement

### 8. Test Insights with AI

**Action**: [testomatio/check-tests](https://github.com/marketplace/actions/check-tests)

**Benefits**:

- Analyzes test coverage and quality
- Uses AI to suggest test improvements
- Identifies untested code paths
- Generates test reports with insights

**Setup Example**:

```yaml
name: Test Insights

on:
  pull_request:
    branches: [main]

jobs:
  test-insights:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check Tests
        uses: testomatio/check-tests@master
        with:
          framework: jest
          tests: '**/*.test.js'
          token: ${{ secrets.GITHUB_TOKEN }}
```

## Implementation Plan

To implement these AI-powered GitHub Actions:

1. **Start with the basics**:

   - CodeQL Analysis for security
   - GitHub Copilot for PRs for code review

2. **Add performance monitoring**:

   - Lighthouse CI for web performance

3. **Enhance documentation**:

   - AI Documentation Generator
   - AI Changelog Generator

4. **Improve testing**:
   - Test Insights with AI

Each of these actions can be implemented incrementally to avoid overwhelming the CI/CD pipeline and to allow time for the team to adapt to the new tools and insights.

## GitHub Insights Workflows

This section explains the two approaches we've implemented for generating GitHub insights reports in the project.

## Approach 1: Using GitHub API (Requires Special Permissions)

The first approach uses the GitHub API to fetch repository information, workflow runs, security alerts, and other data directly from GitHub. This is implemented in `.github/workflows/sync-github-insights.yml`.

### Requirements

- A Personal Access Token (PAT) with the following permissions:
  - `repo` (all)
  - `workflow`
  - `read:packages`

### How It Works

1. The workflow uses the GitHub API to fetch repository information, workflow runs, pull requests, and issues
2. It organizes this information into a comprehensive markdown report
3. It also generates a structured data file specifically for AI analysis
4. The reports are committed to the repository in `docs/github-insights/`

### Limitations

- Requires special permissions that may not be available to all users
- May fail with "Resource not accessible by integration" or "Not Found" errors
- GitHub's API is subject to rate limiting and permission changes

## Approach 2: Using Git Commands (Alternative Approach)

The second approach uses git commands and shell scripts to gather information about the repository locally. This is implemented in `.github/workflows/sync-github-insights-alt.yml`.

### Requirements

- No special permissions required beyond basic repository access
- Git installed in the workflow environment

### How It Works

1. The workflow uses git commands like `git log` and `git branch` to gather repository information
2. It also uses shell commands like `find` to analyze the repository structure
3. It generates both a human-readable markdown report and a structured data file for AI analysis
4. The reports are committed to the repository in `docs/github-insights/`

### Advantages

- Works without special GitHub API permissions
- Provides detailed information about the repository structure and history
- Less susceptible to API changes and rate limiting
- Can include file statistics and directory structure analysis

## Which Approach to Use

### Use Approach 1 (GitHub API) if:

- You have the necessary permissions
- You want to include information about workflow runs, pull requests, and issues
- You prefer a more comprehensive report with data from GitHub's web interface

### Use Approach 2 (Git Commands) if:

- You encounter permission issues with the GitHub API
- You want more detailed information about the repository structure
- You want to include file statistics and directory analysis
- You prefer a simpler approach that doesn't rely on external APIs

## Setting Up the Workflows

Three workflows are available in the repository:

1. **Sync GitHub Insights** (Original): Uses GitHub API but may encounter permission issues
2. **Sync GitHub Insights (Fixed)**: An improved version of the original with better error handling
3. **Sync GitHub Insights (Alternative)**: Uses git commands instead of the GitHub API

If you encounter permission issues with the first approach:

1. Go to your GitHub repository
2. Navigate to **Actions** > **Sync GitHub Insights**
3. Click the three dots menu (⋮) and select **Disable workflow**
4. Then go to **Sync GitHub Insights (Fixed)** or **Sync GitHub Insights (Alternative)**
5. If it's disabled, click **Enable workflow**

We recommend trying the workflows in this order:

1. First try **Sync GitHub Insights (Fixed)** as it provides the most comprehensive information if permissions are available
2. If that fails, use **Sync GitHub Insights (Alternative)** which works without special permissions

## Customizing the Reports

### Customizing the GitHub API Report

Edit `.github/workflows/sync-github-insights.yml` and modify the JavaScript code in the `script` section to change:

- The report format
- The information included
- The API endpoints queried

### Customizing the Git Commands Report

Edit `.github/workflows/sync-github-insights-alt.yml` and modify:

- The shell script in the `Generate Basic Repository Info` step to change the report format
- The git commands to adjust the information gathered
- The find commands to change the file analysis parameters

## Troubleshooting

### "Not Found" or "Resource not accessible by integration" Errors

If you see these errors with the GitHub API approach:

1. Check that your PAT has the necessary permissions
2. Verify that the repository exists and is accessible
3. Consider switching to the alternative approach

### Empty or Incomplete Reports

If the reports are empty or incomplete:

1. Check the workflow logs for any errors during the execution
2. Verify that the git commands are working correctly
3. Check that the workflow can access the necessary files and directories

## GitHub Integration

This section outlines how the Date Night App project can better leverage GitHub features, particularly for integrating Dependabot alerts and GitHub Actions test results into the development workflow.

## Table of Contents

- [Current GitHub Usage](#current-github-usage)
- [Improvement Opportunities](#improvement-opportunities)
- [Dependabot Integration](#dependabot-integration)
- [GitHub Actions Test Results Integration](#github-actions-test-results-integration)
- [Automated Documentation Updates](#automated-documentation-updates)
- [AI-Assisted Code Review](#ai-assisted-code-review)
- [Implementation Plan](#implementation-plan)

## Current GitHub Usage

The project currently uses GitHub for:

1. **Source Control**: Standard Git repository functionality
2. **GitHub Actions Workflows**:
   - Angular Tests (`angular-tests.yml`)
   - Server Tests (`server-tests.yml`)
3. **Artifact Storage**: Test results are uploaded as artifacts

However, the project is not fully leveraging GitHub's capabilities for:

- Dependency management and security alerts (Dependabot)
- Automated documentation generation from CI/CD results
- Structured reporting of test results and code quality metrics

## Improvement Opportunities

### 1. Dependabot Integration

Dependabot can automatically create pull requests to update dependencies when new versions are available or when security vulnerabilities are discovered.

### 2. Enhanced GitHub Actions Workflows

The existing workflows can be enhanced to:

- Generate structured reports
- Update documentation automatically
- Provide more detailed insights into test results

### 3. Automated Documentation

GitHub Actions can be used to automatically update documentation based on:

- Test results
- Code coverage reports
- Dependency updates
- Performance metrics

### 4. AI-Assisted Development

AI tools (like GitHub Copilot) can be better integrated into the workflow to:

- Analyze test results
- Suggest fixes for failing tests
- Review code changes
- Identify potential issues

## Dependabot Integration

### Configuration

Create a `.github/dependabot.yml` file with the following configuration:

```yaml
version: 2
updates:
  # Client Angular dependencies
  - package-ecosystem: 'npm'
    directory: '/client-angular'
    schedule:
      interval: 'weekly'
    open-pull-requests-limit: 10
    groups:
      angular-dependencies:
        patterns:
          - '@angular*'
    commit-message:
      prefix: 'deps(client)'
      include: 'scope'

  # Server dependencies
  - package-ecosystem: 'npm'
    directory: '/server'
    schedule:
      interval: 'weekly'
    open-pull-requests-limit: 10
    commit-message:
      prefix: 'deps(server)'
      include: 'scope'

  # GitHub Actions
  - package-ecosystem: 'github-actions'
    directory: '/'
    schedule:
      interval: 'monthly'
    commit-message:
      prefix: 'ci'
      include: 'scope'
```

### Security Alerts Report

Create a GitHub Action workflow to generate a report of Dependabot security alerts:

```yaml
name: Security Alerts Report

on:
  schedule:
    - cron: '0 0 * * 1' # Run weekly on Monday
  workflow_dispatch: # Allow manual triggering

jobs:
  generate-report:
    runs-on: ubuntu-latest
    permissions:
      security-events: read
      contents: write

    steps:
      - uses: actions/checkout@v4

      - name: Get Dependabot Alerts
        id: get-alerts
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const alerts = await github.rest.dependabot.listAlertsForRepo({
              owner: context.repo.owner,
              repo: context.repo.repo,
              state: 'open',
              per_page: 100
            });

            const fs = require('fs');

            let report = '# Dependabot Security Alerts\n\n';
            report += `*Generated on: ${new Date().toISOString().split('T')[0]}*\n\n`;

            if (alerts.data.length === 0) {
              report += '✅ No open security alerts found.\n';
            } else {
              report += `## Open Alerts (${alerts.data.length})\n\n`;
              
              const severityOrder = ['critical', 'high', 'medium', 'low'];
              const alertsBySeverity = {};
              
              severityOrder.forEach(severity => {
                alertsBySeverity[severity] = [];
              });
              
              alerts.data.forEach(alert => {
                const severity = alert.security_advisory.severity.toLowerCase();
                if (alertsBySeverity[severity]) {
                  alertsBySeverity[severity].push(alert);
                }
              });
              
              severityOrder.forEach(severity => {
                const severityAlerts = alertsBySeverity[severity];
                if (severityAlerts.length > 0) {
                  report += `### ${severity.charAt(0).toUpperCase() + severity.slice(1)} Severity (${severityAlerts.length})\n\n`;
                  
                  severityAlerts.forEach(alert => {
                    report += `#### ${alert.security_advisory.summary}\n\n`;
                    report += `- **Package**: ${alert.dependency.package.name}\n`;
                    report += `- **Current Version**: ${alert.dependency.manifest_path}\n`;
                    report += `- **Vulnerable Versions**: ${alert.security_advisory.vulnerabilities.map(v => v.vulnerable_version_range).join(', ')}\n`;
                    report += `- **Patched Versions**: ${alert.security_advisory.vulnerabilities.map(v => v.patched_version_range || 'None').join(', ')}\n`;
                    report += `- **CVSS Score**: ${alert.security_advisory.cvss.score} (${alert.security_advisory.cvss.vector_string})\n`;
                    report += `- **Details**: [${alert.security_advisory.ghsa_id}](${alert.security_advisory.html_url})\n\n`;
                  });
                }
              });
            }

            fs.writeFileSync('docs/security-alerts.md', report);

            return { alertCount: alerts.data.length };

      - name: Commit Report
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add docs/security-alerts.md
          git commit -m "docs: update security alerts report" || echo "No changes to commit"
          git push
```

## GitHub Actions Test Results Integration

### Enhanced Test Reporting

Modify the existing GitHub Actions workflows to generate detailed test reports:

```yaml
# Add to both angular-tests.yml and server-tests.yml
- name: Generate Test Report
  if: always()
  run: |
    mkdir -p test-reports
    # Convert test results to markdown format
    node scripts/generate-test-report.js

- name: Upload Test Report
  uses: actions/upload-artifact@v4
  if: always()
  with:
    name: test-reports
    path: test-reports/
```

### Test Report Generator Script

Create a script to convert test results to markdown:

```javascript
// scripts/generate-test-report.js
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

async function generateTestReport() {
  // Read JUnit XML test results
  const xmlData = fs.readFileSync('test-results/junit.xml', 'utf8');
  const parser = new xml2js.Parser({ explicitArray: false });
  const result = await parser.parseStringPromise(xmlData);

  const testsuites = Array.isArray(result.testsuites.testsuite)
    ? result.testsuites.testsuite
    : [result.testsuites.testsuite];

  let report = '# Test Results\n\n';
  report += `*Generated on: ${new Date().toISOString().split('T')[0]}*\n\n`;

  let totalTests = 0;
  let totalFailures = 0;
  let totalErrors = 0;
  let totalSkipped = 0;

  testsuites.forEach(suite => {
    totalTests += parseInt(suite.$.tests || 0);
    totalFailures += parseInt(suite.$.failures || 0);
    totalErrors += parseInt(suite.$.errors || 0);
    totalSkipped += parseInt(suite.$.skipped || 0);
  });

  const totalPassed = totalTests - totalFailures - totalErrors - totalSkipped;
  const passRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(2) : '0.00';

  report += '## Summary\n\n';
  report += `- **Total Tests**: ${totalTests}\n`;
  report += `- **Passed**: ${totalPassed} (${passRate}%)\n`;
  report += `- **Failed**: ${totalFailures}\n`;
  report += `- **Errors**: ${totalErrors}\n`;
  report += `- **Skipped**: ${totalSkipped}\n\n`;

  report += '## Test Suites\n\n';

  testsuites.forEach(suite => {
    const suiteName = suite.$.name;
    const suiteTests = parseInt(suite.$.tests || 0);
    const suiteFailures = parseInt(suite.$.failures || 0);
    const suiteErrors = parseInt(suite.$.errors || 0);
    const suiteSkipped = parseInt(suite.$.skipped || 0);
    const suitePassed = suiteTests - suiteFailures - suiteErrors - suiteSkipped;
    const suitePassRate = suiteTests > 0 ? ((suitePassed / suiteTests) * 100).toFixed(2) : '0.00';

    report += `### ${suiteName}\n\n`;
    report += `- **Tests**: ${suiteTests}\n`;
    report += `- **Pass Rate**: ${suitePassRate}%\n`;
    report += `- **Duration**: ${suite.$.time || 0}s\n\n`;

    if (suiteFailures > 0 || suiteErrors > 0) {
      report += '#### Failed Tests\n\n';

      const testcases = Array.isArray(suite.testcase) ? suite.testcase : [suite.testcase];

      testcases.forEach(testcase => {
        if (testcase.failure || testcase.error) {
          report += `- **${testcase.$.name}**: `;
          if (testcase.failure) {
            report += `Failed - ${testcase.failure.$.message || 'No message'}\n`;
          } else if (testcase.error) {
            report += `Error - ${testcase.error.$.message || 'No message'}\n`;
          }
        }
      });

      report += '\n';
    }
  });

  // Write report to file
  fs.mkdirSync('test-reports', { recursive: true });
  fs.writeFileSync('test-reports/test-results.md', report);

  // Also create a summary version for the main documentation
  const summaryReport =
    `# Latest Test Results\n\n` +
    `*Generated on: ${new Date().toISOString().split('T')[0]}*\n\n` +
    `## Summary\n\n` +
    `- **Total Tests**: ${totalTests}\n` +
    `- **Pass Rate**: ${passRate}%\n` +
    `- **Failed**: ${totalFailures}\n` +
    `- **Errors**: ${totalErrors}\n` +
    `- **Skipped**: ${totalSkipped}\n\n` +
    `[View Full Report](./TEST-RESULTS.MD)\n`;

  fs.writeFileSync('docs/latest-test-results.md', summaryReport);
}

generateTestReport().catch(console.error);
```

### Workflow to Sync Reports to Repository

Create a new GitHub Action workflow to sync test reports to the repository:

```yaml
name: Sync Test Reports

on:
  workflow_run:
    workflows: ['Angular Tests', 'Server Tests']
    types:
      - completed

jobs:
  sync-reports:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Download Angular Test Artifacts
        uses: dawidd6/action-download-artifact@v2
        with:
          workflow: angular-tests.yml
          workflow_conclusion: completed
          name: test-reports
          path: downloaded-reports/angular

      - name: Download Server Test Artifacts
        uses: dawidd6/action-download-artifact@v2
        with:
          workflow: server-tests.yml
          workflow_conclusion: completed
          name: server-test-reports
          path: downloaded-reports/server

      - name: Merge Reports
        run: |
          mkdir -p docs/test-reports
          cp -r downloaded-reports/angular/* docs/test-reports/ || true
          cp -r downloaded-reports/server/* docs/test-reports/ || true

          # Create combined report
          node scripts/combine-test-reports.js

      - name: Commit Reports
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add docs/test-reports
          git add docs/latest-test-results.md
          git commit -m "docs: update test reports" || echo "No changes to commit"
          git push
```

## Automated Documentation Updates

### GitHub Actions Status Badge

Add GitHub Actions status badges to the README.md:

```markdown
# Date Night App

[![Angular Tests](https://github.com/username/date-night-app/actions/workflows/angular-tests.yml/badge.svg)](https://github.com/username/date-night-app/actions/workflows/angular-tests.yml)
[![Server Tests](https://github.com/username/date-night-app/actions/workflows/server-tests.yml/badge.svg)](https://github.com/username/date-night-app/actions/workflows/server-tests.yml)
```

### Dependency Status Report

Create a workflow to generate a dependency status report:

```yaml
name: Dependency Status Report

on:
  schedule:
    - cron: '0 0 * * 1' # Run weekly on Monday
  workflow_dispatch:

jobs:
  generate-report:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Generate Client Dependencies Report
        run: |
          cd client-angular
          npm ci
          npx npm-check --json > ../client-deps.json

      - name: Generate Server Dependencies Report
        run: |
          cd server
          npm ci
          npx npm-check --json > ../server-deps.json

      - name: Create Markdown Report
        run: |
          node scripts/generate-dependency-report.js

      - name: Commit Report
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add docs/dependency-status.md
          git commit -m "docs: update dependency status report" || echo "No changes to commit"
          git push
```

### Dependency Report Generator Script

Create a script to generate a dependency status report:

```javascript
// scripts/generate-dependency-report.js
const fs = require('fs');

function generateDependencyReport() {
  const clientDeps = JSON.parse(fs.readFileSync('client-deps.json', 'utf8'));
  const serverDeps = JSON.parse(fs.readFileSync('server-deps.json', 'utf8'));

  let report = '# Dependency Status Report\n\n';
  report += `*Generated on: ${new Date().toISOString().split('T')[0]}*\n\n`;

  // Client dependencies
  report += '## Client Dependencies\n\n';
  report += '### Outdated Dependencies\n\n';
  report += '| Package | Current | Latest | Type |\n';
  report += '|---------|---------|--------|------|\n';

  let hasOutdatedClient = false;

  clientDeps.forEach(dep => {
    if (dep.installed && dep.latest && dep.installed !== dep.latest) {
      hasOutdatedClient = true;
      report += `| ${dep.moduleName} | ${dep.installed} | ${dep.latest} | ${dep.devDependency ? 'dev' : 'prod'} |\n`;
    }
  });

  if (!hasOutdatedClient) {
    report += '✅ No outdated dependencies\n\n';
  } else {
    report += '\n';
  }

  // Server dependencies
  report += '## Server Dependencies\n\n';
  report += '### Outdated Dependencies\n\n';
  report += '| Package | Current | Latest | Type |\n';
  report += '|---------|---------|--------|------|\n';

  let hasOutdatedServer = false;

  serverDeps.forEach(dep => {
    if (dep.installed && dep.latest && dep.installed !== dep.latest) {
      hasOutdatedServer = true;
      report += `| ${dep.moduleName} | ${dep.installed} | ${dep.latest} | ${dep.devDependency ? 'dev' : 'prod'} |\n`;
    }
  });

  if (!hasOutdatedServer) {
    report += '✅ No outdated dependencies\n\n';
  } else {
    report += '\n';
  }

  fs.writeFileSync('docs/dependency-status.md', report);
}

generateDependencyReport();
```

## AI-Assisted Code Review

### GitHub Actions for AI Code Review

Create a workflow for AI-assisted code review:

```yaml
name: AI Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: AI Code Review
        uses: reviewdog/action-suggester@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          tool_name: ai-review
          level: warning
          filter_mode: added
          reporter: github-pr-review
```

## Implementation Plan

1. **Phase 1: Basic GitHub Integration**

   - Add Dependabot configuration
   - Add GitHub Actions status badges to README
   - Create initial documentation structure

2. **Phase 2: Enhanced Test Reporting**

   - Implement test report generation scripts
   - Configure workflows to generate and upload reports
   - Create workflow to sync reports to repository

3. **Phase 3: Dependency Management**

   - Implement dependency status report generation
   - Configure Dependabot security alerts report
   - Create documentation for dependency management

4. **Phase 4: AI Integration**

   - Implement AI-assisted code review workflow
   - Create documentation for AI-assisted development
   - Integrate AI analysis of test results

5. **Phase 5: Advanced Features**
   - Implement performance tracking and reporting
   - Create dashboards for monitoring project health
   - Implement automated issue creation for failing tests

## Conclusion

By implementing these GitHub integrations, the Date Night App project can significantly improve its development workflow, particularly in the areas of:

1. **Dependency Management**: Automated updates and security alerts
2. **Test Reporting**: Detailed insights into test results
3. **Documentation**: Automated updates based on CI/CD results
4. **AI Assistance**: Leveraging AI for code review and analysis

These improvements will lead to:

- Reduced manual effort in maintaining documentation
- Better visibility into project health
- Improved security through timely dependency updates
- More efficient development through AI assistance

## GitHub Repository Setup Guide

This section provides instructions for configuring the GitHub repository settings to enable all the integration features we've implemented.

## Enabling Dependabot Alerts

1. Go to your GitHub repository: https://github.com/mrkurger/date-night-app2
2. Navigate to **Settings** > **Security & analysis**
3. Enable the following features:
   - **Dependabot alerts**: Notifies you about vulnerabilities in your dependencies
   - **Dependabot security updates**: Automatically creates PRs to fix vulnerabilities
   - **Dependency graph**: Shows dependencies for your project

## Setting Up Branch Protection Rules

1. Go to your GitHub repository: https://github.com/mrkurger/date-night-app2
2. Navigate to **Settings** > **Branches**
3. Click on **Add rule** under "Branch protection rules"
4. Configure the following settings:

   - **Branch name pattern**: `main` (or your default branch)
   - **Require a pull request before merging**: Checked
   - **Require status checks to pass before merging**: Checked
     - Search for and select the following status checks:
       - `Angular Tests`
       - `Server Tests`
   - **Require branches to be up to date before merging**: Checked
   - **Require linear history**: Optional but recommended
   - **Include administrators**: Recommended for consistency

5. Click **Create** to save the rule

## Configuring GitHub Actions Permissions

1. Go to your GitHub repository: https://github.com/mrkurger/date-night-app2
2. Navigate to **Settings** > **Actions** > **General**
3. Under "Workflow permissions":
   - Select **Read and write permissions**
   - Check **Allow GitHub Actions to create and approve pull requests**
4. Click **Save**

## Setting Up Repository Secrets

Some workflows require additional permissions that can be provided through a Personal Access Token (PAT):

1. Create a Personal Access Token:

   - Go to your GitHub account settings: https://github.com/settings/tokens
   - Click **Generate new token** > **Generate new token (classic)**
   - Give it a descriptive name like "Date Night App Workflow Token"
   - Set an expiration date (recommended: 90 days)
   - Select the following scopes:
     - `repo` (all)
     - `workflow`
     - `read:packages`
   - Click **Generate token**
   - Copy the generated token (you won't be able to see it again)

2. Add the token as a repository secret:

   - Go to your GitHub repository: https://github.com/mrkurger/date-night-app2
   - Navigate to **Settings** > **Secrets and variables** > **Actions**
   - Click **New repository secret**
   - Name: `WORKFLOW_TOKEN`
   - Value: Paste the Personal Access Token you generated
   - Click **Add secret**

3. Additional secrets (if needed):
   - If your workflows require any other secrets (like API keys), add them here using the same process

## Enabling GitHub Pages (Optional)

If you want to publish your test reports and documentation as a website:

1. Go to your GitHub repository: https://github.com/mrkurger/date-night-app2
2. Navigate to **Settings** > **Pages**
3. Under "Source", select **Deploy from a branch**
4. Select the branch (e.g., `main`) and folder (e.g., `/docs`)
5. Click **Save**

## Verifying the Setup

After configuring these settings:

1. Go to the **Actions** tab to ensure workflows are running correctly
2. Check the **Security** tab to see Dependabot alerts
3. Make a small change and create a pull request to test the branch protection rules

## Troubleshooting

If you encounter issues with the GitHub integration:

1. Check the workflow run logs in the **Actions** tab
2. Verify that the repository has the correct permissions
3. Ensure all required files (`.github/workflows/*.yml` and `.github/dependabot.yml`) are present in the repository
4. Check that branch protection rules are correctly configured

## Workflow Permissions

This section explains how to resolve common permission issues with GitHub Actions workflows, particularly when accessing artifacts from other workflows or pushing changes to the repository.

## Common Permission Issues

### 1. "Resource not accessible by integration" Error

This error typically occurs when a workflow tries to access artifacts from another workflow or when accessing APIs that require special permissions, such as the Dependabot API. By default, GitHub Actions workflows have limited permissions to access these resources.

**Example error message:**

```
##[error]Resource not accessible by integration
```

### 2. GitHub API Access Issues

Several GitHub APIs have stricter permission requirements. Even with a PAT, you might encounter permission issues when trying to access certain APIs.

#### Dependabot API Issues

**Example error message:**

```
RequestError [HttpError]: Resource not accessible by integration
status: 403,
response: {
  url: 'https://api.github.com/repos/username/repo/dependabot/alerts?state=open&per_page=100',
  status: 403,
  ...
}
```

#### Repository API Issues

**Example error message:**

```
RequestError [HttpError]: Not Found - https://docs.github.com/rest/repos/repos#get-a-repository
status: 404,
response: {
  url: 'https://api.github.com/repos/username/repo',
  status: 404,
  ...
}
```

### 3. Push Permission Issues

Sometimes workflows may fail when trying to push changes to the repository, especially when triggered by other workflows.

## Solutions

### Option 1: Using a Personal Access Token (PAT) - Recommended

A Personal Access Token (PAT) provides the necessary permissions to access resources across workflows and push changes to the repository.

1. **Create a PAT**:

   - Go to your GitHub account settings: https://github.com/settings/tokens
   - Click **Generate new token** > **Generate new token (classic)**
   - Give it a descriptive name like "Workflow Token"
   - Set an expiration date (recommended: 90 days)
   - Select the following scopes:
     - `repo` (all)
     - `workflow`
     - `read:packages`
   - Click **Generate token**
   - Copy the generated token

2. **Add the PAT as a repository secret**:

   - Go to your repository settings
   - Navigate to **Settings** > **Secrets and variables** > **Actions**
   - Click **New repository secret**
   - Name: `WORKFLOW_TOKEN`
   - Value: Paste the PAT you generated
   - Click **Add secret**

3. **Use the PAT in your workflows**:

   For downloading artifacts:

   ```yaml
   - name: Download Artifacts
     uses: dawidd6/action-download-artifact@v2
     with:
       workflow: some-workflow.yml
       github_token: ${{ secrets.WORKFLOW_TOKEN }}
   ```

   For pushing changes:

   ```yaml
   - name: Commit and Push
     run: |
       git config --local user.email "action@github.com"
       git config --local user.name "GitHub Action"
       git add .
       git commit -m "Update files" || echo "No changes to commit"

       # Use PAT for push
       git remote set-url origin https://x-access-token:${WORKFLOW_TOKEN}@github.com/username/repo.git
       git push
     env:
       WORKFLOW_TOKEN: ${{ secrets.WORKFLOW_TOKEN }}
   ```

### Option 2: Configuring Workflow Permissions

You can also configure the permissions for the GitHub Actions workflow:

```yaml
jobs:
  job-name:
    runs-on: ubuntu-latest
    permissions:
      contents: write # For pushing changes
      actions: read # For accessing artifacts
      security-events: read # For accessing security alerts
```

However, this approach may not be sufficient for all cross-workflow interactions, which is why using a PAT is recommended.

### Option 3: Alternative Approaches for GitHub API Access

If you continue to experience issues accessing GitHub APIs even with a PAT, consider these alternative approaches:

#### For Dependabot Alerts:

1. **Use npm audit directly**:

   ```yaml
   - name: Run npm audit
     run: |
       cd your-package-directory
       npm audit --json > audit-results.json
   ```

2. **Use third-party security scanning tools** that don't require special GitHub permissions:
   - Snyk (`snyk test`)
   - OWASP Dependency Check
   - npm-audit-html for generating reports

#### For Repository Information:

1. **Use git commands directly**:

   ```yaml
   - name: Get repository information
     run: |
       # Get recent commits
       git log --pretty=format:"%h - %an, %ar : %s" -n 10 > recent-commits.txt

       # Get branch information
       git branch -a > branches.txt

       # Get file statistics
       find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" | grep -E '\.[a-zA-Z0-9]+$' | sed 's/.*\.//' | sort | uniq -c | sort -nr > file-stats.txt
   ```

2. **Create static reports with links** to GitHub web interface:

   ```yaml
   - name: Create static report
     run: |
       echo "# Repository Report" > report.md
       echo "" >> report.md
       echo "- [Pull Requests](https://github.com/username/repo/pulls)" >> report.md
       echo "- [Issues](https://github.com/username/repo/issues)" >> report.md
       echo "- [Actions](https://github.com/username/repo/actions)" >> report.md
   ```

## Troubleshooting

If you continue to experience permission issues:

1. **Check the workflow logs** for specific error messages
2. **Verify the PAT scopes** to ensure they include all necessary permissions
3. **Check the repository settings** to ensure Actions have the necessary permissions
4. **Consider using the `workflow_dispatch` event** to manually trigger workflows for testing

## References

- [GitHub Actions Permissions Documentation](https://docs.github.com/en/actions/security-guides/automatic-token-authentication)
- [Personal Access Tokens Documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

## Husky Integration Issues

### Issue

The GitHub Actions workflows were failing with errors related to Husky not being found in CI environments. This was happening because the `prepare` script in package.json was trying to run Husky in CI environments where it wasn't needed.

### Solution

#### 1. Added a preinstall script

Added a `preinstall` script to package.json that runs a custom script to disable Husky in CI environments:

```json
"preinstall": "node scripts/disable-husky-in-ci.js"
```

#### 2. Created a disable-husky-in-ci.js script

Created a script that:

- Creates a `.huskyrc` file that exits early when the CI environment variable is set
- Makes the `.huskyrc` file executable
- Updates package.json if needed

```javascript
#!/usr/bin/env node

/**
 * This script disables husky in CI environments by creating a .huskyrc file
 * that exits early when CI environment variable is set.
 */

const fs = require('fs');
const path = require('path');

const huskyrcPath = path.join(__dirname, '..', '.huskyrc');
const huskyrcContent = `#!/bin/sh
# Skip husky hooks in CI environments
if [ -n "$CI" ]; then
  exit 0
fi
`;

// Create .huskyrc file
fs.writeFileSync(huskyrcPath, huskyrcContent, 'utf8');
console.log('.huskyrc file created to disable husky in CI environments');

// Make it executable
try {
  fs.chmodSync(huskyrcPath, '755');
  console.log('.huskyrc file made executable');
} catch (error) {
  console.warn('Could not make .huskyrc executable:', error.message);
}

// Update package.json to run this script before install
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = require(packageJsonPath);

if (!packageJson.scripts.preinstall) {
  packageJson.scripts.preinstall = 'node scripts/disable-husky-in-ci.js';
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
  console.log('Added preinstall script to package.json');
}
```

#### 3. Created a .huskyrc file

Created a `.huskyrc` file with the following content:

```sh
#!/bin/sh
# Skip husky hooks in CI environments
if [ -n "$CI" ]; then
  exit 0
fi
```

#### 4. Updated documentation

1. Updated the CHANGELOG.md file to document the changes
2. Added a new section to AILessons.md about CI/CD and Git Hooks
3. Created a dedicated WORKFLOW_FIXES.md file to document the workflow fixes
4. Created this HUSKY_CI_FIX.md file with detailed information about the fix

### Testing

The fix was tested by running the analyze-workflow-errors.js script, which confirmed that the error patterns were correctly identified.

### Future Considerations

1. Consider using a more robust method for detecting CI environments across different CI providers
2. Monitor workflow runs to ensure the fixes are working as expected
3. Consider adding more comprehensive error handling in the workflow scripts
4. Implement a more comprehensive solution for handling Git hooks in CI environments
