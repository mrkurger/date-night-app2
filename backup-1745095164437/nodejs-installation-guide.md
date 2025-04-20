# Node.js Installation and Protection Guide for macOS

This guide explains how to install Node.js on macOS and configure it to prevent downgrading or removal.

## Installation

1. Make the installation script executable:
   ```bash
   chmod +x install-nodejs.sh
   ```

2. Run the installation script with sudo privileges:
   ```bash
   sudo ./install-nodejs.sh
   ```

3. Verify the installation:
   ```bash
   node -v
   npm -v
   ```

4. Check the protection status:
   ```bash
   ./check-nodejs-protection.sh
   ```

## What the Installation Script Does

The installation script performs the following actions:

1. Installs Homebrew if not already installed
2. Installs the latest LTS version of Node.js (v20.x) using Homebrew
3. Creates protection mechanisms to prevent Node.js from being downgraded or removed:
   - Homebrew hooks that block package operations on Node.js
   - Makes Node.js binaries immutable using macOS `chflags`
   - Creates a launchd service that continuously monitors and protects Node.js binaries

## Protection Mechanisms

### Homebrew Hook

The script creates a hook that intercepts any attempt to modify the Node.js package through Homebrew. This hook prevents:
- Removing Node.js
- Downgrading Node.js
- Reinstalling Node.js

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

3. Restore the original brew command (temporarily):
   ```bash
   # For Apple Silicon Macs
   sudo cp /opt/homebrew/bin/brew-original /opt/homebrew/bin/brew

   # For Intel Macs
   sudo cp /usr/local/bin/brew-original /usr/local/bin/brew
   ```

4. Perform the update:
   ```bash
   brew update
   brew upgrade node@20
   ```

5. Re-enable the protection by running the installation script again:
   ```bash
   sudo ./install-nodejs.sh
   ```

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