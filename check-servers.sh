#!/bin/bash

echo "Checking server status..."

# Check if the Angular frontend server is running
if pgrep -f "ng serve" > /dev/null; then
  echo "✅ Angular frontend server is running"
else
  echo "❌ Angular frontend server is NOT running"
fi

# Check if the Node.js backend server is running
if pgrep -f "node.*server.js" > /dev/null; then
  echo "✅ Node.js backend server is running"
else
  echo "❌ Node.js backend server is NOT running"
fi

# Check if specific ports are in use
if nc -z localhost 4200 2>/dev/null; then
  echo "✅ Port 4200 is in use (Angular frontend)"
else
  echo "❌ Port 4200 is NOT in use (Angular frontend not available)"
fi

if nc -z localhost 3001 2>/dev/null; then
  echo "✅ Port 3001 is in use (Node.js backend)"
else
  echo "❌ Port 3001 is NOT in use (Node.js backend not available)"
fi

echo "Done checking server status"
