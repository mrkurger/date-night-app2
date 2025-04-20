#!/bin/bash

# Simple script to install Node.js v22.1.0 on macOS
# This script focuses on just installing Node.js correctly without protection mechanisms

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# The specific Node.js version to install
TARGET_VERSION="22.1.0"

echo -e "${GREEN}Starting Node.js v${TARGET_VERSION} installation script for macOS...${NC}"

# Create a temporary directory
TEMP_DIR=$(mktemp -d)
cd "${TEMP_DIR}"

# Determine architecture
if [[ $(uname -m) == 'arm64' ]]; then
    ARCH="arm64"
else
    ARCH="x64"
fi

# Download Node.js
echo -e "${YELLOW}Downloading Node.js v${TARGET_VERSION}...${NC}"
curl -# -o "node-v${TARGET_VERSION}-darwin-${ARCH}.tar.gz" "https://nodejs.org/dist/v${TARGET_VERSION}/node-v${TARGET_VERSION}-darwin-${ARCH}.tar.gz"

# Extract the archive
echo -e "${YELLOW}Extracting Node.js...${NC}"
tar -xzf "node-v${TARGET_VERSION}-darwin-${ARCH}.tar.gz"
NODE_EXTRACT_DIR="${TEMP_DIR}/node-v${TARGET_VERSION}-darwin-${ARCH}"

# Create installation directory
echo -e "${YELLOW}Creating Node.js installation directory...${NC}"
sudo mkdir -p /usr/local/nodejs-${TARGET_VERSION}

# Install Node.js
echo -e "${YELLOW}Installing Node.js to /usr/local/nodejs-${TARGET_VERSION}...${NC}"
sudo cp -R "${NODE_EXTRACT_DIR}/"* /usr/local/nodejs-${TARGET_VERSION}/

# Create symlinks
echo -e "${YELLOW}Creating symlinks...${NC}"
sudo ln -sf /usr/local/nodejs-${TARGET_VERSION}/bin/node /usr/local/bin/node
sudo ln -sf /usr/local/nodejs-${TARGET_VERSION}/bin/npm /usr/local/bin/npm
sudo ln -sf /usr/local/nodejs-${TARGET_VERSION}/bin/npx /usr/local/bin/npx

# Clean up
rm -rf "${TEMP_DIR}"

# Verify installation
DIRECT_NODE_VERSION=$(/usr/local/nodejs-${TARGET_VERSION}/bin/node -v 2>/dev/null || echo "Not available")
echo -e "${GREEN}Node.js $DIRECT_NODE_VERSION has been installed to /usr/local/nodejs-${TARGET_VERSION}${NC}"

# Check if the symlinks are working correctly
SYMLINK_NODE_VERSION=$(/usr/local/bin/node -v 2>/dev/null || echo "Not available")
echo -e "${YELLOW}Symlinked node version: $SYMLINK_NODE_VERSION${NC}"

if [[ "$SYMLINK_NODE_VERSION" != "v${TARGET_VERSION}" ]]; then
    echo -e "${RED}Warning: Symlinked node is reporting version ${SYMLINK_NODE_VERSION} instead of v${TARGET_VERSION}${NC}"
    echo -e "${YELLOW}This is likely because Homebrew's Node.js is taking precedence in your PATH.${NC}"
    echo -e "${YELLOW}To use the installed version, you can:${NC}"
    echo -e "${YELLOW}1. Use the full path: /usr/local/nodejs-${TARGET_VERSION}/bin/node${NC}"
    echo -e "${YELLOW}2. Add this to your shell profile and restart your terminal:${NC}"
    echo -e "${YELLOW}   export PATH=\"/usr/local/bin:\$PATH\"${NC}"
    
    # Add to user's shell profile if not already there
    for PROFILE in ~/.zshrc ~/.bash_profile ~/.bashrc; do
        if [ -f "$PROFILE" ]; then
            if ! grep -q "Added by Node.js installation script" "$PROFILE"; then
                echo -e "${YELLOW}Adding PATH configuration to $PROFILE${NC}"
                echo -e "\n# Added by Node.js installation script\nexport PATH=\"/usr/local/bin:\$PATH\"" >> "$PROFILE"
            fi
        fi
    done
else
    echo -e "${GREEN}Node.js v${TARGET_VERSION} has been successfully installed and is accessible via 'node' command.${NC}"
fi

echo -e "\n${GREEN}Installation complete!${NC}"
echo -e "${YELLOW}To start using Node.js v${TARGET_VERSION} in new terminal windows, please restart your terminal.${NC}"
echo -e "${YELLOW}To use it in this terminal session, run:${NC}"
echo -e "${YELLOW}  export PATH=\"/usr/local/bin:\$PATH\"${NC}"