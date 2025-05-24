import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// PrimeNG Modules
// Font Awesome for icons (replacement for Eva Icons)
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
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
  FontAwesomeModule,
];

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
  FontAwesomeModule,
];

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ...PRIMENG_MODULES],
  exports: [CommonModule, FormsModule, ReactiveFormsModule, ...PRIMENG_MODULES],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ...PRIMENG_MODULES],
  exports: [CommonModule, FormsModule, ReactiveFormsModule, ...PRIMENG_MODULES],
})
export class SharedModule {}
