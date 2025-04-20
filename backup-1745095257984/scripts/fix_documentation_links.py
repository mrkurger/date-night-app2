#!/usr/bin/env python3
# ===================================================
# CUSTOMIZABLE SETTINGS IN THIS FILE
# ===================================================
# This file contains settings for the documentation link fixer
# 
# COMMON CUSTOMIZATIONS:
# - DIRECTORIES_TO_SCAN: Directories to scan for documentation files (default: ['.', 'docs', 'client-angular', 'server'])
# - DIRECTORIES_TO_EXCLUDE: Directories to exclude from scanning (default: ['node_modules', 'dist', '.git'])
# - FILE_EXTENSIONS: File extensions to scan for links (default: ['.md'])
# - LINK_PATTERNS: Regex patterns to identify links in documentation files
# - LINK_REPLACEMENTS: Patterns to replace in links
# ===================================================

import os
import re
import sys
from pathlib import Path

# Configuration
DIRECTORIES_TO_SCAN = ['.', 'docs', 'client-angular', 'server']
DIRECTORIES_TO_EXCLUDE = ['node_modules', 'dist', '.git', '__pycache__']
FILE_EXTENSIONS = ['.md']

# Regex patterns to identify links in documentation files
LINK_PATTERNS = [
    r'\[([^\]]+)\]\(([^)]+)\)',  # Markdown links: [text](url)
]

# Common link replacement patterns
LINK_REPLACEMENTS = [
    # Fix absolute paths in CONFIG_INDEX.md
    (r'/Users/oivindlund/date-night-app/', '/'),
    
    # Fix relative paths that should be absolute
    (r'\]\(docs/', '](/docs/'),
    (r'\]\(server/', '](/server/'),
    (r'\]\(client-angular/', '](/client-angular/'),
    
    # Fix example links in documentation style guide
    (r'\]\(file\.md\)', '](example.md)'),
    (r'\]\(/docs/file\.md\)', '](/docs/example.md)'),
    
    # Fix image links
    (r'\]\(images/', '](/docs/images/'),
]

def fix_links_in_file(file_path, project_root):
    """
    Fix broken links in a documentation file.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Apply link replacements
        for pattern, replacement in LINK_REPLACEMENTS:
            content = re.sub(pattern, replacement, content)
        
        # Write the updated content back to the file if changes were made
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed links in {file_path}")
            return True
        
        return False
    except Exception as e:
        print(f"Error fixing links in {file_path}: {e}")
        return False

def scan_directory(base_dir, project_root):
    """
    Scan a directory for documentation files and fix links.
    """
    fixed_files = 0
    
    for root, dirs, files in os.walk(base_dir):
        # Skip excluded directories
        dirs[:] = [d for d in dirs if d not in DIRECTORIES_TO_EXCLUDE]
        
        for file in files:
            file_path = os.path.join(root, file)
            ext = os.path.splitext(file)[1]
            
            if ext in FILE_EXTENSIONS:
                # Fix links in the file
                if fix_links_in_file(file_path, project_root):
                    fixed_files += 1
    
    return fixed_files

def main():
    """
    Main function to fix documentation links.
    """
    print("Fixing documentation links...")
    
    # Get project root directory
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Fix links in all directories
    total_fixed_files = 0
    for directory in DIRECTORIES_TO_SCAN:
        dir_path = os.path.join(project_root, directory)
        if os.path.exists(dir_path):
            print(f"Scanning {dir_path}...")
            fixed_files = scan_directory(dir_path, project_root)
            total_fixed_files += fixed_files
        else:
            print(f"Directory not found: {dir_path}")
    
    print(f"Fixed links in {total_fixed_files} files.")
    
    # Run the link checker to see if there are still broken links
    print("\nRunning link checker to verify fixes...")
    os.system(f"python3 {os.path.join(project_root, 'scripts', 'check_documentation_links.py')}")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())