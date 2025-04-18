# Dependency Updates Changelog

## 2025-04-18: Fixed Deprecated Dependencies

### Summary

Updated several deprecated dependencies to their latest versions to address security vulnerabilities and deprecation warnings.

### Changes

#### Root Package (package.json)

- Removed deprecated dependencies from overrides:

  - `inflight`: Removed as it's not supported and leaks memory
  - `abab`: Removed as native `atob()` and `btoa()` methods should be used instead
  - `domexception`: Removed as native `DOMException` should be used instead
  - `@humanwhocodes/config-array`: Replaced with `@eslint/config-array`
  - `@humanwhocodes/object-schema`: Replaced with `@eslint/object-schema`

- Updated dependency versions:
  - `@eslint/object-schema`: Updated to `^2.1.6` (from `^0.1.1`)

#### Server Package (server/package.json)

- Updated dependency versions:
  - `eslint`: Updated to `9.24.0` (from `8.56.0`)

#### Client Angular Package (client-angular/package.json)

- Updated dependency versions:
  - `eslint`: Updated to `9.24.0` (from `8.56.0`)

### Security Vulnerabilities Addressed

- `http-proxy-middleware`: Ensured version `^3.0.5` is used to address CVE-2024-21536 (Denial of Service vulnerability)

### Deprecation Warnings Resolved

1. `inflight@1.0.6`: Removed from overrides as it's not supported and leaks memory
2. `rimraf@3.0.2`: Updated to `^5.0.5` in overrides
3. `abab@2.0.6`: Removed from overrides as native methods should be used
4. `glob@7.2.3`: Updated to `^10.3.10` in overrides
5. `domexception@4.0.0`: Removed from overrides as native DOMException should be used
6. `@humanwhocodes/object-schema@2.0.3`: Replaced with `@eslint/object-schema@^2.1.6`
7. `@humanwhocodes/config-array@0.11.14`: Replaced with `@eslint/config-array@^0.20.0`
8. `eslint@8.56.0`: Updated to `9.24.0` in all packages

### Notes

- The application should be thoroughly tested after these updates to ensure no regressions
- Some dependencies were removed from overrides as they are no longer needed or should be replaced with native methods
- ESLint was updated to the latest version (9.24.0) to address deprecation warnings
