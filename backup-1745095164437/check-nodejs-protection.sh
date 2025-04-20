#!/bin/bash

# Script to check Node.js protection status on macOS
# Created: $(date)

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Checking Node.js protection status on macOS...${NC}"

# Check Node.js version from both PATH and protected installation
NODE_VERSION=$(node -v 2>/dev/null || echo "Not installed")
PROTECTED_VERSION=""

# Find protected installation
for dir in /usr/local/nodejs-*; do
  if [ -d "$dir" ] && [ -f "$dir/bin/node" ]; then
    PROTECTED_INSTALL_DIR="$dir"
    PROTECTED_VERSION=$("$dir/bin/node" -v 2>/dev/null || echo "Not available")
    break
  fi
done
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

if [ -f "$(which npx 2>/dev/null)" ]; then
  echo -e "NPX binary: ${GREEN}Found at $(which npx)${NC}"
else
  echo -e "NPX binary: ${RED}Not found${NC}"
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

if [ -f "$(which npx 2>/dev/null)" ]; then
  NPX_FLAGS=$(ls -lO $(which npx 2>/dev/null) 2>/dev/null | grep -o "uchg" || echo "No")
  if [ "$NPX_FLAGS" = "uchg" ]; then
    echo -e "NPX immutable status: ${GREEN}Protected${NC}"
  else
    echo -e "NPX immutable status: ${RED}Not protected${NC}"
  fi
fi

# Check installation directory protection
NODE_VERSION_CLEAN=$(echo $NODE_VERSION | sed 's/v//')
if [ -d "/usr/local/nodejs-$NODE_VERSION_CLEAN" ]; then
  echo -e "Node.js installation directory: ${GREEN}Found at /usr/local/nodejs-$NODE_VERSION_CLEAN${NC}"

  INSTALL_DIR_FLAGS=$(ls -lO "/usr/local/nodejs-$NODE_VERSION_CLEAN" 2>/dev/null | grep -o "uchg" || echo "No")
  if [ "$INSTALL_DIR_FLAGS" = "uchg" ]; then
    echo -e "Installation directory immutable status: ${GREEN}Protected${NC}"
  else
    echo -e "Installation directory immutable status: ${RED}Not protected${NC}"
  fi
else
  echo -e "Node.js installation directory: ${RED}Not found${NC}"
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

# Check if symlinks point to our protected installation
if [ -z "$PROTECTED_INSTALL_DIR" ]; then
  # Try to find any protected installation directory if not already found
  for dir in /usr/local/nodejs-*; do
    if [ -d "$dir" ] && [ -f "$dir/bin/node" ]; then
      PROTECTED_INSTALL_DIR="$dir"
      PROTECTED_VERSION=$(basename "$dir" | sed 's/nodejs-//')
      break
    fi
  done
else
  echo -e "Protected Node.js version: ${GREEN}$PROTECTED_VERSION${NC}"
fi

if [ -n "$PROTECTED_INSTALL_DIR" ]; then
  echo -e "Protected installation: ${GREEN}Found at $PROTECTED_INSTALL_DIR${NC}"

  if [ -f "$(which node 2>/dev/null)" ]; then
    NODE_SYMLINK_TARGET=$(readlink $(which node) || echo "Not a symlink")
    if [[ "$NODE_SYMLINK_TARGET" == "$PROTECTED_INSTALL_DIR/bin/node" ]]; then
      echo -e "Node symlink: ${GREEN}Correctly points to protected installation${NC}"
    else
      echo -e "Node symlink: ${RED}Does not point to protected installation${NC}"
      echo -e "  Current: ${YELLOW}$NODE_SYMLINK_TARGET${NC}"
      echo -e "  Expected: ${YELLOW}$PROTECTED_INSTALL_DIR/bin/node${NC}"
    fi
  fi
else
  echo -e "Protected installation: ${RED}Not found${NC}"
fi

echo -e "\n${YELLOW}Summary:${NC}"

# Check if we have a protected installation
if [ -n "$PROTECTED_INSTALL_DIR" ]; then
  # Check if the current node version matches the protected version
  if [[ "$NODE_VERSION" == "$PROTECTED_VERSION" ]]; then
    echo -e "${GREEN}Node.js version matches protected installation.${NC}"
  else
    echo -e "${RED}Node.js version mismatch! Current: $NODE_VERSION, Protected: $PROTECTED_VERSION${NC}"
    echo -e "${YELLOW}This suggests the symlinks are not correctly pointing to the protected installation.${NC}"
    echo -e "${YELLOW}Try adding /usr/local/bin to the beginning of your PATH:${NC}"
    echo -e "${YELLOW}  export PATH=\"/usr/local/bin:\$PATH\"${NC}"
  fi

  # Check if symlinks are correct
  if [[ "$NODE_SYMLINK_TARGET" == "$PROTECTED_INSTALL_DIR/bin/node" ]]; then
    echo -e "${GREEN}Node.js symlinks are correctly configured.${NC}"
  else
    echo -e "${RED}Node.js symlinks are not pointing to the protected installation.${NC}"
  fi

  # Check protection mechanisms
  if [ "$NODE_FLAGS" = "uchg" ] && [ "$NPM_FLAGS" = "uchg" ] && [ "$NPX_FLAGS" = "uchg" ] && [ -d "/usr/local/bin/nodejs-protection" ] && [ "$BREW_HOOK_INSTALLED" = "Yes" ] && [ -n "$LAUNCHD_STATUS" ]; then
    echo -e "${GREEN}Protection mechanisms are active.${NC}"
  else
    echo -e "${RED}Some protection mechanisms are not active.${NC}"
  fi

  # Overall status
  if [[ "$NODE_VERSION" == "v$PROTECTED_VERSION" ]] && [[ "$NODE_SYMLINK_TARGET" == "$PROTECTED_INSTALL_DIR/bin/node" ]] && [ "$NODE_FLAGS" = "uchg" ] && [ "$NPM_FLAGS" = "uchg" ] && [ "$NPX_FLAGS" = "uchg" ] && [ -d "/usr/local/bin/nodejs-protection" ] && [ "$BREW_HOOK_INSTALLED" = "Yes" ] && [ -n "$LAUNCHD_STATUS" ]; then
    echo -e "\n${GREEN}Node.js is installed and fully protected against downgrading or removal.${NC}"
  else
    echo -e "\n${RED}Node.js protection is incomplete. Run the installation script again.${NC}"

    # Provide specific recommendations
    if [[ "$NODE_VERSION" != "$PROTECTED_VERSION" ]]; then
      echo -e "${YELLOW}Recommendation: Run 'sudo ./install-nodejs-specific-version.sh' to fix symlinks.${NC}"
      echo -e "${YELLOW}Alternatively, add /usr/local/bin to the beginning of your PATH:${NC}"
      echo -e "${YELLOW}  export PATH=\"/usr/local/bin:\$PATH\"${NC}"
      echo -e "${YELLOW}And add this line to your shell profile (~/.zshrc or ~/.bash_profile).${NC}"
    fi

    if [ "$NODE_FLAGS" != "uchg" ] || [ "$NPM_FLAGS" != "uchg" ] || [ "$NPX_FLAGS" != "uchg" ]; then
      echo -e "${YELLOW}Recommendation: Run 'sudo /usr/local/bin/nodejs-protection/make-nodejs-immutable.sh' to restore immutability.${NC}"
    fi

    if [ ! -n "$LAUNCHD_STATUS" ]; then
      echo -e "${YELLOW}Recommendation: Run 'sudo launchctl load /Library/LaunchDaemons/com.nodejs.protection.plist' to start the protection service.${NC}"
    fi
  fi
else
  echo -e "${RED}No protected Node.js installation found. Run the installation script.${NC}"
fi