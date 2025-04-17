# Workflow Fixes Documentation

## Latest Fixes (April 17, 2025)

### Security Vulnerabilities

#### http-proxy-middleware

- **Issue**: Using vulnerable version 3.0.3
- **Fix**: Updated to version 3.0.5 via package overrides
- **Details**: Added `http-proxy-middleware: "^3.0.5"` to the overrides section in the root package.json

### Deprecated Packages

The following deprecated packages were identified and fixed:

| Package                             | Issue               | Fix                                 |
| ----------------------------------- | ------------------- | ----------------------------------- |
| inflight@1.0.6                      | Memory leak         | Updated to v2.0.0+                  |
| rimraf@3.0.2                        | Outdated            | Updated to v5.0.5+                  |
| abab@2.0.6                          | Deprecated          | Kept at v2.0.6 (latest version)     |
| glob@7.2.3                          | Outdated            | Updated to v10.3.10+                |
| domexception@4.0.0                  | Deprecated          | Updated to use native DOMException  |
| @humanwhocodes/config-array@0.11.14 | Deprecated          | Replaced with @eslint/config-array  |
| @humanwhocodes/object-schema@2.0.3  | Deprecated          | Replaced with @eslint/object-schema |
| eslint@8.56.0                       | No longer supported | Kept at v8.56.0 for compatibility   |

### Memory Issues in Angular Tests

- **Issue**: JavaScript heap out of memory error during Angular tests
- **Fix**: Increased Node.js heap memory limit for Angular tests
- **Details**: Modified the test script in client-angular/package.json to use `node --max_old_space_size=4096`

### Implementation Details

#### Scripts Added

1. **scripts/update-deprecated-packages.js**

   - Adds overrides for deprecated packages to the root package.json

2. **scripts/increase-node-memory.js**

   - Increases Node.js heap memory for Angular tests

3. **scripts/fix-workflow-issues.js**
   - Main script that runs all fixes and reinstalls dependencies

#### Package.json Changes

1. **Root package.json**

   - Added overrides for vulnerable and deprecated packages
   - Added `fix:workflow-issues` script

2. **client-angular/package.json**

   - Updated ESLint to v9.24.0+
   - Updated TypeScript ESLint packages to v7.7.0+
   - Modified test script to increase heap memory

3. **server/package.json**
   - Updated ESLint to v9.24.0+

#### How to Apply the Fixes

Run the following command from the project root:

```bash
npm run fix:workflow-issues
```

This will:

1. Update all deprecated packages
2. Increase Node.js heap memory for Angular tests
3. Reinstall dependencies to apply the overrides

#### Verification

After applying the fixes, run:

```bash
npm run analyze:security
```

This will check for any remaining security vulnerabilities in the project.

## Previous Fixes

### Husky in CI Environments

### Issue

The GitHub Actions workflows were failing with errors related to Husky not being found in CI environments. This was happening because the `prepare` script in package.json was trying to run Husky in CI environments where it wasn't needed.

### Solution

1. Added a `preinstall` script to package.json that runs a custom script to disable Husky in CI environments:

   ```json
   "preinstall": "node scripts/disable-husky-in-ci.js"
   ```

2. Created a `disable-husky-in-ci.js` script that:

   - Creates a `.huskyrc` file that exits early when the CI environment variable is set
   - Makes the `.huskyrc` file executable

3. Created a `.huskyrc` file with the following content:

   ```sh
   #!/bin/sh
   # Skip husky hooks in CI environments
   if [ -n "$CI" ]; then
     exit 0
   fi
   ```

4. Ensured all workflow files have the `CI: true` environment variable set at the job level.

## GitHub Workflow Improvements

### Issue

The GitHub workflow files had issues with the Octokit library and potential Git conflicts when committing changes.

### Solution

1. Updated the Octokit library version to a compatible one (19.0.13)
2. Added retry logic to the Octokit client configuration
3. Improved Git conflict handling in workflow files:
   - Added conflict detection
   - Added branching strategy for conflicting changes
   - Created pull request creation for conflicting changes

### Affected Files

- `.github/workflows/sync-workflow-errors.yml`
- `.github/workflows/sync-github-insights.yml`
- `.github/workflows/sync-test-reports.yml`
- `scripts/disable-husky-in-ci.js` (new)
- `.huskyrc` (new)
- `package.json`

## Testing

These changes have been tested by:

1. Running the analyze-workflow-errors.js script to verify the error patterns
2. Checking the package.json configuration
3. Verifying the CI environment variable is properly set in all workflow files

## Future Considerations

- Consider using a more robust method for detecting CI environments across different CI providers
- Monitor workflow runs to ensure the fixes are working as expected
- Consider adding more comprehensive error handling in the workflow scripts
