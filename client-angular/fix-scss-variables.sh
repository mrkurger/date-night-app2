#!/bin/bash

# This script fixes SCSS variables in Angular components
# It replaces direct variable references with namespaced ones

# Find all SCSS files
find src -name "*.scss" -type f | while read -r file; do
  echo "Processing $file..."
  
  # Get the namespace used in the file (if any)
  namespace=$(grep -o "@use '[^']*' as [^;]*;" "$file" | grep -o " as [^;]*;" | sed 's/ as //g' | sed 's/;//g' | head -1)
  
  # If no namespace found but using design tokens, assume 'tokens' namespace
  if [ -z "$namespace" ] && grep -q "@use '[^']*design-tokens" "$file"; then
    namespace="tokens"
  fi
  
  # If we have a namespace, replace all direct variable references
  if [ -n "$namespace" ]; then
    echo "  Using namespace: $namespace"
    
    # List of common design token variables to replace
    variables=(
      "primary-50" "primary-100" "primary-200" "primary-300" "primary-400" "primary-500" "primary-600" "primary-700" "primary-800" "primary-900"
      "secondary-50" "secondary-100" "secondary-200" "secondary-300" "secondary-400" "secondary-500" "secondary-600" "secondary-700" "secondary-800" "secondary-900"
      "neutral-50" "neutral-100" "neutral-200" "neutral-300" "neutral-400" "neutral-500" "neutral-600" "neutral-700" "neutral-800" "neutral-900"
      "success" "warning" "error" "info"
      "font-size-xs" "font-size-sm" "font-size-base" "font-size-lg" "font-size-xl" "font-size-2xl" "font-size-3xl" "font-size-4xl"
      "font-weight-light" "font-weight-regular" "font-weight-medium" "font-weight-semibold" "font-weight-bold"
      "spacing-0" "spacing-1" "spacing-2" "spacing-3" "spacing-4" "spacing-5" "spacing-6" "spacing-8" "spacing-10" "spacing-12" "spacing-16" "spacing-20" "spacing-24" "spacing-32"
      "border-radius-none" "border-radius-sm" "border-radius-md" "border-radius-lg" "border-radius-xl" "border-radius-2xl" "border-radius-full"
      "shadow-none" "shadow-xs" "shadow-sm" "shadow-md" "shadow-lg" "shadow-xl" "shadow-2xl" "shadow-inner"
      "transition-fast" "transition-normal" "transition-slow" "transition-ease" "transition-ease-in" "transition-ease-out" "transition-ease-in-out"
      "breakpoint-xs" "breakpoint-sm" "breakpoint-md" "breakpoint-lg" "breakpoint-xl" "breakpoint-2xl"
    )
    
    # Replace each variable with namespaced version
    for var in "${variables[@]}"; do
      # Only replace if it's a variable reference (preceded by $ and not already namespaced)
      sed -i '' "s/\\\$${var}/\\\$${namespace}.\\\$${var}/g" "$file"
    done
  fi
done

echo "All files processed!"