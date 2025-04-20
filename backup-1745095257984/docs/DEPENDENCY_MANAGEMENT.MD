# Dependency Management

This document provides comprehensive guidance on managing dependencies in the Date Night App project, including identifying unused dependencies, updating deprecated packages, and maintaining a clean dependency tree.

## Table of Contents

- [Overview](#overview)
- [Dependency Analysis](#dependency-analysis)
- [Dependency Cleanup](#dependency-cleanup)
  - [Dependencies Kept Despite Being Flagged as Unused](#dependencies-kept-despite-being-flagged-as-unused)
  - [Dependencies Removed](#dependencies-removed)
  - [Missing Dependencies](#missing-dependencies)
  - [How to Run the Cleanup](#how-to-run-the-cleanup)
  - [Benefits of Dependency Cleanup](#benefits-of-dependency-cleanup)
- [Dependency Updates](#dependency-updates)
  - [Recent Updates](#recent-updates)
  - [Security Vulnerabilities Addressed](#security-vulnerabilities-addressed)
  - [Deprecation Warnings Resolved](#deprecation-warnings-resolved)
- [Best Practices](#best-practices)
  - [Adding New Dependencies](#adding-new-dependencies)
  - [Updating Dependencies](#updating-dependencies)
  - [Handling Deprecated Dependencies](#handling-deprecated-dependencies)
  - [Security Considerations](#security-considerations)
- [Automated Dependency Management](#automated-dependency-management)
- [Troubleshooting](#troubleshooting)

## Overview

Effective dependency management is crucial for maintaining a healthy, secure, and performant application. This document outlines our approach to managing dependencies in the Date Night App project, including:

- Identifying and removing unused dependencies
- Updating deprecated dependencies
- Addressing security vulnerabilities
- Maintaining a clean dependency tree

## Dependency Analysis

We use `depcheck` to identify potentially unused dependencies in the project. The analysis is performed on:

1. Root project
2. Client Angular project
3. Server project

To run a dependency analysis:

```bash
# For the root project
npx depcheck

# For the client Angular project
cd client-angular && npx depcheck

# For the server project
cd server && npx depcheck
```

## Dependency Cleanup

### Dependencies Kept Despite Being Flagged as Unused

Some dependencies are flagged as unused by `depcheck` but are kept because they are used indirectly:

#### Root Project

- **helmet**: Security package used for setting HTTP headers in Express
- **path**: Node.js built-in module used in various scripts
- **child_process**: Node.js built-in module used in scripts for executing commands
- **@testing-library/jest-dom**: Testing library that extends Jest with DOM-specific matchers
- **lint-staged**: Used with husky for pre-commit hooks to run linters on staged files

#### Client Angular Project

- **@angular/compiler**: Required for Angular AOT compilation
- **bootstrap**: CSS framework used in styles (imported in SCSS files)
- **tslib**: Required for TypeScript helpers and runtime functions
- **@angular-eslint/template-parser**: Used for linting Angular templates

#### Server Project

- **express-session**: Used for session management in Express
- **jest-extended**: Extends Jest with additional matchers for testing
- **jest-junit**: Generates JUnit XML reports for CI integration

### Dependencies Removed

The following dependencies were identified as truly unused and were safely removed:

#### Root Project

- **@popperjs/core**: Not used directly in the project
- **npm-check** (dev): Replaced by more modern tools
- **xml2js** (dev): Not used in any scripts or configurations

#### Client Angular Project

- **@fortawesome/fontawesome-free**: Not used in the project
- **eslint-plugin-import** (dev): Not used in ESLint configuration
- **typescript-eslint** (dev): Redundant with @typescript-eslint packages

#### Server Project

- **@eslint/js** (dev): Not used in ESLint configuration

### Missing Dependencies

The following dependencies were identified as missing and should be installed:

- **socket.io-client**: Used in chat service but not listed in dependencies
- **argon2** and **bcrypt**: Used in scripts but not listed in dependencies

### How to Run the Cleanup

To clean up unused dependencies, run:

```bash
node scripts/cleanup-dependencies.js
```

This script will:

1. Remove identified unused dependencies
2. Preserve dependencies that might be used indirectly
3. Run npm install to update node_modules
4. Provide a summary of changes

### Benefits of Dependency Cleanup

- **Reduced package size**: Smaller node_modules folder
- **Faster installation**: Fewer packages to download and install
- **Reduced security risks**: Fewer dependencies means fewer potential vulnerabilities
- **Cleaner project**: Better understanding of what's actually being used

## Dependency Updates

### Recent Updates

#### 2025-04-18: Fixed Deprecated Dependencies

Updated several deprecated dependencies to their latest versions to address security vulnerabilities and deprecation warnings.

##### Root Package (package.json)

- Removed deprecated dependencies from overrides:

  - `inflight`: Removed as it's not supported and leaks memory
  - `abab`: Removed as native `atob()` and `btoa()` methods should be used instead
  - `domexception`: Removed as native `DOMException` should be used instead
  - `@humanwhocodes/config-array`: Replaced with `@eslint/config-array`
  - `@humanwhocodes/object-schema`: Replaced with `@eslint/object-schema`

- Updated dependency versions:
  - `@eslint/object-schema`: Updated to `^2.1.6` (from `^0.1.1`)

##### Server Package (server/package.json)

- Updated dependency versions:
  - `eslint`: Updated to `9.24.0` (from `8.56.0`)

##### Client Angular Package (client-angular/package.json)

- Updated dependency versions:
  - `eslint`: Updated to `9.24.0` (from `8.56.0`)

### Security Vulnerabilities Addressed

- `http-proxy-middleware`: Updated to version `^3.0.5` to address CVE-2024-21536 (Denial of Service vulnerability)

### Deprecation Warnings Resolved

1. `inflight@1.0.6`: Removed from overrides as it's not supported and leaks memory
2. `rimraf@3.0.2`: Updated to `^5.0.5` in overrides
3. `abab@2.0.6`: Removed from overrides as native methods should be used
4. `glob@7.2.3`: Updated to `^10.3.10` in overrides
5. `domexception@4.0.0`: Removed from overrides as native DOMException should be used
6. `@humanwhocodes/object-schema@2.0.3`: Replaced with `@eslint/object-schema@^2.1.6`
7. `@humanwhocodes/config-array@0.11.14`: Replaced with `@eslint/config-array@^0.20.0`
8. `eslint@8.56.0`: Updated to `9.24.0` in all packages

## Best Practices

### Adding New Dependencies

When adding new dependencies to the project, follow these guidelines:

1. **Evaluate necessity**: Consider whether the dependency is truly needed or if the functionality can be implemented with existing code
2. **Check popularity and maintenance**: Choose dependencies that are well-maintained, have a large user base, and are actively developed
3. **Consider size and performance**: Be mindful of the size of the dependency and its impact on bundle size and performance
4. **Check license compatibility**: Ensure the license is compatible with the project's license
5. **Review security**: Check for known security vulnerabilities using tools like npm audit or Snyk
6. **Document usage**: Add a comment explaining why the dependency is needed and how it's used

### Updating Dependencies

To keep dependencies up to date:

1. **Regular audits**: Run `npm audit` regularly to identify security vulnerabilities
2. **Scheduled updates**: Schedule regular dependency updates (e.g., monthly)
3. **Incremental updates**: Update dependencies incrementally rather than all at once
4. **Test thoroughly**: Test the application thoroughly after updating dependencies
5. **Document changes**: Document all dependency updates in the changelog

### Handling Deprecated Dependencies

When a dependency is deprecated:

1. **Identify alternatives**: Research and identify suitable alternatives
2. **Plan migration**: Create a plan for migrating to the alternative
3. **Test thoroughly**: Test the application thoroughly after migrating
4. **Document changes**: Document the migration in the changelog and update any relevant documentation
5. **Update DEPRECATED.MD**: Add the deprecated dependency to the [DEPRECATED.MD](/docs/DEPRECATED.MD) file

### Security Considerations

To maintain security:

1. **Regular audits**: Run `npm audit` regularly to identify security vulnerabilities
2. **Fix vulnerabilities promptly**: Address security vulnerabilities as soon as they're identified
3. **Use lockfiles**: Use package-lock.json or yarn.lock to ensure consistent dependency versions
4. **Pin versions**: Consider pinning dependency versions to avoid unexpected updates
5. **Monitor security advisories**: Stay informed about security advisories for dependencies

## Automated Dependency Management

Consider implementing automated dependency management tools:

1. **Dependabot**: GitHub's automated dependency management tool
2. **Renovate**: Automated dependency management tool with extensive configuration options
3. **npm-check-updates**: Command-line tool for updating package.json dependencies

## Troubleshooting

### Common Issues

1. **Dependency conflicts**: Use `npm ls <package-name>` to identify conflicting versions
2. **Peer dependency warnings**: Install peer dependencies manually if needed
3. **Broken builds after updates**: Revert to previous versions and update incrementally
4. **Missing dependencies**: Use `depcheck` to identify missing dependencies

### Resolving Dependency Conflicts

To resolve dependency conflicts:

1. **Identify the conflict**: Use `npm ls <package-name>` to identify conflicting versions
2. **Update package.json**: Add resolutions or overrides to force specific versions
3. **Update dependencies**: Update dependencies to versions that don't conflict
4. **Consider alternatives**: Consider alternative dependencies if conflicts can't be resolved

## Future Maintenance

To keep dependencies clean:

1. Run `npx depcheck` periodically to identify new unused dependencies
2. Update the `keepDependencies` list in `scripts/cleanup-dependencies.js` as needed
3. Document why certain dependencies are kept despite being flagged as unused
4. Install missing dependencies that are actually used in the project
5. Monitor for new deprecations and security vulnerabilities
