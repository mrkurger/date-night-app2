import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NbTableModule,
  NbCardModule,
  NbButtonModule,
  NbIconModule,
  NbInputModule,
  NbSelectModule,
  NbCheckboxModule,
  NbTooltipModule,
  NbSpinnerModule,
  NbBadgeModule,
} from '@nebular/theme';

import { NbDataTableComponent } from './nb-data-table.component';
import { NbDataTableHeaderComponent } from './components/header/header.component';
import { NbDataTablePaginatorComponent } from './components/paginator/paginator.component';
import { NbDataTableFilterComponent } from './components/filter/filter.component';
import { NbDataTableSortComponent } from './components/sort/sort.component';

@NgModule({
  declarations: [
    NbDataTableComponent,
    NbDataTableHeaderComponent,
    NbDataTablePaginatorComponent,
    NbDataTableFilterComponent,
    NbDataTableSortComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NbTableModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbInputModule,
    NbSelectModule,
    NbCheckboxModule,
    NbTooltipModule,
    NbSpinnerModule,
    NbBadgeModule,
  ],
  exports: [
    NbDataTableComponent,
    NbDataTableHeaderComponent,
    NbDataTablePaginatorComponent,
    NbDataTableFilterComponent,
    NbDataTableSortComponent,
  ],
})
export class NbDataTableModule {}
