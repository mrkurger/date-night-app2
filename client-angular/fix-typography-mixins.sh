#!/bin/bash

# This script fixes wildcard issues in typography-mixins.scss

echo "Fixing typography-mixins.scss..."

FILE="src/app/core/design/typography-mixins.scss"

# Replace all instances of $*.$variable with $variable
sed -i '' 's/\$\*\.\$font-size-4xl/\$font-size-4xl/g' "$FILE"
sed -i '' 's/\$\*\.\$font-size-3xl/\$font-size-3xl/g' "$FILE"
sed -i '' 's/\$\*\.\$font-size-2xl/\$font-size-2xl/g' "$FILE"
sed -i '' 's/\$\*\.\$font-size-xl/\$font-size-xl/g' "$FILE"
sed -i '' 's/\$\*\.\$font-size-lg/\$font-size-lg/g' "$FILE"
sed -i '' 's/\$\*\.\$font-size-base/\$font-size-base/g' "$FILE"
sed -i '' 's/\$\*\.\$font-size-sm/\$font-size-sm/g' "$FILE"
sed -i '' 's/\$\*\.\$font-size-xs/\$font-size-xs/g' "$FILE"

sed -i '' 's/\$\*\.\$font-weight-light/\$font-weight-light/g' "$FILE"
sed -i '' 's/\$\*\.\$font-weight-regular/\$font-weight-regular/g' "$FILE"
sed -i '' 's/\$\*\.\$font-weight-medium/\$font-weight-medium/g' "$FILE"
sed -i '' 's/\$\*\.\$font-weight-semibold/\$font-weight-semibold/g' "$FILE"
sed -i '' 's/\$\*\.\$font-weight-bold/\$font-weight-bold/g' "$FILE"

sed -i '' 's/\$\*\.\$spacing-1/\$spacing-1/g' "$FILE"
sed -i '' 's/\$\*\.\$spacing-2/\$spacing-2/g' "$FILE"
sed -i '' 's/\$\*\.\$spacing-3/\$spacing-3/g' "$FILE"
sed -i '' 's/\$\*\.\$spacing-4/\$spacing-4/g' "$FILE"
sed -i '' 's/\$\*\.\$spacing-5/\$spacing-5/g' "$FILE"
sed -i '' 's/\$\*\.\$spacing-6/\$spacing-6/g' "$FILE"
sed -i '' 's/\$\*\.\$spacing-8/\$spacing-8/g' "$FILE"
sed -i '' 's/\$\*\.\$spacing-10/\$spacing-10/g' "$FILE"
sed -i '' 's/\$\*\.\$spacing-12/\$spacing-12/g' "$FILE"
sed -i '' 's/\$\*\.\$spacing-16/\$spacing-16/g' "$FILE"

echo "Typography mixins fixed!"