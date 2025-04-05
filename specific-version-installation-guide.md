# Installing a Specific Node.js Version on macOS

This guide explains how to install a specific version of Node.js (22.14.0) on macOS and configure it to prevent downgrading or removal.

## Installation

1. Make the installation script executable:
   ```bash
   chmod +x install-nodejs-specific-version.sh
   ```

2. Run the installation script:
   ```bash
   ./install-nodejs-specific-version.sh
   ```

3. Verify the installation:
   ```bash
   node -v  # Should show v22.14.0 or the closest available version
   npm -v
   ```

4. Check the protection status:
   ```bash
   ./check-nodejs-protection.sh
   ```

## What the Installation Script Does

The installation script performs the following actions:

1. Installs Homebrew if not already installed
2. Installs NVM (Node Version Manager) to manage specific Node.js versions
3. Installs Node.js version 22.14.0 (or the closest available version if 22.14.0 is not available)
4. Creates protection mechanisms to prevent Node.js from being downgraded or removed:
   - NVM hooks that block version changes
   - Makes Node.js binaries immutable using macOS `chflags`
   - Creates a launchd service that continuously monitors and protects Node.js binaries

## Protection Mechanisms

### NVM Hook

The script creates a hook that intercepts any attempt to change the Node.js version through NVM. This hook prevents:
- Switching to a different Node.js version
- Installing a different Node.js version as the default

### File Immutability

The Node.js binaries (`node` and `npm`) are made immutable using the macOS `chflags` command with the `uchg` flag. This prevents:
- Deletion of the binaries
- Modification of the binaries
- Replacement of the binaries

### Protection Service

A launchd service continuously monitors the Node.js binaries and ensures they remain immutable. If someone tries to remove the immutable attribute, the service will reapply it.

## Updating Node.js in the Future

To update Node.js in the future, you'll need to temporarily disable the protection mechanisms:

1. Stop the protection service:
   ```bash
   sudo launchctl unload /Library/LaunchDaemons/com.nodejs.protection.plist
   ```

2. Remove the immutable attribute from the binaries:
   ```bash
   sudo chflags nouchg $(which node) $(which npm) $(dirname $(which node))
   ```

3. Remove the NVM hook:
   ```bash
   rm ~/.nvm/hooks/before-use
   ```

4. Perform the update using NVM:
   ```bash
   nvm install <new-version>
   nvm use <new-version>
   nvm alias default <new-version>
   ```

5. Re-enable protection by running the installation script again with the new version.

## Troubleshooting

If you need to completely remove the protection mechanisms:

1. Stop and unload the protection service:
   ```bash
   sudo launchctl unload /Library/LaunchDaemons/com.nodejs.protection.plist
   sudo rm /Library/LaunchDaemons/com.nodejs.protection.plist
   ```

2. Remove the immutable attribute:
   ```bash
   sudo chflags nouchg $(which node) $(which npm) $(dirname $(which node))
   ```

3. Remove the NVM hook:
   ```bash
   rm ~/.nvm/hooks/before-use
   ```

4. Remove the protection scripts:
   ```bash
   sudo rm -rf /usr/local/bin/nodejs-protection
   ```

5. To completely remove Node.js and NVM:
   ```bash
   nvm deactivate
   nvm uninstall <version>
   ```

6. To remove NVM completely:
   ```bash
   rm -rf ~/.nvm
   ```

## Notes on Version 22.14.0

Node.js version 22.14.0 might not be available at the time of installation. The script will attempt to install this specific version, but if it's not available, it will install the latest available version instead. The protection mechanisms will be configured to protect whichever version is actually installed.