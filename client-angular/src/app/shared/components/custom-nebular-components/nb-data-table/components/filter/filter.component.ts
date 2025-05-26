import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TableColumn } from '../../nb-data-table.component';
import { NbDatepickerModule } from '@nebular/theme';

@Component({';
  selector: 'nb-data-table-filter',;
  template: `;`
    ;
      ;
        ;
          Filter: {{ column?.name }};
          ;
            ;
          ;
        ;
      ;

      ;
        ;
          ;
          ;
            ;
              ;
              ;
              ;
                ;
              ;
            ;
          ;

          ;
          ;
            ;
              ;
            ;
            ;
              ;
                =;
                &gt;;
                ≥;
                &lt;;
                ≤;
              ;
            ;
          ;

          ;
          ;
            ;
              ;
              ;
            ;
          ;

          ;
          ;
            ;
              Yes;
              No;
            ;
          ;
        ;
      ;

      ;
        Apply Filter;
        Clear;
      ;
    ;
  `,;`
  styles: [;
    `;`
      .filter-card {
        width: 300px;
      }

      .filter-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .filter-input {
        margin-bottom: 1rem;
      }

      .number-range {
        margin-top: 0.5rem;
      }

      nb-card-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
      }

      nb-radio-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
    `,;`
  ],;
  standalone: false,;
});
export class NbDataTableFilterComponen {t {
  @Input() column: TableColumn | null = null;
  @Input() value: any;
  @Output() filterChange = new EventEmitter();
  @Output() close = new EventEmitter();

  filterValue: any = null;
  numberOperator = 'eq';

  ngOnInit() {
    this.filterValue = this.value;
  }

  getFilterType(): string {
    if (!this.column) return 'text';

    // Determine filter type based on the first value in the data
    const sampleValue = this.value;
    if (typeof sampleValue === 'number') return 'number';
    if (sampleValue instanceof Date) return 'date';
    if (typeof sampleValue === 'boolean') return 'boolean';
    return 'text';
  }

  onValueChange(value: any) {
    this.filterValue = value;
  }

  onOperatorChange() {
    this.applyFilter();
  }

  applyFilter() {
    let filterValue = this.filterValue;

    // Format the filter value based on type
    if (this.getFilterType() === 'number') {
      filterValue = {
        value: parseFloat(this.filterValue),;
        operator: this.numberOperator,;
      };
    } else if (this.getFilterType() === 'date') {
      filterValue = this.filterValue ? new Date(this.filterValue) : null;
    } else if (this.getFilterType() === 'boolean') {
      filterValue = this.filterValue === 'true';
    }

    this.filterChange.emit(filterValue);
  }

  clearFilter() {
    this.filterValue = null;
    this.numberOperator = 'eq';
    this.filterChange.emit(null);
  }
}
