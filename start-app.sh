#!/bin/bash

# Function to check if a port is in use
port_in_use() {
  lsof -i :"$1" >/dev/null 2>&1
}

# Function to stop existing processes
kill_existing() {
  echo "Stopping any existing servers..."
  pkill -f "ng serve" || true
  pkill -f "node.*server.js" || true
  sleep 2
}

# Kill existing processes first
kill_existing

# Start backend server
echo "Starting backend server..."
cd server
npm run dev &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# Wait for backend to initialize
echo "Waiting for backend to initialize..."
sleep 5

# Start frontend server
echo "Starting frontend server..."
cd ../client-angular
# Run Angular from inside the client-angular directory
npx --node-options=--max-old-space-size=4096 ng serve client-angular --port 4200 &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

# Wait for frontend to be ready
echo "Waiting for frontend to initialize..."
MAX_ATTEMPTS=60
ATTEMPTS=0
while ! port_in_use 4200 && [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
  echo "Waiting for Angular to start... ($((ATTEMPTS+1))/$MAX_ATTEMPTS)"
  sleep 2
  ATTEMPTS=$((ATTEMPTS+1))
done

if port_in_use 4200; then
  echo "Application is running!"
  echo "- Backend: http://localhost:3001"
  echo "- Frontend: http://localhost:4200"
  
  # Open the browser
  if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:4200
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:4200
  elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    start http://localhost:4200
  fi
else
  echo "ERROR: Frontend failed to start within timeout period"
  echo "Check the logs or run 'cd client-angular && ng serve client-angular' to see errors"
  kill $BACKEND_PID
  exit 1
fi

# Handle exit to kill both processes
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM EXIT

# Keep script running
wait 