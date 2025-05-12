// ===================================================
// NEBULAR MODULE CONFIGURATION
// ===================================================
// This file contains all Nebular module imports and exports
// for consistent UI components across the application
// ===================================================
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Nebular Imports
import {
  NbActionsModule,
  NbButtonModule,
  NbCardModule,
  NbCheckboxModule,
  NbDatepickerModule,
  NbDialogModule,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule,
  NbLayoutModule,
  NbListModule,
  NbMenuModule,
  NbPopoverModule,
  NbProgressBarModule,
  NbRadioModule,
  NbSelectModule,
  NbSidebarModule,
  NbSpinnerModule,
  NbTabsetModule,
  NbTagModule,
  NbToastrModule,
  NbToggleModule,
  NbTooltipModule,
  NbTreeGridModule,
  NbUserModule,
  NbWindowModule,
  NbBadgeModule,
  NbAlertModule,
  NbAccordionModule,
  NbAutocompleteModule,
  NbChatModule,
  NbStepperModule,
  NbThemeModule,
} from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { NbSecurityModule } from '@nebular/security';
import {
  NbPaginatorModule,
  NbSortModule,
  NbDividerModule,
} from '../shared/components/custom-nebular-components';

const NEBULAR_MODULES = [
  NbActionsModule,
  NbButtonModule,
  NbCardModule,
  NbCheckboxModule,
  NbDatepickerModule,
  NbDialogModule,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule,
  NbLayoutModule,
  NbListModule,
  NbMenuModule,
  NbPopoverModule,
  NbProgressBarModule,
  NbRadioModule,
  NbSelectModule,
  NbSidebarModule,
  NbSpinnerModule,
  NbTabsetModule,
  NbTagModule,
  NbToastrModule,
  NbToggleModule,
  NbTooltipModule,
  NbTreeGridModule,
  NbUserModule,
  NbWindowModule,
  NbBadgeModule,
  NbAlertModule,
  NbAccordionModule,
  NbAutocompleteModule,
  NbChatModule,
  NbStepperModule,
  NbEvaIconsModule,
  NbSecurityModule,
];

const commonModules = [CommonModule, ReactiveFormsModule, FormsModule, RouterModule];

@NgModule({
  imports: [
    ...NEBULAR_MODULES,
    ...commonModules,
    NbThemeModule.forRoot({ name: 'default' }),
    NbDatepickerModule.forRoot(),
    NbDialogModule.forRoot(),
    NbMenuModule.forRoot(),
    NbSidebarModule.forRoot(),
    NbToastrModule.forRoot(),
    NbWindowModule.forRoot(),
  ],
  exports: [...NEBULAR_MODULES, ...commonModules],
})
export class NebularModule {}

// Export a SharedModule for backward compatibility
@NgModule({
  imports: [NebularModule],
  exports: [NebularModule],
})
export class SharedModule {}
