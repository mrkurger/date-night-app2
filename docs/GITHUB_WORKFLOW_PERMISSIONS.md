# GitHub Workflow Permissions Guide

This document explains how to resolve common permission issues with GitHub Actions workflows, particularly when accessing artifacts from other workflows or pushing changes to the repository.

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
