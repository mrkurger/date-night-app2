# GitHub Repository Setup Guide

This guide provides instructions for configuring the GitHub repository settings to enable all the integration features we've implemented.

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

If your workflows require any secrets (like API keys), add them here:

1. Go to your GitHub repository: https://github.com/mrkurger/date-night-app2
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add any required secrets (none are required for the current setup)

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
