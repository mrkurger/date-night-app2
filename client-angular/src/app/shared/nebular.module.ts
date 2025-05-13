// ===================================================
// NEBULAR MODULE CONFIGURATION
// ===================================================
// This file contains all Nebular module imports and exports
// for consistent UI components across the application
// ===================================================
import { NgModule } from '@angular/core';
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
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const NB_MODULES = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
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
  NbEvaIconsModule,
];

@NgModule({
  imports: [
    NbThemeModule.forRoot({ name: 'default' }),
    NbMenuModule.forRoot(),
    NbDialogModule.forRoot(),
    NbToastrModule.forRoot(),
    NbWindowModule.forRoot(),
    NbDatepickerModule.forRoot(),
    NbTimepickerModule.forRoot(),
    NbSidebarModule.forRoot(),
    NbContextMenuModule,
    NbEvaIconsModule,
    ...NB_MODULES,
  ],
  exports: [...NB_MODULES],
})
export class NebularModule {}

// Export a SharedModule for backward compatibility
@NgModule({
  imports: [NebularModule],
  exports: [NebularModule],
})
export class SharedModule {}
