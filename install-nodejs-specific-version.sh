#!/bin/bash

# Script to install a specific Node.js version on macOS and prevent downgrading
# Created: $(date)

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# The specific Node.js version to install
TARGET_VERSION="22.14.0"

echo -e "${GREEN}Starting Node.js v${TARGET_VERSION} installation script for macOS...${NC}"

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo -e "${YELLOW}Homebrew not found. Installing Homebrew...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo -e "${GREEN}Homebrew is already installed.${NC}"
fi

# Make sure Homebrew is in the PATH
if ! command -v brew &> /dev/null; then
    echo -e "${YELLOW}Adding Homebrew to PATH...${NC}"
    if [[ $(uname -m) == 'arm64' ]]; then
        # For Apple Silicon Macs
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    else
        # For Intel Macs
        echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/usr/local/bin/brew shellenv)"
    fi
fi

# Install NVM (Node Version Manager) to manage specific Node.js versions
echo -e "${YELLOW}Installing NVM (Node Version Manager)...${NC}"
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# Check if NVM is installed correctly
if ! command -v nvm &> /dev/null; then
    echo -e "${RED}NVM installation failed. Please install NVM manually.${NC}"
    exit 1
fi

# Install the specific Node.js version
echo -e "${YELLOW}Installing Node.js v${TARGET_VERSION}...${NC}"
nvm install $TARGET_VERSION || {
    echo -e "${YELLOW}Version ${TARGET_VERSION} not found. Trying to install the latest available version...${NC}"
    nvm install node
    INSTALLED_VERSION=$(node -v | sed 's/v//')
    echo -e "${YELLOW}Installed Node.js v${INSTALLED_VERSION} instead.${NC}"
    TARGET_VERSION=$INSTALLED_VERSION
}

# Use the installed version
nvm use $TARGET_VERSION

# Make this version the default
nvm alias default $TARGET_VERSION

# Verify installation
NODE_VERSION=$(node -v)
echo -e "${GREEN}Node.js $NODE_VERSION has been installed successfully${NC}"

# Create a directory for our protection scripts
echo -e "${YELLOW}Creating protection directory...${NC}"
sudo mkdir -p /usr/local/bin/nodejs-protection

# Create a script to check for downgrades
echo -e "${YELLOW}Creating Node.js version protection script...${NC}"
cat > /tmp/prevent-nodejs-downgrade.sh << EOF
#!/bin/bash

# Script to prevent Node.js from being downgraded on macOS

set -e

# Get the currently installed version
CURRENT_VERSION=\$(node -v 2>/dev/null | sed 's/v//' || echo "0.0.0")

# Log the attempt
echo "\$(date): Node.js protection script triggered" >> /usr/local/bin/nodejs-protection/protection.log

# Block any attempt to modify Node.js
if [[ "\$1" == *"node"* ]]; then
  echo "Node.js package operation detected. Blocking operation."
  echo "\$(date): Blocked attempt to modify Node.js: \$1 \$2" >> /usr/local/bin/nodejs-protection/protection.log
  exit 1
fi

# Allow other operations
exit 0
EOF

sudo mv /tmp/prevent-nodejs-downgrade.sh /usr/local/bin/nodejs-protection/prevent-nodejs-downgrade.sh
sudo chmod +x /usr/local/bin/nodejs-protection/prevent-nodejs-downgrade.sh

# Create a script to make Node.js binaries immutable
echo -e "${YELLOW}Creating immutability script...${NC}"
cat > /tmp/make-nodejs-immutable.sh << EOF
#!/bin/bash

# Script to make Node.js binaries immutable on macOS

# Get the path to node and npm
NODE_PATH=\$(which node)
NPM_PATH=\$(which npm)

# Make the binaries immutable using chflags
sudo chflags uchg "\$NODE_PATH"
sudo chflags uchg "\$NPM_PATH"

# Also protect the parent directories
NODE_DIR=\$(dirname "\$NODE_PATH")
sudo chflags uchg "\$NODE_DIR"

echo "\$(date): Made Node.js binaries immutable" >> /usr/local/bin/nodejs-protection/protection.log
EOF

sudo mv /tmp/make-nodejs-immutable.sh /usr/local/bin/nodejs-protection/make-nodejs-immutable.sh
sudo chmod +x /usr/local/bin/nodejs-protection/make-nodejs-immutable.sh

# Create a script to check and restore immutability
echo -e "${YELLOW}Creating protection monitor script...${NC}"
cat > /tmp/monitor-nodejs-protection.sh << EOF
#!/bin/bash

# Script to monitor and protect Node.js on macOS

# Get the path to node and npm
NODE_PATH=\$(which node)
NPM_PATH=\$(which npm)
NODE_DIR=\$(dirname "\$NODE_PATH")

# Check if the binaries are immutable
NODE_FLAGS=\$(ls -lO "\$NODE_PATH" | grep -o "uchg" || echo "No")
NPM_FLAGS=\$(ls -lO "\$NPM_PATH" | grep -o "uchg" || echo "No")
DIR_FLAGS=\$(ls -lO "\$NODE_DIR" | grep -o "uchg" || echo "No")

# Restore immutability if needed
if [ "\$NODE_FLAGS" != "uchg" ]; then
  sudo chflags uchg "\$NODE_PATH"
  echo "\$(date): Restored immutability to node binary" >> /usr/local/bin/nodejs-protection/protection.log
fi

if [ "\$NPM_FLAGS" != "uchg" ]; then
  sudo chflags uchg "\$NPM_PATH"
  echo "\$(date): Restored immutability to npm binary" >> /usr/local/bin/nodejs-protection/protection.log
fi

if [ "\$DIR_FLAGS" != "uchg" ]; then
  sudo chflags uchg "\$NODE_DIR"
  echo "\$(date): Restored immutability to node directory" >> /usr/local/bin/nodejs-protection/protection.log
fi

# Check if the version is correct
CURRENT_VERSION=\$(node -v)
if [ "\$CURRENT_VERSION" != "v${TARGET_VERSION}" ]; then
  echo "\$(date): Node.js version changed! Current: \$CURRENT_VERSION, Expected: v${TARGET_VERSION}" >> /usr/local/bin/nodejs-protection/protection.log
fi
EOF

sudo mv /tmp/monitor-nodejs-protection.sh /usr/local/bin/nodejs-protection/monitor-nodejs-protection.sh
sudo chmod +x /usr/local/bin/nodejs-protection/monitor-nodejs-protection.sh

# Create a launchd plist to run the monitor script periodically
echo -e "${YELLOW}Creating launchd service...${NC}"
cat > /tmp/com.nodejs.protection.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.nodejs.protection</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/nodejs-protection/monitor-nodejs-protection.sh</string>
    </array>
    <key>StartInterval</key>
    <integer>300</integer>
    <key>RunAtLoad</key>
    <true/>
    <key>StandardErrorPath</key>
    <string>/usr/local/bin/nodejs-protection/protection.log</string>
    <key>StandardOutPath</key>
    <string>/usr/local/bin/nodejs-protection/protection.log</string>
</dict>
</plist>
EOF

sudo mv /tmp/com.nodejs.protection.plist /Library/LaunchDaemons/com.nodejs.protection.plist
sudo chmod 644 /Library/LaunchDaemons/com.nodejs.protection.plist

# Create a hook for NVM to prevent version changes
echo -e "${YELLOW}Creating NVM hook...${NC}"
mkdir -p "$NVM_DIR/hooks"
cat > "$NVM_DIR/hooks/before-use" << EOF
#!/bin/bash

# NVM hook to prevent Node.js version changes
if [ "\$1" != "v${TARGET_VERSION}" ] && [ "\$1" != "${TARGET_VERSION}" ]; then
  echo "Attempt to change Node.js version blocked by protection mechanism"
  echo "\$(date): Blocked attempt to change Node.js version to \$1" >> /usr/local/bin/nodejs-protection/protection.log
  exit 1
fi
EOF

chmod +x "$NVM_DIR/hooks/before-use"

# Make Node.js binaries immutable
echo -e "${YELLOW}Making Node.js binaries immutable...${NC}"
sudo /usr/local/bin/nodejs-protection/make-nodejs-immutable.sh

# Load the launchd service
echo -e "${YELLOW}Loading protection service...${NC}"
sudo launchctl load /Library/LaunchDaemons/com.nodejs.protection.plist

echo -e "${GREEN}Node.js v${TARGET_VERSION} installation and protection complete!${NC}"
echo -e "${GREEN}Installed version: $NODE_VERSION${NC}"
echo -e "${YELLOW}Note: To update Node.js in the future, you'll need to manually disable the protection:${NC}"
echo -e "  1. sudo launchctl unload /Library/LaunchDaemons/com.nodejs.protection.plist"
echo -e "  2. sudo chflags nouchg \$(which node) \$(which npm) \$(dirname \$(which node))"
echo -e "  3. Remove the NVM hook: rm $NVM_DIR/hooks/before-use"
echo -e "  4. Perform the update using NVM: nvm install <new-version>"
echo -e "  5. Re-enable protection by running this script again with the new version"