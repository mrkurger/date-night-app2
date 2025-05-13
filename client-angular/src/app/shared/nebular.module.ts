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
  NbBadgeModule,
  NbAlertModule,
  NbProgressBarModule,
  NbSearchModule,
  NbWindowModule,
  NbTagModule,
  NbTreeGridModule,
  NbStepperModule,
  NbTableModule,
} from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';

const NEBULAR_MODULES: Array<Type<any> | ModuleWithProviders<any>> = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  NbThemeModule.forRoot({ name: 'default' }),
  NbLayoutModule,
  NbButtonModule,
  NbCardModule,
  NbIconModule,
  NbInputModule,
  NbFormFieldModule,
  NbUserModule,
  NbActionsModule,
  NbContextMenuModule,
  NbMenuModule.forRoot(),
  NbToastrModule.forRoot(),
  NbDialogModule.forRoot(),
  NbSpinnerModule,
  NbChatModule,
  NbSidebarModule.forRoot(),
  NbListModule,
  NbSelectModule,
  NbAccordionModule,
  NbCheckboxModule,
  NbRadioModule,
  NbDatepickerModule.forRoot(),
  NbTimepickerModule.forRoot(),
  NbToggleModule,
  NbPopoverModule,
  NbTooltipModule,
  NbTabsetModule,
  NbBadgeModule,
  NbAlertModule,
  NbProgressBarModule,
  NbSearchModule,
  NbWindowModule.forRoot(),
  NbTagModule,
  NbTreeGridModule,
  NbStepperModule,
  NbTableModule,
  NbEvaIconsModule,
];

@NgModule({
  imports: NEBULAR_MODULES,
  exports: NEBULAR_MODULES,
})
export class NebularModule {}

// Export a SharedModule for backward compatibility
@NgModule({
  imports: [NebularModule],
  exports: [NebularModule],
})
export class SharedModule {}
