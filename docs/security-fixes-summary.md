# Security Fixes Summary

## Overview

This document summarizes the security fixes implemented on 2025-04-16 to address vulnerabilities identified in GitHub security alerts and workflow failures.

## High Severity Issues Fixed

### 1. Artifact Poisoning Vulnerability in GitHub Actions

**Issue**: The `dawidd6/action-download-artifact` action in version 5 and earlier is vulnerable to artifact poisoning attacks.

**Fix**: Updated from v2 to v6 in `.github/workflows/sync-test-reports.yml`.

**Details**: This vulnerability (GHSA-5xr6-xhww-33m4) could allow attackers to manipulate artifacts in GitHub Actions workflows. The update to v6 includes security improvements that prevent this attack vector.

### 2. Regular Expression Denial of Service in semver

**Issue**: The semver package versions before 7.5.2 are vulnerable to ReDoS attacks.

**Fix**: Updated semver from ^7.7.1 to ^7.5.4 in both root and server package.json files.

**Details**: This vulnerability (GHSA-c2qf-rxjj-qqgw) could allow attackers to cause denial of service through specially crafted input to regular expressions. The update to 7.5.4 includes the security patch while maintaining compatibility.

## Medium Severity Issues Fixed

### 1. UNIX Socket Redirect in got

**Issue**: The got package allows a redirect to a UNIX socket, which could lead to server-side request forgery.

**Fix**: Added override for ^12.1.0 in root package.json.

**Details**: This vulnerability (GHSA-pfrx-2q88-qq97) could allow attackers to redirect requests to internal resources. The override ensures that all instances of got in the dependency tree use a patched version.

### 2. server.fs.deny Bypass in vite

**Issue**: Vite has vulnerabilities that allow bypassing the server.fs.deny protection with invalid request-targets or relative paths.

**Fix**:

- Updated vite from ^6.2.6 to ^6.2.7 in all package.json files
- Added specific override for @angular/build to use the patched vite version

**Details**: These vulnerabilities (GHSA-356w-63v5-8wf4, GHSA-xcj6-pq6g-qj4x) could allow attackers to access files outside the intended directory. The update to 6.2.7 includes patches for these issues.

## Workflow Improvements

### GitHub Actions Workflows

**Issue**: The GitHub Actions workflows were failing with husky installation errors.

**Fix**:

- Added `CI=true` environment variable to all workflow jobs
- Updated `prepare` script in root package.json to skip husky installation in CI environments
- Added `--no-progress` flag to the Angular unit test command

**Details**: These changes prevent husky from attempting to install git hooks in the CI environment, which was causing the workflows to fail. The `--no-progress` flag makes the test output more concise and helps identify the root cause of test failures.

## Known Issues

### Nested vite Dependency

**Issue**: There are still moderate severity vulnerabilities in the nested vite dependency within @angular/build.

**Status**: This will require a future update of the Angular build tools to fully resolve.

**Details**: The vulnerability is in a deeply nested dependency that cannot be directly overridden without potentially breaking the build system. We've added an override for @angular/build to use the patched vite version, but some references may still use the vulnerable version.

## Documentation Updates

1. Updated CHANGELOG.md with details of all security fixes
2. Added security best practices section to AILessons.md
3. Created this summary document for future reference

## Recommendations for Future Security Maintenance

1. Implement automated security scanning in CI/CD pipelines
2. Establish a regular schedule for reviewing and updating dependencies
3. Develop a formal security response plan for addressing vulnerabilities
4. Maintain comprehensive security documentation for the project
5. Ensure all developers understand security best practices for dependency management

## References

- [GHSA-5xr6-xhww-33m4](https://github.com/advisories/GHSA-5xr6-xhww-33m4) - Artifact poisoning vulnerability
- [GHSA-c2qf-rxjj-qqgw](https://github.com/advisories/GHSA-c2qf-rxjj-qqgw) - semver ReDoS vulnerability
- [GHSA-pfrx-2q88-qq97](https://github.com/advisories/GHSA-pfrx-2q88-qq97) - got UNIX socket redirect
- [GHSA-356w-63v5-8wf4](https://github.com/advisories/GHSA-356w-63v5-8wf4) - vite server.fs.deny bypass
- [GHSA-xcj6-pq6g-qj4x](https://github.com/advisories/GHSA-xcj6-pq6g-qj4x) - vite server.fs.deny bypass with .svg or relative paths
