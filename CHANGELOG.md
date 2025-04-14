# Change Log

## 2024-05-03

### Added
- Implemented standardized customization system across the codebase
  - Created CUSTOMIZATION_GUIDE.md with comprehensive documentation
  - Developed CONFIG_INDEX.md as a central reference for all customizable settings
  - Implemented standardized header system in configuration files
  - Added utility scripts for maintaining the customization system:
    - update_customization_headers.py to check and update headers
    - update_config_index.py to automatically update the central index
  - Applied standardized headers to key configuration files:
    - server/config/environment.js
    - server/config/csp.config.js
    - client-angular/src/environments/environment.ts
    - client-angular/src/app/shared/emerald/components/info-panel/info-panel.component.ts

### Improved
- Enhanced developer experience for configuration management
  - Added cross-references between related settings
  - Provided clear documentation for each customizable setting
  - Implemented consistent format for configuration headers
  - Added validation information for settings (valid values, ranges)

### Documentation
- Updated README.md with information about the customization system
- Added detailed instructions for maintaining the system
- Created comprehensive examples of common customization scenarios
- Added cross-referencing between related configuration settings

## 2024-05-02

### Added
- Implemented Emerald.js UI components for enhanced user experience
  - Added AppCard component for advertiser cards in both Tinder and Netflix views
  - Implemented Label component for online/offline status indicators
  - Added background blur effect for improved text readability on cards
  - Integrated Avatar component with dropdown menu in the main layout
  - Implemented Carousel for photo galleries in advertiser profiles
  - Added InfoPanel for displaying advertiser information
  - Implemented PageHeader for advertiser detail pages
  - Added SkeletonLoader for content loading states
  - Implemented light/dark mode Toggle switch

### Improved
- Enhanced UI responsiveness and visual consistency
  - Applied consistent styling across all components
  - Improved loading states with skeleton loaders
  - Enhanced card design with background blur effects
  - Optimized image loading and display

### Documentation
- Added comprehensive documentation for Emerald.js components
  - Created detailed API documentation for each component
  - Added usage examples for common scenarios
  - Included customization guidelines
  - Provided troubleshooting tips

## 2024-05-01

### Fixed
- Updated Angular component file references to use standard naming conventions
  - Modified `app.component.ts` to reference standard file names (`app.component.html` and `app.component.scss`) instead of custom ones (`app.component.new.html` and `app.component.new.css`)
  - Cleaned up `app.component.html` by removing Angular default template content and style sections
  - Kept the existing SCSS styles in `app.component.scss`

### Cleanup
- Removed redundant Angular template content from `app.component.html`
- Created cleanup instructions for manual deletion of unused files:
  - `app.component.new.html`
  - `app.component.new.css`
  - `app.component.css` (if unused)
- Added `CLEANUP_INSTRUCTIONS.md` file with detailed steps for removing these files
- Completed cleanup by removing all unused files

### Improved
- Aligned Angular architecture with modern standalone component approach
  - Updated `app.module.ts` to mark it as deprecated and remove AppComponent from declarations
  - Modified `app-routing.module.ts` to use routes from `app.routes.ts` to avoid duplication
  - Added clear documentation about the transition from NgModules to standalone components
  - Ensured backward compatibility during the transition period

### Enhanced
- Improved accessibility in the application layout
  - Added semantic HTML5 elements with appropriate ARIA roles
  - Enhanced screen reader support with aria-label and aria-hidden attributes
  - Improved keyboard navigation support
  - Added descriptive labels for interactive elements
  - Replaced anchor tags with button elements for actions (logout)
  - Used routerLink instead of href for internal navigation
  - Added comments to improve code readability and maintainability