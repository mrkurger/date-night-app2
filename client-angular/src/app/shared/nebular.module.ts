// ===================================================
// CONSOLIDATED NEBULAR MODULE
// ===================================================
// This is the single source of truth for all Nebular-related imports
// and configurations across the application.
// ===================================================

import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Import all required Nebular modules
import {
  NbThemeModule,
  NbLayoutModule,
  NbMenuModule,
  NbToastrModule,
  NbDialogModule,
  NbSidebarModule,
  NbDatepickerModule,
  NbTimepickerModule,
  NbWindowModule,
  NbCardModule,
  NbButtonModule,
  NbIconModule,
  NbInputModule,
  NbFormFieldModule,
  NbSelectModule,
  NbCheckboxModule,
  NbRadioModule,
  NbAutocompleteModule,
  NbTagModule,
  NbTooltipModule,
  NbSpinnerModule,
  NbAlertModule,
  NbBadgeModule,
  NbUserModule,
  NbSearchModule,
  NbContextMenuModule,
  NbPopoverModule,
  NbTabsetModule,
  NbAccordionModule,
  NbListModule,
  NbStepperModule,
  NbProgressBarModule,
  NbActionsModule,
  NbTreeGridModule,
  NbTableModule,
  NbCalendarModule,
  NbChatModule,
  NbRouteTabsetModule,
  NbToggleModule,
} from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';

// Import custom Nebular components
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

// Array of all Nebular modules that need to be configured at root level
const ROOT_NEBULAR_MODULES = [
  NbThemeModule.forRoot({ name: 'default' }),
  NbMenuModule.forRoot(),
  NbToastrModule.forRoot(),
  NbDialogModule.forRoot(),
  NbSidebarModule.forRoot(),
  NbDatepickerModule.forRoot(),
  NbTimepickerModule.forRoot(),
  NbWindowModule.forRoot(),
];

// Array of feature Nebular modules that can be imported multiple times
const FEATURE_NEBULAR_MODULES = [
  NbLayoutModule,
  NbCardModule,
  NbButtonModule,
  NbIconModule,
  NbInputModule,
  NbFormFieldModule,
  NbSelectModule,
  NbCheckboxModule,
  NbRadioModule,
  NbAutocompleteModule,
  NbTagModule,
  NbTooltipModule,
  NbSpinnerModule,
  NbAlertModule,
  NbBadgeModule,
  NbUserModule,
  NbSearchModule,
  NbContextMenuModule,
  NbPopoverModule,
  NbTabsetModule,
  NbAccordionModule,
  NbListModule,
  NbStepperModule,
  NbProgressBarModule,
  NbActionsModule,
  NbTreeGridModule,
  NbTableModule,
  NbCalendarModule,
  NbChatModule,
  NbRouteTabsetModule,
  NbToggleModule,
  NbEvaIconsModule,
];

// Array of custom form components
const FORM_COMPONENTS = [
  NbAdvancedFormComponent,
  NbFormArrayComponent,
  NbFormGroupComponent,
  NbFormValidationComponent,
  NbFormErrorComponent,
];

// Array of custom navigation components
const NAVIGATION_COMPONENTS = [
  NbNavigationComponent,
  NbSideMenuComponent,
  NbTopMenuComponent,
  NbUserMenuComponent,
  NbSearchBarComponent,
  NbBreadcrumbsComponent,
  NbThemeToggleComponent,
];

// Array of custom data table components
const DATA_TABLE_COMPONENTS = [
  NbDataTableComponent,
  NbDataTableHeaderComponent,
  NbDataTablePaginatorComponent,
  NbDataTableFilterComponent,
  NbDataTableSortComponent,
];

/**
 * NebularModule
 *
 * This module provides all Nebular components, directives, and services
 * needed throughout the application. It should be imported in the SharedModule.
 */
@NgModule({
  declarations: [...FORM_COMPONENTS, ...NAVIGATION_COMPONENTS, ...DATA_TABLE_COMPONENTS],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ...ROOT_NEBULAR_MODULES,
    ...FEATURE_NEBULAR_MODULES,
  ],
  exports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ...FEATURE_NEBULAR_MODULES,
    ...FORM_COMPONENTS,
    ...NAVIGATION_COMPONENTS,
    ...DATA_TABLE_COMPONENTS,
  ],
})
export class NebularModule {
  static forRoot(): ModuleWithProviders<NebularModule> {
    return {
      ngModule: NebularModule,
      providers: [],
    };
  }
}
