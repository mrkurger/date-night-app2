# Setting Up Snyk Token for Security Scanning

This guide explains how to set up a Snyk API token for the security scanning workflow.

## Overview

The DateNight.io application uses Snyk to scan for security vulnerabilities, code quality issues, and licensing problems. To enable this functionality, you need to:

1. Create a Snyk account
2. Generate an API token
3. Add the token as a GitHub secret

## Step-by-Step Instructions

### 1. Create a Snyk Account

1. Go to [snyk.io](https://snyk.io) and sign up for a free account
2. You can sign up using your GitHub, GitLab, Bitbucket, or Google account, or create a new account with your email

### 2. Generate a Snyk API Token

1. Log in to your Snyk account
2. Click on your profile picture in the top-right corner
3. Select "Account Settings"
4. Navigate to the "API Token" section
5. Click "Show" to reveal your existing token or "Regenerate" to create a new one
6. Copy the token to your clipboard

### 3. Add the Token as a GitHub Secret

1. Go to your GitHub repository
2. Click on "Settings" in the top navigation bar
3. In the left sidebar, click on "Secrets and variables" > "Actions"
4. Click on "New repository secret"
5. Enter `SNYK_TOKEN` as the name
6. Paste your Snyk API token as the value
7. Click "Add secret"

## Verifying the Setup

To verify that the token is set up correctly:

1. Go to the "Actions" tab in your GitHub repository
2. Select the "Sync Snyk Issues" workflow
3. Click "Run workflow" and select the branch to run on
4. Click "Run workflow" to start the process
5. Check the workflow logs to ensure it completes successfully
6. Verify that the reports are generated in the `docs/snyk-reports/` directory

## Running Snyk Locally

You can also run Snyk locally to test the integration:

```bash
# Install Snyk CLI
npm install -g snyk

# Authenticate with Snyk
snyk auth

# Run the local scan script
./scripts/run-snyk-local.sh
```

## Troubleshooting

### Common Issues

1. **Authentication Failure**: If the workflow fails with an authentication error, verify that the `SNYK_TOKEN` secret is correctly set in the repository settings.

2. **Token Expiration**: Snyk tokens may expire or be revoked. If this happens, generate a new token and update the GitHub secret.

3. **Rate Limiting**: Snyk has rate limits for API usage. If you encounter rate limiting issues, consider reducing the frequency of the workflow runs.

## Resources

- [Snyk Documentation](https://docs.snyk.io/)
- [Snyk API Documentation](https://docs.snyk.io/snyk-api-info)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
