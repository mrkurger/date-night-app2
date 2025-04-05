#!/bin/bash

# Navigate to the server directory
cd server

# Install server dependencies
npm install cookie-parser csurf express-rate-limit

# Navigate to the client directory
cd ../client-angular

# Install client dependencies
npm install

echo "All dependencies installed successfully!"