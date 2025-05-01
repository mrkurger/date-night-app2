# Documentation Decentralization Guide

This guide provides detailed instructions for implementing the documentation decentralization project in the Date Night App repository.

## Introduction

The documentation decentralization project aims to:

1. Move documentation from centralized `/docs` to individual code folders
2. Convert Markdown to HTML format
3. Create a glossary system for functions and methods
4. Implement tooltips and hyperlinks for code references
5. Automate documentation generation via GitHub Actions

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Git

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/date-night-app.git
   cd date-night-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Make scripts executable:
   ```bash
   chmod +x scripts/*.js
   ```

## Implementation Process

The implementation is divided into five phases, as outlined in the [Documentation Decentralization Roadmap](/docs/DOCUMENTATION_DECENTRALIZATION_ROADMAP.md).

### Phase 1: Audit and Planning

Run the audit script to analyze existing documentation and map it to code folders:

```bash
node scripts/audit_documentation.js --output docs/DOCUMENTATION_AUDIT.md
```

Review the audit report to understand the current documentation structure and identify any gaps or redundancies.

### Phase 2: Infrastructure Setup

Create the initial documentation structure:

```bash
node scripts/create_doc_structure.js
```

This will:

- Create stub HTML documentation files in each code folder
- Create global documentation index and glossary files
- Set up redirects from old documentation locations

### Phase 3: Content Migration

Migrate existing Markdown documentation to HTML:

```bash
node scripts/migrate_markdown_to_html.js
```

This will:

- Convert Markdown files to HTML using the templates
- Move documentation to the appropriate code folders
- Update internal links to point to new locations

### Phase 4: Glossary Implementation

Extract function and method signatures from code and implement tooltips:

```bash
node scripts/extract_functions.js
node scripts/implement_tooltips.js
```

This will:

- Parse code files to extract function/method signatures and documentation
- Generate glossary entries for each function/method
- Add tooltips to function/method references in documentation

### Phase 5: Integration and Finalization

Generate the final documentation:

```bash
node scripts/generate_docs.js
```

This will:

- Update all glossary files
- Rebuild the global documentation index
- Ensure all documentation is properly linked

### Automation Setup

Set up GitHub Actions for automatic documentation generation:

```bash
node scripts/setup_github_actions.js
```

This will:

- Create the GitHub Actions workflow file
- Make all scripts executable
- Configure the workflow to run on code and documentation changes

## Running the Complete Process

To run the entire documentation decentralization process at once:

```bash
node scripts/decentralize_docs.js
```

To run a specific phase:

```bash
node scripts/decentralize_docs.js --phase 1
```

To see what would happen without making changes:

```bash
node scripts/decentralize_docs.js --dry-run
```

## Documentation Structure

### Code Folder Documentation

Each code folder will contain:

- `CHANGELOG.html` - History of changes to the component/module
- `AILESSONS.html` - AI-discovered patterns and solutions
- `GLOSSARY.html` - Automatically generated list of functions/methods

### Global Documentation

The repository root will contain:

- `_docs_index.html` - Central documentation index
- `_glossary.html` - Global glossary of all functions and methods

### HTML Format

All documentation will use HTML format with:

- Consistent styling matching component-library
- Responsive design for all devices
- Accessible navigation
- Cross-document linking

### Glossary System

The glossary system includes:

- Function/method signatures
- Brief descriptions
- Parameter documentation
- Return value documentation
- Example usage
- Links to source code
- Tooltips on hover
- Deep-dive pages for detailed documentation

## Maintaining Documentation

### Adding New Documentation

1. Create the appropriate HTML file in the code folder
2. Use the templates in `scripts/templates` as a starting point
3. Run `node scripts/generate_docs.js` to update indexes and glossaries

### Updating Existing Documentation

1. Edit the HTML file directly
2. Run `node scripts/generate_docs.js` to update indexes and glossaries

### Adding New Code

1. Add JSDoc/TSDoc comments to functions and methods
2. Run `node scripts/generate_docs.js` to update glossaries

## GitHub Actions Workflow

The GitHub Actions workflow will:

- Run on pushes to the main branch
- Run on pull requests to the main branch
- Run when manually triggered
- Generate documentation for all code folders
- Commit the changes back to the repository

## Troubleshooting

### Common Issues

- **Missing documentation files**: Run `node scripts/create_doc_structure.js` to create stub files
- **Broken links**: Run `node scripts/generate_docs.js` to update all links
- **Missing glossary entries**: Ensure code has proper JSDoc/TSDoc comments

### Getting Help

If you encounter issues:

1. Check the script output for error messages
2. Review the logs in GitHub Actions
3. Consult the [Documentation Decentralization Roadmap](/docs/DOCUMENTATION_DECENTRALIZATION_ROADMAP.md)
4. Contact the project maintainers

## Conclusion

The documentation decentralization project will significantly improve the organization, accessibility, and maintainability of the Date Night App documentation. By following this guide, you can successfully implement the project and ensure that documentation remains up-to-date with code changes.
