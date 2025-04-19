# Workflow Logs Collection Improvements

## Overview

This document describes the improvements made to the workflow logs collection system in the Date Night App project. The changes ensure that workflow logs are properly extracted from zip files and saved as readable text.

## Changes Made

1. **Created Dedicated Script**

   - Moved the log collection logic from an inline script in the workflow file to a dedicated script at `scripts/fetch-workflow-logs.js`
   - Made the script executable with proper shebang for Node.js

2. **Added Zip File Handling**

   - Integrated the `adm-zip` library to properly handle zip-formatted log files
   - Added detection logic to identify when logs are returned as zip files
   - Implemented extraction of text content from zip archives
   - Preserved original file names from the zip archive
   - Added fallback to save the main log file as `logs.txt` for consistency

3. **Updated GitHub Workflow**
   - Modified `.github/workflows/sync-workflow-errors.yml` to use the new script
   - Added `adm-zip` to the dependencies installed in the workflow
   - Updated the README to reflect the improved log handling

## Implementation Details

### Zip File Detection

The script now detects zip files using multiple methods:

- Checking if the response is a Buffer
- Checking if the response starts with the zip file signature ('PK')
- Checking the content-type header for 'application/zip'

```javascript
const isZip =
  Buffer.isBuffer(logs.data) ||
  (typeof logs.data === 'string' &&
    logs.data.startsWith('PK') &&
    logs.headers &&
    logs.headers['content-type'] === 'application/zip');
```

### Zip File Processing

When a zip file is detected:

1. The file is temporarily saved to disk
2. The zip archive is opened with `adm-zip`
3. Each entry in the archive is extracted and saved with its original name
4. Log files are also saved as `logs.txt` for consistency
5. The temporary zip file is removed

### Error Handling

The script includes comprehensive error handling:

- Errors during zip extraction are caught and logged
- Error details are saved to `extract-error.txt` for troubleshooting
- The original zip file is preserved in case of extraction errors

## Benefits

These improvements provide several benefits:

1. **Better Log Readability**: Logs are now properly extracted as text instead of being saved as raw zip data
2. **Preserved File Structure**: Original file names and structure from the zip archive are maintained
3. **Consistent Access**: All logs can be accessed as `logs.txt` regardless of whether they came from a zip file
4. **Improved Troubleshooting**: More detailed error information is available when issues occur

## Testing

The script has been tested with various log formats, including:

- Plain text logs
- Zip archives containing single log files
- Zip archives containing multiple files

## Future Improvements

Potential future improvements to consider:

1. Add support for other compressed formats (gzip, etc.)
2. Implement log rotation to manage disk space
3. Add log analysis tools to identify common error patterns
4. Create a web interface for browsing and searching logs
