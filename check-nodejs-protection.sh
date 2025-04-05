#!/bin/bash

# Script to check Node.js protection status on macOS
# Created: $(date)

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Checking Node.js protection status on macOS...${NC}"

# Check Node.js version
NODE_VERSION=$(node -v 2>/dev/null || echo "Not installed")
echo -e "Node.js version: ${GREEN}$NODE_VERSION${NC}"

# Check if binaries exist
if [ -f "$(which node 2>/dev/null)" ]; then
  echo -e "Node binary: ${GREEN}Found at $(which node)${NC}"
else
  echo -e "Node binary: ${RED}Not found${NC}"
fi

if [ -f "$(which npm 2>/dev/null)" ]; then
  echo -e "NPM binary: ${GREEN}Found at $(which npm)${NC}"
else
  echo -e "NPM binary: ${RED}Not found${NC}"
fi

# Check immutable status using macOS chflags
if [ -f "$(which node 2>/dev/null)" ]; then
  NODE_FLAGS=$(ls -lO $(which node 2>/dev/null) 2>/dev/null | grep -o "uchg" || echo "No")
  if [ "$NODE_FLAGS" = "uchg" ]; then
    echo -e "Node immutable status: ${GREEN}Protected${NC}"
  else
    echo -e "Node immutable status: ${RED}Not protected${NC}"
  fi
fi

if [ -f "$(which npm 2>/dev/null)" ]; then
  NPM_FLAGS=$(ls -lO $(which npm 2>/dev/null) 2>/dev/null | grep -o "uchg" || echo "No")
  if [ "$NPM_FLAGS" = "uchg" ]; then
    echo -e "NPM immutable status: ${GREEN}Protected${NC}"
  else
    echo -e "NPM immutable status: ${RED}Not protected${NC}"
  fi
fi

# Check directory protection
if [ -f "$(which node 2>/dev/null)" ]; then
  NODE_DIR=$(dirname $(which node 2>/dev/null))
  DIR_FLAGS=$(ls -lO "$NODE_DIR" 2>/dev/null | grep -o "uchg" || echo "No")
  if [ "$DIR_FLAGS" = "uchg" ]; then
    echo -e "Node directory immutable status: ${GREEN}Protected${NC}"
  else
    echo -e "Node directory immutable status: ${RED}Not protected${NC}"
  fi
fi

# Check protection scripts
if [ -d "/usr/local/bin/nodejs-protection" ]; then
  echo -e "Protection scripts: ${GREEN}Installed${NC}"
else
  echo -e "Protection scripts: ${RED}Not installed${NC}"
fi

# Check Homebrew hook
BREW_HOOK_INSTALLED="No"
if [[ $(uname -m) == 'arm64' ]]; then
  # For Apple Silicon Macs
  if [ -f "/opt/homebrew/bin/brew-original" ]; then
    BREW_HOOK_INSTALLED="Yes"
  fi
else
  # For Intel Macs
  if [ -f "/usr/local/bin/brew-original" ]; then
    BREW_HOOK_INSTALLED="Yes"
  fi
fi

if [ "$BREW_HOOK_INSTALLED" = "Yes" ]; then
  echo -e "Homebrew hook: ${GREEN}Installed${NC}"
else
  echo -e "Homebrew hook: ${RED}Not installed${NC}"
fi

# Check launchd service
LAUNCHD_STATUS=$(launchctl list | grep com.nodejs.protection || echo "")
if [ -n "$LAUNCHD_STATUS" ]; then
  echo -e "Protection service: ${GREEN}Running${NC}"
else
  echo -e "Protection service: ${RED}Not running${NC}"
fi

echo -e "\n${YELLOW}Summary:${NC}"
if [ "$NODE_VERSION" != "Not installed" ] && [ "$NODE_FLAGS" = "uchg" ] && [ "$NPM_FLAGS" = "uchg" ] && [ "$DIR_FLAGS" = "uchg" ] && [ -d "/usr/local/bin/nodejs-protection" ] && [ "$BREW_HOOK_INSTALLED" = "Yes" ]; then
  echo -e "${GREEN}Node.js is installed and fully protected against downgrading or removal.${NC}"
else
  echo -e "${RED}Node.js protection is incomplete. Run the installation script again.${NC}"
fi