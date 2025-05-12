#!/bin/bash

# Script to help migrate from Material UI to Nebular UI
# This script will:
# 1. Remove Material UI dependencies
# 2. Update component imports
# 3. Update component templates
# 4. Update component styles

echo "Starting Material UI to Nebular migration..."

# 1. Remove Material UI dependencies
echo "Removing Material UI dependencies..."
npm uninstall @angular/material @angular/cdk

# 2. Update imports in all TypeScript files
echo "Updating component imports..."
find src/app -type f -name "*.ts" -exec sed -i '' \
  -e 's/@angular\/material/@nebular\/theme/g' \
  -e 's/MatButton/NbButton/g' \
  -e 's/MatCard/NbCard/g' \
  -e 's/MatDialog/NbDialog/g' \
  -e 's/MatSnackBar/NbToastr/g' \
  -e 's/MatMenu/NbMenu/g' \
  -e 's/MatSidenav/NbSidebar/g' \
  -e 's/MatToolbar/NbLayout/g' \
  -e 's/MatIcon/NbIcon/g' \
  -e 's/MatBadge/NbBadge/g' \
  -e 's/MatList/NbList/g' \
  -e 's/MatTab/NbTab/g' \
  -e 's/MatInput/NbInput/g' \
  -e 's/MatSelect/NbSelect/g' \
  -e 's/MatCheckbox/NbCheckbox/g' \
  -e 's/MatRadio/NbRadio/g' \
  -e 's/MatDatepicker/NbDatepicker/g' \
  -e 's/MatAutocomplete/NbAutocomplete/g' \
  -e 's/MatProgressBar/NbProgressBar/g' \
  -e 's/MatSpinner/NbSpinner/g' \
  -e 's/MatTooltip/NbTooltip/g' \
  -e 's/MatSort/NbSort/g' \
  -e 's/MatPaginator/NbPaginator/g' \
  {} \;

# 3. Update templates in all HTML files
echo "Updating component templates..."
find src/app -type f -name "*.html" -exec sed -i '' \
  -e 's/mat-button/nbButton/g' \
  -e 's/mat-card/nb-card/g' \
  -e 's/mat-card-title/nb-card-header/g' \
  -e 's/mat-card-content/nb-card-body/g' \
  -e 's/mat-card-actions/nb-card-footer/g' \
  -e 's/mat-dialog/nb-dialog/g' \
  -e 's/mat-menu/nb-menu/g' \
  -e 's/mat-sidenav/nb-sidebar/g' \
  -e 's/mat-toolbar/nb-layout-header/g' \
  -e 's/mat-icon/nb-icon/g' \
  -e 's/matBadge/nbBadge/g' \
  -e 's/mat-list/nb-list/g' \
  -e 's/mat-list-item/nb-list-item/g' \
  -e 's/mat-tab/nb-tab/g' \
  -e 's/mat-form-field/nb-form-field/g' \
  -e 's/matInput/nbInput/g' \
  -e 's/mat-select/nb-select/g' \
  -e 's/mat-option/nb-option/g' \
  -e 's/mat-checkbox/nb-checkbox/g' \
  -e 's/mat-radio/nb-radio/g' \
  -e 's/mat-datepicker/nb-datepicker/g' \
  -e 's/mat-autocomplete/nb-autocomplete/g' \
  -e 's/mat-progress-bar/nb-progress-bar/g' \
  -e 's/mat-spinner/nb-spinner/g' \
  -e 's/matTooltip/nbTooltip/g' \
  -e 's/matSort/nbSort/g' \
  -e 's/matSortHeader/nbSortHeader/g' \
  -e 's/mat-paginator/nb-paginator/g' \
  {} \;

# 4. Update styles in all SCSS files
echo "Updating component styles..."
find src/app -type f -name "*.scss" -exec sed -i '' \
  -e 's/@use "@angular\/material"/@use "@nebular\/theme\/styles\/theming"/g' \
  -e 's/\$mat-/\$nb-/g' \
  -e 's/mat-color/nb-theme/g' \
  -e 's/mat-elevation/nb-shadow/g' \
  -e 's/mat-typography/nb-typography/g' \
  {} \;

# 5. Update angular.json
echo "Updating angular.json..."
sed -i '' \
  -e 's/"@angular\/material\/prebuilt-themes\/indigo-pink.css"/"@nebular\/theme\/styles\/prebuilt\/default.css"/g' \
  angular.json

echo "Migration complete! Please review the changes and fix any remaining issues manually."
echo "Don't forget to:"
echo "1. Update your app.module.ts to import Nebular modules"
echo "2. Update your theme configuration in styles.scss"
echo "3. Test all components thoroughly"
echo "4. Fix any TypeScript errors"
echo "5. Update any custom components that might need manual migration" 