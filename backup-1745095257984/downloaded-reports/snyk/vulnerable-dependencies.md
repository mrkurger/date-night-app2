# Vulnerable Dependencies Report

*Generated on: 2025-04-19*

## Dependency Overview

- **Total Vulnerable Packages**: 1
- **Direct Vulnerable Dependencies**: 0
- **Transitive Vulnerable Dependencies**: 1

## Vulnerable Packages

| Package | Version | Vulnerabilities | Highest Severity | Fixable |
|---------|---------|-----------------|------------------|--------|
| `@octokit/request-error` | 6.0.1 | 3 | Medium | ❌ |

## Package Details

### @octokit/request-error@6.0.1

- **Type**: Transitive Dependency
- **Dependency Path**: date-night-app@1.0.0 > @octokit/rest@19.0.13 > @octokit/core@6.1.5 > @octokit/request-error@6.0.1

**Vulnerabilities**:

- **Regular Expression Denial of Service (ReDoS)** (MEDIUM)
  - CVSS: 6.9
  - Fixed in: 5.1.1, 6.1.7
- **Regular Expression Denial of Service (ReDoS)** (MEDIUM)
  - CVSS: 6.9
  - Fixed in: 5.1.1, 6.1.7
- **Regular Expression Denial of Service (ReDoS)** (MEDIUM)
  - CVSS: 6.9
  - Fixed in: 5.1.1, 6.1.7

**Remediation**:

No direct fix available. Consider:
1. Finding an alternative package
2. Implementing additional security controls
3. Accepting the risk after assessment

---

## Remediation Strategy

### 1. Direct Dependencies

For direct dependencies, you can update them directly using npm:

```bash
# Update a specific package
npm install package-name@version

# Update all packages according to package.json
npm update

# Update all packages including major versions (use with caution)
npm update --force
```

### 2. Transitive Dependencies

For transitive (indirect) dependencies, you have several options:

1. **Update the parent dependency** that requires the vulnerable package

2. **Use npm overrides** (npm 8+):
   Add to package.json:
   ```json
   "overrides": {
     "vulnerable-package": "safe-version"
   }
   ```

3. **Use npm resolution** (with npm-force-resolutions package):
   ```json
   "resolutions": {
     "vulnerable-package": "safe-version"
   }
   ```

4. **Use Snyk patches** where available:
   ```bash
   snyk wizard
   ```

### 3. Testing After Updates

Always test thoroughly after updating dependencies:

1. Run your test suite
2. Check for breaking changes in updated packages
3. Verify application functionality manually
4. Run Snyk again to confirm vulnerabilities are resolved

