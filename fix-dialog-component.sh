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
