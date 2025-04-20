#!/bin/bash

# Script to install Node.js and prevent downgrading on macOS
# Created: $(date)

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Node.js installation script for macOS...${NC}"

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

# Install Node.js using Homebrew
echo -e "${YELLOW}Installing Node.js...${NC}"
brew update
brew install node@20

# Make sure node is linked
echo -e "${YELLOW}Linking Node.js...${NC}"
brew link --force node@20

# Verify installation
NODE_VERSION=$(node -v)
echo -e "${GREEN}Node.js $NODE_VERSION has been installed successfully${NC}"

# Create a directory for our protection scripts
echo -e "${YELLOW}Creating protection directory...${NC}"
mkdir -p /usr/local/bin/nodejs-protection

# Create a script to check for downgrades
echo -e "${YELLOW}Creating Node.js version protection script...${NC}"
cat > /usr/local/bin/nodejs-protection/prevent-nodejs-downgrade.sh << 'EOF'
#!/bin/bash

# Script to prevent Node.js from being downgraded on macOS

set -e

# Get the currently installed version
CURRENT_VERSION=$(node -v 2>/dev/null | sed 's/v//' || echo "0.0.0")

# Log the attempt
echo "$(date): Node.js protection script triggered" >> /usr/local/bin/nodejs-protection/protection.log

# Block any attempt to modify Node.js
if [[ "$1" == *"node"* ]]; then
  echo "Node.js package operation detected. Blocking operation."
  echo "$(date): Blocked attempt to modify Node.js: $1 $2" >> /usr/local/bin/nodejs-protection/protection.log
  exit 1
fi

# Allow other operations
exit 0
EOF

chmod +x /usr/local/bin/nodejs-protection/prevent-nodejs-downgrade.sh

# Create a script to make Node.js binaries immutable
echo -e "${YELLOW}Creating immutability script...${NC}"
cat > /usr/local/bin/nodejs-protection/make-nodejs-immutable.sh << 'EOF'
#!/bin/bash

# Script to make Node.js binaries immutable on macOS

# Get the path to node and npm
NODE_PATH=$(which node)
NPM_PATH=$(which npm)

# Make the binaries immutable using chflags
chflags uchg "$NODE_PATH"
chflags uchg "$NPM_PATH"

# Also protect the parent directories
NODE_DIR=$(dirname "$NODE_PATH")
chflags uchg "$NODE_DIR"

echo "$(date): Made Node.js binaries immutable" >> /usr/local/bin/nodejs-protection/protection.log
EOF

chmod +x /usr/local/bin/nodejs-protection/make-nodejs-immutable.sh

# Create a script to check and restore immutability
echo -e "${YELLOW}Creating protection monitor script...${NC}"
cat > /usr/local/bin/nodejs-protection/monitor-nodejs-protection.sh << 'EOF'
#!/bin/bash

# Script to monitor and protect Node.js on macOS

# Get the path to node and npm
NODE_PATH=$(which node)
NPM_PATH=$(which npm)
NODE_DIR=$(dirname "$NODE_PATH")

# Check if the binaries are immutable
NODE_FLAGS=$(ls -lO "$NODE_PATH" | grep -o "uchg")
NPM_FLAGS=$(ls -lO "$NPM_PATH" | grep -o "uchg")
DIR_FLAGS=$(ls -lO "$NODE_DIR" | grep -o "uchg")

# Restore immutability if needed
if [ "$NODE_FLAGS" != "uchg" ]; then
  chflags uchg "$NODE_PATH"
  echo "$(date): Restored immutability to node binary" >> /usr/local/bin/nodejs-protection/protection.log
fi

if [ "$NPM_FLAGS" != "uchg" ]; then
  chflags uchg "$NPM_PATH"
  echo "$(date): Restored immutability to npm binary" >> /usr/local/bin/nodejs-protection/protection.log
fi

if [ "$DIR_FLAGS" != "uchg" ]; then
  chflags uchg "$NODE_DIR"
  echo "$(date): Restored immutability to node directory" >> /usr/local/bin/nodejs-protection/protection.log
fi

# Check if the version is correct
CURRENT_VERSION=$(node -v)
if [ "$CURRENT_VERSION" != "v20.14.0" ]; then
  echo "$(date): Node.js version changed! Current: $CURRENT_VERSION" >> /usr/local/bin/nodejs-protection/protection.log
fi
EOF

chmod +x /usr/local/bin/nodejs-protection/monitor-nodejs-protection.sh

# Create a launchd plist to run the monitor script periodically
echo -e "${YELLOW}Creating launchd service...${NC}"
cat > /Library/LaunchDaemons/com.nodejs.protection.plist << 'EOF'
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

# Create a Homebrew hook to prevent Node.js modifications
echo -e "${YELLOW}Creating Homebrew hook...${NC}"
cat > /usr/local/bin/brew-hook << 'EOF'
#!/bin/bash

# Homebrew hook to prevent Node.js modifications

# Get the original brew command
BREW_ORIGINAL="/usr/local/bin/brew-original"
if [[ $(uname -m) == 'arm64' ]]; then
    BREW_ORIGINAL="/opt/homebrew/bin/brew-original"
fi

# Check if this is a Node.js related operation
if [[ "$*" == *"node"* ]]; then
    if [[ "$1" == "uninstall" || "$1" == "remove" || "$1" == "unlink" || "$1" == "install" || "$1" == "upgrade" || "$1" == "link" ]]; then
        echo "Operation blocked by Node.js protection"
        echo "$(date): Blocked Homebrew operation: $*" >> /usr/local/bin/nodejs-protection/protection.log
        exit 1
    fi
fi

# Pass through all other commands
"$BREW_ORIGINAL" "$@"
EOF

chmod +x /usr/local/bin/brew-hook

# Backup the original brew command
if [[ $(uname -m) == 'arm64' ]]; then
    # For Apple Silicon Macs
    if [ ! -f "/opt/homebrew/bin/brew-original" ]; then
        echo -e "${YELLOW}Backing up original brew command...${NC}"
        cp /opt/homebrew/bin/brew /opt/homebrew/bin/brew-original
        echo -e "${YELLOW}Replacing brew command with our hook...${NC}"
        cp /usr/local/bin/brew-hook /opt/homebrew/bin/brew
    fi
else
    # For Intel Macs
    if [ ! -f "/usr/local/bin/brew-original" ]; then
        echo -e "${YELLOW}Backing up original brew command...${NC}"
        cp /usr/local/bin/brew /usr/local/bin/brew-original
        echo -e "${YELLOW}Replacing brew command with our hook...${NC}"
        cp /usr/local/bin/brew-hook /usr/local/bin/brew
    fi
fi

# Make Node.js binaries immutable
echo -e "${YELLOW}Making Node.js binaries immutable...${NC}"
/usr/local/bin/nodejs-protection/make-nodejs-immutable.sh

# Load the launchd service
echo -e "${YELLOW}Loading protection service...${NC}"
launchctl load /Library/LaunchDaemons/com.nodejs.protection.plist

echo -e "${GREEN}Node.js installation and protection complete!${NC}"
echo -e "${GREEN}Installed version: $NODE_VERSION${NC}"
echo -e "${YELLOW}Note: To update Node.js in the future, you'll need to manually disable the protection:${NC}"
echo -e "  1. sudo launchctl unload /Library/LaunchDaemons/com.nodejs.protection.plist"
echo -e "  2. sudo chflags nouchg \$(which node) \$(which npm) \$(dirname \$(which node))"
echo -e "  3. Restore the original brew command"
echo -e "  4. Perform the update"
echo -e "  5. Re-enable protection by running this script again"