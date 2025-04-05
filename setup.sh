#!/bin/bash

# Setup script for DateNight.io application

echo "Starting DateNight.io setup..."

# Make scripts executable
echo -e "\n📋 Making scripts executable..."
chmod +x scripts/*.js
chmod +x setup.js

# Run the setup script
echo -e "\n📋 Running setup script..."
node setup.js

echo -e "\n✅ Setup completed!"
echo "To start the application, run:"
echo "  npm run dev"