# Documentation Decentralization Scripts

This directory contains scripts for implementing the documentation decentralization project as outlined in the [Documentation Decentralization Roadmap](/docs/DOCUMENTATION_DECENTRALIZATION_ROADMAP.md).

## Overview

The documentation decentralization project aims to:

1. Move documentation from centralized `/docs` to individual code folders
2. Convert Markdown to HTML format
3. Create a glossary system for functions and methods
4. Implement tooltips and hyperlinks for code references
5. Automate documentation generation via GitHub Actions

## Scripts

### Main Scripts

- `decentralize_docs.js` - Master script that orchestrates the entire process
- `generate_docs.js` - Core script for generating documentation
- `setup_github_actions.js` - Sets up GitHub Actions workflow

### Phase 1: Audit and Planning

- `audit_documentation.js` - Audits existing documentation and maps to code folders

### Phase 2: Infrastructure Setup

- `create_doc_structure.js` - Creates the initial documentation structure

### Phase 3: Content Migration

- `migrate_markdown_to_html.js` - Migrates Markdown documentation to HTML
- `markdown_to_html.js` - Converts individual Markdown files to HTML

### Phase 4: Glossary Implementation

- `extract_functions.js` - Extracts function and method signatures from code
- `implement_tooltips.js` - Adds tooltips to function references in documentation

## Usage

### Complete Process

To run the entire documentation decentralization process:

```bash
node scripts/decentralize_docs.js
```

### Individual Phases

To run a specific phase:

```bash
node scripts/decentralize_docs.js --phase 1
```

### Dry Run

To see what would happen without making changes:

```bash
node scripts/decentralize_docs.js --dry-run
```

### Individual Scripts

Each script can also be run individually:

```bash
node scripts/audit_documentation.js --output docs/DOCUMENTATION_AUDIT.md
node scripts/create_doc_structure.js
node scripts/migrate_markdown_to_html.js
node scripts/extract_functions.js
node scripts/implement_tooltips.js
node scripts/generate_docs.js
```

## GitHub Actions Integration

The documentation generation is automated via GitHub Actions. The workflow is defined in `.github/workflows/generate-docs.yml` and runs on:

- Pushes to the main branch that modify code or documentation
- Pull requests to the main branch that modify code or documentation
- Manual triggers via the GitHub Actions UI

To set up the GitHub Actions workflow:

```bash
node scripts/setup_github_actions.js
```

## Templates

The `templates` directory contains HTML templates for:

- `CHANGELOG.html.template` - Template for changelog files
- `AILESSONS.html.template` - Template for AI lessons files
- `GLOSSARY.html.template` - Template for glossary files

## Documentation Structure

Each code directory will contain:

- `CHANGELOG.html` - History of changes to the component/module
- `AILESSONS.html` - AI-discovered patterns and solutions
- `GLOSSARY.html` - Automatically generated list of functions/methods

The repository root will contain:

- `_docs_index.html` - Central documentation index
- `_glossary.html` - Global glossary of all functions and methods
