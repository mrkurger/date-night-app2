import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TableColumn } from '../../nb-data-table.component';

@Component({
  selector: 'nb-data-table-header',
  template: `
    <div class="header-container">
      <div class="title-section">
        <h5 class="title">{{ title }}</h5>
        <button
          nbButton
          ghost
          size="small"
          [nbPopover]="columnSelector"
          nbPopoverPlacement="bottom"
          nbPopoverTrigger="click"
        >
          <nb-icon icon="options-2-outline"></nb-icon>
        </button>
      </div>

      <div class="actions-section">
        <ng-content></ng-content>
      </div>
    </div>

    <ng-template #columnSelector>
      <div class="column-selector">
        <h6 class="column-selector-title">Show/Hide Columns</h6>
        <nb-checkbox
          *ngFor="let column of columns"
          [checked]="isColumnSelected(column)"
          (checkedChange)="toggleColumn(column)"
        >
          {{ column.name }}
        </nb-checkbox>
      </div>
    </ng-template>
  `,
  styles: [
    `
      .header-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .title-section {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .title {
        margin: 0;
        color: nb-theme(text-basic-color);
        font-weight: nb-theme(text-heading-5-font-weight);
      }

      .actions-section {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .column-selector {
        padding: 1rem;
        min-width: 200px;
      }

      .column-selector-title {
        margin: 0 0 1rem;
        color: nb-theme(text-basic-color);
        font-weight: nb-theme(text-heading-6-font-weight);
      }

      nb-checkbox {
        display: block;
        margin-bottom: 0.5rem;

        &:last-child {
          margin-bottom: 0;
        }
      }
    `,
  ],
})
export class NbDataTableHeaderComponent<T = any> {
  @Input() title = '';
  @Input() columns: TableColumn<T>[] = [];
  @Input() selectedColumns: TableColumn<T>[] = [];
  @Output() columnsChange = new EventEmitter<TableColumn<T>[]>();

  isColumnSelected(column: TableColumn<T>): boolean {
    return this.selectedColumns.some((col) => col.prop === column.prop);
  }

  toggleColumn(column: TableColumn<T>) {
    const isSelected = this.isColumnSelected(column);
    let newSelectedColumns: TableColumn<T>[];

    if (isSelected) {
      newSelectedColumns = this.selectedColumns.filter((col) => col.prop !== column.prop);
    } else {
      newSelectedColumns = [...this.selectedColumns, column];
    }

    // Sort columns based on their original order
    newSelectedColumns.sort((a, b) => {
      const aIndex = this.columns.findIndex((col) => col.prop === a.prop);
      const bIndex = this.columns.findIndex((col) => col.prop === b.prop);
      return aIndex - bIndex;
    });

    this.columnsChange.emit(newSelectedColumns);
  }
}
