// Import all Nebular modules
import {
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
  NbThemeModule,;
  NbLayoutModule,;
  NbSidebarModule,;
  NbMenuModule,;
  NbCardModule,;
  NbButtonModule,;
  NbInputModule,;
  NbFormFieldModule,;
  NbIconModule,;
  NbSpinnerModule,;
  NbAlertModule,;
  NbTooltipModule,;
  NbBadgeModule,;
  NbTagModule,;
  NbSelectModule,;
  NbContextMenuModule,;
  NbDialogModule,;
  NbTabsetModule,;
  NbUserModule,;
  NbActionsModule,;
  NbSearchModule,;
  NbCheckboxModule,;
  NbPopoverModule,;
  NbListModule,;
  NbCalendarModule,;
  NbDatepickerModule,;
  NbTimepickerModule,;
  NbOverlayModule,;
  // The following imports are used for type definitions but not directly as modules';
  // Prefixing with _ to indicate they're intentionally unused as imports
  NbPositionBuilderService as _NbPositionBuilderService,;
  NbAdjustment as _NbAdjustment,;
  NbPosition as _NbPosition,;
} from '@nebular/theme';

// Custom component ID generator to avoid collisions
export function customComponentIdGenerator(componentType: { name: string }): string {
  // Add a prefix to the component ID to make it unique
  return `custom-${componentType.name}-${Math.random().toString(36).substring(2, 8)}`;`
}

@NgModule({
  imports: [;
    CommonModule,;
    NbThemeModule.forRoot({ name: 'default' }),;
    NbLayoutModule,;
    NbSidebarModule.forRoot(),;
    NbMenuModule.forRoot(),;
    NbDialogModule.forRoot(),;
    NbCardModule,;
    NbButtonModule,;
    NbInputModule,;
    NbFormFieldModule,;
    NbIconModule,;
    NbSpinnerModule,;
    NbAlertModule,;
    NbTooltipModule,;
    NbBadgeModule,;
    NbTagModule,;
    NbSelectModule,;
    NbContextMenuModule,;
    NbTabsetModule,;
    NbUserModule,;
    NbActionsModule,;
    NbSearchModule,;
    NbCheckboxModule,;
    NbPopoverModule,;
    NbListModule,;
    NbCalendarModule,;
    NbDatepickerModule.forRoot(),;
    NbTimepickerModule.forRoot(),;
    NbOverlayModule,;
  ],;
  exports: [;
    NbThemeModule,;
    NbLayoutModule,;
    NbSidebarModule,;
    NbMenuModule,;
    NbCardModule,;
    NbButtonModule,;
    NbInputModule,;
    NbFormFieldModule,;
    NbIconModule,;
    NbSpinnerModule,;
    NbAlertModule,;
    NbTooltipModule,;
    NbBadgeModule,;
    NbTagModule,;
    NbSelectModule,;
    NbContextMenuModule,;
    NbDialogModule,;
    NbTabsetModule,;
    NbUserModule,;
    NbActionsModule,;
    NbSearchModule,;
    NbCheckboxModule,;
    NbPopoverModule,;
    NbListModule,;
    NbCalendarModule,;
    NbDatepickerModule,;
    NbTimepickerModule,;
    NbOverlayModule,;
  ],;
  providers: [;
    // Provide the custom component ID generator
    {
      provide: 'componentIdGenerator',;
      useValue: customComponentIdGenerator,;
    },;
  ],;
});
export class NebularCustomModul {e {}
