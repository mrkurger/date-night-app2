# Documentation Decentralization Project Roadmap

This roadmap outlines the step-by-step process for reorganizing the Date Night App's documentation to create a decentralized, HTML-based documentation system with an interactive glossary.

## Phase 1: Audit and Planning

- [ ] **1.1 Audit Existing Documentation**

  - [ ] 1.1.1 Create inventory of all files in `/docs` directory
  - [ ] 1.1.2 Map documentation files to their corresponding code folders
  - [ ] 1.1.3 Identify documentation gaps and redundancies
  - [ ] 1.1.4 Document file relationships and dependencies

- [ ] **1.2 Analyze Code Structure**

  - [ ] 1.2.1 Map Angular features in `/client-angular/src/app/features/`
  - [ ] 1.2.2 Map shared components in `/client-angular/src/app/shared/components/`
  - [ ] 1.2.3 Map core services in `/client-angular/src/app/core/services/`
  - [ ] 1.2.4 Map server modules in `/server/`
  - [ ] 1.2.5 Create a comprehensive code-to-documentation mapping

- [ ] **1.3 Define HTML Documentation Structure**

  - [ ] 1.3.1 Analyze existing component-library HTML structure
  - [ ] 1.3.2 Define HTML templates for CHANGELOG.html, AILESSONS.html, and GLOSSARY.html
  - [ ] 1.3.3 Define CSS styling consistent with component-library
  - [ ] 1.3.4 Create navigation patterns for cross-document linking

- [ ] **1.4 Design Glossary System**
  - [ ] 1.4.1 Define schema for function/method documentation
  - [ ] 1.4.2 Design tooltip implementation
  - [ ] 1.4.3 Create template for glossary entries
  - [ ] 1.4.4 Define linking strategy between code references and glossary entries

## Phase 2: Infrastructure Setup

- [ ] **2.1 Create Base Templates**

  - [ ] 2.1.1 Create HTML template for CHANGELOG.html
  - [ ] 2.1.2 Create HTML template for AILESSONS.html
  - [ ] 2.1.3 Create HTML template for GLOSSARY.html
  - [ ] 2.1.4 Create HTML template for \_docs_index.html
  - [ ] 2.1.5 Create HTML template for \_glossary.html

- [ ] **2.2 Develop Documentation Generation Scripts**

  - [ ] 2.2.1 Create script to convert Markdown to HTML
  - [ ] 2.2.2 Create script to extract function/method signatures and documentation
  - [ ] 2.2.3 Create script to generate glossary entries
  - [ ] 2.2.4 Create script to build documentation indexes
  - [ ] 2.2.5 Create script to implement tooltips and hyperlinks

- [ ] **2.3 Set Up GitHub Actions Workflow**

  - [ ] 2.3.1 Create `.github/workflows/generate-docs.yml` workflow file
  - [ ] 2.3.2 Configure workflow to trigger on push/PR
  - [ ] 2.3.3 Set up workflow to run documentation generation scripts
  - [ ] 2.3.4 Configure workflow to commit generated documentation
  - [ ] 2.3.5 Test workflow with sample documentation changes

- [ ] **2.4 Create Documentation Stubs**
  - [ ] 2.4.1 Generate stub CHANGELOG.html files for each code folder
  - [ ] 2.4.2 Generate stub AILESSONS.html files for each code folder
  - [ ] 2.4.3 Generate stub GLOSSARY.html files for each code folder
  - [ ] 2.4.4 Create initial \_docs_index.html in repository root
  - [ ] 2.4.5 Create initial \_glossary.html in repository root

## Phase 3: Content Migration

- [ ] **3.1 Migrate Angular Feature Documentation**

  - [ ] 3.1.1 Move relevant content from `/docs/features/` to corresponding feature folders
  - [ ] 3.1.2 Convert Markdown to HTML using established templates
  - [ ] 3.1.3 Update internal links to point to new locations
  - [ ] 3.1.4 Create feature-specific CHANGELOG.html and AILESSONS.html

- [ ] **3.2 Migrate Shared Component Documentation**

  - [ ] 3.2.1 Move relevant content from `/docs/COMPONENT_LIBRARY.MD` to component folders
  - [ ] 3.2.2 Convert Markdown to HTML using established templates
  - [ ] 3.2.3 Update internal links to point to new locations
  - [ ] 3.2.4 Create component-specific CHANGELOG.html and AILESSONS.html

- [ ] **3.3 Migrate Core Service Documentation**

  - [ ] 3.3.1 Move relevant content from service-related docs to service folders
  - [ ] 3.3.2 Convert Markdown to HTML using established templates
  - [ ] 3.3.3 Update internal links to point to new locations
  - [ ] 3.3.4 Create service-specific CHANGELOG.html and AILESSONS.html

- [ ] **3.4 Migrate Server Module Documentation**

  - [ ] 3.4.1 Move relevant content from `/docs` and `/server/docs` to server module folders
  - [ ] 3.4.2 Convert Markdown to HTML using established templates
  - [ ] 3.4.3 Update internal links to point to new locations
  - [ ] 3.4.4 Create module-specific CHANGELOG.html and AILESSONS.html

- [ ] **3.5 Migrate General Documentation**
  - [ ] 3.5.1 Identify general documentation that doesn't map to specific code
  - [ ] 3.5.2 Create appropriate locations for general documentation
  - [ ] 3.5.3 Convert to HTML and update links
  - [ ] 3.5.4 Update \_docs_index.html to include general documentation

## Phase 4: Glossary Implementation

- [ ] **4.1 Extract Code Signatures**

  - [ ] 4.1.1 Parse TypeScript files to extract function/method signatures
  - [ ] 4.1.2 Parse JavaScript files to extract function/method signatures
  - [ ] 4.1.3 Extract documentation comments (JSDoc/TSDoc)
  - [ ] 4.1.4 Create structured data for glossary entries

- [ ] **4.2 Generate Local Glossaries**

  - [ ] 4.2.1 Generate GLOSSARY.html for each Angular feature
  - [ ] 4.2.2 Generate GLOSSARY.html for shared components
  - [ ] 4.2.3 Generate GLOSSARY.html for core services
  - [ ] 4.2.4 Generate GLOSSARY.html for server modules

- [ ] **4.3 Generate Global Glossary**

  - [ ] 4.3.1 Aggregate all local glossary entries
  - [ ] 4.3.2 Organize by module/folder
  - [ ] 4.3.3 Create cross-references between related entries
  - [ ] 4.3.4 Generate \_glossary.html in repository root

- [ ] **4.4 Implement Tooltips and Hyperlinks**
  - [ ] 4.4.1 Add tooltips to function/method references in documentation
  - [ ] 4.4.2 Create hyperlinks from references to glossary entries
  - [ ] 4.4.3 Implement tooltip JavaScript/CSS
  - [ ] 4.4.4 Test tooltip functionality in GitHub environment

## Phase 5: Integration and Finalization

- [ ] **5.1 Create Central Indexes**

  - [ ] 5.1.1 Update \_docs_index.html with links to all documentation
  - [ ] 5.1.2 Create section indexes for features, components, services, etc.
  - [ ] 5.1.3 Implement search functionality
  - [ ] 5.1.4 Add documentation summaries to indexes

- [ ] **5.2 Implement Redirects**

  - [ ] 5.2.1 Create redirects from old `/docs` files to new locations
  - [ ] 5.2.2 Update README.md with links to new documentation
  - [ ] 5.2.3 Create index.html in `/docs` pointing to \_docs_index.html
  - [ ] 5.2.4 Update any external references to documentation

- [ ] **5.3 Test and Validate**

  - [ ] 5.3.1 Verify all documentation is accessible via GitHub
  - [ ] 5.3.2 Test navigation between documents
  - [ ] 5.3.3 Validate tooltip functionality
  - [ ] 5.3.4 Check for broken links or missing content
  - [ ] 5.3.5 Verify GitHub Actions workflow correctly updates documentation

- [ ] **5.4 Documentation and Training**
  - [ ] 5.4.1 Create guide for maintaining decentralized documentation
  - [ ] 5.4.2 Document GitHub Actions workflow
  - [ ] 5.4.3 Create templates for new documentation
  - [ ] 5.4.4 Train team on documentation maintenance process

## Phase 6: Automation Refinement

- [ ] **6.1 Enhance GitHub Actions Workflow**

  - [ ] 6.1.1 Add validation checks for documentation
  - [ ] 6.1.2 Implement incremental updates to improve performance
  - [ ] 6.1.3 Add notifications for documentation changes
  - [ ] 6.1.4 Create documentation status reports

- [ ] **6.2 Improve Documentation Scripts**

  - [ ] 6.2.1 Optimize performance for large codebases
  - [ ] 6.2.2 Add support for additional documentation formats
  - [ ] 6.2.3 Enhance error handling and reporting
  - [ ] 6.2.4 Implement versioning for documentation

- [ ] **6.3 Implement Advanced Features**
  - [ ] 6.3.1 Add version comparison for documentation changes
  - [ ] 6.3.2 Implement advanced search capabilities
  - [ ] 6.3.3 Add visualization of code relationships
  - [ ] 6.3.4 Create documentation analytics

## Implementation Details

### Directory Structure

Each code directory will contain:

- `CHANGELOG.html` - History of changes to the component/module
- `AILESSONS.html` - AI-discovered patterns and solutions
- `GLOSSARY.html` - Automatically generated list of functions/methods

### HTML Format

All documentation will use HTML format with:

- Consistent styling matching component-library
- Responsive design for all devices
- Accessible navigation
- Cross-document linking

### Glossary System

The glossary system will include:

- Function/method signatures
- Brief descriptions
- Parameter documentation
- Return value documentation
- Example usage
- Links to source code
- Tooltips on hover
- Deep-dive pages for detailed documentation

### GitHub Actions Workflow

The workflow will:

- Scan the repository for code folders
- Ensure each has required documentation files
- Parse code to extract function/method information
- Generate/update glossary entries
- Rebuild documentation indexes
- Commit changes back to the branch

### Tooltip Implementation

Tooltips will:

- Show on hover over function/method names
- Display brief description and signature
- Link to full documentation in glossary
- Work in GitHub's HTML viewer
- Degrade gracefully when JavaScript is disabled
