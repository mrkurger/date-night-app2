# Angular Client Fix Scripts

This directory contains scripts to fix various issues in the Angular client.

## Available Scripts

### `fix-all-issues.cjs`

Runs all the fix scripts in sequence. This is the main script you should run to fix all issues at once.

```bash
node scripts/fix-all-issues.cjs
```

### Individual Fix Scripts

These scripts are run by `fix-all-issues.cjs` but can also be run individually:

1. **`fix-css-paths.cjs`**: Creates placeholder CSS files for eva-icons and Nebular themes.
2. **`fix-index-html.cjs`**: Updates the index.html file to include Eva Icons CSS and proper CSP.
3. **`fix-styles.cjs`**: Fixes styles.scss issues, adds CSS variables for Nebular theme.
4. **`fix-nebular-imports.cjs`**: Consolidates Nebular imports in component files.
5. **`fix-remaining-nebular-issues.cjs`**: Fixes formatting and missing imports in components.
6. **`fix-chat-message-interface.cjs`**: Updates the ChatMessage interface with missing properties.

## Common Issues Fixed

1. **Eva Icons CSS**: Added CDN link in index.html and created placeholder file.
2. **Nebular Module Imports**: Consolidated imports and fixed missing modules.
3. **Component Formatting**: Fixed imports array formatting in standalone components.
4. **CSS Variables**: Added CSS variables for Nebular theme in styles.scss.
5. **Content Security Policy**: Updated CSP to allow loading from CDNs.
6. **ChatMessage Interface**: Updated with missing properties used in components.
7. **NbTagComponent**: Fixed issues with tag components and separatorKeys.
8. **NbDialogRef**: Fixed dialog reference issues in components.

## Running the Application

After running the fix scripts, you can start the application with:

```bash
npm run dev
```

## Troubleshooting

If you encounter any issues after running the fix scripts, try the following:

1. Clear the Angular cache: `npx ng cache clean`
2. Delete node_modules and reinstall: `rm -rf node_modules && npm install`
3. Restart your development server

## Adding New Fixes

If you need to add new fixes:

1. Create a new script in the scripts directory
2. Make it executable: `chmod +x scripts/your-new-script.cjs`
3. Add it to the sequence in `fix-all-issues.cjs`