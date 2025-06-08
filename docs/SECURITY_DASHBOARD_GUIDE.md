# Security Dashboard - Pro+ Edition 

## Overview

The Security Dashboard - Pro+ Edition is a comprehensive security monitoring system for the Date Night App repository. It automatically generates detailed security reports by combining results from multiple security scanning tools.

## Features

### 🔍 **Automated Security Scanning**
- **Trivy Security Scan**: Scans for vulnerabilities in dependencies and container images
- **CodeQL Analysis**: Performs static code analysis to identify security vulnerabilities
- **Combined Dashboard**: Merges results from all security tools into a unified view

### 📊 **Comprehensive Reporting**
- Interactive HTML dashboard with security metrics and trends
- GitHub Actions workflow summaries with quick stats
- Artifact generation for detailed security reports
- Automated issue creation/updates with dashboard links

### 🔄 **Automated Triggers**
- Daily generation at 6 AM UTC
- Triggered after security scan completion
- Manual trigger available via workflow_dispatch

## Workflow Components

### 1. Main Security Dashboard (`trivy-codeql-dashboard.yml`)
**Purpose**: Generates the comprehensive security dashboard
**Triggers**: 
- After Trivy and CodeQL workflows complete
- Daily at 6 AM UTC
- Manual trigger

**Key Features**:
- Fetches recent workflow runs from GitHub API
- Generates interactive HTML dashboard
- Creates workflow summaries
- Uploads dashboard as artifact
- Creates/updates GitHub issues with dashboard links

### 2. CodeQL Security Analysis (`codeql-analysis-pro.yml`) 
**Purpose**: Performs static code analysis for security vulnerabilities
**Languages**: JavaScript/TypeScript
**Features**:
- Uses extended security queries
- Generates SARIF results
- Uploads artifacts with scan results
- Compatible with GitHub Pro+ (no Code Scanning API required)

### 3. Trivy Security Scan (`trivy-scan-angular19.yml`)
**Purpose**: Scans for vulnerabilities in dependencies and file system
**Features**:
- Scans for HIGH and CRITICAL vulnerabilities
- Generates JSON output for dashboard consumption
- Continues on failures to allow dashboard generation
- Uploads scan results as artifacts

## Dashboard Content

The generated dashboard includes:

### 📊 **Security Overview**
- Total scans performed in the last 24 hours
- Latest Trivy scan status
- Latest CodeQL scan status
- Hours since last scan

### 🔄 **Recent Activity Tables**
- **Trivy Scans**: Date, branch, status, duration, links to runs
- **CodeQL Analyses**: Date, branch, status, duration, links to runs

### 📈 **Security Trends**
- Total scans performed over the past 7 days
- Average scan time across all security tools
- Success rate percentage

### 🎯 **Recommendations**
- Branch protection rule suggestions
- Security best practices
- Dependency management advice
- Regular security review recommendations

## Usage

### Viewing the Dashboard

1. **From GitHub Issues**: Look for issues titled "🔐 Security Dashboard - Pro+ Edition"
2. **From Actions**: Navigate to the Security Dashboard workflow runs
3. **Download Artifacts**: Download the `security-dashboard-X` artifact for the full HTML dashboard

### Manual Trigger

1. Go to **Actions** → **Security Dashboard**
2. Click **Run workflow**
3. Wait for completion and download the generated artifact

### Accessing Results

- **HTML Dashboard**: Download the artifact and open `index.html` in a browser
- **Workflow Summary**: View the summary directly in the GitHub Actions run
- **Issue Updates**: Check the automatically created/updated issues

## Technical Improvements (v2.0)

### Recent Enhancements
1. **Fixed deprecated syntax**: Replaced `::set-output` with modern `GITHUB_OUTPUT`
2. **Improved error handling**: Better handling of edge cases and division by zero
3. **Enhanced Trivy workflow**: Continues on failures and generates artifacts
4. **Added concurrency control**: Prevents multiple dashboard generations
5. **Added timeouts**: 15-minute timeout for dashboard generation
6. **Enhanced content**: More comprehensive recommendations and information

### Security Features
- Minimal required permissions (contents: read, actions: read, issues: write)
- Secure artifact handling with retention policies
- No secrets required for basic functionality
- Compatible with private repositories

## Troubleshooting

### Common Issues

1. **No recent scans showing**: Ensure Trivy and CodeQL workflows are enabled and running
2. **Dashboard not updating**: Check workflow triggers and permissions
3. **Missing artifacts**: Verify artifact retention settings and workflow completion

### Prerequisites

- Node.js 20+ for dashboard generation
- GitHub Actions enabled
- Proper workflow permissions configured

## Configuration

### Customizing Scan Frequency
Edit the cron schedule in `trivy-codeql-dashboard.yml`:
```yaml
schedule:
  - cron: '0 6 * * *'  # Daily at 6 AM UTC
```

### Modifying Security Tools
- Add/remove workflow names in the `workflow_run.workflows` array
- Customize severity levels in Trivy scans
- Adjust CodeQL query sets

### Dashboard Customization
- Modify the HTML template in the dashboard generation script
- Adjust metrics calculations
- Add custom recommendations

## Support

For issues or questions about the Security Dashboard:
1. Check existing GitHub issues in the repository
2. Review workflow run logs for error details
3. Verify all prerequisites are met
4. Ensure proper permissions are configured

---

*Security Dashboard - Pro+ Edition v2.0*  
*Generated by: Security Dashboard Workflow*  
*Last Updated: $(date)*