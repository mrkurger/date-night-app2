#!/usr/bin/env python3
# ===================================================
# CUSTOMIZABLE SETTINGS IN THIS FILE
# ===================================================
# This file contains settings for the config index update script
# 
# COMMON CUSTOMIZATIONS:
# - FILE_EXTENSIONS: File extensions to scan for customization headers (default: ['.js', '.ts', '.py', '.html', '.css', '.scss'])
# - DIRECTORIES_TO_SCAN: Directories to scan for customizable files (default: ['server', 'client-angular/src'])
# - DIRECTORIES_TO_EXCLUDE: Directories to exclude from scanning (default: ['node_modules', 'dist', '.git'])
# - HEADER_PATTERNS: Regex patterns to identify customization headers by file type
#   Related to: update_customization_headers.py:HEADER_TEMPLATES
# - CONFIG_INDEX_PATH: Path to the configuration index file (default: 'docs/CONFIG_INDEX.md')
# ===================================================

import os
import re
import sys
from pathlib import Path
from datetime import datetime
from collections import defaultdict

# Configuration
FILE_EXTENSIONS = ['.js', '.ts', '.py', '.html', '.css', '.scss']
DIRECTORIES_TO_SCAN = ['server', 'client-angular/src']
DIRECTORIES_TO_EXCLUDE = ['node_modules', 'dist', '.git', '__pycache__']
CONFIG_INDEX_PATH = 'docs/CONFIG_INDEX.md'

# Patterns to identify customization headers
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

# Patterns to extract settings from headers
SETTING_PATTERNS = {
    '.js': r'//\s*-\s*([A-Z_][A-Z0-9_]*)\s*:\s*(.*?)(?:\n//\s*|$)',
    '.ts': r'//\s*-\s*([A-Z_][A-Z0-9_]*)\s*:\s*(.*?)(?:\n//\s*|$)',
    '.py': r'#\s*-\s*([A-Z_][A-Z0-9_]*)\s*:\s*(.*?)(?:\n#\s*|$)',
    '.html': r'<!--\s*-\s*([A-Z_][A-Z0-9_]*)\s*:\s*(.*?)(?:\n\s*-\s*|-->)',
    '.css': r'/\*\s*-\s*([A-Z_][A-Z0-9_]*)\s*:\s*(.*?)(?:\n\s*-\s*|\*/)',
    '.scss': r'/\*\s*-\s*([A-Z_][A-Z0-9_]*)\s*:\s*(.*?)(?:\n\s*-\s*|\*/)'
}

# Default setting pattern for unknown file types
DEFAULT_SETTING_PATTERN = SETTING_PATTERNS['.js']

# Category mapping based on file paths
CATEGORY_MAPPING = {
    'server/config': 'Server Configuration',
    'server/middleware': 'Server Middleware',
    'server/services': 'Server Services',
    'client-angular/src/environments': 'Client Configuration',
    'client-angular/src/app/shared': 'UI Components',
    'client-angular/src/app/services': 'Client Services',
    'client-angular/src/app/features': 'Feature Modules'
}

# Default category for files that don't match any mapping
DEFAULT_CATEGORY = 'Other Configuration'

class ConfigSetting:
    """
    Represents a configuration setting extracted from a file.
    """
    def __init__(self, name, description, file_path, category=None):
        self.name = name
        self.description = description
        self.file_path = file_path
        self.category = category
        
        # Extract default value and valid values if present
        self.default_value = self._extract_default_value(description)
        self.valid_values = self._extract_valid_values(description)
        self.related_to = self._extract_related_to(description)
        
        # Extract environment if present
        self.environment = self._extract_environment(description)
    
    def _extract_default_value(self, description):
        """Extract default value from description."""
        match = re.search(r'\(default:\s*(.*?)\)', description)
        return match.group(1) if match else None
    
    def _extract_valid_values(self, description):
        """Extract valid values from description."""
        match = re.search(r'Valid values:\s*\[(.*?)\]', description)
        return match.group(1) if match else None
    
    def _extract_related_to(self, description):
        """Extract related settings from description."""
        match = re.search(r'Related to:\s*(.*?)(?:\n|$)', description)
        return match.group(1) if match else None
    
    def _extract_environment(self, description):
        """Extract environment from description."""
        if 'development' in description.lower():
            return 'Development'
        elif 'production' in description.lower():
            return 'Production'
        elif 'test' in description.lower():
            return 'Test'
        return None

def extract_customization_header(file_path):
    """
    Extract the customization header from a file.
    """
    ext = os.path.splitext(file_path)[1]
    pattern = HEADER_PATTERNS.get(ext, DEFAULT_PATTERN)
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            match = re.search(pattern, content)
            return match.group(0) if match else None
    except Exception as e:
        print(f"Error reading file {file_path}: {e}")
        return None

def extract_settings_from_header(header, file_path, ext):
    """
    Extract settings from a customization header.
    """
    if not header:
        return []
    
    setting_pattern = SETTING_PATTERNS.get(ext, DEFAULT_SETTING_PATTERN)
    settings = []
    
    # Determine category based on file path
    category = DEFAULT_CATEGORY
    for path_prefix, cat in CATEGORY_MAPPING.items():
        if path_prefix in file_path:
            category = cat
            break
    
    # Extract settings
    matches = re.finditer(setting_pattern, header)
    for match in matches:
        if len(match.groups()) >= 2:
            name = match.group(1)
            description = match.group(2).strip()
            settings.append(ConfigSetting(name, description, file_path, category))
    
    return settings

def scan_directory(base_dir):
    """
    Scan a directory for files with customization headers.
    """
    all_settings = []
    
    for root, dirs, files in os.walk(base_dir):
        # Skip excluded directories
        dirs[:] = [d for d in dirs if d not in DIRECTORIES_TO_EXCLUDE]
        
        for file in files:
            file_path = os.path.join(root, file)
            ext = os.path.splitext(file)[1]
            
            if ext in FILE_EXTENSIONS:
                # Extract customization header
                header = extract_customization_header(file_path)
                if header:
                    # Extract settings from header
                    settings = extract_settings_from_header(header, file_path, ext)
                    all_settings.extend(settings)
    
    return all_settings

def generate_config_index(settings):
    """
    Generate the CONFIG_INDEX.md file.
    """
    # Group settings by category
    settings_by_category = defaultdict(list)
    for setting in settings:
        settings_by_category[setting.category].append(setting)
    
    # Generate table of contents
    toc = "## Table of Contents\n\n"
    for category in sorted(settings_by_category.keys()):
        category_anchor = category.lower().replace(' ', '-')
        toc += f"- [{category}](#{category_anchor})\n"
        
        # Group settings by file within each category
        files_in_category = set(setting.file_path for setting in settings_by_category[category])
        for file_path in sorted(files_in_category):
            file_name = os.path.basename(file_path)
            file_anchor = file_name.lower().replace('.', '-')
            toc += f"  - [{file_name}](#{file_anchor})\n"
    
    toc += "\n"
    
    # Generate content for each category
    content = ""
    for category in sorted(settings_by_category.keys()):
        content += f"## {category}\n\n"
        
        # Group settings by file within each category
        settings_by_file = defaultdict(list)
        for setting in settings_by_category[category]:
            settings_by_file[setting.file_path].append(setting)
        
        # Generate content for each file
        for file_path in sorted(settings_by_file.keys()):
            file_name = os.path.basename(file_path)
            relative_path = os.path.relpath(file_path, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            absolute_path = os.path.abspath(file_path)
            
            content += f"### {file_name}\n\n"
            content += f"**File**: [{relative_path}]({absolute_path})\n\n"
            
            # Create table of settings
            content += "| Setting | Description | Default Value | Environment |\n"
            content += "|---------|-------------|---------------|------------|\n"
            
            for setting in settings_by_file[file_path]:
                description = setting.description.split('(default:')[0].strip()
                default_value = setting.default_value or 'N/A'
                environment = setting.environment or 'All'
                
                content += f"| {setting.name} | {description} | {default_value} | {environment} |\n"
            
            content += "\n"
    
    # Generate the full index
    index = f"# Configuration Settings Index\n\n"
    index += "This document serves as a central reference for all customizable settings in the Date Night App. "
    index += "Settings are organized by category and include links to their specific locations in the codebase.\n\n"
    index += toc
    index += content
    index += "---\n\n"
    index += f"*This index was automatically generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}. "
    index += "Do not edit manually.*"
    
    return index

def main():
    """
    Main function to update the configuration index.
    """
    print("Updating configuration index...")
    
    # Get project root directory
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Collect all settings
    all_settings = []
    for directory in DIRECTORIES_TO_SCAN:
        dir_path = os.path.join(project_root, directory)
        if os.path.exists(dir_path):
            print(f"Scanning {dir_path}...")
            settings = scan_directory(dir_path)
            all_settings.extend(settings)
        else:
            print(f"Directory not found: {dir_path}")
    
    print(f"Found {len(all_settings)} settings in {len(set(s.file_path for s in all_settings))} files.")
    
    # Generate the index
    index_content = generate_config_index(all_settings)
    
    # Write the index file
    index_path = os.path.join(project_root, CONFIG_INDEX_PATH)
    os.makedirs(os.path.dirname(index_path), exist_ok=True)
    
    try:
        with open(index_path, 'w', encoding='utf-8') as f:
            f.write(index_content)
        print(f"Configuration index updated: {index_path}")
    except Exception as e:
        print(f"Error writing index file: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())