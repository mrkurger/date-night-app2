#!/usr/bin/env python3
# ===================================================
# CUSTOMIZABLE SETTINGS IN THIS FILE
# ===================================================
# This file contains settings for the documentation link checker
# 
# COMMON CUSTOMIZATIONS:
# - DIRECTORIES_TO_SCAN: Directories to scan for documentation files (default: ['.', 'docs', 'client-angular', 'server'])
# - DIRECTORIES_TO_EXCLUDE: Directories to exclude from scanning (default: ['node_modules', 'dist', '.git'])
# - FILE_EXTENSIONS: File extensions to scan for links (default: ['.md'])
# - LINK_PATTERNS: Regex patterns to identify links in documentation files
# ===================================================

import os
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

# Configuration
DIRECTORIES_TO_SCAN = ['.', 'docs', 'client-angular', 'server']
DIRECTORIES_TO_EXCLUDE = ['node_modules', 'dist', '.git', '__pycache__']
FILE_EXTENSIONS = ['.md']

# Regex patterns to identify links in documentation files
LINK_PATTERNS = [
    r'\[([^\]]+)\]\(([^)]+)\)',  # Markdown links: [text](url)
    r'<a\s+href=[\'"]([^\'"]+)[\'"]',  # HTML links: <a href="url">
]

class DocumentationLink:
    """
    Represents a link in a documentation file.
    """
    def __init__(self, text, url, file_path, line_number):
        self.text = text
        self.url = url
        self.file_path = file_path
        self.line_number = line_number
        self.is_valid = None
        self.error_message = None

def extract_links_from_file(file_path):
    """
    Extract links from a documentation file.
    """
    links = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')
            
            for pattern in LINK_PATTERNS:
                for i, line in enumerate(lines):
                    matches = re.finditer(pattern, line)
                    for match in matches:
                        if len(match.groups()) >= 2:
                            text = match.group(1)
                            url = match.group(2)
                            links.append(DocumentationLink(text, url, file_path, i + 1))
                        elif len(match.groups()) == 1:
                            url = match.group(1)
                            links.append(DocumentationLink('', url, file_path, i + 1))
    except Exception as e:
        print(f"Error reading file {file_path}: {e}")
    
    return links

def is_external_link(url):
    """
    Check if a URL is an external link.
    """
    parsed_url = urlparse(url)
    return parsed_url.scheme in ['http', 'https']

def is_anchor_link(url):
    """
    Check if a URL is an anchor link.
    """
    return url.startswith('#')

def is_valid_internal_link(url, file_path, project_root):
    """
    Check if an internal link is valid.
    """
    # Handle anchor links
    if is_anchor_link(url):
        # Anchor links are considered valid for now
        return True, None
    
    # Handle relative links
    if not url.startswith('/'):
        # Relative to the current file
        current_dir = os.path.dirname(file_path)
        target_path = os.path.normpath(os.path.join(current_dir, url))
    else:
        # Absolute path within the project
        target_path = os.path.normpath(os.path.join(project_root, url.lstrip('/')))
    
    # Check if the target file exists
    if not os.path.exists(target_path):
        return False, f"Target file does not exist: {target_path}"
    
    return True, None

def validate_links(links, project_root):
    """
    Validate links in documentation files.
    """
    valid_links = []
    broken_links = []
    
    for link in links:
        if is_external_link(link.url):
            # External links are considered valid for now
            link.is_valid = True
            valid_links.append(link)
        else:
            # Internal links
            is_valid, error_message = is_valid_internal_link(link.url, link.file_path, project_root)
            link.is_valid = is_valid
            link.error_message = error_message
            
            if is_valid:
                valid_links.append(link)
            else:
                broken_links.append(link)
    
    return valid_links, broken_links

def scan_directory(base_dir, project_root):
    """
    Scan a directory for documentation files and extract links.
    """
    all_links = []
    
    for root, dirs, files in os.walk(base_dir):
        # Skip excluded directories
        dirs[:] = [d for d in dirs if d not in DIRECTORIES_TO_EXCLUDE]
        
        for file in files:
            file_path = os.path.join(root, file)
            ext = os.path.splitext(file)[1]
            
            if ext in FILE_EXTENSIONS:
                # Extract links from the file
                links = extract_links_from_file(file_path)
                all_links.extend(links)
    
    return all_links

def generate_report(valid_links, broken_links):
    """
    Generate a report of valid and broken links.
    """
    report = "# Documentation Link Check Report\n\n"
    
    report += f"## Summary\n\n"
    report += f"- Total links: {len(valid_links) + len(broken_links)}\n"
    report += f"- Valid links: {len(valid_links)}\n"
    report += f"- Broken links: {len(broken_links)}\n\n"
    
    if broken_links:
        report += f"## Broken Links\n\n"
        report += f"| File | Line | Link Text | URL | Error |\n"
        report += f"|------|------|-----------|-----|-------|\n"
        
        for link in broken_links:
            relative_path = os.path.relpath(link.file_path, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            report += f"| {relative_path} | {link.line_number} | {link.text} | {link.url} | {link.error_message} |\n"
    else:
        report += f"## No Broken Links Found\n\n"
        report += f"All links in the documentation are valid.\n"
    
    return report

def main():
    """
    Main function to check documentation links.
    """
    print("Checking documentation links...")
    
    # Get project root directory
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Collect all links
    all_links = []
    for directory in DIRECTORIES_TO_SCAN:
        dir_path = os.path.join(project_root, directory)
        if os.path.exists(dir_path):
            print(f"Scanning {dir_path}...")
            links = scan_directory(dir_path, project_root)
            all_links.extend(links)
        else:
            print(f"Directory not found: {dir_path}")
    
    print(f"Found {len(all_links)} links in documentation files.")
    
    # Validate links
    valid_links, broken_links = validate_links(all_links, project_root)
    
    print(f"Valid links: {len(valid_links)}")
    print(f"Broken links: {len(broken_links)}")
    
    # Generate report
    report = generate_report(valid_links, broken_links)
    
    # Write report to file
    report_path = os.path.join(project_root, 'docs', 'documentation-link-check-report.md')
    try:
        # Remove the old report if it exists
        if os.path.exists(report_path):
            os.remove(report_path)
        
        # Write the new report
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"Report generated: {report_path}")
    except Exception as e:
        print(f"Error writing report: {e}")
        return 1
    
    # Return non-zero exit code if there are broken links
    return 1 if broken_links else 0

if __name__ == "__main__":
    sys.exit(main())