# PrimeNG Migration Guide

## Overview

This guide provides comprehensive instructions for migrating the Date Night App frontend from a mixed UI framework state to a unified PrimeNG implementation.

### Current State (December 2024)
- **PrimeNG**: 35% (Target framework)
- **Nebular UI**: 45% (Being phased out)
- **Custom Components**: 15% (To be replaced)
- **Angular Material**: 5% (Legacy - remove first)

### Target State
- **PrimeNG**: 100% (Complete framework consolidation)

## Migration Phases

### Phase 1: Angular Material Removal (Critical Priority) ✅ COMPLETED
**Timeline**: 1-2 weeks | **Effort**: 5% of total migration | **Status**: ✅ COMPLETED

#### Components Successfully Migrated
| Component | Usage | PrimeNG Replacement | Status |
|-----------|-------|-------------------|--------|
| `mat-date-range-input` | 2+ | `p-calendar` with range | ✅ Migrated |
| `mat-date-range-picker` | 2+ | `p-calendar` | ✅ Migrated |
| `mat-header-cell`, `mat-cell` | 6+ | `p-table` columns | ✅ Migrated |
| `mat-header-row`, `mat-row` | 2+ | `p-table` structure | ✅ Migrated |

#### Migration Steps ✅ COMPLETED
1. **✅ Audit Angular Material Usage**
   ```bash
   # Found 2 Angular Material components in performance dashboards
   # mat-date-range-input, mat-date-range-picker, mat-table components
   ```

2. **✅ Run Phase 1 Migration**
   ```bash
   # Executed successfully with backup
   node scripts/comprehensive-primeng-migration.js phase1 --backup --verbose
   # Result: 97 files processed, 1 file modified, 2 components replaced
   ```

3. **✅ Manual Template Fixes**
   - Fixed date range implementation for PrimeNG calendar
   - Converted Angular Material table to PrimeNG table structure
   - Updated button implementations
   - Removed custom pagination (using PrimeNG built-in)

4. **✅ Update TypeScript Components**
   - Added PrimeNG module imports (TableModule, CalendarModule, ButtonModule)
   - Updated form structure for dateRange control
   - Modified pagination handling for PrimeNG table events

5. **✅ Dependencies Already Clean**
   - Angular Material dependencies already removed from package.json
   - PrimeNG dependencies already present and up-to-date

6. **✅ Verification Complete**
   - No remaining Angular Material components in actual templates
   - Only documentation files contain mat-* references (expected)
   - Migration successful with backup files created

### Phase 2: Nebular to PrimeNG Migration (High Priority) ✅ COMPLETED
**Timeline**: 4-6 weeks | **Effort**: 30% of total migration | **Status**: ✅ COMPLETED

#### High-Impact Components Successfully Migrated
| Nebular Component | Usage | PrimeNG Replacement | Status |
|-------------------|-------|-------------------|--------|
| `nb-icon` | 40+ | PrimeIcons | ✅ Migrated |
| `nb-card` | 37+ | `p-card` | ✅ Migrated |
| `nb-form-field` | 24+ | `p-field` + validation | ✅ Migrated |
| `nb-skeleton` | 40+ | `p-skeleton` | ✅ Migrated |
| `nb-toggle` | 28+ | `p-inputSwitch` | ✅ Migrated |

#### Migration Steps ✅ COMPLETED
1. **✅ Automated Component Migration**
   ```bash
   # Successfully migrated 380 components across 40 files
   node scripts/comprehensive-primeng-migration.js phase2 --backup --verbose
   # Result: 97 files processed, 40 files modified, 380 components replaced
   ```

2. **✅ Manual Fixes Applied**
   ```bash
   # Applied 91 manual fixes across 46 files
   node scripts/phase2-manual-fixes.js --backup --verbose
   # Fixed broken buttons, input directives, icons, validation classes
   ```

3. **✅ TypeScript Component Updates**
   ```bash
   # Added 146 PrimeNG imports and 58 options arrays
   node scripts/update-primeng-typescript.js --backup --verbose
   # Updated 58 files with proper module imports and dropdown options
   ```

4. **✅ Verification Complete**
   - 380 Nebular components successfully replaced
   - All PrimeNG module imports added
   - Options arrays created for dropdown components
   - Remaining nb-* components are custom Emerald design system components (Phase 3)

### Phase 3: Custom Component Replacement (Medium Priority) ✅ COMPLETED
**Timeline**: 6-8 weeks | **Effort**: 40% of total migration | **Status**: ✅ COMPLETED

#### Custom Components Successfully Migrated
| Custom Component | Usage | PrimeNG Strategy | Status |
|------------------|-------|-----------------|--------|
| `app-icon` | 36+ | PrimeIcons | ✅ Migrated |
| `app-button` | 28+ | `p-button` | ✅ Migrated |
| `app-input` | 24+ | `pInputText` | ✅ Migrated |
| `app-select` | 20+ | `p-dropdown` | ✅ Migrated |
| `nb-skeleton` | 40+ | `p-skeleton` | ✅ Migrated |
| `nb-user` | 18+ | `p-avatar` | ✅ Migrated |
| `nb-tag` | 10+ | `p-tag` | ✅ Migrated |
| `nb-badge` | 8+ | `p-badge` | ✅ Migrated |
| `nb-progress-bar` | 6+ | `p-progressBar` | ✅ Migrated |
| `nb-accordion` | 4+ | `p-accordion` | ✅ Migrated |
| `nb-menu` | 4+ | `p-menu` | ✅ Migrated |
| `nb-sidebar` | 4+ | `p-sidebar` | ✅ Migrated |
| `nb-divider` | 2+ | `p-divider` | ✅ Migrated |
| `nb-layout` components | 8+ | Semantic HTML | ✅ Migrated |

#### Migration Steps ✅ COMPLETED
1. **✅ Automated Custom Component Migration**
   ```bash
   # Successfully migrated 59 custom components across 4 files
   node scripts/comprehensive-primeng-migration.js phase3 --backup --verbose
   # Result: 97 files processed, 4 files modified, 59 components replaced
   ```

2. **✅ Emerald Design System Migration**
   ```bash
   # Applied 83 component replacements across 19 files
   node scripts/phase3-emerald-migration.js --backup --verbose
   # Migrated skeleton, user, tag, badge, progress, accordion, menu, sidebar, layout components
   ```

3. **✅ Icon Cleanup Migration**
   ```bash
   # Converted remaining 5 nb-icon components to PrimeIcons
   node scripts/phase3-icon-cleanup.js --backup --verbose
   # Applied comprehensive icon mapping from Eva Icons to PrimeIcons
   ```

4. **✅ TypeScript Component Updates**
   ```bash
   # Added 21 PrimeNG imports across 12 files
   node scripts/update-primeng-typescript.js --backup --verbose
   # Updated module imports for new PrimeNG components
   ```

5. **✅ Manual Component Fixes**
   - Fixed nb-info-panel template structure and PrimeNG integration
   - Converted nb-icon components to PrimeIcons with proper class bindings
   - Updated badge and progress bar implementations
   - Restructured accordion components for PrimeNG templates

6. **✅ Verification Complete**
   - 147 total components migrated in Phase 3 (59 + 83 + 5)
   - All major custom components successfully replaced
   - Remaining components are CSS-based wrappers or specialized custom components

### Icon Migration Strategy

#### Icon System Consolidation
- **Current**: Eva Icons (nb-icon), Custom icons (app-icon), Material Icons
- **Target**: PrimeIcons exclusively

#### Icon Mapping Examples
```typescript
const iconMappings = {
  'menu-2-outline': 'pi pi-bars',
  'search-outline': 'pi pi-search',
  'person-outline': 'pi pi-user',
  'bell-outline': 'pi pi-bell',
  'settings-outline': 'pi pi-cog'
};
```

#### Migration Command
```bash
node scripts/comprehensive-primeng-migration.js icons --verbose
```

## Tools and Scripts

### Comprehensive Migration Script
```bash
# Location: scripts/comprehensive-primeng-migration.js

# Usage examples:
node scripts/comprehensive-primeng-migration.js phase1 --dry-run --verbose
node scripts/comprehensive-primeng-migration.js phase2 --backup
node scripts/comprehensive-primeng-migration.js all --report
```

### Script Options
- `--dry-run`: Preview changes without modifying files
- `--verbose`: Show detailed migration information
- `--backup`: Create backup files before modification
- `--report`: Generate detailed migration report

## Testing Strategy

### 1. Visual Regression Testing
```bash
# Install visual testing tools
npm install --save-dev @storybook/test-runner chromatic

# Run visual tests
npm run test:visual
```

### 2. Functional Testing
```bash
# Run unit tests
npm run test

# Run e2e tests
npm run e2e
```

### 3. Accessibility Testing
```bash
# Install accessibility testing
npm install --save-dev @axe-core/playwright

# Run accessibility tests
npm run test:a11y
```

### 4. Performance Testing
```bash
# Analyze bundle size
npm run analyze

# Performance testing
npm run test:performance
```

## Dependencies Management

### Remove Legacy Dependencies
```bash
# Remove Angular Material
npm uninstall @angular/material @angular/cdk

# Remove Nebular (after Phase 2 completion)
npm uninstall @nebular/theme @nebular/eva-icons
```

### Ensure PrimeNG Dependencies
```bash
# Install/update PrimeNG
npm install primeng@latest primeicons@latest primeflex@latest

# Verify installation
npm list primeng primeicons primeflex
```

## Common Migration Patterns

### Form Migration Pattern
```html
<!-- Before (Nebular) -->
<nb-form-field>
  <label for="email">Email</label>
  <input nbInput type="email" id="email" formControlName="email">
  <div *ngIf="form.get('email')?.invalid && form.get('email')?.touched">
    <p class="caption status-danger">Email is required</p>
  </div>
</nb-form-field>

<!-- After (PrimeNG) -->
<div class="p-field">
  <label for="email">Email</label>
  <input pInputText id="email" type="email" formControlName="email"
         [class.p-invalid]="form.get('email')?.invalid && form.get('email')?.touched">
  <small class="p-error" *ngIf="form.get('email')?.invalid && form.get('email')?.touched">
    Email is required
  </small>
</div>
```

### Card Migration Pattern
```html
<!-- Before (Nebular) -->
<nb-card>
  <nb-card-header>Title</nb-card-header>
  <nb-card-body>Content</nb-card-body>
  <nb-card-footer>Footer</nb-card-footer>
</nb-card>

<!-- After (PrimeNG) -->
<p-card>
  <ng-template pTemplate="header">Title</ng-template>
  <ng-template pTemplate="content">Content</ng-template>
  <ng-template pTemplate="footer">Footer</ng-template>
</p-card>
```

### Icon Migration Pattern
```html
<!-- Before (Eva Icons) -->
<nb-icon icon="menu-2-outline"></nb-icon>

<!-- Before (Custom) -->
<app-icon name="menu"></app-icon>

<!-- After (PrimeIcons) -->
<i class="pi pi-bars"></i>
```

## Troubleshooting

### Common Issues

1. **Styling Inconsistencies**
   - Ensure PrimeNG theme is properly imported
   - Check for conflicting CSS from legacy frameworks
   - Use PrimeFlex utility classes for layout

2. **Form Validation Issues**
   - Update validation display patterns
   - Ensure proper error state handling
   - Test form submission flows

3. **Icon Display Problems**
   - Verify PrimeIcons CSS is loaded
   - Check icon name mappings
   - Ensure proper icon class syntax

### Getting Help

1. **Check Migration Reports**
   ```bash
   # Generate detailed report
   node scripts/comprehensive-primeng-migration.js all --report --dry-run
   ```

2. **Review Documentation**
   - [PrimeNG Documentation](https://primeng.org/)
   - [Migration Plan](./PRIMENG_MIGRATION_PLAN.html)
   - [AI Lessons](./AILESSONS.html)

3. **Test Incrementally**
   - Use `--dry-run` flag for preview
   - Create backups before major changes
   - Test each phase thoroughly before proceeding

## Success Metrics

### Target Metrics
- **100%** PrimeNG component usage
- **0%** legacy framework components
- **-30%** bundle size reduction (estimated)
- **100%** WCAG 2.1 AA compliance
- **No regression** in functionality

### Monitoring Progress
```bash
# Check current component distribution
grep -r "p-\|nb-\|mat-\|app-" src/app --include="*.html" | \
  sed 's/.*\(p-\|nb-\|mat-\|app-\)[a-zA-Z-]*/\1/' | \
  sort | uniq -c | sort -nr
```

## Timeline Summary

| Phase | Duration | Effort | Priority |
|-------|----------|--------|----------|
| Phase 1: Angular Material | 1-2 weeks | 5% | Critical |
| Phase 2: Nebular Migration | 4-6 weeks | 30% | High |
| Phase 3: Custom Components | 6-8 weeks | 40% | Medium |
| Phase 4: Final Consolidation | 2-4 weeks | 25% | Low |
| **Total** | **13-20 weeks** | **100%** | - |

## Next Steps

1. **Immediate Actions**
   - Review and approve migration plan
   - Set up development environment
   - Run Phase 1 migration (Angular Material removal)

2. **Short-term Goals**
   - Complete Phase 1 within 2 weeks
   - Begin Phase 2 planning
   - Establish testing protocols

3. **Long-term Objectives**
   - Achieve 100% PrimeNG implementation
   - Reduce technical debt
   - Improve maintainability and consistency
