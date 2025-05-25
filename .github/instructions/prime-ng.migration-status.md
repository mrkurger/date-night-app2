# PrimeNG Migration Status Report

## Components Remaining in Codebase

### Nebular Components
- **nb-card**: Replace with PrimeNG Card component.
- **nb-button**: Replace with PrimeNG Button component.
- **nb-input**: Replace with PrimeNG InputText component.
- **nb-select**: Replace with PrimeNG Dropdown component.
- **nb-sidebar**: Replace with PrimeNG Sidebar component.
- **nb-menu**: Replace with PrimeNG Menu component.
- **nb-user**: Replace with PrimeNG User component.
- **nb-actions**: Replace with PrimeNG Actions component.

### Angular Material Components
- **mat-button**: Replace with PrimeNG Button component.
- **mat-input**: Replace with PrimeNG InputText component.

### Bootstrap UI Components
- **btn**: Replace with PrimeNG Button component.
- **form-control**: Replace with PrimeNG InputText component.

## Next Steps
1. Identify all instances of the above components in the codebase.
2. Research and select appropriate PrimeNG components for each.
3. Update component TypeScript files to import PrimeNG modules.
4. Modify HTML templates to use PrimeNG components.
5. Adjust SCSS styles as needed.

## Progress Tracking
- Document each replacement in the CHANGELOG.html.
- Update AILESSONS.html with insights on the migration process.
- Ensure all changes are committed to the repository.