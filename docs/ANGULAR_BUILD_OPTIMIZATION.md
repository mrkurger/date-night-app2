# Angular Build Optimization Guide

## JavaScript Heap Out of Memory Error

When building large Angular applications, you may encounter JavaScript heap out of memory errors. This document provides solutions and best practices to resolve these issues.

## Implemented Solutions

### 1. Increased Node.js Memory Limit

We've updated the package.json scripts to include the `NODE_OPTIONS=--max_old_space_size=8192` flag for all build and serve commands. This increases the memory allocation for Node.js processes to 8GB.

```json
"scripts": {
  "start": "NODE_OPTIONS=--max_old_space_size=8192 ng serve client-angular",
  "build": "NODE_OPTIONS=--max_old_space_size=8192 ng build client-angular",
  "build:prod": "NODE_OPTIONS=--max_old_space_size=8192 ng build client-angular --configuration production"
}
```

### 2. Clean Build Scripts

We've added convenience scripts to clean the environment before rebuilding:

```json
"scripts": {
  "clean": "rm -rf node_modules && rm -f package-lock.json && rm -rf .angular/cache && rm -rf dist",
  "clean:install": "npm run clean && npm install",
  "clean:build": "npm run clean:install && npm run build"
}
```

## Troubleshooting Steps

If you still encounter memory issues, try the following steps in order:

1. **Clean Your Environment**

   ```bash
   npm run clean:install
   ```

2. **Check Node.js Version Compatibility**

   - Current project uses Node.js 22.14.0 with Angular 19.2.5
   - If you need to switch Node.js versions, use nvm:
     ```bash
     nvm install 22.14.0
     nvm use 22.14.0
     ```

3. **Adjust Memory Limit**

   - If 8GB is not enough, you can increase the limit further:
     ```bash
     export NODE_OPTIONS=--max_old_space_size=12288  # 12GB
     ng build client-angular
     ```

4. **Optimize Your Build**

   - Consider using production build with AOT compilation:
     ```bash
     npm run build:prod
     ```

5. **Check System Resources**
   - Ensure you have sufficient free RAM
   - Close other memory-intensive applications
   - Ensure enough free disk space

## Best Practices

1. **Regular Dependency Updates**

   - Keep Angular CLI and core packages updated
   - Check for memory leak fixes in newer versions

2. **Code Splitting**

   - Use lazy loading for routes
   - Consider breaking up large modules

3. **Asset Optimization**

   - Optimize images and other assets
   - Consider using a CDN for large assets

4. **Development vs. Production**
   - Use development configuration during development
   - Use production configuration for final builds

## Changelog

- **2024-05-XX**: Added memory optimization settings to package.json scripts
  - Increased Node.js memory limit to 8GB
  - Added clean build scripts for easier environment reset
