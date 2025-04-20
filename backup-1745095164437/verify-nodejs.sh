#!/bin/bash

# Script to verify Node.js installation

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Verifying Node.js installation...${NC}"

# Check for Node.js installations
echo -e "\n${YELLOW}Checking Node.js installations:${NC}"

# Check PATH-based Node.js
PATH_NODE=$(which node 2>/dev/null || echo "Not found")
if [ "$PATH_NODE" != "Not found" ]; then
    PATH_NODE_VERSION=$(node -v 2>/dev/null || echo "Not available")
    echo -e "Node.js in PATH: ${GREEN}$PATH_NODE${NC}"
    echo -e "Version: ${GREEN}$PATH_NODE_VERSION${NC}"
else
    echo -e "Node.js in PATH: ${RED}Not found${NC}"
fi

# Check Homebrew Node.js
if command -v brew &> /dev/null; then
    BREW_NODE=$(brew list | grep node || echo "Not installed")
    if [ "$BREW_NODE" != "Not installed" ]; then
        BREW_NODE_PATH=$(brew --prefix node 2>/dev/null || echo "Unknown")
        echo -e "Homebrew Node.js: ${GREEN}Installed at $BREW_NODE_PATH${NC}"
    else
        echo -e "Homebrew Node.js: ${YELLOW}Not installed${NC}"
    fi
else
    echo -e "Homebrew: ${YELLOW}Not installed${NC}"
fi

# Check protected Node.js installations
echo -e "\n${YELLOW}Checking protected Node.js installations:${NC}"
FOUND_PROTECTED=false

for dir in /usr/local/nodejs-*; do
    if [ -d "$dir" ] && [ -f "$dir/bin/node" ]; then
        PROTECTED_VERSION=$("$dir/bin/node" -v 2>/dev/null || echo "Not available")
        echo -e "Protected installation: ${GREEN}$dir${NC}"
        echo -e "Version: ${GREEN}$PROTECTED_VERSION${NC}"
        FOUND_PROTECTED=true
    fi
done

if [ "$FOUND_PROTECTED" = false ]; then
    echo -e "Protected installations: ${RED}None found${NC}"
fi

# Check symlinks
echo -e "\n${YELLOW}Checking symlinks:${NC}"
for binary in node npm npx; do
    if [ -f "/usr/local/bin/$binary" ]; then
        SYMLINK_TARGET=$(readlink "/usr/local/bin/$binary" || echo "Not a symlink")
        echo -e "/usr/local/bin/$binary: ${GREEN}$SYMLINK_TARGET${NC}"
    else
        echo -e "/usr/local/bin/$binary: ${RED}Not found${NC}"
    fi
done

# Check PATH
echo -e "\n${YELLOW}Checking PATH:${NC}"
echo -e "Current PATH: ${GREEN}$PATH${NC}"

# Determine which node would be used
WHICH_NODE=$(which node 2>/dev/null || echo "Not found")
echo -e "Node.js that would be used: ${GREEN}$WHICH_NODE${NC}"

# Recommendations
echo -e "\n${YELLOW}Recommendations:${NC}"
if [ "$FOUND_PROTECTED" = true ]; then
    if [[ "$PATH_NODE" != *"/usr/local/bin/node"* ]]; then
        echo -e "${RED}Your PATH is not configured to use the protected Node.js installation.${NC}"
        echo -e "${YELLOW}Add this to your shell profile and restart your terminal:${NC}"
        echo -e "${YELLOW}  export PATH=\"/usr/local/bin:\$PATH\"${NC}"
    else
        if [[ "$PATH_NODE_VERSION" == "$PROTECTED_VERSION" ]]; then
            echo -e "${GREEN}Your system is correctly configured to use the protected Node.js installation.${NC}"
        else
            echo -e "${RED}Your system is using a different Node.js version than the protected installation.${NC}"
            echo -e "${YELLOW}This could be due to PATH ordering. Try running:${NC}"
            echo -e "${YELLOW}  export PATH=\"/usr/local/bin:\$PATH\"${NC}"
        fi
    fi
else
    echo -e "${RED}No protected Node.js installation found.${NC}"
    echo -e "${YELLOW}Run the installation script to install Node.js v22.1.0.${NC}"
fi