import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Layout & Navigation
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { SidebarModule } from 'primeng/sidebar';
import { PanelModule } from 'primeng/panel';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ToolbarModule } from 'primeng/toolbar';
import { DividerModule } from 'primeng/divider';

// Data Display
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { BadgeModule } from 'primeng/badge';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

// Forms & Input
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputMaskModule } from 'primeng/inputmask';
import { SelectButtonModule } from 'primeng/selectbutton';

// Feedback & Overlays
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { OverlayPanelModule } from 'primeng/overlaypanel';

// Services
import { ConfirmationService, MessageService } from 'primeng/api';

// Others
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { ChipModule } from 'primeng/chip';
import { TabViewModule } from 'primeng/tabview';
import { AccordionModule } from 'primeng/accordion';

const PRIME_MODULES = [
  // Layout & Navigation
  ButtonModule,
  RippleModule,
  MenuModule,
  MenubarModule,
  SidebarModule,
  PanelModule,
  PanelMenuModule,
  ToolbarModule,
  DividerModule,

  // Data Display
  TableModule,
  PaginatorModule,
  BadgeModule,
  CardModule,
  TagModule,

  // Forms & Input
  InputTextModule,
  InputNumberModule,
  CheckboxModule,
  RadioButtonModule,
  DropdownModule,
  CalendarModule,
  AutoCompleteModule,
  InputSwitchModule,
  InputMaskModule,
  SelectButtonModule,

  // Feedback & Overlays
  ToastModule,
  DialogModule,
  ProgressSpinnerModule,
  TooltipModule,
  MessagesModule,
  MessageModule,
  ConfirmDialogModule,
  OverlayPanelModule,

  // Others
  AvatarModule,
  AvatarGroupModule,
  ChipModule,
  TabViewModule,
  AccordionModule,
];

/**
 * PrimeNGModule
 *
 * This module provides all PrimeNG components, directives, and services needed
 * throughout the application. Import this module in SharedModule.
 *
 * Features:
 * - Layout components (Panel, Toolbar, Sidebar, etc.)
 * - Data display components (Table, Paginator, etc.)
 * - Form controls (Input, Dropdown, Calendar, etc.)
 * - Feedback components (Toast, Dialog, etc.)
 * - Other utilities (Avatar, Chip, etc.)
 */
@NgModule({
  imports: [CommonModule, ...PRIME_MODULES],
  exports: [...PRIME_MODULES],
  providers: [ConfirmationService, MessageService],
})
export class PrimeNgModule {}
