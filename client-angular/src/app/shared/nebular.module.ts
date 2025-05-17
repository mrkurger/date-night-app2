// ===================================================
// CONSOLIDATED NEBULAR MODULE
// ===================================================
// This is the single source of truth for all Nebular-related imports
// and configurations across the application.
// ===================================================

import { NgModule, ModuleWithProviders, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  NbInputModule,
  NbFormFieldModule,
  NbIconModule,
  NbSpinnerModule,
  NbAlertModule,
  NbTooltipModule,
  NbBadgeModule,
  NbTagModule,
  NbSelectModule,
  NbContextMenuModule,
  NbTabsetModule,
  NbUserModule,
  NbActionsModule,
  NbSearchModule,
  NbCheckboxModule,
  NbRadioModule,
  NbPopoverModule,
  NbListModule,
  NbCalendarModule,
  NbStepperModule,
  NbTreeGridModule,
  NbAccordionModule,
  NbToggleModule,
  NbTableModule,
  NbOverlayModule,
  NbAutocompleteModule,
} from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';

// Import custom Nebular-compatible components
import { NbErrorComponent } from './components/custom-nebular-components/nb-error/nb-error.component';
import { NbPaginatorModule } from './components/custom-nebular-components/nb-paginator/nb-paginator.module';
import { NbDataTableModule } from './components/custom-nebular-components/nb-data-table/nb-data-table.module';
import { NbAdvancedFormModule } from './components/custom-nebular-components/nb-advanced-form/nb-advanced-form.module';
import { NbNavigationModule } from './components/custom-nebular-components/nb-navigation/nb-navigation.module';

// Custom component ID generator
export function customComponentIdGenerator(componentType: any): string {
  return `custom-${componentType.name}-${Math.random().toString(36).substring(2, 8)}`;
}

// Root Nebular modules (configured once at app level)
const ROOT_NEBULAR_MODULES: Array<ModuleWithProviders<any>> = [
  NbThemeModule.forRoot({
    name: 'default',
  }),
  NbMenuModule.forRoot(),
  NbToastrModule.forRoot({
    duration: 3000,
    position: 'top-right',
  }),
  NbDialogModule.forRoot({
    hasBackdrop: true,
    closeOnBackdropClick: true,
    closeOnEsc: true,
  }),
  NbSidebarModule.forRoot(),
  NbDatepickerModule.forRoot(),
  NbTimepickerModule.forRoot(),
  NbWindowModule.forRoot(),
];

// Feature Nebular modules (can be imported multiple times)
const FEATURE_NEBULAR_MODULES: Array<Type<any>> = [
  NbLayoutModule,
  NbCardModule,
  NbButtonModule,
  NbInputModule,
  NbFormFieldModule,
  NbIconModule,
  NbSpinnerModule,
  NbAlertModule,
  NbTooltipModule,
  NbBadgeModule,
  NbTagModule,
  NbSelectModule,
  NbContextMenuModule,
  NbTabsetModule,
  NbUserModule,
  NbActionsModule,
  NbSearchModule,
  NbCheckboxModule,
  NbRadioModule,
  NbPopoverModule,
  NbListModule,
  NbCalendarModule,
  NbStepperModule,
  NbTreeGridModule,
  NbAccordionModule,
  NbToggleModule,
  NbTableModule,
  NbOverlayModule,
  NbAutocompleteModule,
  NbEvaIconsModule,
];

// Custom Nebular-compatible modules
const CUSTOM_NEBULAR_MODULES = [
  NbPaginatorModule,
  NbDataTableModule,
  NbAdvancedFormModule,
  NbNavigationModule,
];

// Custom Nebular-compatible components
const CUSTOM_NEBULAR_COMPONENTS = [NbErrorComponent];

/**
 * NebularModule
 *
 * This module provides all Nebular components, directives, and services
 * needed throughout the application. It should be imported in the SharedModule.
 */
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ...ROOT_NEBULAR_MODULES,
    ...FEATURE_NEBULAR_MODULES,
    ...CUSTOM_NEBULAR_MODULES,
    ...CUSTOM_NEBULAR_COMPONENTS,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ...FEATURE_NEBULAR_MODULES,
    ...CUSTOM_NEBULAR_MODULES,
    ...CUSTOM_NEBULAR_COMPONENTS,
  ],
  providers: [
    {
      provide: 'componentIdGenerator',
      useValue: customComponentIdGenerator,
    },
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
