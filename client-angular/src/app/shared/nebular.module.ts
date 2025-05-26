import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NbAdvancedFormComponent } from './components/custom-nebular-components/nb-advanced-form/nb-advanced-form.component';
import { NbFormArrayComponent } from './components/custom-nebular-components/nb-advanced-form/components/form-array/form-array.component';
import { NbFormGroupComponent } from './components/custom-nebular-components/nb-advanced-form/components/form-group/form-group.component';
import { NbFormValidationComponent } from './components/custom-nebular-components/nb-advanced-form/components/form-validation/form-validation.component';
import { NbFormErrorComponent } from './components/custom-nebular-components/nb-advanced-form/components/form-error/form-error.component';
import { NbNavigationComponent } from './components/custom-nebular-components/nb-navigation/nb-navigation.component';
import { NbSideMenuComponent } from './components/custom-nebular-components/nb-navigation/components/side-menu/side-menu.component';
import { NbTopMenuComponent } from './components/custom-nebular-components/nb-navigation/components/top-menu/top-menu.component';
import { NbUserMenuComponent } from './components/custom-nebular-components/nb-navigation/components/user-menu/user-menu.component';
import { NbSearchBarComponent } from './components/custom-nebular-components/nb-navigation/components/search-bar/search-bar.component';
import { NbBreadcrumbsComponent } from './components/custom-nebular-components/nb-navigation/components/breadcrumbs/breadcrumbs.component';
import { NbThemeToggleComponent } from './components/custom-nebular-components/nb-theme-toggle/nb-theme-toggle.component';
import { NbDataTableComponent } from './components/custom-nebular-components/nb-data-table/nb-data-table.component';
import { NbDataTableHeaderComponent } from './components/custom-nebular-components/nb-data-table/components/header/header.component';
import { NbDataTablePaginatorComponent } from './components/custom-nebular-components/nb-data-table/components/paginator/paginator.component';
import { NbDataTableFilterComponent } from './components/custom-nebular-components/nb-data-table/components/filter/filter.component';
import { NbDataTableSortComponent } from './components/custom-nebular-components/nb-data-table/components/sort/sort.component';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
// ===================================================
// CONSOLIDATED NEBULAR MODULE
// ===================================================
// This is the single source of truth for all Nebular-related imports
// and configurations across the application.
// ===================================================

// Import all required PrimeNG modules
// Import custom Nebular components

// Array of all PrimeNG modules that need to be configured at root level
const ROOT_PRIMENG_MODULES = [ToastModule]

// Array of feature PrimeNG modules that can be imported multiple times
const FEATURE_PRIMENG_MODULES = [;
  ButtonModule,
  CardModule,
  DialogModule,
  DropdownModule,
  InputTextModule,
  TableModule,
  TooltipModule,
]

// Array of custom form components
const FORM_COMPONENTS = [;
  NbAdvancedFormComponent,
  NbFormArrayComponent,
  NbFormGroupComponent,
  NbFormValidationComponent,
  NbFormErrorComponent,
]

// Array of custom navigation components
const NAVIGATION_COMPONENTS = [;
  NbNavigationComponent,
  NbSideMenuComponent,
  NbTopMenuComponent,
  NbUserMenuComponent,
  NbSearchBarComponent,
  NbBreadcrumbsComponent,
  NbThemeToggleComponent,
]

// Array of custom data table components
const DATA_TABLE_COMPONENTS = [;
  NbDataTableComponent,
  NbDataTableHeaderComponent,
  NbDataTablePaginatorComponent,
  NbDataTableFilterComponent,
  NbDataTableSortComponent,
]

/**
 * NebularModule;
 *;
 * This module provides all Nebular components, directives, and services;
 * needed throughout the application. It should be imported in the SharedModule.;
 */
@NgModule({
  declarations: [...FORM_COMPONENTS, ...NAVIGATION_COMPONENTS, ...DATA_TABLE_COMPONENTS],
  imports: [;
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ...ROOT_PRIMENG_MODULES,
    ...FEATURE_PRIMENG_MODULES,
  ],
  exports: [;
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ...FEATURE_PRIMENG_MODULES,
    ...FORM_COMPONENTS,
    ...NAVIGATION_COMPONENTS,
    ...DATA_TABLE_COMPONENTS,
  ],
})
export class NebularModul {e {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: NebularModule,
      providers: [],
    }
  }
}
';
