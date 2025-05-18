import { NgModule } from '@angular/core';
import { NebularModule } from './nebular.module';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NbEvaIconsModule } from '@nebular/eva-icons';
import {
  NbCardModule,
  NbButtonModule,
  NbInputModule,
  NbFormFieldModule,
  NbIconModule,
  NbSelectModule,
  NbTagModule,
  NbListModule,
  NbUserModule,
  NbBadgeModule,
  NbAlertModule,
  NbCheckboxModule,
  NbRadioModule,
  NbDatepickerModule,
  NbTimepickerModule,
  NbContextMenuModule,
  NbActionsModule,
  NbTabsetModule,
  NbRouteTabsetModule,
  NbAccordionModule,
  NbStepperModule,
  NbTreeGridModule,
  NbPopoverModule,
  NbTooltipModule,
  NbToggleModule,
  NbChatModule,
  NbCalendarModule,
  NbSpinnerModule,
  NbSearchModule,
} from '@nebular/theme';

// Import custom components
import { NbErrorComponent } from './components/custom-nebular-components/nb-error/nb-error.component';
import { NbPaginationChangeEvent } from './components/custom-nebular-components/nb-paginator/nb-paginator.module';

const NEBULAR_MODULES = [
  // Basic Nebular modules
  NbCardModule,
  NbButtonModule,
  NbInputModule,
  NbFormFieldModule,
  NbIconModule,
  NbSelectModule,
  NbTagModule,
  NbListModule,
  NbUserModule,
  NbBadgeModule,
  NbAlertModule,
  NbCheckboxModule,
  NbRadioModule,
  NbDatepickerModule,
  NbTimepickerModule,
  NbContextMenuModule,
  NbActionsModule,
  NbTabsetModule,
  NbRouteTabsetModule,
  NbAccordionModule,
  NbStepperModule,
  NbTreeGridModule,
  NbEvaIconsModule,

  // Additional modules needed
  NbPopoverModule,
  NbTooltipModule,
  NbToggleModule,
  NbChatModule,
  NbCalendarModule,
  NbSpinnerModule,
  NbSearchModule,
];

// Custom components and modules
const CUSTOM_COMPONENTS = [NbErrorComponent];

const CUSTOM_MODULES = [];

/**
 * Shared Module
 *
 * This module exports common Angular modules and Nebular modules.
 * Standalone components and pipes should be imported directly where needed.
 *
 * Note: All components and pipes have been migrated to standalone.
 * They should be imported directly in the components that use them.
 */
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ...NEBULAR_MODULES,
    ...CUSTOM_MODULES,
    ...CUSTOM_COMPONENTS,
    NebularModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ...NEBULAR_MODULES,
    ...CUSTOM_MODULES,
    ...CUSTOM_COMPONENTS,
  ],
})
export class SharedModule {}
