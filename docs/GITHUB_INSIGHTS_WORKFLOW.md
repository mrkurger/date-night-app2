# GitHub Insights Workflow Guide

This document explains the two approaches we've implemented for generating GitHub insights reports in the project.

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

Both workflows are already configured in the repository. If you encounter permission issues with the first approach, you can disable it and rely on the alternative approach:

1. Go to your GitHub repository
2. Navigate to **Actions** > **Sync GitHub Insights**
3. Click the three dots menu (⋮) and select **Disable workflow**
4. Then go to **Sync GitHub Insights (Alternative)**
5. If it's disabled, click **Enable workflow**

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
