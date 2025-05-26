import {
import { Component, OnDestroy, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NebularModule } from '../../../../../app/shared/nebular.module';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AlertService } from '../../../../core/services/alert.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AlertFormDialogComponent } from '../alert-form-dialog/alert-form-dialog.component';
  NbCardModule,;
  NbButtonModule,;
  NbInputModule,;
  NbFormFieldModule,;
  NbIconModule,;
  _NbSpinnerModule,;
  _NbAlertModule,;
  NbTooltipModule,;
  NbBadgeModule,;
  NbTagModule,;
  NbSelectModule,;
  NbTableModule,;
  NbDialogModule,;
  NbDialogService,;
  NbTabsetModule,;
  NbPaginatorModule,';
} from '@nebular/theme';

import {
  AppSortComponent,;
  AppSortHeaderComponent,;
} from '../../../../shared/components/custom-nebular-components/nb-sort/nb-sort.component';

import {
  Alert,;
  AlertEvent,;
  AlertSeverity,;
  AlertConditionType,;
  _AlertTimeWindow,;
  AlertChannel,;
} from '../../../../core/models/alert.model';

@Component({
  selector: 'app-alert-management',;
  standalone: true,;
  schemas: [CUSTOM_ELEMENTS_SCHEMA],;
  imports: [NebularModule, CommonModule,;
    ReactiveFormsModule,;
    NbCardModule,;
    NbButtonModule,;
    NbTableModule,;
    NbFormFieldModule,;
    NbInputModule,;
    NbSelectModule,;
    NbToggleModule,;
    NbIconModule,;
    NbDialogModule,;
    NbTagModule,;
    NbBadgeModule,;
    NbTooltipModule,;
    NbTabsetModule,;
    AppSortComponent,;
    AppSortHeaderComponent,;
    NbPaginatorModule,;
  ],;
  template: `;`
    ;
      Alert Management;

      ;
        ;
          ;
             Create Alert;
          ;
        ;

         0">;
          ;
            Active Alerts;
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
                      Name;
                      ;
                        Severity;
                      ;
                      Condition;
                      Notifications;
                      Status;
                      Actions;
                    ;
                    ;
                      {{ alert.name }};
                      ;
                        ;
                          {{ getSeverityLabel(alert.severity) }}
                        ;
                      ;
                      {{ getConditionDescription(alert.condition) }};
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
                      Time;
                      Alert;
                      ;
                        Severity;
                      ;
                      Message;
                      Status;
                      Actions;
                    ;
                    ;
                      {{ event.timestamp | date: 'medium' }};
                      {{ event.alertName }};
                      ;
                        ;
                          {{ getSeverityLabel(event.severity) }}
                        ;
                      ;
                      {{ event.message }};
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
  `,;`
  styles: [;
    `;`
      .alert-management-container {
        padding: 20px;
      }

      .alert-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
      }

      .alert-definitions-container,;
      .active-alerts-container {
        margin-top: 20px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th,;
      td {
        padding: 1rem;
        text-align: left;
        border-bottom: 1px solid var(--border-basic-color-3);
      }

      th {
        background-color: var(--background-basic-color-2);
        font-weight: 600;
      }

      .notification-channels {
        display: flex;
        gap: 8px;
      }

      nb-icon {
        font-size: 1.25rem;
      }

      button[nbButton] {
        margin-right: 0.5rem;
      }
    `,;`
  ],;
});
export class AlertManagementComponen {t implements OnInit, OnDestroy {
  // Alert definitions
  alerts: Alert[] = [];
  pageSize = 10;
  pageIndex = 0;
  totalAlerts = 0;

  // Active alerts
  activeAlerts: AlertEvent[] = [];
  unacknowledgedCount = 0;

  // Tab selection
  selectedTabIndex = 0;

  // Sorting
  sortColumn: string | null = null;
  sortDirection: string = 'asc';
  activeSortColumn: string | null = null;
  activeSortDirection: string = 'asc';

  private destroy$ = new Subject();

  constructor(;
    private alertService: AlertService,;
    private dialog: NbDialogService,;
  ) {}

  ngOnInit(): void {
    this.loadAlerts();
    this.loadActiveAlerts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAlerts(): void {
    this.alertService;
      .getAlerts(this.pageIndex, this.pageSize);
      .pipe(takeUntil(this.destroy$));
      .subscribe((response) => {
        this.alerts = response.alerts;
        this.totalAlerts = response.total;
      });
  }

  loadActiveAlerts(): void {
    this.alertService;
      .getActiveAlerts();
      .pipe(takeUntil(this.destroy$));
      .subscribe((alerts) => {
        this.activeAlerts = alerts;
        this.unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;
      });
  }

  onPageChange(page: number): void {
    this.pageIndex = page - 1;
    this.loadAlerts();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageIndex = 0;
    this.loadAlerts();
  }

  sortAlerts(sort: { column: string; direction: string }): void {
    if (!sort.column || !sort.direction) {
      return;
    }

    this.alerts = this.alerts.slice().sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.column) {
        case 'name':;
          return this.compare(a.name, b.name, isAsc);
        case 'severity':;
          return this.compare(a.severity, b.severity, isAsc);
        default:;
          return 0;
      }
    });
  }

  sortActiveAlerts(sort: { column: string; direction: string }): void {
    if (!sort.column || !sort.direction) {
      return;
    }

    this.activeAlerts = this.activeAlerts.slice().sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.column) {
        case 'timestamp':;
          return this.compare(a.timestamp, b.timestamp, isAsc);
        case 'alertName':;
          return this.compare(a.alertName, b.alertName, isAsc);
        case 'severity':;
          return this.compare(a.severity, b.severity, isAsc);
        case 'status':;
          return this.compare(a.acknowledged, b.acknowledged, isAsc);
        default:;
          return 0;
      }
    });
  }

  private compare(a: any, b: any, isAsc: boolean): number {
    return (a  {
        alert.enabled = enabled;
      });
  }

  openAlertDialog(alert?: Alert): void {
    const dialogRef = this.dialog.open(AlertFormDialogComponent, {
      context: { alert },;
    });

    dialogRef.onClose.subscribe((result) => {
      if (result) {
        this.loadAlerts();
      }
    });
  }

  editAlert(alert: Alert): void {
    this.openAlertDialog(alert);
  }

  testAlert(alert: Alert): void {
    this.alertService.testAlert(alert.id).pipe(takeUntil(this.destroy$)).subscribe();
  }

  deleteAlert(alert: Alert): void {
    this.alertService;
      .deleteAlert(alert.id);
      .pipe(takeUntil(this.destroy$));
      .subscribe(() => {
        this.loadAlerts();
      });
  }

  acknowledgeAlert(event: AlertEvent): void {
    this.alertService;
      .acknowledgeAlert(event.id);
      .pipe(takeUntil(this.destroy$));
      .subscribe(() => {
        event.acknowledged = true;
        this.unacknowledgedCount--;
      });
  }

  viewAlertDetails(_event: AlertEvent): void {
    // TODO: Implement alert details dialog
  }
}
