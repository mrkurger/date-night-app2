# Node.js Installation Guide

This guide provides instructions for installing Node.js on various operating systems. DateNight.io requires Node.js version 22.14.0 or later.

## Table of Contents

- [Installation Methods](#installation-methods)
  - [Using a Version Manager (Recommended)](#using-a-version-manager-recommended)
  - [Direct Installation](#direct-installation)
- [Installation by Operating System](#installation-by-operating-system)
  - [Windows](#windows)
  - [macOS](#macos)
  - [Linux](#linux)
- [Verifying the Installation](#verifying-the-installation)
- [Updating npm](#updating-npm)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)

## Installation Methods

### Using a Version Manager (Recommended)

Using a version manager is the recommended approach as it allows you to easily switch between Node.js versions.

#### nvm (Node Version Manager)

For Unix-based systems (Linux, macOS):

1. Install nvm:

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

3. Install the required Node.js version:

   ```bash
   nvm install 22.14.0
   ```

4. Set it as the default version:

   ```bash
   nvm alias default 22.14.0
   ```

#### nvm-windows

For Windows:

1. Download the nvm-windows installer from [GitHub](https://github.com/coreybutler/nvm-windows/releases)
2. Run the installer and follow the prompts
3. Open a new command prompt and install Node.js:

   ```bash
   nvm install 22.14.0
   nvm use 22.14.0
   ```

### Direct Installation

#### Official Installer

1. Visit the [Node.js download page](https://nodejs.org/en/download/)
2. Download the installer for your operating system
3. Run the installer and follow the prompts

#### Package Managers

You can also install Node.js using package managers, but be aware that they might not have the latest versions immediately available.

## Installation by Operating System

### Windows

#### Using the Official Installer

1. Visit the [Node.js download page](https://nodejs.org/en/download/)
2. Download the Windows Installer (.msi)
3. Run the installer and follow the prompts
4. Verify the installation by opening Command Prompt and running:

   ```bash
   node -v
   npm -v
   ```

#### Using Chocolatey

If you have [Chocolatey](https://chocolatey.org/) installed:

```bash
choco install nodejs
```

### macOS

#### Using the Official Installer

1. Visit the [Node.js download page](https://nodejs.org/en/download/)
2. Download the macOS Installer (.pkg)
3. Run the installer and follow the prompts
4. Verify the installation by opening Terminal and running:

   ```bash
   node -v
   npm -v
   ```

#### Using Homebrew

If you have [Homebrew](https://brew.sh/) installed:

```bash
brew install node@22
```

### Linux

#### Using Package Manager

For Debian/Ubuntu:

```bash
# Using apt
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

For RHEL/CentOS/Fedora:

```bash
# Using dnf
curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
sudo dnf install -y nodejs
```

For Arch Linux:

```bash
sudo pacman -S nodejs npm
```

## Verifying the Installation

After installation, verify that Node.js and npm are correctly installed:

```bash
node -v  # Should output v22.14.0 or later
npm -v   # Should output v10.9.2 or later
```

## Updating npm

Node.js comes with npm, but npm is updated more frequently than Node.js. To update npm to the latest version:

```bash
npm install -g npm@latest
```

## Troubleshooting

### Common Issues

#### Permission Errors

If you encounter permission errors when installing global packages:

For Unix-based systems:

```bash
# Option 1: Change npm's default directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
source ~/.profile

# Option 2: Fix permissions
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
```

For Windows:

Run Command Prompt or PowerShell as Administrator.

#### Path Issues

If `node` or `npm` commands are not found after installation:

1. Ensure the installation directory is in your PATH
2. For Windows, you might need to restart your computer
3. For Unix-based systems, source your profile file or restart your terminal

#### Version Conflicts

If you need multiple Node.js versions for different projects:

1. Use a version manager like nvm or nvm-windows
2. Use project-specific `.nvmrc` files to specify Node.js versions

## Additional Resources

- [Node.js Official Documentation](https://nodejs.org/en/docs/)
- [npm Documentation](https://docs.npmjs.com/)
- [nvm GitHub Repository](https://github.com/nvm-sh/nvm)
- [nvm-windows GitHub Repository](https://github.com/coreybutler/nvm-windows)
- [SPECIFIC-VERSION-INSTALLATION-GUIDE.MD](/docs/SPECIFIC-VERSION-INSTALLATION-GUIDE.MD) - For installing specific Node.js versions
