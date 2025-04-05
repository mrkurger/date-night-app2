#!/bin/bash
# Make this script executable with: chmod +x cleanup-protection.sh

# Script to clean up previous Node.js protection
# This will remove all immutable flags and protection mechanisms

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Cleaning up previous Node.js protection...${NC}"

# Stop and unload the protection service
echo -e "${YELLOW}Stopping protection service...${NC}"
sudo launchctl unload /Library/LaunchDaemons/com.nodejs.protection.plist 2>/dev/null || true
sudo rm -f /Library/LaunchDaemons/com.nodejs.protection.plist

# Remove immutable flags from all possible Node.js installations
echo -e "${YELLOW}Removing immutable flags from Node.js installations...${NC}"
for dir in /usr/local/nodejs-*; do
  if [ -d "$dir" ]; then
    echo -e "  Removing immutable flags from $dir"
    sudo chflags -R nouchg "$dir" 2>/dev/null || true
  fi
done

# Remove immutable flags from symlinks
echo -e "${YELLOW}Removing immutable flags from symlinks...${NC}"
sudo chflags nouchg /usr/local/bin/node 2>/dev/null || true
sudo chflags nouchg /usr/local/bin/npm 2>/dev/null || true
sudo chflags nouchg /usr/local/bin/npx 2>/dev/null || true

# Restore original brew command if backup exists
echo -e "${YELLOW}Restoring original brew command...${NC}"
if [ -f "/opt/homebrew/bin/brew-original" ]; then
  sudo cp /opt/homebrew/bin/brew-original /opt/homebrew/bin/brew
  echo -e "${GREEN}Restored original brew command from /opt/homebrew/bin/brew-original${NC}"
elif [ -f "/usr/local/bin/brew-original" ]; then
  sudo cp /usr/local/bin/brew-original /usr/local/bin/brew
  echo -e "${GREEN}Restored original brew command from /usr/local/bin/brew-original${NC}"
else
  echo -e "${YELLOW}No original brew command backup found${NC}"
fi

# Remove protection scripts
echo -e "${YELLOW}Removing protection scripts...${NC}"
sudo rm -rf /usr/local/bin/nodejs-protection
sudo rm -f /usr/local/bin/brew-hook

echo -e "${GREEN}Cleanup complete. You can now run the installation script again.${NC}"