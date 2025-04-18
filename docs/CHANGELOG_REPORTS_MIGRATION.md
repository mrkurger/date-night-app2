# Changelog: Reports Directory Migration

## [2025-04-19] Reports Directory Restructuring

### Added

- New `downloaded-reports/` directory to centralize all automatically generated reports
- `downloaded-reports/README.md` with documentation of the new structure
- `docs/REPORTS_MIGRATION_GUIDE.md` to guide developers through the transition

### Changed

- Moved GitHub insights reports from `docs/github-insights/` to `downloaded-reports/github-insights/`
- Moved security alerts report from `docs/security-alerts.md` to `downloaded-reports/security/dependabot-alerts.md`
- Moved security HTML reports from `docs/security-reports/` to `downloaded-reports/security/html-reports/`
- Moved Snyk reports from `docs/snyk-reports/` to `downloaded-reports/snyk/`
- Moved test results from `docs/latest-test-results.md` to `downloaded-reports/testing/coverage-summary.md`
- Moved workflow error logs from `workflow-error-logs/` to `downloaded-reports/workflow-errors/`
- Updated all GitHub Actions workflows to use the new directory structure:
  - `security-alerts-report.yml`
  - `sync-github-insights.yml`
  - `sync-snyk-issues.yml`
  - `sync-test-reports.yml`
  - `sync-workflow-errors.yml`
- Updated related scripts to use the new directory structure:
  - `scripts/combine-test-reports.js`
  - `scripts/fetch-workflow-logs.js`
  - `.github/scripts/generate-snyk-task-list.js`

### Deprecated

- Old report paths in the `docs/` directory are now deprecated and will no longer be updated

### Removed

- Removed `docs/test-reports/` directory as it's no longer needed

### Technical Details

- All file moves were performed using `git mv` to preserve history
- All workflows and scripts were updated to point to the new locations
- Directory structure was standardized to improve organization and maintainability
