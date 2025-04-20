#!/bin/bash

# Navigate to the Angular project directory
cd "$(dirname "$0")"

# Install dependencies
echo "Installing Angular dependencies..."
npm install

# Check if installation was successful
if [ $? -eq 0 ]; then
  echo "Dependencies installed successfully!"
  echo "You can now run 'ng serve' to start the development server."
else
  echo "Error installing dependencies. Please check the error messages above."
fi