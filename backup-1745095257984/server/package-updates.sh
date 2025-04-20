#!/bin/bash

# Navigate to server directory
cd /Users/oivindlund/date-night-app/server

# Remove deprecated csurf package
npm uninstall csurf

# Install csrf-csrf for improved CSRF protection
npm install csrf-csrf

# Install file-type for magic number validation
npm install file-type

# Install express-validator for input validation
npm install express-validator

# Install argon2 for better password hashing
npm install argon2

# Install http2-express-bridge for HTTP/2 support
npm install http2-express-bridge spdy

# Install winston for better logging
npm install winston winston-daily-rotate-file

# Update other packages
npm update

echo "Security-related packages have been updated!"