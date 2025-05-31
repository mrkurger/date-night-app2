#!/bin/bash

# Script to run Playwright tests with different configurations
# filepath: /Users/oivindlund/date-night-app/run-tests.sh

set -e # Exit on error

# Check if the app is running
echo "Checking if application is running..."
if ! curl -s http://localhost:3002 > /dev/null; then
  echo "Starting application..."
  cd client_angular2
  npm run dev &
  APP_PID=$!
  
  echo "Waiting for application to start..."
  for i in {1..30}; do
    if curl -s http://localhost:3002 > /dev/null; then
      echo "Application started successfully!"
      break
    fi
    
    if [ $i -eq 30 ]; then
      echo "Application failed to start. Exiting."
      exit 1
    fi
    
    sleep 1
  done
else
  echo "Application is already running."
  APP_PID=""
fi

# Create screenshots directory if it doesn't exist
mkdir -p tests/e2e/screenshots

# Function to run tests with specific configuration
run_tests() {
  local test_type=$1
  local browser=$2
  local additional_args=${3:-""}
  
  echo "Running $test_type tests on $browser..."
  npx playwright test --project=$browser $additional_args $test_type.spec.ts
  
  # Check exit code
  if [ $? -eq 0 ]; then
    echo "✅ $test_type tests on $browser completed successfully"
  else
    echo "❌ $test_type tests on $browser failed"
    # Continue with other tests despite failures
  fi
}

# Main test execution
echo "Starting test execution..."

# Basic tests on all supported browsers
for browser in chromium firefox webkit; do
  run_tests "home" $browser
  run_tests "navigation" $browser
done

# Run responsive tests only on chromium (they involve viewport resizing)
run_tests "responsive" "chromium"

# Performance tests
run_tests "performance" "chromium" "--timeout=60000"

# Accessibility tests
run_tests "accessibility" "chromium"

# Generate test report
npx playwright show-report

# Stop application if we started it
if [ ! -z "$APP_PID" ]; then
  echo "Stopping application..."
  kill $APP_PID
fi

echo "All tests completed!"
