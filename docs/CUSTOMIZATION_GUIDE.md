# Date Night App Customization Guide

## Overview

This guide explains the standardized customization system implemented across the Date Night App codebase. The system is designed to make it easy for developers to locate, understand, and modify configuration settings without having to search through files manually.

## Key Components

### 1. Customization Documentation

- **CUSTOMIZATION_GUIDE.md** (this file): Central documentation explaining how to use the customization system
- **CONFIG_INDEX.md**: A comprehensive catalog of all customizable settings across the codebase

### 2. Standardized Header System

All files containing customizable settings include a standardized header in the following format:

```
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for [module name/purpose]
// 
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// - ANOTHER_SETTING: Description of setting (default: value)
//   Valid values: [list of valid values or range]
// ===================================================
```

### 3. Maintenance Utilities

The following utilities help maintain the customization system:

- **update_customization_headers.py**: Checks and updates headers in files
- **update_config_index.py**: Automatically updates the central index based on file headers

## How to Use This System

### Finding Settings to Customize

1. Start by consulting the **CONFIG_INDEX.md** file, which provides a categorized list of all customizable settings
2. Use the links in the index to navigate directly to the relevant files
3. Each file with customizable settings has a clearly marked header section that explains what can be modified

### Making Customizations

1. Locate the specific setting you want to modify using the CONFIG_INDEX.md
2. Navigate to the file containing the setting
3. Review the header documentation to understand the setting's purpose, default values, and valid options
4. Make your changes following the guidelines provided in the header
5. If the setting is related to other settings (indicated by "Related to:" references), consider whether those need to be updated as well

### Adding New Customizable Settings

When adding new settings that should be customizable:

1. Add the standardized header to the file if it doesn't already have one
2. Document your new setting in the header following the established format
3. Include cross-references to related settings if applicable
4. Run the maintenance utilities to update the CONFIG_INDEX.md

```bash
python3 scripts/update_customization_headers.py
python3 scripts/update_config_index.py
```

## Header Format Guidelines

### For JavaScript/TypeScript Files

```javascript
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for [module name/purpose]
// 
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// - ANOTHER_SETTING: Description of setting (default: value)
//   Valid values: [list of valid values or range]
// ===================================================
```

### For Python Files

```python
# ===================================================
# CUSTOMIZABLE SETTINGS IN THIS FILE
# ===================================================
# This file contains settings for [module name/purpose]
# 
# COMMON CUSTOMIZATIONS:
# - SETTING_NAME: Description of setting (default: value)
#   Related to: other_file.py:OTHER_SETTING
# - ANOTHER_SETTING: Description of setting (default: value)
#   Valid values: [list of valid values or range]
# ===================================================
```

### For HTML/CSS Files

```html
<!-- ===================================================
     CUSTOMIZABLE SETTINGS IN THIS FILE
     ===================================================
     This file contains settings for [module name/purpose]
     
     COMMON CUSTOMIZATIONS:
     - SETTING_NAME: Description of setting (default: value)
       Related to: other_file.css:OTHER_SETTING
     - ANOTHER_SETTING: Description of setting (default: value)
       Valid values: [list of valid values or range]
     =================================================== -->
```

## Best Practices

1. **Be Descriptive**: Provide clear, concise descriptions for each setting
2. **Include Defaults**: Always document the default value for each setting
3. **Specify Valid Values**: When applicable, list the valid values or ranges for a setting
4. **Cross-Reference**: Link related settings across different files
5. **Group Related Settings**: Keep related settings together in the same file when possible
6. **Update Documentation**: Run the maintenance utilities after adding or modifying customizable settings

## Common Customization Scenarios

### Changing API Endpoints

1. Navigate to `client-angular/src/environments/environment.ts` for development or `environment.prod.ts` for production
2. Locate the `apiUrl`, `chatWsUrl`, or `socketUrl` settings
3. Update the values as needed

### Modifying Database Connection

1. Navigate to `server/config/database.js`
2. Update the MongoDB connection settings as needed
3. Consider environment-specific settings in `server/config/environment.js`

### Adjusting Content Security Policy

1. Navigate to `server/config/csp.config.js`
2. Modify the directives in either `baseDirectives`, `developmentDirectives`, or `productionDirectives`
3. Be careful to maintain security while making changes

### Changing File Upload Limits

1. Navigate to `client-angular/src/environments/environment.ts`
2. Modify the `maxUploadSize` or `supportedImageTypes` settings
3. Ensure corresponding server-side settings are updated as well

## Troubleshooting

If you encounter issues with the customization system:

1. Verify that you've consulted the most recent version of CONFIG_INDEX.md
2. Check that the file headers are properly formatted
3. Run the maintenance utilities to ensure documentation is up-to-date
4. If settings don't seem to take effect, check for environment variable overrides

For additional help, consult the project's main documentation or contact the development team.