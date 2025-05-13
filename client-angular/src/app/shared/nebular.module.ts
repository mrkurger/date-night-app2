// ===================================================
// NEBULAR MODULE CONFIGURATION
// ===================================================
// This file contains all Nebular module imports and exports
// for consistent UI components across the application
// ===================================================
import { NgModule, ModuleWithProviders, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NbThemeModule,
  NbLayoutModule,
  NbButtonModule,
  NbCardModule,
  NbIconModule,
  NbInputModule,
  NbFormFieldModule,
  NbUserModule,
  NbActionsModule,
  NbContextMenuModule,
  NbMenuModule,
  NbToastrModule,
  NbDialogModule,
  NbSpinnerModule,
  NbChatModule,
  NbSidebarModule,
  NbListModule,
  NbSelectModule,
  NbAccordionModule,
  NbCheckboxModule,
  NbRadioModule,
  NbDatepickerModule,
  NbTimepickerModule,
  NbToggleModule,
  NbPopoverModule,
  NbTooltipModule,
  NbTabsetModule,
  NbRouteTabsetModule,
  NbBadgeModule,
  NbAlertModule,
  NbSearchModule,
  NbWindowModule,
  NbTagModule,
  NbTreeGridModule,
  NbStepperModule,
  NbCalendarModule,
} from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';

// Import custom Nebular-compatible components/modules
import { NbErrorComponent } from './components/custom-nebular-components/nb-error/nb-error.component';
import { NbSortModule } from './components/custom-nebular-components/nb-sort/nb-sort.module';
import { NbPaginatorModule } from './components/custom-nebular-components/nb-paginator/nb-paginator.module';

/**
 * Core Nebular modules that need to be configured at the root level
 */
const ROOT_NEBULAR_MODULES: Array<ModuleWithProviders<any>> = [
  NbThemeModule.forRoot({ name: 'default' }),
  NbMenuModule.forRoot(),
  NbToastrModule.forRoot(),
  NbDialogModule.forRoot(),
  NbSidebarModule.forRoot(),
  NbDatepickerModule.forRoot(),
  NbTimepickerModule.forRoot(),
  NbWindowModule.forRoot(),
];

/**
 * Feature Nebular modules that can be imported multiple times
 */
const FEATURE_NEBULAR_MODULES: Array<Type<any>> = [
  NbLayoutModule,
  NbButtonModule,
  NbCardModule,
  NbIconModule,
  NbInputModule,
  NbFormFieldModule,
  NbUserModule,
  NbActionsModule,
  NbContextMenuModule,
  NbSpinnerModule,
  NbChatModule,
  NbListModule,
  NbSelectModule,
  NbAccordionModule,
  NbCheckboxModule,
  NbRadioModule,
  NbToggleModule,
  NbPopoverModule,
  NbTooltipModule,
  NbTabsetModule,
  NbRouteTabsetModule,
  NbBadgeModule,
  NbAlertModule,
  NbSearchModule,
  NbTagModule,
  NbTreeGridModule,
  NbStepperModule,
  NbCalendarModule,
  NbEvaIconsModule,
];

/**
 * Custom Nebular-compatible components and modules
 */
const CUSTOM_NEBULAR_COMPONENTS = [NbErrorComponent];

const CUSTOM_NEBULAR_MODULES = [NbSortModule, NbPaginatorModule];

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
    NbErrorComponent,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ...FEATURE_NEBULAR_MODULES,
    ...CUSTOM_NEBULAR_MODULES,
    NbErrorComponent,
  ],
})
export class NebularModule {}
