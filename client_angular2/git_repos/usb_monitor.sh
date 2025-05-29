#!/bin/bash

# Save initial state
prev=$(system_profiler SPUSBDataType)

while true; do
  current=$(system_profiler SPUSBDataType)
  if [ "$prev" != "$current" ]; then
    echo "$(date): USB device change detected"
    diff <(echo "$prev") <(echo "$current") | grep "Product ID\|Vendor ID\|Serial Number"
    prev="$current"
  fi
  sleep 2
done
