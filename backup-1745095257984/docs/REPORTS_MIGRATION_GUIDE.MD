# Reports Migration Guide

## Overview

As part of our ongoing efforts to improve code organization and maintainability, we have consolidated all automatically generated reports into a single `downloaded-reports` directory. This document provides guidance on the migration and how to update any references to the old locations.

## Migration Summary

| Previous Location             | New Location                                       |
| ----------------------------- | -------------------------------------------------- |
| `docs/github-insights/`       | `downloaded-reports/github-insights/`              |
| `docs/security-alerts.md`     | `downloaded-reports/security/dependabot-alerts.md` |
| `docs/security-reports/`      | `downloaded-reports/security/html-reports/`        |
| `docs/snyk-reports/`          | `downloaded-reports/snyk/`                         |
| `docs/latest-test-results.md` | `downloaded-reports/testing/coverage-summary.md`   |
| `workflow-error-logs/`        | `downloaded-reports/workflow-errors/`              |

## New Directory Structure

```
downloaded-reports/
├── github-insights/         # GitHub repository insights and metrics
├── security/                # Security-related reports
│   ├── dependabot-alerts.md # Dependency vulnerability alerts
│   └── html-reports/        # HTML security audit reports
├── snyk/                    # Snyk security scanning reports
├── testing/                 # Test results and coverage reports
└── workflow-errors/         # GitHub Actions workflow error logs
```

## Workflow Changes

The following GitHub Actions workflows have been updated to use the new directory structure:

1. `security-alerts-report.yml`
2. `sync-github-insights.yml`
3. `sync-snyk-issues.yml`
4. `sync-test-reports.yml`
5. `sync-workflow-errors.yml`

## Script Changes

The following scripts have been updated to use the new directory structure:

1. `scripts/combine-test-reports.js`
2. `scripts/fetch-workflow-logs.js`
3. `.github/scripts/generate-snyk-task-list.js`

## Documentation Updates Needed

The following documentation files contain references to the old paths and should be updated:

1. `docs/GITHUB_INTEGRATION.md`
2. `docs/GITHUB_INSIGHTS_WORKFLOW.md`
3. `docs/SNYK_TOKEN_SETUP.md`
4. `docs/DOCUMENTATION_INDEX.md`
5. `docs/SECURITY_REMEDIATION_GUIDE.md`
6. `docs/SNYK_WORKFLOW.md`
7. `docs/WORKFLOW_ERROR_MONITORING.md`
8. `docs/SECURITY_ALERTS_WORKFLOW.md`

## How to Update References

If you have scripts, documentation, or other files that reference the old paths, please update them to use the new paths according to the migration summary above.

### Example Updates

#### Markdown Links

```markdown
<!-- Old -->

[Security Alerts](../docs/SECURITY-ALERTS.MD)

<!-- New -->

[Security Alerts](../downloaded-reports/security/DEPENDABOT-ALERTS.MD)
```

#### JavaScript/Node.js

```javascript
// Old
const reportsPath = path.join('docs', 'snyk-reports');

// New
const reportsPath = path.join('downloaded-reports', 'snyk');
```

#### Shell Scripts

```bash
# Old
cat docs/latest-test-results.md

# New
cat downloaded-reports/testing/coverage-summary.md
```

## Rationale for Changes

This reorganization provides several benefits:

1. **Improved Organization**: All automatically generated reports are now in a single directory with a clear structure.
2. **Separation of Concerns**: Clear separation between documentation (`docs/`) and generated reports (`downloaded-reports/`).
3. **Easier Maintenance**: Workflows and scripts now follow a consistent pattern for storing reports.
4. **Better Discoverability**: The new structure makes it easier to find specific types of reports.

## Questions or Issues

If you encounter any issues with the new structure or have questions about the migration, please contact the DevOps team or open an issue in the repository.
