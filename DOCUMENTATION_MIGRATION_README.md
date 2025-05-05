# Documentation Migration Guide

This guide explains how to use the documentation migration tools to convert Markdown documentation to HTML and ensure all code folders have proper documentation.

## Overview

The documentation migration project aims to:

1. Migrate all Markdown documentation to HTML
2. Ensure each code folder has at least three HTML docs:
   - CHANGELOG.html
   - AILESSONS.html
   - GLOSSARY.html
3. Follow the component-library HTML template for consistency
4. Maintain a central index and global glossary
5. Add tooltips and links to function references

## Tools Available

We have several tools to help with the migration process:

### 1. Documentation Browser

The documentation browser allows you to browse, search, and view the HTML documentation:

```bash
./migrate-docs.sh browse
```

### 2. Documentation Analysis

To analyze the current state of documentation:

```bash
./migrate-docs.sh analyze
```

This will show:

- Which folders have documentation
- Which documentation files are missing
- Which Markdown files need to be migrated

### 3. Enhanced Migration

To migrate documentation for a specific feature:

```bash
./migrate-docs.sh enhanced-migrate <feature-name>
```

This will:

- Analyze all source files for the feature
- Merge content from multiple sources
- Format the content according to HTML standards
- Apply the component-library template
- Add tooltips and links to function references
- Update the main index and glossary

### 4. Batch Migration

To migrate documentation in batches, prioritized by importance:

```bash
./migrate-docs.sh batch-migrate [priority]
```

Where `priority` can be:

- `high` - High-priority features and components
- `medium` - Medium-priority features and components
- `low` - Low-priority features and components
- `all` - All features and components (default)

### 5. Creating Missing Documentation Files

To create missing documentation files for all code folders:

```bash
./migrate-docs.sh create-missing-docs
```

### 6. Manual Migration

For more control over the migration process:

```bash
./migrate-docs.sh convert-md-to-html <markdown-file> <output-html-file>
```

## Workflow

Here's a recommended workflow for migrating documentation:

1. **Install required dependencies**:

   ```bash
   ./migrate-docs.sh install-dependencies
   ```

2. **Analyze the current state**:

   ```bash
   ./migrate-docs.sh analyze
   ```

3. **Create missing documentation files**:

   ```bash
   ./migrate-docs.sh create-missing-docs
   ```

4. **Migrate high-priority features**:

   ```bash
   ./migrate-docs.sh batch-migrate high
   ```

5. **Migrate medium-priority features**:

   ```bash
   ./migrate-docs.sh batch-migrate medium
   ```

6. **Migrate low-priority features**:

   ```bash
   ./migrate-docs.sh batch-migrate low
   ```

7. **Browse the documentation**:
   ```bash
   ./migrate-docs.sh browse
   ```

## Automation

The documentation migration process is also automated through GitHub Actions:

1. The workflow runs on push to the main branch
2. It generates documentation for all code folders
3. It migrates Markdown documentation to HTML
4. It commits the changes back to the repository

## Best Practices

1. **Keep documentation close to code**: Documentation should be in the same folder as the code it documents.
2. **Use the component-library template**: All HTML documentation should follow the component-library template.
3. **Add tooltips and links**: Function references should have tooltips and links to their glossary entries.
4. **Update the changelog**: Keep the CHANGELOG.html file up to date with changes to the code.
5. **Document AI lessons**: Record insights and lessons learned in the AILESSONS.html file.
6. **Keep the glossary up to date**: The GLOSSARY.html file should contain all functions and methods in the code.

## Troubleshooting

If you encounter issues with the migration process:

1. **Check the logs**: The migration scripts output detailed logs.
2. **Run with verbose flag**: Add `--verbose` to see more detailed output.
3. **Check for missing dependencies**: Make sure all required dependencies are installed.
4. **Check file permissions**: Make sure the scripts have execute permissions.
5. **Check for syntax errors**: Make sure the Markdown files have valid syntax.

## Need Help?

If you need help with the documentation migration process, contact the documentation team or open an issue in the repository.
