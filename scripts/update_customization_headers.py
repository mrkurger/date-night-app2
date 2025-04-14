#!/usr/bin/env python3
# ===================================================
# CUSTOMIZABLE SETTINGS IN THIS FILE
# ===================================================
# This file contains settings for the customization header update script
# 
# COMMON CUSTOMIZATIONS:
# - FILE_EXTENSIONS: File extensions to scan for customization headers (default: ['.js', '.ts', '.py', '.html', '.css', '.scss'])
# - DIRECTORIES_TO_SCAN: Directories to scan for customizable files (default: ['server', 'client-angular/src'])
# - DIRECTORIES_TO_EXCLUDE: Directories to exclude from scanning (default: ['node_modules', 'dist', '.git'])
# - HEADER_TEMPLATES: Templates for customization headers by file type
#   Related to: update_config_index.py:HEADER_PATTERNS
# ===================================================

import os
import re
import sys
from pathlib import Path

# Configuration
FILE_EXTENSIONS = ['.js', '.ts', '.py', '.html', '.css', '.scss']
DIRECTORIES_TO_SCAN = ['server', 'client-angular/src']
DIRECTORIES_TO_EXCLUDE = ['node_modules', 'dist', '.git', '__pycache__']

# Header templates for different file types
HEADER_TEMPLATES = {
    '.js': """// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for {module_purpose}
// 
// COMMON CUSTOMIZATIONS:
// - {setting_example}: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
""",
    '.ts': """// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for {module_purpose}
// 
// COMMON CUSTOMIZATIONS:
// - {setting_example}: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
""",
    '.py': """# ===================================================
# CUSTOMIZABLE SETTINGS IN THIS FILE
# ===================================================
# This file contains settings for {module_purpose}
# 
# COMMON CUSTOMIZATIONS:
# - {setting_example}: Description of setting (default: value)
#   Related to: other_file.py:OTHER_SETTING
# ===================================================
""",
    '.html': """<!-- ===================================================
     CUSTOMIZABLE SETTINGS IN THIS FILE
     ===================================================
     This file contains settings for {module_purpose}
     
     COMMON CUSTOMIZATIONS:
     - {setting_example}: Description of setting (default: value)
       Related to: other_file.html:OTHER_SETTING
     =================================================== -->
""",
    '.css': """/* ===================================================
   CUSTOMIZABLE SETTINGS IN THIS FILE
   ===================================================
   This file contains settings for {module_purpose}
   
   COMMON CUSTOMIZATIONS:
   - {setting_example}: Description of setting (default: value)
     Related to: other_file.css:OTHER_SETTING
   =================================================== */
""",
    '.scss': """/* ===================================================
   CUSTOMIZABLE SETTINGS IN THIS FILE
   ===================================================
   This file contains settings for {module_purpose}
   
   COMMON CUSTOMIZATIONS:
   - {setting_example}: Description of setting (default: value)
     Related to: other_file.scss:OTHER_SETTING
   =================================================== */
"""
}

# Default template for unknown file types
DEFAULT_TEMPLATE = HEADER_TEMPLATES['.js']

# Patterns to identify existing customization headers
HEADER_PATTERNS = {
    '.js': r'//\s*={3,}\s*\n//\s*CUSTOMIZABLE SETTINGS IN THIS FILE\s*\n//\s*={3,}[\s\S]*?//\s*={3,}',
    '.ts': r'//\s*={3,}\s*\n//\s*CUSTOMIZABLE SETTINGS IN THIS FILE\s*\n//\s*={3,}[\s\S]*?//\s*={3,}',
    '.py': r'#\s*={3,}\s*\n#\s*CUSTOMIZABLE SETTINGS IN THIS FILE\s*\n#\s*={3,}[\s\S]*?#\s*={3,}',
    '.html': r'<!--\s*={3,}\s*\n\s*CUSTOMIZABLE SETTINGS IN THIS FILE\s*\n\s*={3,}[\s\S]*?={3,}\s*-->',
    '.css': r'/\*\s*={3,}\s*\n\s*CUSTOMIZABLE SETTINGS IN THIS FILE\s*\n\s*={3,}[\s\S]*?={3,}\s*\*/',
    '.scss': r'/\*\s*={3,}\s*\n\s*CUSTOMIZABLE SETTINGS IN THIS FILE\s*\n\s*={3,}[\s\S]*?={3,}\s*\*/'
}

# Default pattern for unknown file types
DEFAULT_PATTERN = HEADER_PATTERNS['.js']

def is_config_file(file_path):
    """
    Determine if a file is likely to contain configuration settings.
    """
    config_indicators = [
        'config', 'environment', 'settings', 'constants', 'options',
        'defaults', 'parameters', 'preferences', 'setup'
    ]
    
    file_name = os.path.basename(file_path).lower()
    file_name_without_ext = os.path.splitext(file_name)[0]
    
    # Check if any config indicator is in the file name
    for indicator in config_indicators:
        if indicator in file_name_without_ext:
            return True
    
    # Check file content for configuration patterns
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Look for common configuration patterns
            patterns = [
                r'const\s+\w+\s*=\s*{',  # JavaScript/TypeScript object definition
                r'export\s+const\s+\w+\s*=\s*{',  # Exported constant object
                r'module\.exports\s*=',  # Node.js exports
                r'process\.env\.',  # Environment variables
                r'config\s*[=:]\s*{',  # Config object
                r'settings\s*[=:]\s*{',  # Settings object
                r'options\s*[=:]\s*{',  # Options object
                r'@Input\(\)',  # Angular input properties
                r'@Component\(',  # Angular component
                r'@NgModule\('  # Angular module
            ]
            
            for pattern in patterns:
                if re.search(pattern, content):
                    return True
    except Exception as e:
        print(f"Error reading file {file_path}: {e}")
    
    return False

def has_customization_header(file_path):
    """
    Check if a file already has a customization header.
    """
    ext = os.path.splitext(file_path)[1]
    pattern = HEADER_PATTERNS.get(ext, DEFAULT_PATTERN)
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            return bool(re.search(pattern, content))
    except Exception as e:
        print(f"Error reading file {file_path}: {e}")
        return False

def add_customization_header(file_path):
    """
    Add a customization header to a file.
    """
    ext = os.path.splitext(file_path)[1]
    template = HEADER_TEMPLATES.get(ext, DEFAULT_TEMPLATE)
    
    # Extract module purpose from file path
    file_name = os.path.basename(file_path)
    module_name = os.path.splitext(file_name)[0]
    
    # Determine module purpose based on file path and name
    if 'config' in file_path:
        module_purpose = f"configuration settings ({module_name})"
    elif 'environment' in file_path:
        module_purpose = f"environment-specific settings ({module_name})"
    elif 'component' in file_path:
        module_purpose = f"component configuration ({module_name})"
    elif 'service' in file_path:
        module_purpose = f"service configuration ({module_name})"
    else:
        module_purpose = f"{module_name} settings"
    
    # Determine setting example based on file content
    setting_example = "SETTING_NAME"
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Look for potential setting names
            if ext in ['.js', '.ts']:
                matches = re.findall(r'(?:const|let|var)\s+([A-Z_]+)\s*=', content)
                if matches:
                    setting_example = matches[0]
            elif ext == '.py':
                matches = re.findall(r'([A-Z_]+)\s*=', content)
                if matches:
                    setting_example = matches[0]
    except Exception as e:
        print(f"Error analyzing file {file_path}: {e}")
    
    # Format the header
    header = template.format(
        module_purpose=module_purpose,
        setting_example=setting_example
    )
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Add header after any initial comments or imports
        lines = content.split('\n')
        insert_index = 0
        
        # Skip shebang line if present
        if lines and lines[0].startswith('#!'):
            insert_index = 1
        
        # Skip initial comments
        while insert_index < len(lines) and (
            lines[insert_index].strip().startswith('//') or
            lines[insert_index].strip().startswith('/*') or
            lines[insert_index].strip().startswith('*') or
            lines[insert_index].strip().startswith('#') or
            lines[insert_index].strip() == ''
        ):
            insert_index += 1
        
        # Insert header
        new_content = '\n'.join(lines[:insert_index]) + '\n' + header + '\n'.join(lines[insert_index:])
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"Added customization header to {file_path}")
        return True
    except Exception as e:
        print(f"Error updating file {file_path}: {e}")
        return False

def scan_directory(base_dir):
    """
    Scan a directory for files that might need customization headers.
    """
    files_updated = 0
    files_scanned = 0
    
    for root, dirs, files in os.walk(base_dir):
        # Skip excluded directories
        dirs[:] = [d for d in dirs if d not in DIRECTORIES_TO_EXCLUDE]
        
        for file in files:
            file_path = os.path.join(root, file)
            ext = os.path.splitext(file)[1]
            
            if ext in FILE_EXTENSIONS:
                files_scanned += 1
                
                # Check if file is a configuration file
                if is_config_file(file_path):
                    # Check if file already has a customization header
                    if not has_customization_header(file_path):
                        # Add customization header
                        if add_customization_header(file_path):
                            files_updated += 1
    
    return files_scanned, files_updated

def main():
    """
    Main function to update customization headers across the codebase.
    """
    print("Updating customization headers...")
    
    # Get project root directory
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    total_scanned = 0
    total_updated = 0
    
    # Scan directories
    for directory in DIRECTORIES_TO_SCAN:
        dir_path = os.path.join(project_root, directory)
        if os.path.exists(dir_path):
            print(f"Scanning {dir_path}...")
            scanned, updated = scan_directory(dir_path)
            total_scanned += scanned
            total_updated += updated
        else:
            print(f"Directory not found: {dir_path}")
    
    print(f"Scan complete. Scanned {total_scanned} files, updated {total_updated} files.")
    
    if total_updated > 0:
        print("Please review the added headers and customize them as needed.")
        print("Then run update_config_index.py to update the configuration index.")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())