# Snyk Security Workflow

This document describes the Snyk security workflow implemented for the DateNight.io application. The workflow automatically scans the codebase for security vulnerabilities, code quality issues, and licensing problems, and generates prioritized reports for remediation.

## Overview

The Snyk workflow is designed to:

1. Regularly scan the codebase for security vulnerabilities
2. Analyze dependency trees to identify direct and transitive dependencies with issues
3. Generate detailed reports with prioritized remediation steps
4. Provide specific upgrade commands and strategies for fixing issues
5. Track security status over time

## Workflow Implementation

The workflow is implemented as a GitHub Action that runs daily and can also be triggered manually. It uses the Snyk CLI to scan the codebase and generates markdown reports that are committed to the repository.

### Workflow File

The workflow is defined in `.github/workflows/sync-snyk-issues.yml`:

```yaml
name: Sync Snyk Issues

on:
  schedule:
    - cron: '0 0 * * *' # Run daily at midnight
  workflow_dispatch: # Allow manual triggering

jobs:
  sync-snyk-issues:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      security-events: read

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Install Snyk CLI
        run: npm install -g snyk

      - name: Install dependencies
        run: |
          npm install
          cd server && npm install
          cd ../client-angular && npm install

      - name: Authenticate with Snyk
        run: snyk auth ${{ secrets.SNYK_TOKEN }}
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

      # Standard vulnerability tests
      - name: Scan root project
        run: snyk test --json > snyk-root-results.json || true

      - name: Scan server project
        run: cd server && snyk test --json > ../snyk-server-results.json || true

      - name: Scan client project
        run: cd client-angular && snyk test --json > ../snyk-client-results.json || true

      # Dependency vulnerability tests with detailed output
      - name: Scan root project dependencies
        run: snyk test --all-projects --json > snyk-root-deps-results.json || true

      - name: Generate dependency tree for root
        run: npm ls --json > npm-root-deps-tree.json || true

      - name: Generate dependency tree for server
        run: cd server && npm ls --json > ../npm-server-deps-tree.json || true

      - name: Generate dependency tree for client
        run: cd client-angular && npm ls --json > ../npm-client-deps-tree.json || true

      # Get upgrade recommendations
      - name: Get upgrade recommendations for root
        run: snyk test --json --dev --severity-threshold=low --print-deps > snyk-root-upgrade-paths.json || true

      - name: Get upgrade recommendations for server
        run: cd server && snyk test --json --dev --severity-threshold=low --print-deps > ../snyk-server-upgrade-paths.json || true

      - name: Get upgrade recommendations for client
        run: cd client-angular && snyk test --json --dev --severity-threshold=low --print-deps > ../snyk-client-upgrade-paths.json || true

      # Generate reports
      - name: Generate prioritized task list
        run: |
          mkdir -p docs/snyk-reports
          node .github/scripts/generate-snyk-task-list.js

      - name: Configure Git
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"

      - name: Commit and push changes
        run: |
          git add docs/snyk-reports/
          git commit -m "docs: update Snyk issues task list [skip ci]" || echo "No changes to commit"
          git push
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Report Generation Script

The workflow uses a Node.js script (`.github/scripts/generate-snyk-task-list.js`) to process the Snyk scan results and generate detailed reports. The script:

1. Parses the JSON output from Snyk scans
2. Extracts vulnerability information, dependency trees, and upgrade paths
3. Prioritizes issues based on severity, CVSS score, and fixability
4. Generates markdown reports with detailed remediation steps
5. Creates specific upgrade commands for direct dependencies
6. Provides npm override examples for transitive dependencies

## Generated Reports

The workflow generates three main reports in the `docs/snyk-reports/` directory:

1. **issues-summary.md**: A high-level overview of the current security status
2. **prioritized-issues.md**: A comprehensive list of all issues, prioritized by severity
3. **vulnerable-dependencies.md**: A focused analysis of vulnerable dependencies with upgrade paths

## Integration with Other Workflows

The Snyk workflow complements the existing GitHub Actions workflows:

- **angular-tests.yml** and **server-tests.yml**: These workflows ensure code quality through testing, while the Snyk workflow focuses on security vulnerabilities.

- **security-alerts-report.yml**: This workflow reports on GitHub's built-in security alerts, while the Snyk workflow provides more detailed vulnerability information and remediation steps.

- **sync-github-insights.yml**: This workflow collects repository metrics, which can be correlated with security metrics from the Snyk workflow.

## Using the Reports

The reports generated by the Snyk workflow are designed to be used by both developers and AI assistants:

### For Developers

1. Review the summary report to get an overview of the current security status
2. Address critical and high severity issues first
3. Follow the specific upgrade commands provided in the reports
4. Use the dependency upgrade plan to systematically fix vulnerable dependencies
5. Document fixes in commit messages

### For AI Assistance

The reports are structured to be easily parsed by AI assistants, allowing them to:

1. Explain vulnerabilities and their potential impact
2. Suggest specific fix approaches for each issue
3. Prioritize work based on severity and fixability
4. Implement fixes by following the provided commands
5. Analyze dependency trees to understand the source of vulnerabilities

## Setup Requirements

To use this workflow, you need:

1. A Snyk account and API token
2. The token stored as a GitHub secret named `SNYK_TOKEN`
3. Appropriate GitHub workflow permissions (contents: write, security-events: read)

## Maintenance and Troubleshooting

### Common Issues

1. **Workflow fails to authenticate with Snyk**: Verify that the `SNYK_TOKEN` secret is correctly set in the repository settings.

2. **Reports show no issues despite known vulnerabilities**: Check that the Snyk CLI is scanning all projects correctly and that the JSON output is being properly generated.

3. **Workflow fails to commit changes**: Ensure that the workflow has the necessary permissions to write to the repository.

### Updating the Workflow

To update the workflow:

1. Modify the `.github/workflows/sync-snyk-issues.yml` file to change the schedule or add new scan options
2. Update the `.github/scripts/generate-snyk-task-list.js` script to modify the report format or prioritization logic
3. Test changes by manually triggering the workflow

## Future Enhancements

Potential enhancements to the workflow include:

1. **Integration with issue tracking**: Automatically create GitHub issues for critical vulnerabilities
2. **Pull request generation**: Create PRs with dependency updates for simple fixes
3. **Trend analysis**: Track security metrics over time and generate trend reports
4. **Custom policies**: Implement organization-specific security policies
5. **Slack/Teams notifications**: Send alerts for critical vulnerabilities

## Resources

- [Snyk Documentation](https://docs.snyk.io/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [npm Overrides Documentation](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#overrides)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
