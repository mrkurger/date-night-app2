#!/bin/bash

# Fix wallet.component.ts schema issue
sed -i '' -e '/^schemas: \[CUSTOM_ELEMENTS_SCHEMA\],/d' client-angular/src/app/features/wallet/wallet.component.ts

# Fix showToast issue in wallet.component.html
sed -i '' 's/(cbOnSuccess)="showToast([^)]*)"/(click)="copyToClipboard(method.cryptoDetails.address)"/g' client-angular/src/app/features/wallet/wallet.component.html

# Create a script to fix each dialog component
cat > fix-dialog-component.sh << 'DIALOG_FIX'
#!/bin/bash

FILE=$1

# Remove FormControl from imports
sed -i '' 's/FormControl, //g' $FILE

# Add correct FormControl import if needed
if grep -q "FormControl" $FILE && ! grep -q "import { FormControl" $FILE; then
  if grep -q "import {.*} from '@angular/forms'" $FILE; then
    sed -i '' 's/import {/import { FormControl, /g' $FILE
  else
    sed -i '' "1a\\
import { FormControl } from '@angular/forms';" $FILE
  fi
fi

# Add CUSTOM_ELEMENTS_SCHEMA to imports
if grep -q "schemas: \[CUSTOM_ELEMENTS_SCHEMA\]" $FILE && ! grep -q "CUSTOM_ELEMENTS_SCHEMA" $FILE; then
  sed -i '' 's/import { Component/import { Component, CUSTOM_ELEMENTS_SCHEMA/g' $FILE
fi
DIALOG_FIX
chmod +x fix-dialog-component.sh

# Find and fix all dialog components
for file in $(find client-angular/src -name "*-dialog.component.ts") $(find client-angular/src/app/features/wallet/dialogs -name "*.component.ts"); do
  ./fix-dialog-component.sh "$file"
done

# Fix ReviewDialog issue - make sure both interface definitions match
sed -i '' -e 's/categories: {/categories?: {/g' -e 's/communication: number;/communication?: number;/g' client-angular/src/app/shared/components/review-form/review-form.component.ts
