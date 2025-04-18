# Dependency Cleanup

This document explains the process of identifying and removing unused dependencies in the Date Night App project.

## Dependency Analysis

We used `depcheck` to identify potentially unused dependencies in the project. The analysis was performed on:

1. Root project
2. Client Angular project
3. Server project

## Dependencies Kept Despite Being Flagged as Unused

Some dependencies were flagged as unused by `depcheck` but were kept because they are likely used indirectly:

### Root Project

- **helmet**: Security package used for setting HTTP headers in Express
- **path**: Node.js built-in module used in various scripts
- **child_process**: Node.js built-in module used in scripts for executing commands
- **@testing-library/jest-dom**: Testing library that extends Jest with DOM-specific matchers
- **lint-staged**: Used with husky for pre-commit hooks to run linters on staged files

### Client Angular Project

- **@angular/compiler**: Required for Angular AOT compilation
- **bootstrap**: CSS framework used in styles (imported in SCSS files)
- **tslib**: Required for TypeScript helpers and runtime functions
- **@angular-eslint/template-parser**: Used for linting Angular templates

### Server Project

- **express-session**: Used for session management in Express
- **jest-extended**: Extends Jest with additional matchers for testing
- **jest-junit**: Generates JUnit XML reports for CI integration

## Dependencies Removed

The following dependencies were identified as truly unused and were safely removed:

### Root Project

- **@popperjs/core**: Not used directly in the project
- **npm-check** (dev): Replaced by more modern tools
- **xml2js** (dev): Not used in any scripts or configurations

### Client Angular Project

- **@fortawesome/fontawesome-free**: Not used in the project
- **eslint-plugin-import** (dev): Not used in ESLint configuration
- **typescript-eslint** (dev): Redundant with @typescript-eslint packages

### Server Project

- **@eslint/js** (dev): Not used in ESLint configuration

## Missing Dependencies

The following dependencies were identified as missing and should be installed:

- **socket.io-client**: Used in chat service but not listed in dependencies
- **argon2** and **bcrypt**: Used in scripts but not listed in dependencies

## How to Run the Cleanup

To clean up unused dependencies, run:

```bash
node scripts/cleanup-dependencies.js
```

This script will:

1. Remove identified unused dependencies
2. Preserve dependencies that might be used indirectly
3. Run npm install to update node_modules
4. Provide a summary of changes

## Benefits of Dependency Cleanup

- **Reduced package size**: Smaller node_modules folder
- **Faster installation**: Fewer packages to download and install
- **Reduced security risks**: Fewer dependencies means fewer potential vulnerabilities
- **Cleaner project**: Better understanding of what's actually being used

## Future Maintenance

To keep dependencies clean:

1. Run `npx depcheck` periodically to identify new unused dependencies
2. Update the `keepDependencies` list in `scripts/cleanup-dependencies.js` as needed
3. Document why certain dependencies are kept despite being flagged as unused
4. Install missing dependencies that are actually used in the project
