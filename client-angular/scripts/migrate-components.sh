#!/usr/bin/env bash
# Script to automate component cleanups: remove CUSTOM_ELEMENTS_SCHEMA, update dialogRef methods, fix getAds subscriptions

set -eo pipefail

# Root directory for TS files
ROOT="src/app"

echo "Starting component migration..."

echo "Removing CUSTOM_ELEMENTS_SCHEMA imports and schemas..."
find "$ROOT" -type f -name "*.ts" -print0 | xargs -0 sed -i '' -E "/CUSTOM_ELEMENTS_SCHEMA/d"
find "$ROOT" -type f -name "*.ts" -print0 | xargs -0 sed -i '' -E "/schemas: *\[.*CUSTOM_ELEMENTS_SCHEMA.*\],?/d"

echo "Updating dialogRef.afterClosed() to dialogRef.onClose..."
find "$ROOT" -type f -name "*.ts" -print0 | xargs -0 sed -i '' -E "s/\.afterClosed\(\)/.onClose/g"

echo "Fixing getAds subscription to extract ads array..."
# Using perl for multiline replace
find "$ROOT" -type f -path "*/features/*" -name "*.ts" -print0 \
  | xargs -0 perl -0777 -i -pe '\
    s/getAds\(\)\.subscribe\(\{\s*next:\s*\((\w+)\)\s*=>\s*\{\s*this\.ads\s*=\s*\1;/getAds().subscribe({ next: (response) => { this.ads = response\.ads;/gs';

echo "Component migration complete." 