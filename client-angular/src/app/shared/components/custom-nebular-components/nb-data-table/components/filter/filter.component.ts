import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TableColumn } from '../../nb-data-table.component';

@Component({
    selector: 'nb-data-table-filter',
    template: `
    <nb-card class="filter-card">
      <nb-card-header>
        <div class="filter-header">
          <span>Filter: {{ column?.name }}</span>
          <button nbButton ghost size="tiny" (click)="close.emit()">
            <nb-icon icon="close-outline"></nb-icon>
          </button>
        </div>
      </nb-card-header>

      <nb-card-body>
        <div [ngSwitch]="getFilterType()">
          <!-- Text Filter -->
          <div *ngSwitchCase="'text'" class="filter-input">
            <nb-form-field>
              <nb-icon nbPrefix icon="search-outline"></nb-icon>
              <input
                nbInput
                fullWidth
                [placeholder]="'Search ' + column?.name"
                [(ngModel)]="filterValue"
                (ngModelChange)="onValueChange($event)"
              />
              <button
                *ngIf="filterValue"
                nbSuffix
                nbButton
                ghost
                size="tiny"
                (click)="clearFilter()"
              >
                <nb-icon icon="close-outline"></nb-icon>
              </button>
            </nb-form-field>
          </div>

          <!-- Number Filter -->
          <div *ngSwitchCase="'number'" class="filter-input">
            <nb-form-field>
              <input
                nbInput
                fullWidth
                type="number"
                [placeholder]="'Enter ' + column?.name"
                [(ngModel)]="filterValue"
                (ngModelChange)="onValueChange($event)"
              />
            </nb-form-field>
            <div class="number-range">
              <nb-select [(ngModel)]="numberOperator" (ngModelChange)="onOperatorChange()">
                <nb-option value="eq">=</nb-option>
                <nb-option value="gt">&gt;</nb-option>
                <nb-option value="gte">≥</nb-option>
                <nb-option value="lt">&lt;</nb-option>
                <nb-option value="lte">≤</nb-option>
              </nb-select>
            </div>
          </div>

          <!-- Date Filter -->
          <div *ngSwitchCase="'date'" class="filter-input">
            <nb-form-field>
              <input
                nbInput
                fullWidth
                [nbDatepicker]="datepicker"
                [placeholder]="'Select ' + column?.name"
                [(ngModel)]="filterValue"
                (ngModelChange)="onValueChange($event)"
              />
              <nb-datepicker #datepicker></nb-datepicker>
            </nb-form-field>
          </div>

          <!-- Boolean Filter -->
          <div *ngSwitchCase="'boolean'" class="filter-input">
            <nb-radio-group [(ngModel)]="filterValue" (ngModelChange)="onValueChange($event)">
              <nb-radio value="true">Yes</nb-radio>
              <nb-radio value="false">No</nb-radio>
            </nb-radio-group>
          </div>
        </div>
      </nb-card-body>

      <nb-card-footer>
        <button nbButton status="primary" size="small" (click)="applyFilter()">Apply Filter</button>
        <button nbButton ghost size="small" (click)="clearFilter()">Clear</button>
      </nb-card-footer>
    </nb-card>
  `,
    styles: [
        `
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
    `,
    ],
    standalone: false
})
export class NbDataTableFilterComponent<T = any> {
  @Input() column: TableColumn<T> | null = null;
  @Input() value: any;
  @Output() filterChange = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

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
        value: parseFloat(this.filterValue),
        operator: this.numberOperator,
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
