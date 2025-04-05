#!/bin/bash

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
RESET='\033[0m'

PROJECT_ROOT="/Users/oivindlund/date-night-app"
SERVER_DIR="$PROJECT_ROOT/server"
CLIENT_DIR="$PROJECT_ROOT/client-angular"

echo -e "${CYAN}===== Date Night App Project Fixer =====${RESET}"
echo -e "${CYAN}This script will fix common issues with the project.${RESET}"
echo ""

# Function to check if a command was successful
check_success() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Success: $1${RESET}"
  else
    echo -e "${RED}❌ Failed: $1${RESET}"
    echo -e "${YELLOW}Continuing with the next step...${RESET}"
  fi
  echo ""
}

# Step 1: Make scripts executable
echo -e "${MAGENTA}Step 1: Making scripts executable...${RESET}"
chmod +x $PROJECT_ROOT/scripts/*.js
chmod +x $PROJECT_ROOT/server/scripts/*.js
# Ensure update-packages.js is executable
chmod +x $PROJECT_ROOT/scripts/update-packages.js
check_success "Making scripts executable"

# Step 2: Update package.json files to use correct versions
echo -e "${MAGENTA}Step 2: Updating package.json files...${RESET}"

# Update root package.json
if [ -f "$PROJECT_ROOT/package.json" ]; then
  echo -e "${BLUE}Updating root package.json...${RESET}"
  # Use sed to replace helmet version
  sed -i '' 's/"helmet": "\^8\.1\.1"/"helmet": "\^8\.1\.0"/g' "$PROJECT_ROOT/package.json"
fi

# Update server package.json
if [ -f "$SERVER_DIR/package.json" ]; then
  echo -e "${BLUE}Updating server package.json...${RESET}"
  # Use sed to replace helmet version
  sed -i '' 's/"helmet": "\^8\.1\.1"/"helmet": "\^8\.1\.0"/g' "$SERVER_DIR/package.json"
fi
check_success "Updating package.json files"

# Step 3: Install missing dependencies
echo -e "${MAGENTA}Step 3: Installing missing dependencies...${RESET}"
cd $PROJECT_ROOT
node scripts/install-missing-deps.js
check_success "Installing missing dependencies"

# Step 4: Fix npm audit issues
echo -e "${MAGENTA}Step 4: Fixing npm audit issues...${RESET}"
cd $PROJECT_ROOT
npm audit fix --force
cd $SERVER_DIR
npm audit fix --force
cd $CLIENT_DIR
npm audit fix --force
cd $PROJECT_ROOT
check_success "Fixing npm audit issues"

# Step 5: Fix CSP issues
echo -e "${MAGENTA}Step 5: Fixing CSP issues...${RESET}"
cd $PROJECT_ROOT
node scripts/fix-csp-issues.js
check_success "Fixing CSP issues"

# Step 6: Check MongoDB setup
echo -e "${MAGENTA}Step 6: Checking MongoDB setup...${RESET}"
cd $PROJECT_ROOT
node scripts/ensure-mongodb.js
check_success "Checking MongoDB setup"

# Step 7: Updating packages
echo -e "${MAGENTA}Step 7: Updating packages...${RESET}"
cd $PROJECT_ROOT
npm run update-packages
check_success "Updating packages"

# Step 8: Verify server/scripts directory
echo -e "${MAGENTA}Step 8: Verifying server/scripts directory...${RESET}"
if [ ! -d "$SERVER_DIR/scripts" ]; then
  echo -e "${YELLOW}Creating server/scripts directory...${RESET}"
  mkdir -p "$SERVER_DIR/scripts"
fi

# Check if start-client.js exists in server/scripts
if [ ! -f "$SERVER_DIR/scripts/start-client.js" ]; then
  echo -e "${YELLOW}Creating start-client.js in server/scripts...${RESET}"
  cat > "$SERVER_DIR/scripts/start-client.js" << 'EOF'
#!/usr/bin/env node

/**
 * Script to start the Angular client from the server directory
 * This script ensures the correct project is specified when running ng serve
 */

const { execSync } = require('child_process');
const path = require('path');

// Define the client directory
const clientDir = path.join(__dirname, '..', '..', 'client-angular');

console.log('Starting Angular client from server directory...');

try {
  // Change to client directory
  process.chdir(clientDir);

  // Start the Angular client with the correct project
  execSync('ng serve client-angular --open', {
    stdio: 'inherit',
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' } // Increase memory limit
  });
} catch (error) {
  console.error('Error starting Angular client:', error.message);
  process.exit(1);
}
EOF
  chmod +x "$SERVER_DIR/scripts/start-client.js"
fi
check_success "Verifying server/scripts directory"

# Final message
echo -e "${GREEN}===== All fixes applied! =====${RESET}"
echo -e "${GREEN}You can now start the application with:${RESET}"
echo -e "${CYAN}npm run dev${RESET}"
echo ""
echo -e "${GREEN}Or run each component separately:${RESET}"
echo -e "${CYAN}npm run start:server${RESET}"
echo -e "${CYAN}npm run start:client${RESET}"
echo ""
echo -e "${YELLOW}Note: If you still encounter issues, try running:${RESET}"
echo -e "${CYAN}cd $SERVER_DIR && npm run start-client${RESET}"