#!/bin/sh
# Check if this is a CI environment
if [ -n "$CI" ]; then
  # Disable husky hooks in CI
  echo "export HUSKY=0" >> $GITHUB_ENV
  echo "Husky hooks disabled in CI environment"
  exit 0
fi
