# Node.js v22.1.0 Installation Guide

This guide explains how to install Node.js v22.1.0 on macOS.

## Quick Installation

1. Make the installation script executable:
   ```bash
   chmod +x simple-nodejs-install.sh verify-nodejs.sh
   ```

2. Run the installation script:
   ```bash
   sudo ./simple-nodejs-install.sh
   ```

3. Restart your terminal or run:
   ```bash
   export PATH="/usr/local/bin:$PATH"
   ```

4. Verify the installation:
   ```bash
   ./verify-nodejs.sh
   ```

## What the Installation Script Does

The installation script performs the following actions:

1. Downloads Node.js v22.1.0 directly from the official Node.js website
2. Installs it to a dedicated directory at `/usr/local/nodejs-22.1.0`
3. Creates symlinks in `/usr/local/bin` to the installed binaries
4. Adds a PATH configuration to your shell profile

## Troubleshooting

If you're still seeing the wrong Node.js version after installation:

1. Check your PATH:
   ```bash
   echo $PATH
   ```
   Make sure `/usr/local/bin` appears before any Homebrew paths.

2. Check which Node.js is being used:
   ```bash
   which node
   ```
   It should show `/usr/local/bin/node`.

3. Check where the symlink points:
   ```bash
   ls -la /usr/local/bin/node
   ```
   It should point to `/usr/local/nodejs-22.1.0/bin/node`.

4. If all else fails, you can use the full path:
   ```bash
   /usr/local/nodejs-22.1.0/bin/node
   /usr/local/nodejs-22.1.0/bin/npm
   /usr/local/nodejs-22.1.0/bin/npx
   ```

## Using the Verification Script

The verification script provides detailed information about your Node.js installations:

```bash
./verify-nodejs.sh
```

This will show:
- The Node.js version in your PATH
- Any Homebrew Node.js installations
- Protected Node.js installations
- Symlink configurations
- PATH information
- Recommendations for fixing issues