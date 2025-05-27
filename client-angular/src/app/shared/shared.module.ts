import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'; // Not installed
import { AccordionModule } from 'primeng/accordion';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { ListboxModule } from 'primeng/listbox';
import { MessageModule } from 'primeng/message';
import { PaginatorModule } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TooltipModule } from 'primeng/tooltip';
import { TreeTableModule } from 'primeng/treetable';

// PrimeNG Modules
// Font Awesome for icons (replacement for Eva Icons)

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
  // FontAwesomeModule, // Not installed
];

/**
 *
 */
@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ...PRIMENG_MODULES],
  exports: [CommonModule, FormsModule, ReactiveFormsModule, ...PRIMENG_MODULES],
})
export class SharedModule {}
