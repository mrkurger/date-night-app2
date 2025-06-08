# Nebular to PrimeNG Migration Strategy

## Completed
- ✅ Removed Nebular packages from package.json files
- ✅ Created PrimeNGModule to replace NebularModule
- ✅ Updated app.module.ts and app.config.ts
- ✅ Updated styles.scss to use PrimeNG themes
- ✅ Updated CoreModule (removed NbSecurityModule)
- ✅ Migrated NavigationComponent to PrimeNG
- ✅ Updated ThemeService for PrimeNG
- ✅ Started migration of ButtonComponent

## Remaining Work (190 files with Nebular references)

### High Priority Components (Core Functionality)
1. **Dialog Service** - Replace NbDialogService with PrimeNG DialogService
2. **Notification Service** - Replace NbToastrService with PrimeNG MessageService
3. **Icon Component** - Replace nb-icon with PrimeNG icons
4. **Form Components** - Replace Nebular form components with PrimeNG equivalents

### Shared Components (50+ files)
- app-card → p-card
- app-button → p-button (started)
- Custom Nebular components (nb-data-table, nb-navigation, etc.)
- Dialog components
- Form components

### Feature Components (100+ files)
- Auth components
- Admin components
- Browse/Gallery components
- Wallet components
- Profile components

### Migration Approach
1. **Phase 1: Core Services** - Dialog, Notification, Icon services
2. **Phase 2: Shared Components** - Button, Card, Form components
3. **Phase 3: Feature Components** - Page by page migration
4. **Phase 4: Custom Components** - Replace custom Nebular wrappers
5. **Phase 5: Testing & Cleanup** - Remove unused imports, test functionality

### Icon Mapping
```typescript
const iconMap = {
  'home-outline': 'pi pi-home',
  'search-outline': 'pi pi-search',
  'edit-outline': 'pi pi-pencil',
  'trash-outline': 'pi pi-trash',
  'plus-outline': 'pi pi-plus',
  'close-outline': 'pi pi-times',
  'checkmark-outline': 'pi pi-check',
  'menu-outline': 'pi pi-bars',
  'person-outline': 'pi pi-user',
  'settings-outline': 'pi pi-cog',
  // ... more mappings needed
};
```

### Component Mapping
- NbButtonModule → ButtonModule
- NbCardModule → CardModule
- NbInputModule → InputTextModule
- NbFormFieldModule → (remove, use PrimeNG field structure)
- NbDialogModule → DialogModule
- NbToastrModule → ToastModule
- NbMenuModule → MenuModule
- NbSidebarModule → SidebarModule

### CSS Changes Required
- Replace nb-theme() functions with CSS custom properties
- Update component selectors (nb-card → p-card)
- Update class names to PrimeNG conventions
- Remove Nebular-specific styling

## Estimated Effort
- **Total**: ~2-3 weeks for complete migration
- **Core functionality**: 2-3 days
- **Shared components**: 1 week
- **Feature components**: 1-2 weeks
- **Testing & polish**: 2-3 days

## Risks
- Breaking changes may affect user workflows
- Some Nebular features may not have direct PrimeNG equivalents
- Custom Nebular components need complete rewrite
- Styling inconsistencies during transition