# Date Night App Fixes

This document outlines the fixes applied to the Date Night App project to resolve common issues.

## Issues Fixed

### 1. Husky Git Hooks Issues

**Problem:** Husky Git hooks were causing errors in CI environments and failing with "husky: not found" errors.

**Solution:**

- Created a `.huskyrc` file to disable Husky in CI environments
- Updated the `prepare` script in package.json to skip Husky in CI environments
- Created a `fix-husky.sh` script for the client-angular project
- Updated the `disable-husky-in-ci.js` script to properly disable Husky

### 2. Missing SASS Variables

**Problem:** The build was failing due to missing SASS variables like `$error-100`.

**Solution:**

- Added semantic color variations to the design system variables file
- Created a comprehensive set of color variations for error, success, warning, and info colors
- Ensured proper color inheritance and consistency across the application

### 3. QR Code Module Issues

**Problem:** The application was failing to build due to issues with the `angularx-qrcode` module.

**Solution:**

- Updated the QR code module to use the correct import syntax
- Changed from importing the component directly to importing the module
- Added the module to the package.json dependencies
- Ensured proper installation with `--legacy-peer-deps` flag

### 4. ESLint Dependency Conflicts

**Problem:** There were dependency conflicts between ESLint versions, with @typescript-eslint/utils requiring ESLint 8.57.0 or 9.0.0, but the project using ESLint 8.56.0.

**Solution:**

- Created a `fix-eslint-dependencies.js` script to update ESLint-related packages in package.json files
- Updated ESLint to version ^9.0.0 in dependencies and devDependencies
- Updated @typescript-eslint/parser and @typescript-eslint/eslint-plugin to ^8.0.0
- Added overrides for ESLint and TypeScript ESLint packages to ensure consistent versions
- Used --legacy-peer-deps flag to install dependencies with the updated versions
- Ensured all packages use compatible versions to resolve dependency conflicts

### 5. Package Version Conflicts

**Problem:** There were version conflicts with packages like `helmet`.

**Solution:**

- Updated package.json files to use compatible versions
- Fixed version conflicts using sed replacements
- Ensured consistent versions across root, server, and client projects

### 5. Missing Scripts

**Problem:** Some required scripts were missing or not executable.

**Solution:**

- Created missing scripts in the server/scripts directory
- Made all scripts executable with chmod
- Added a start-client.js script to properly start the Angular client

## How to Apply Fixes

Run the `fix-project.sh` script from the project root:

```bash
./fix-project.sh
```

This script will:

1. Make scripts executable
2. Update package.json files
3. Fix husky issues
4. Install missing dependencies
5. Fix npm audit issues
6. Fix CSP issues
7. Check MongoDB setup
8. Fix ESLint dependency conflicts
9. Update packages
10. Verify server/scripts directory

## Manual Fixes (if needed)

If you encounter specific issues not addressed by the script, you can apply these fixes manually:

### Fix Husky Issues

```bash
echo 'export HUSKY=0' > .huskyrc
chmod +x .huskyrc
node scripts/disable-husky-in-ci.js
```

### Install Missing Dependencies

```bash
cd client-angular
npm install angularx-qrcode --save --legacy-peer-deps
```

### Fix ESLint Dependency Conflicts

Run the ESLint dependency fix script:

```bash
node scripts/fix-eslint-dependencies.js
```

Or manually update ESLint in package.json:

1. Update ESLint and TypeScript ESLint packages in dependencies and devDependencies:

```json
"dependencies": {
  "eslint": "^9.0.0"
},
"devDependencies": {
  "eslint": "^9.0.0",
  "@typescript-eslint/parser": "^8.0.0",
  "@typescript-eslint/eslint-plugin": "^8.0.0"
}
```

2. Add overrides for ESLint and TypeScript ESLint packages:

```json
"overrides": {
  "eslint": "^9.0.0",
  "@typescript-eslint/parser": "^8.0.0",
  "@typescript-eslint/eslint-plugin": "^8.0.0"
}
```

3. Install dependencies with the --legacy-peer-deps flag:

```bash
npm install --legacy-peer-deps
```

### Fix SASS Variables

Add the missing variables to `client-angular/src/styles/design-system/_variables.scss`:

```scss
// Semantic Color Variations
$error-100: rgba($color-error, 0.1);
$error-200: rgba($color-error, 0.2);
// ... and so on
```

### Clean Up Unused Dependencies

Run the dependency cleanup script:

```bash
node scripts/cleanup-dependencies.js
```

Install missing dependencies:

```bash
node scripts/install-missing-dependencies.js
```

## Troubleshooting

If you still encounter issues after running the fix script:

1. Try running the components separately:

   ```bash
   npm run start:server
   npm run start:client
   ```

2. Check for error logs in:

   ```
   downloaded-reports/workflow-errors/
   ```

3. Run npm audit to identify security issues:

   ```bash
   npm audit
   ```

4. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules client-angular/node_modules server/node_modules
   npm install --legacy-peer-deps
   ```
