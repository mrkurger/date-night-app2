# DeepScan Integration Guide

This document explains the DeepScan configuration and integration for the Date Night App monorepo.

## 🎯 Overview

DeepScan is configured to analyze both frontend applications with specialized rules and ESLint integration:

- **client-angular/**: Angular 19 frontend with Angular-specific rules
- **client_angular2/**: React/Next.js frontend with React/Next.js-specific rules

## 📁 Configuration Files

### `.deepscan.json`
Main DeepScan configuration file with:
- Monorepo-aware file inclusion/exclusion patterns
- Framework-specific rule sets
- ESLint integration settings
- TypeScript and React/Angular specific configurations

### `.eslintrc.security.json` 
Enhanced ESLint configuration combining:
- Security-focused rules from `eslint-plugin-security`
- Next.js core web vitals rules from `client_angular2/`
- Angular-specific rules for `client-angular/`
- React hooks and JSX security rules

### `date-night-app.code-workspace`
VS Code workspace configuration with:
- Multi-folder workspace setup for each frontend
- DeepScan integration settings
- ESLint working directories for each frontend
- Framework-specific file associations

## 🔧 Setup Instructions

### 1. Install DeepScan Extension
```bash
code --install-extension deepscan.vscode-deepscan
```

### 2. Configure DeepScan Account
1. Visit [https://deepscan.io](https://deepscan.io)
2. Sign up/login with your GitHub account
3. Connect your repository
4. Get your license token for CI/CD

### 3. Local Development Setup
1. Open the workspace file:
   ```bash
   code date-night-app.code-workspace
   ```

2. Install dependencies in both frontends:
   ```bash
   # Angular frontend
   cd client-angular && npm install
   
   # React/Next.js frontend  
   cd client_angular2 && npm install
   ```

3. DeepScan will automatically start analyzing your code

## 🚀 CI/CD Integration

### GitHub Actions Workflow
The `.github/workflows/deepscan-analysis.yml` workflow:
- Runs on every push/PR to main branches
- Analyzes both frontend applications
- Runs ESLint security checks
- Uploads results as artifacts
- Comments on PRs with findings

### Required Secrets
Add to your GitHub repository secrets:
- `DEEPSCAN_LICENSE`: Your DeepScan license token

## 📊 Analysis Scope

### File Patterns Analyzed
```
✅ Included:
- client-angular/**/*.ts (Angular TypeScript)
- client-angular/**/*.js (Angular JavaScript)
- client-angular/**/*.html (Angular templates)
- client_angular2/**/*.ts (React TypeScript)
- client_angular2/**/*.tsx (React TSX)
- client_angular2/**/*.js (React JavaScript)
- client_angular2/**/*.jsx (React JSX)
- scripts/**/*.js (Build scripts)
- scripts/**/*.ts (TypeScript scripts)

❌ Excluded:
- **/node_modules/** (Dependencies)
- **/dist/** (Build outputs)
- **/.next/** (Next.js build cache)
- **/coverage/** (Test coverage)
- **/playwright-report/** (Test reports)
```

### Framework-Specific Rules

#### Angular Frontend (`client-angular/`)
- Angular lifecycle method validation
- Component/directive selector patterns
- Template syntax analysis  
- Dependency injection patterns
- Angular-specific TypeScript rules

#### React/Next.js Frontend (`client_angular2/`)
- React hooks rules validation
- JSX security patterns
- Next.js specific optimizations
- Image component alt text validation
- Server-side rendering safety

#### Security Rules (Both)
- XSS vulnerability detection
- SQL injection pattern analysis
- Unsafe regex detection
- Eval expression analysis
- Buffer overflow detection
- Timing attack vulnerability checks

## 📋 Common Issues and Solutions

### Issue: DeepScan Not Running
**Solution**: 
1. Check that DeepScan extension is installed
2. Verify `.deepscan.json` exists in project root
3. Restart VS Code
4. Check VS Code output panel for DeepScan logs

### Issue: False Positives
**Solution**:
1. Add specific exclusions to `.deepscan.json`
2. Adjust rule severity levels
3. Use ESLint disable comments for specific lines

### Issue: Missing Dependencies
**Solution**:
1. Install dependencies in both frontend directories
2. Use `npm install --ignore-scripts` for CI environments
3. Check that TypeScript configurations are valid

## 🔍 Reading DeepScan Results

### Severity Levels
- **HIGH**: Critical issues requiring immediate attention
- **MEDIUM**: Important issues that should be addressed
- **LOW**: Minor issues or suggestions

### Common Rule Categories
- **TYPESCRIPT_**: TypeScript-specific issues
- **REACT_**: React-specific issues  
- **ANGULAR_**: Angular-specific issues
- **NEXTJS_**: Next.js-specific issues
- **XSS_**: Cross-site scripting vulnerabilities
- **NULL_POINTER**: Potential null/undefined access

## 🛠️ Customization

### Adding New Rules
Edit `.deepscan.json`:
```json
{
  "rules": {
    "NEW_RULE_NAME": { "severity": "HIGH" }
  }
}
```

### Framework-Specific Overrides
Use ESLint overrides in `.eslintrc.security.json`:
```json
{
  "overrides": [
    {
      "files": ["client_angular2/**/*.tsx"],
      "rules": {
        "react/prop-types": "off"
      }
    }
  ]
}
```

## 📚 Additional Resources

- [DeepScan Documentation](https://deepscan.io/docs/)
- [ESLint Configuration](https://eslint.org/docs/user-guide/configuring/)
- [Next.js ESLint](https://nextjs.org/docs/basic-features/eslint)
- [Angular ESLint](https://angular-eslint.io/)

## 🤝 Contributing

When contributing code:
1. Run DeepScan locally before committing
2. Address HIGH severity issues
3. Document any rule suppressions
4. Test in both frontend environments
5. Update this guide if adding new configurations