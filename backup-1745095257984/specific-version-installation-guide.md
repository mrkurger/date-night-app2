# Installing a Specific Node.js Version on macOS

This guide explains how to install a specific version of Node.js (22.1.0) on macOS and configure it to prevent downgrading or removal.

## Installation

1. Make the installation script executable:
   ```bash
   chmod +x install-nodejs-specific-version.sh
   ```

2. Run the installation script with sudo privileges:
   ```bash
   sudo ./install-nodejs-specific-version.sh
   ```

3. Verify the installation:
   ```bash
   node -v  # Should show v22.1.0
   npm -v
   ```

4. Check the protection status:
   ```bash
   ./check-nodejs-protection.sh
   ```

## What the Installation Script Does

The installation script performs the following actions:

1. Installs Homebrew if not already installed
2. Downloads and installs Node.js version 22.1.0 directly from the official Node.js website
3. Creates a dedicated installation directory at `/usr/local/nodejs-22.1.0`
4. Creates symlinks in `/usr/local/bin` to the installed binaries
5. Implements multiple protection mechanisms to prevent Node.js from being downgraded or removed:
   - Homebrew hooks that block package operations on Node.js
   - Makes Node.js binaries and installation directory immutable using macOS `chflags`
   - Creates a launchd service that continuously monitors and protects Node.js binaries

## Protection Mechanisms

### Homebrew Hook

The script creates a hook that intercepts any attempt to modify the Node.js package through Homebrew. This hook prevents:
- Removing Node.js
- Downgrading Node.js
- Installing a different version of Node.js

### File Immutability

The Node.js binaries (`node`, `npm`, and `npx`) and the installation directory are made immutable using the macOS `chflags` command with the `uchg` flag. This prevents:
- Deletion of the binaries
- Modification of the binaries
- Replacement of the binaries
- Modification of the installation directory

### Protection Service

A launchd service continuously monitors the Node.js binaries and ensures they remain immutable. If someone tries to remove the immutable attribute or change the symlinks, the service will:
- Reapply the immutable attribute
- Restore the symlinks to point to the protected installation
- Log any tampering attempts

## Updating Node.js in the Future

To update Node.js in the future, you'll need to temporarily disable the protection mechanisms:

1. Stop the protection service:
   ```bash
   sudo launchctl unload /Library/LaunchDaemons/com.nodejs.protection.plist
   ```

2. Remove the immutable attribute from the binaries and installation directory:
   ```bash
   sudo chflags nouchg $(which node) $(which npm) $(which npx) /usr/local/nodejs-22.1.0
   ```

3. Restore the original brew command:
   ```bash
   # For Apple Silicon Macs
   sudo cp /opt/homebrew/bin/brew-original /opt/homebrew/bin/brew

   # For Intel Macs
   sudo cp /usr/local/bin/brew-original /usr/local/bin/brew
   ```

4. Install the new version by running the installation script again with the new version number.

## Troubleshooting

If you need to completely remove the protection mechanisms:

1. Stop and unload the protection service:
   ```bash
   sudo launchctl unload /Library/LaunchDaemons/com.nodejs.protection.plist
   sudo rm /Library/LaunchDaemons/com.nodejs.protection.plist
   ```

2. Remove the immutable attribute:
   ```bash
   sudo chflags nouchg $(which node) $(which npm) $(which npx) /usr/local/nodejs-22.1.0
   ```

3. Restore the original brew command:
   ```bash
   # For Apple Silicon Macs
   sudo cp /opt/homebrew/bin/brew-original /opt/homebrew/bin/brew

   # For Intel Macs
   sudo cp /usr/local/bin/brew-original /usr/local/bin/brew
   ```

4. Remove the protection scripts:
   ```bash
   sudo rm -rf /usr/local/bin/nodejs-protection
   sudo rm /usr/local/bin/brew-hook
   ```

5. To completely remove the installed Node.js:
   ```bash
   sudo rm -rf /usr/local/nodejs-22.1.0
   sudo rm /usr/local/bin/node
   sudo rm /usr/local/bin/npm
   sudo rm /usr/local/bin/npx
   ```

## Why This Approach?

This installation method:
1. Avoids dependency on NVM or Homebrew for the actual Node.js installation
2. Creates a completely isolated Node.js installation
3. Implements multiple layers of protection
4. Continuously monitors and restores protection if tampered with
5. Prevents accidental or malicious downgrading or removal