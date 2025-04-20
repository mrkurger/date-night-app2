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
TARGET_VERSION="22.1.0"  # Using LTS version 22

echo -e "${GREEN}Starting Node.js v${TARGET_VERSION} installation script for macOS...${NC}"

# Determine architecture
ARCH=$(uname -m)
if [[ "$ARCH" == "arm64" ]]; then
    NODE_ARCH="arm64"
    BREW_PATH="/opt/homebrew"
else
    NODE_ARCH="x64"
    BREW_PATH="/usr/local"
fi

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo -e "${YELLOW}Homebrew not found. Installing Homebrew...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

    # Add Homebrew to PATH
    if [[ "$ARCH" == "arm64" ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    else
        echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/usr/local/bin/brew shellenv)"
    fi
else
    echo -e "${GREEN}Homebrew is already installed.${NC}"
fi

# Create a directory for Node.js installation
echo -e "${YELLOW}Creating Node.js installation directory...${NC}"
sudo mkdir -p /usr/local/nodejs-${TARGET_VERSION}

# Download and install Node.js directly
echo -e "${YELLOW}Downloading Node.js v${TARGET_VERSION}...${NC}"
DOWNLOAD_URL="https://nodejs.org/dist/v${TARGET_VERSION}/node-v${TARGET_VERSION}-darwin-${NODE_ARCH}.tar.gz"
TEMP_DIR=$(mktemp -d)
curl -o "${TEMP_DIR}/node.tar.gz" "$DOWNLOAD_URL"

echo -e "${YELLOW}Extracting Node.js...${NC}"
tar -xzf "${TEMP_DIR}/node.tar.gz" -C "${TEMP_DIR}"
NODE_EXTRACT_DIR=$(find "${TEMP_DIR}" -type d -name "node-v*" | head -n 1)

echo -e "${YELLOW}Installing Node.js to /usr/local/nodejs-${TARGET_VERSION}...${NC}"
sudo cp -R "${NODE_EXTRACT_DIR}/"* /usr/local/nodejs-${TARGET_VERSION}/

# Check for existing Node.js installations from Homebrew
echo -e "${YELLOW}Checking for existing Node.js installations...${NC}"
if command -v brew &> /dev/null; then
    # Don't run brew as root
    if [ "$(id -u)" -eq 0 ]; then
        echo -e "${YELLOW}Running as root, will check for Homebrew Node.js installation after script completes${NC}"
    else
        BREW_NODE=$(brew list | grep node || echo "")
        if [ -n "$BREW_NODE" ]; then
            echo -e "${YELLOW}Found existing Node.js installation via Homebrew. Will temporarily unlink it.${NC}"
            brew unlink node || true
        fi
    fi
fi

# Clean up any previous protected installation
echo -e "${YELLOW}Cleaning up previous protected installation...${NC}"
if [ -d "/usr/local/nodejs-${TARGET_VERSION}" ]; then
    echo -e "${YELLOW}Found existing installation at /usr/local/nodejs-${TARGET_VERSION}. Removing...${NC}"
    sudo chflags -R nouchg "/usr/local/nodejs-${TARGET_VERSION}" 2>/dev/null || true
    sudo rm -rf "/usr/local/nodejs-${TARGET_VERSION}"
fi

# Create symlinks with absolute paths to ensure they take precedence
echo -e "${YELLOW}Creating symlinks...${NC}"
sudo rm -f /usr/local/bin/node /usr/local/bin/npm /usr/local/bin/npx
sudo ln -sf /usr/local/nodejs-${TARGET_VERSION}/bin/node /usr/local/bin/node
sudo ln -sf /usr/local/nodejs-${TARGET_VERSION}/bin/npm /usr/local/bin/npm
sudo ln -sf /usr/local/nodejs-${TARGET_VERSION}/bin/npx /usr/local/bin/npx

# Add our bin directory to the beginning of PATH for this script
export PATH="/usr/local/bin:$PATH"

# Create a shell profile snippet to ensure our Node.js is used
echo -e "${YELLOW}Creating shell profile snippet...${NC}"
cat > /tmp/nodejs-protected-path.sh << EOF
# Added by Node.js protection script
# This ensures the protected Node.js installation is used
export PATH="/usr/local/bin:\$PATH"
EOF

# Add to user's shell profile if not already there
for PROFILE in ~/.zshrc ~/.bash_profile ~/.bashrc; do
    if [ -f "$PROFILE" ]; then
        if ! grep -q "Added by Node.js protection script" "$PROFILE"; then
            echo -e "${YELLOW}Adding PATH configuration to $PROFILE${NC}"
            cat /tmp/nodejs-protected-path.sh >> "$PROFILE"
        fi
    fi
done

# Clean up
rm -rf "${TEMP_DIR}"

# Verify installation with full path to ensure we're checking our version
NODE_VERSION=$(/usr/local/nodejs-${TARGET_VERSION}/bin/node -v)
echo -e "${GREEN}Node.js $NODE_VERSION has been installed successfully${NC}"

# If the version doesn't match, something went wrong
if [[ "$NODE_VERSION" != "v${TARGET_VERSION}" ]]; then
    echo -e "${RED}Installation failed. Expected v${TARGET_VERSION}, got ${NODE_VERSION}${NC}"
    exit 1
fi

# Check if the symlinks are working correctly
SYMLINK_NODE_VERSION=$(/usr/local/bin/node -v 2>/dev/null || echo "Not available")
if [[ "$SYMLINK_NODE_VERSION" != "v${TARGET_VERSION}" ]]; then
    echo -e "${YELLOW}Warning: Symlinked node is reporting version ${SYMLINK_NODE_VERSION} instead of v${TARGET_VERSION}${NC}"
    echo -e "${YELLOW}This could be because another Node.js installation is taking precedence in your PATH.${NC}"
    echo -e "${YELLOW}After installation, you may need to restart your terminal or run:${NC}"
    echo -e "${YELLOW}  export PATH=\"/usr/local/bin:\$PATH\"${NC}"
fi

# Create a directory for our protection scripts
echo -e "${YELLOW}Creating protection directory...${NC}"
sudo mkdir -p /usr/local/bin/nodejs-protection
sudo touch /usr/local/bin/nodejs-protection/protection.log
sudo chmod 755 /usr/local/bin/nodejs-protection
sudo chmod 644 /usr/local/bin/nodejs-protection/protection.log

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
NPX_PATH=\$(which npx)

# Make the binaries immutable using chflags
sudo chflags uchg "\$NODE_PATH"
sudo chflags uchg "\$NPM_PATH"
sudo chflags uchg "\$NPX_PATH"

# Also protect the installation directory
sudo chflags uchg /usr/local/nodejs-${TARGET_VERSION}
sudo chflags uchg /usr/local/nodejs-${TARGET_VERSION}/bin

echo "\$(date): Made Node.js binaries immutable" >> /usr/local/bin/nodejs-protection/protection.log
EOF

sudo mv /tmp/make-nodejs-immutable.sh /usr/local/bin/nodejs-protection/make-nodejs-immutable.sh
sudo chmod +x /usr/local/bin/nodejs-protection/make-nodejs-immutable.sh

# Create a script to check and restore immutability
echo -e "${YELLOW}Creating protection monitor script...${NC}"
cat > /tmp/monitor-nodejs-protection.sh << EOF
#!/bin/bash

# Script to monitor and protect Node.js on macOS

# Ensure our protected version is in the PATH
export PATH="/usr/local/bin:/usr/local/nodejs-${TARGET_VERSION}/bin:\$PATH"

# Check if our installation directory exists
if [ ! -d "/usr/local/nodejs-${TARGET_VERSION}" ]; then
  echo "\$(date): ERROR: Protected Node.js installation directory not found!" >> /usr/local/bin/nodejs-protection/protection.log
  exit 1
fi

# Check if our binaries exist in the installation directory
if [ ! -f "/usr/local/nodejs-${TARGET_VERSION}/bin/node" ]; then
  echo "\$(date): ERROR: Node binary not found in protected installation!" >> /usr/local/bin/nodejs-protection/protection.log
  exit 1
fi

# Check if the symlinks exist and point to our installation
NODE_SYMLINK_TARGET=\$(readlink /usr/local/bin/node 2>/dev/null || echo "Not a symlink")
NPM_SYMLINK_TARGET=\$(readlink /usr/local/bin/npm 2>/dev/null || echo "Not a symlink")
NPX_SYMLINK_TARGET=\$(readlink /usr/local/bin/npx 2>/dev/null || echo "Not a symlink")

# Restore symlinks if they don't point to our installation
if [[ "\$NODE_SYMLINK_TARGET" != "/usr/local/nodejs-${TARGET_VERSION}/bin/node" ]]; then
  sudo ln -sf /usr/local/nodejs-${TARGET_VERSION}/bin/node /usr/local/bin/node
  echo "\$(date): Restored node symlink" >> /usr/local/bin/nodejs-protection/protection.log
fi

if [[ "\$NPM_SYMLINK_TARGET" != "/usr/local/nodejs-${TARGET_VERSION}/bin/npm" ]]; then
  sudo ln -sf /usr/local/nodejs-${TARGET_VERSION}/bin/npm /usr/local/bin/npm
  echo "\$(date): Restored npm symlink" >> /usr/local/bin/nodejs-protection/protection.log
fi

if [[ "\$NPX_SYMLINK_TARGET" != "/usr/local/nodejs-${TARGET_VERSION}/bin/npx" ]]; then
  sudo ln -sf /usr/local/nodejs-${TARGET_VERSION}/bin/npx /usr/local/bin/npx
  echo "\$(date): Restored npx symlink" >> /usr/local/bin/nodejs-protection/protection.log
fi

# Check if the binaries are immutable
NODE_FLAGS=\$(ls -lO "/usr/local/bin/node" 2>/dev/null | grep -o "uchg" || echo "No")
NPM_FLAGS=\$(ls -lO "/usr/local/bin/npm" 2>/dev/null | grep -o "uchg" || echo "No")
NPX_FLAGS=\$(ls -lO "/usr/local/bin/npx" 2>/dev/null | grep -o "uchg" || echo "No")
INSTALL_FLAGS=\$(ls -lO "/usr/local/nodejs-${TARGET_VERSION}" 2>/dev/null | grep -o "uchg" || echo "No")

# Restore immutability if needed
if [ "\$NODE_FLAGS" != "uchg" ]; then
  sudo chflags uchg "/usr/local/bin/node"
  echo "\$(date): Restored immutability to node binary" >> /usr/local/bin/nodejs-protection/protection.log
fi

if [ "\$NPM_FLAGS" != "uchg" ]; then
  sudo chflags uchg "/usr/local/bin/npm"
  echo "\$(date): Restored immutability to npm binary" >> /usr/local/bin/nodejs-protection/protection.log
fi

if [ "\$NPX_FLAGS" != "uchg" ]; then
  sudo chflags uchg "/usr/local/bin/npx"
  echo "\$(date): Restored immutability to npx binary" >> /usr/local/bin/nodejs-protection/protection.log
fi

if [ "\$INSTALL_FLAGS" != "uchg" ]; then
  sudo chflags uchg "/usr/local/nodejs-${TARGET_VERSION}"
  sudo chflags uchg "/usr/local/nodejs-${TARGET_VERSION}/bin"
  echo "\$(date): Restored immutability to installation directory" >> /usr/local/bin/nodejs-protection/protection.log
fi

# Check if the version is correct
CURRENT_VERSION=\$(/usr/local/bin/node -v 2>/dev/null || echo "Unknown")
if [ "\$CURRENT_VERSION" != "v${TARGET_VERSION}" ]; then
  echo "\$(date): Node.js version mismatch! Current: \$CURRENT_VERSION, Expected: v${TARGET_VERSION}" >> /usr/local/bin/nodejs-protection/protection.log

  # Check if Homebrew is trying to override our Node.js
  if command -v brew &> /dev/null; then
    BREW_NODE=\$(brew list | grep node || echo "")
    if [ -n "\$BREW_NODE" ]; then
      echo "\$(date): Detected Homebrew Node.js installation. Unlinking..." >> /usr/local/bin/nodejs-protection/protection.log
      brew unlink node 2>/dev/null || true
    fi
  fi

  # Restore our symlinks again
  sudo ln -sf /usr/local/nodejs-${TARGET_VERSION}/bin/node /usr/local/bin/node
  sudo ln -sf /usr/local/nodejs-${TARGET_VERSION}/bin/npm /usr/local/bin/npm
  sudo ln -sf /usr/local/nodejs-${TARGET_VERSION}/bin/npx /usr/local/bin/npx
  echo "\$(date): Forcefully restored Node.js symlinks" >> /usr/local/bin/nodejs-protection/protection.log
fi

# Also check if Homebrew is trying to install a different version
if command -v brew &> /dev/null; then
  BREW_CELLAR=\$(brew --cellar 2>/dev/null)/node*
  if [ -d "\$BREW_CELLAR" ]; then
    echo "\$(date): Detected Homebrew Node.js installation. Checking..." >> /usr/local/bin/nodejs-protection/protection.log

    # If Homebrew has installed Node.js, make it immutable too
    for dir in \$BREW_CELLAR; do
      if [ -d "\$dir" ]; then
        sudo chflags uchg "\$dir/bin/node" 2>/dev/null || true
        sudo chflags uchg "\$dir/bin/npm" 2>/dev/null || true
        sudo chflags uchg "\$dir/bin/npx" 2>/dev/null || true
        echo "\$(date): Protected Homebrew Node.js installation at \$dir" >> /usr/local/bin/nodejs-protection/protection.log
      fi
    done
  fi
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
        <string>/bin/bash</string>
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
    <key>KeepAlive</key>
    <true/>
    <key>ThrottleInterval</key>
    <integer>60</integer>
</dict>
</plist>
EOF

sudo mv /tmp/com.nodejs.protection.plist /Library/LaunchDaemons/com.nodejs.protection.plist
sudo chmod 644 /Library/LaunchDaemons/com.nodejs.protection.plist

# Create a Homebrew hook to prevent Node.js modifications
echo -e "${YELLOW}Creating Homebrew hook...${NC}"
cat > /tmp/brew-hook << EOF
#!/bin/bash

# Homebrew hook to prevent Node.js modifications

# Get the original brew command
BREW_ORIGINAL="${BREW_PATH}/bin/brew-original"

# Log all brew commands for debugging
echo "\$(date): Brew command executed: \$*" >> /usr/local/bin/nodejs-protection/brew-commands.log

# Block any Node.js related operations
if [[ "\$*" == *"node"* || "\$*" == *"npm"* || "\$*" == *"npx"* ]]; then
    if [[ "\$1" == "uninstall" || "\$1" == "remove" || "\$1" == "unlink" || "\$1" == "install" || "\$1" == "upgrade" || "\$1" == "link" || "\$1" == "reinstall" || "\$1" == "pin" || "\$1" == "unpin" ]]; then
        echo "Operation blocked by Node.js protection mechanism"
        echo "\$(date): Blocked Homebrew operation: \$*" >> /usr/local/bin/nodejs-protection/protection.log
        exit 1
    fi
fi

# Also block any operations that might affect our symlinks
if [[ "\$1" == "link" || "\$1" == "unlink" ]]; then
    echo "\$(date): Checking if operation affects Node.js symlinks: \$*" >> /usr/local/bin/nodejs-protection/brew-commands.log

    # Execute the command but restore our symlinks immediately after
    "\$BREW_ORIGINAL" "\$@"
    RESULT=\$?

    # Restore our symlinks regardless of what happened
    if [ -d "/usr/local/nodejs-${TARGET_VERSION}" ]; then
        sudo ln -sf /usr/local/nodejs-${TARGET_VERSION}/bin/node /usr/local/bin/node
        sudo ln -sf /usr/local/nodejs-${TARGET_VERSION}/bin/npm /usr/local/bin/npm
        sudo ln -sf /usr/local/nodejs-${TARGET_VERSION}/bin/npx /usr/local/bin/npx
        echo "\$(date): Restored Node.js symlinks after brew \$1 operation" >> /usr/local/bin/nodejs-protection/protection.log
    fi

    exit \$RESULT
fi

# Pass through all other commands
"\$BREW_ORIGINAL" "\$@"
EOF

sudo mv /tmp/brew-hook /usr/local/bin/brew-hook
sudo chmod +x /usr/local/bin/brew-hook

# Backup the original brew command
if [ ! -f "${BREW_PATH}/bin/brew-original" ]; then
    echo -e "${YELLOW}Backing up original brew command...${NC}"
    sudo cp "${BREW_PATH}/bin/brew" "${BREW_PATH}/bin/brew-original"
    echo -e "${YELLOW}Replacing brew command with our hook...${NC}"
    sudo cp /usr/local/bin/brew-hook "${BREW_PATH}/bin/brew"
fi

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
echo -e "  2. sudo chflags nouchg \$(which node) \$(which npm) \$(which npx) /usr/local/nodejs-${TARGET_VERSION}"
echo -e "  3. Restore the original brew command: sudo cp ${BREW_PATH}/bin/brew-original ${BREW_PATH}/bin/brew"
echo -e "  4. Perform the update"
echo -e "  5. Re-enable protection by running this script again with the new version"