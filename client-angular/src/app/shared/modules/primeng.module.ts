// ===================================================
// PRIMENG MODULE CONFIGURATION
// ===================================================
// This file contains all PrimeNG module imports and exports
// for consistent UI components across the application
// ===================================================

import { NgModule } from '@angular/core';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ListboxModule } from 'primeng/listbox';
import { BadgeModule } from 'primeng/badge';
import { MessageModule } from 'primeng/message';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CalendarModule } from 'primeng/calendar';
import { ContextMenuModule } from 'primeng/contextmenu';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputGroupModule } from 'primeng/inputgroup';
import { AccordionModule } from 'primeng/accordion';
import { TabViewModule } from 'primeng/tabview';
import { DialogModule } from 'primeng/dialog';
import { TreeTableModule } from 'primeng/treetable';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { PaginatorModule } from 'primeng/paginator';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ChipModule } from 'primeng/chip';
import { MenuModule } from 'primeng/menu';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { ToolbarModule } from 'primeng/toolbar';
import { PanelModule } from 'primeng/panel';
import { RippleModule } from 'primeng/ripple';
import { ScrollerModule } from 'primeng/scroller';
import { DividerModule } from 'primeng/divider';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AvatarModule } from 'primeng/avatar';
import { MessagesModule } from 'primeng/messages';
import { TextareaModule } from 'primeng/textarea';
import { InputSwitchModule } from 'primeng/inputswitch';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { MessageService, ConfirmationService } from 'primeng/api';

const PRIMENG_MODULES = [
  CardModule,
  ButtonModule,
  InputTextModule,
  InputGroupModule,
  DropdownModule,
  TagModule,
  ListboxModule,
  BadgeModule,
  MessageModule,
  CheckboxModule,
  RadioButtonModule,
  CalendarModule,
  ContextMenuModule,
  TableModule,
  TabViewModule,
  AccordionModule,
  TreeTableModule,
  TooltipModule,
  ToggleButtonModule,
  PaginatorModule,
  DialogModule,
  ProgressSpinnerModule,
  AutoCompleteModule,
  ChipModule,
  MenuModule,
  TieredMenuModule,
  ToolbarModule,
  PanelModule,
  RippleModule,
  ScrollerModule,
  DividerModule,
  MultiSelectModule,
  ToastModule,
  ConfirmDialogModule,
  AvatarModule,
  MessagesModule,
  TextareaModule,
  InputSwitchModule,
  OverlayPanelModule,
];

@NgModule({
  imports: [...PRIMENG_MODULES],
  exports: [...PRIMENG_MODULES],
  providers: [MessageService, ConfirmationService], // Add PrimeNG services
})
export class PrimeNGModule {}
