# Specific Node.js Version Installation Guide

This guide provides detailed instructions for installing specific versions of Node.js, which is essential for ensuring compatibility with the DateNight.io project. The project currently requires Node.js version 22.14.0.

## Table of Contents

- [Using Version Managers](#using-version-managers)
  - [nvm (Node Version Manager)](#nvm-node-version-manager)
  - [nvm-windows](#nvm-windows)
  - [n (Node Version Manager)](#n-node-version-manager)
- [Direct Installation of Specific Versions](#direct-installation-of-specific-versions)
  - [From Official Node.js Website](#from-official-nodejs-website)
  - [Using Package Managers](#using-package-managers)
- [Project-Specific Node.js Version](#project-specific-nodejs-version)
  - [Using .nvmrc Files](#using-nvmrc-files)
  - [Using package.json engines Field](#using-packagejson-engines-field)
- [Switching Between Node.js Versions](#switching-between-nodejs-versions)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)

## Using Version Managers

Version managers are the recommended approach for installing and managing multiple Node.js versions.

### nvm (Node Version Manager)

For Unix-based systems (Linux, macOS):

1. Install nvm if you haven't already:

   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   ```

   or

   ```bash
   wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   ```

2. Close and reopen your terminal, or source your profile:

   ```bash
   source ~/.bashrc  # for bash
   source ~/.zshrc   # for zsh
   ```

3. List available Node.js versions:

   ```bash
   nvm ls-remote
   ```

4. Install a specific version:

   ```bash
   nvm install 22.14.0  # Install Node.js 22.14.0
   ```

5. Use the installed version:

   ```bash
   nvm use 22.14.0
   ```

6. Set a default version:

   ```bash
   nvm alias default 22.14.0
   ```

### nvm-windows

For Windows:

1. Install nvm-windows if you haven't already:

   - Download the installer from [GitHub](https://github.com/coreybutler/nvm-windows/releases)
   - Run the installer and follow the prompts

2. List available Node.js versions:

   ```bash
   nvm list available
   ```

3. Install a specific version:

   ```bash
   nvm install 22.14.0
   ```

4. Use the installed version:

   ```bash
   nvm use 22.14.0
   ```

### n (Node Version Manager)

An alternative for Unix-based systems:

1. Install n globally:

   ```bash
   npm install -g n
   ```

2. Install a specific version:

   ```bash
   n 22.14.0
   ```

3. Install the latest LTS version:

   ```bash
   n lts
   ```

## Direct Installation of Specific Versions

### From Official Node.js Website

1. Visit the [Node.js Previous Releases](https://nodejs.org/en/download/releases/) page
2. Find the specific version you need (e.g., 22.14.0)
3. Download the appropriate installer for your operating system
4. Run the installer and follow the prompts

### Using Package Managers

#### Homebrew (macOS)

```bash
# Install a specific version
brew install node@22

# Link it to make it available in your PATH
brew link node@22
```

#### apt (Debian/Ubuntu)

```bash
# For a specific major version
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

For a very specific version, you might need to download and install the binary directly.

#### dnf/yum (RHEL/CentOS/Fedora)

```bash
# For a specific major version
curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
sudo dnf install -y nodejs
```

## Project-Specific Node.js Version

### Using .nvmrc Files

For projects using nvm, you can create an `.nvmrc` file in the project root:

1. Create the file:

   ```bash
   echo "22.14.0" > .nvmrc
   ```

2. When entering the project directory, use:

   ```bash
   nvm use
   ```

   This will automatically switch to the version specified in `.nvmrc`.

### Using package.json engines Field

You can specify the required Node.js version in your `package.json`:

```json
{
  "name": "date-night-app",
  "version": "1.0.0",
  "engines": {
    "node": "22.14.0",
    "npm": "10.9.2"
  }
}
```

This doesn't enforce the version but serves as documentation and can be enforced by some deployment platforms.

## Switching Between Node.js Versions

### With nvm

```bash
# List installed versions
nvm ls

# Switch to a specific version
nvm use 22.14.0

# Switch to the latest LTS version
nvm use --lts

# Switch to the system-installed version
nvm use system
```

### With nvm-windows

```bash
# List installed versions
nvm list

# Switch to a specific version
nvm use 22.14.0
```

### With n

```bash
# Switch to a specific version
n 22.14.0
```

## Troubleshooting

### Common Issues

#### Version Not Found

If you're trying to install a version that isn't available:

- Check the available versions with `nvm ls-remote` or `nvm list available`
- Verify that you're using the correct version number format

#### Permission Issues

For Unix-based systems, if you encounter permission errors:

```bash
# Fix permissions for npm global installations
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
```

#### Path Issues After Switching Versions

If the `node` or `npm` commands still point to the old version after switching:

- Close and reopen your terminal
- Verify the PATH environment variable
- For nvm-windows, you might need to run as Administrator

#### Global Packages Not Available After Switching

Global packages are installed per Node.js version. To reinstall global packages:

```bash
# With nvm
nvm reinstall-packages <previous_version>
```

## Additional Resources

- [nvm GitHub Repository](https://github.com/nvm-sh/nvm)
- [nvm-windows GitHub Repository](https://github.com/coreybutler/nvm-windows)
- [n GitHub Repository](https://github.com/tj/n)
- [Node.js Previous Releases](https://nodejs.org/en/download/releases/)
- [NODEJS-INSTALLATION-GUIDE.MD](/docs/NODEJS-INSTALLATION-GUIDE.MD) - For general Node.js installation
