#!/usr/bin/env python3
# ===================================================
# CUSTOMIZABLE SETTINGS IN THIS FILE
# ===================================================
# This file contains tests for the documentation link fixer
# 
# COMMON CUSTOMIZATIONS:
# - TEST_CONTENT: Test content for documentation files (default: defined in this file)
# - TEST_REPLACEMENTS: Test replacements for links (default: defined in this file)
# ===================================================

import os
import sys
import unittest
from unittest.mock import patch, mock_open, MagicMock
import tempfile
import shutil

# Add the parent directory to the path so we can import the script
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import fix_documentation_links

class TestFixDocumentationLinks(unittest.TestCase):
    """Test cases for the fix_documentation_links.py script."""
    
    def setUp(self):
        """Set up test environment."""
        # Create a temporary directory for test files
        self.test_dir = tempfile.mkdtemp()
        
        # Sample test content with links that need fixing
        self.test_content = """
# Test Documentation

This is a test file with links that need to be fixed.

## Links to Fix

1. [Relative Link](docs/example.md) - Should be converted to absolute
2. [Absolute Link](/Users/oivindlund/date-night-app/docs/example.md) - Should be fixed
3. [Image Link](images/test.png) - Should be fixed
4. [Example Link](file.md) - Should be replaced with example.md
5. [Server Link](server/api.md) - Should be converted to absolute
6. [Client Link](client-angular/component.md) - Should be converted to absolute

## Links That Should Not Change

1. [External Link](https://example.com)
2. [Anchor Link](#section)
3. [Already Fixed Link](/docs/example.md)
"""
        
        # Create a test markdown file
        self.test_file_path = os.path.join(self.test_dir, 'test.md')
        with open(self.test_file_path, 'w') as f:
            f.write(self.test_content)
    
    def tearDown(self):
        """Clean up after tests."""
        # Remove the temporary directory and its contents
        shutil.rmtree(self.test_dir)
    
    def test_fix_links_in_file(self):
        """Test that links are fixed correctly in a file."""
        # Set up the project root for testing
        project_root = '/Users/oivindlund/date-night-app'
        
        # Fix links in the test file
        result = fix_documentation_links.fix_links_in_file(self.test_file_path, project_root)
        
        # Check that the function reported changes were made
        self.assertTrue(result)
        
        # Read the updated file content
        with open(self.test_file_path, 'r') as f:
            updated_content = f.read()
        
        # Check that links were fixed correctly
        self.assertIn('](/docs/example.md)', updated_content)  # Relative link fixed
        self.assertIn('](/docs/example.md)', updated_content)  # Absolute link fixed
        self.assertIn('](/docs/images/test.png)', updated_content)  # Image link fixed
        self.assertIn('](example.md)', updated_content)  # Example link fixed
        self.assertIn('](/server/api.md)', updated_content)  # Server link fixed
        self.assertIn('](/client-angular/component.md)', updated_content)  # Client link fixed
        
        # Check that links that should not change remain unchanged
        self.assertIn('](https://example.com)', updated_content)  # External link
        self.assertIn('](#section)', updated_content)  # Anchor link
    
    def test_no_changes_needed(self):
        """Test that the function returns False when no changes are needed."""
        # Create content with already fixed links
        fixed_content = """
# Test Documentation

This is a test file with links that are already fixed.

## Fixed Links

1. [Relative Link](/docs/example.md)
2. [Server Link](/server/api.md)
3. [Client Link](/client-angular/component.md)
4. [Example Link](example.md)
5. [Image Link](/docs/images/test.png)

## Links That Should Not Change

1. [External Link](https://example.com)
2. [Anchor Link](#section)
"""
        
        # Create a test file with already fixed links
        fixed_file_path = os.path.join(self.test_dir, 'fixed.md')
        with open(fixed_file_path, 'w') as f:
            f.write(fixed_content)
        
        # Set up the project root for testing
        project_root = '/Users/oivindlund/date-night-app'
        
        # Try to fix links in the already fixed file
        result = fix_documentation_links.fix_links_in_file(fixed_file_path, project_root)
        
        # Check that the function reported no changes were made
        self.assertFalse(result)
        
        # Read the file content
        with open(fixed_file_path, 'r') as f:
            updated_content = f.read()
        
        # Check that the content is unchanged
        self.assertEqual(fixed_content, updated_content)
    
    @patch('os.path.exists')
    @patch('os.walk')
    def test_scan_directory(self, mock_walk, mock_exists):
        """Test that directories are scanned correctly."""
        # Mock os.path.exists to always return True
        mock_exists.return_value = True
        
        # Mock os.walk to return test files
        mock_walk.return_value = [
            (self.test_dir, [], ['test1.md', 'test2.md', 'test3.txt']),
            (os.path.join(self.test_dir, 'subdir'), [], ['test4.md', 'test5.md'])
        ]
        
        # Mock fix_links_in_file to return True for .md files
        with patch('fix_documentation_links.fix_links_in_file') as mock_fix:
            mock_fix.side_effect = lambda file_path, project_root: file_path.endswith('.md')
            
            # Scan the test directory
            fixed_files = fix_documentation_links.scan_directory(self.test_dir, '/Users/oivindlund/date-night-app')
            
            # Check that the function was called for each .md file
            self.assertEqual(mock_fix.call_count, 4)
            
            # Check that the function returned the correct number of fixed files
            self.assertEqual(fixed_files, 4)
    
    @patch('os.path.dirname')
    @patch('os.path.abspath')
    @patch('fix_documentation_links.scan_directory')
    @patch('os.path.exists')
    @patch('os.path.join')
    @patch('os.system')
    def test_main(self, mock_system, mock_join, mock_exists, mock_scan, mock_abspath, mock_dirname):
        """Test the main function."""
        # Mock directory paths
        mock_dirname.return_value = '/Users/oivindlund/date-night-app/scripts'
        mock_abspath.return_value = '/Users/oivindlund/date-night-app/scripts/fix_documentation_links.py'
        mock_join.side_effect = lambda *args: '/'.join(args)
        
        # Mock os.path.exists to return True for directories
        mock_exists.return_value = True
        
        # Mock scan_directory to return 5 fixed files
        mock_scan.return_value = 5
        
        # Run the main function
        result = fix_documentation_links.main()
        
        # Check that the function returned 0 (success)
        self.assertEqual(result, 0)
        
        # Check that scan_directory was called for each directory in DIRECTORIES_TO_SCAN
        self.assertEqual(mock_scan.call_count, len(fix_documentation_links.DIRECTORIES_TO_SCAN))
        
        # Check that os.system was called to run the link checker
        mock_system.assert_called_once()

if __name__ == '__main__':
    unittest.main()