# Decentralized Documentation Guide

## Overview

The Date Night App uses a decentralized documentation approach where each component has its own documentation files stored alongside the code. This guide explains how to use and maintain this documentation system.

## Documentation Structure

### Component Documentation Files

Each component directory contains the following documentation files:

1. **CHANGELOG.md** - History of changes to the component
2. **AILESSONS.md** - Lessons learned and best practices for the component

These files are stored in the component directory, close to the code they document.

### HTML Documentation

The component documentation files are aggregated into a central HTML documentation system located in `/docs/html-docs/`. This HTML documentation is organized by component type:

- `/docs/html-docs/server/` - Server components
- `/docs/html-docs/client/` - Client components
- `/docs/html-docs/features/` - Features
- `/docs/html-docs/components/` - UI components
- `/docs/html-docs/services/` - Services
- `/docs/html-docs/models/` - Data models
- `/docs/html-docs/design/` - Design system

## Using the Documentation

### Viewing Documentation

You can view the documentation in two ways:

1. **Component Files** - View the CHANGELOG.md and AILESSONS.md files directly in the component directory
2. **HTML Documentation** - Open `/docs/html-docs/index.html` in your browser to view the aggregated HTML documentation

### Finding Documentation

To find documentation for a specific component:

1. Navigate to the component directory to view the CHANGELOG.md and AILESSONS.md files
2. Or, open the HTML documentation and navigate to the appropriate section

## Maintaining Documentation

### Updating Component Documentation

When making changes to a component:

1. Update the CHANGELOG.md file in the component directory

   - Add an entry to the "Unreleased" section
   - Include details about what was added, changed, or fixed
   - Use clear, concise language

2. Update the AILESSONS.md file if you've learned something new
   - Add new best practices or patterns
   - Document challenges and solutions
   - Include implementation notes

### Generating HTML Documentation

After updating component documentation:

1. Run the HTML documentation update script:

```bash
node scripts/update_html_docs.mjs
```

This will regenerate the HTML documentation based on the updated component files.

### Adding Documentation to New Components

When creating a new component:

1. Run the decentralized documentation script to create template files:

```bash
node scripts/create_decentralized_docs.mjs
```

This will create CHANGELOG.md and AILESSONS.md files in the component directory.

2. Update the template files with component-specific information
3. Run the HTML documentation update script to include the new component in the HTML documentation

## Documentation Style Guidelines

### CHANGELOG.md

- Use the following sections:
  - **Added** - New features
  - **Changed** - Changes to existing functionality
  - **Fixed** - Bug fixes
  - **Removed** - Removed features
- Use bullet points for entries
- Be specific about what was changed
- Include references to issue numbers or pull requests when relevant
- Use present tense (e.g., "Add feature X" not "Added feature X")

### AILESSONS.md

- Use the following sections:
  - **Best Practices** - Recommended approaches
  - **Common Patterns** - Recurring patterns used in the component
  - **Known Issues** - Challenges or limitations
  - **Implementation Notes** - Decisions and rationale
- Use clear, concise language
- Include code examples when relevant
- Document both what to do and what not to do
- Explain the reasoning behind recommendations

## Documentation Templates

The following templates are used for component documentation:

### CHANGELOG.md Template

```markdown
# Changelog for [Component Name]

## [Unreleased]

### Added

- Initial changelog file

### Changed

- None

### Fixed

- None

## How to use this file

When making changes to this component, add an entry to the "Unreleased" section above.
When a release is made, create a new version section and move the unreleased entries there.

Example:

## [1.0.0] - YYYY-MM-DD

### Added

- Feature X
- Feature Y

### Changed

- Updated component Z

### Fixed

- Bug in function A
```

### AILESSONS.md Template

```markdown
# AI Lessons for [Component Name]

This document contains lessons learned and best practices specific to this component.

## Best Practices

- [Add best practices specific to this component]

## Common Patterns

- [Add common patterns used in this component]

## Known Issues

- [Add known issues or challenges with this component]

## Implementation Notes

- [Add implementation notes or decisions made for this component]

## How to use this file

When discovering new patterns, best practices, or lessons related to this component, add them to this file.
This helps maintain knowledge about the component and guides future development.
```

## Conclusion

The decentralized documentation approach ensures that documentation stays close to the code it documents and is updated when the code changes. By following this guide, you can help maintain high-quality documentation throughout the Date Night App project.
