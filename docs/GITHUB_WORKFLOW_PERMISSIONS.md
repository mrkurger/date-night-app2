# GitHub Workflow Permissions Guide

This document explains how to resolve common permission issues with GitHub Actions workflows, particularly when accessing artifacts from other workflows or pushing changes to the repository.

## Common Permission Issues

### 1. "Resource not accessible by integration" Error

This error typically occurs when a workflow tries to access artifacts from another workflow. By default, GitHub Actions workflows have limited permissions to access resources from other workflows.

**Example error message:**

```
##[error]Resource not accessible by integration
```

### 2. Push Permission Issues

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

## Troubleshooting

If you continue to experience permission issues:

1. **Check the workflow logs** for specific error messages
2. **Verify the PAT scopes** to ensure they include all necessary permissions
3. **Check the repository settings** to ensure Actions have the necessary permissions
4. **Consider using the `workflow_dispatch` event** to manually trigger workflows for testing

## References

- [GitHub Actions Permissions Documentation](https://docs.github.com/en/actions/security-guides/automatic-token-authentication)
- [Personal Access Tokens Documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
