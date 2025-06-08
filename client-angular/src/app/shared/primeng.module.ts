// ===================================================
// PRIMENG MODULE
// ===================================================
// This module replaces NebularModule and provides all PrimeNG-related imports
// and configurations across the application.
// ===================================================

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// PrimeNG Core modules
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { SidebarModule } from 'primeng/sidebar';
import { TabViewModule } from 'primeng/tabview';
import { AccordionModule } from 'primeng/accordion';
import { PanelModule } from 'primeng/panel';
import { FieldsetModule } from 'primeng/fieldset';
import { DividerModule } from 'primeng/divider';
import { SplitterModule } from 'primeng/splitter';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { SkeletonModule } from 'primeng/skeleton';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SliderModule } from 'primeng/slider';
import { RatingModule } from 'primeng/rating';
import { SpeedDialModule } from 'primeng/speeddial';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ContextMenuModule } from 'primeng/contextmenu';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { StepsModule } from 'primeng/steps';
import { MegaMenuModule } from 'primeng/megamenu';
import { SlideMenuModule } from 'primeng/slidemenu';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { PanelMenuModule } from 'primeng/panelmenu';
import { DockModule } from 'primeng/dock';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CascadeSelectModule } from 'primeng/cascadeselect';
import { TreeSelectModule } from 'primeng/treeselect';
import { ListboxModule } from 'primeng/listbox';
import { OrderListModule } from 'primeng/orderlist';
import { PickListModule } from 'primeng/picklist';
import { CarouselModule } from 'primeng/carousel';
import { GalleriaModule } from 'primeng/galleria';
import { ImageModule } from 'primeng/image';

// PrimeNG Services
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';

// Array of all PrimeNG modules that we want to use
const PRIMENG_MODULES = [
  ButtonModule,
  CardModule,
  InputTextModule,
  InputTextareaModule,
  PasswordModule,
  CheckboxModule,
  RadioButtonModule,
  DropdownModule,
  MultiSelectModule,
  CalendarModule,
  TableModule,
  PaginatorModule,
  DialogModule,
  ToastModule,
  ConfirmDialogModule,
  TooltipModule,
  ProgressBarModule,
  ProgressSpinnerModule,
  MessagesModule,
  MessageModule,
  BadgeModule,
  AvatarModule,
  MenuModule,
  MenubarModule,
  SidebarModule,
  TabViewModule,
  AccordionModule,
  PanelModule,
  FieldsetModule,
  DividerModule,
  SplitterModule,
  TagModule,
  ChipModule,
  SkeletonModule,
  ToggleButtonModule,
  InputSwitchModule,
  SliderModule,
  RatingModule,
  SpeedDialModule,
  OverlayPanelModule,
  ContextMenuModule,
  BreadcrumbModule,
  StepsModule,
  MegaMenuModule,
  SlideMenuModule,
  TieredMenuModule,
  PanelMenuModule,
  DockModule,
  AutoCompleteModule,
  CascadeSelectModule,
  TreeSelectModule,
  ListboxModule,
  OrderListModule,
  PickListModule,
  CarouselModule,
  GalleriaModule,
  ImageModule,
];

/**
 * PrimeNGModule
 *
 * This module provides all PrimeNG components, directives, and services
 * needed throughout the application. It replaces the NebularModule.
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ...PRIMENG_MODULES,
  ],
  exports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ...PRIMENG_MODULES,
  ],
  providers: [
    MessageService,
    ConfirmationService,
  ],
})
export class PrimeNGModule {}