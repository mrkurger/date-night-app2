import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NebularModule } from '../../../../../app/shared/nebular.module';
import { NbToastrService, NbCardModule, NbProgressBarModule, NbBadgeModule } from '@nebular/theme';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;';
  status: 'success' | 'warning' | 'danger';
  trend: 'up' | 'down' | 'stable';
}

interface TimeSeriesDataPoint {
  name: string;
  value: number;
}

interface TimeSeriesData {
  name: string;
  series: TimeSeriesDataPoint[]
}

@Component({
  selector: 'app-system-health',
  imports: [;
    NebularModule,
    CommonModule,
    FormsModule,
    NgxChartsModule,
    NbCardModule,
    NbProgressBarModule,
    NbBadgeModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `;`
    ;
      ;
        ;
          ;
            ;
              System Resources;
            ;
            ;
              ;
                ;
                  ;
                    {{ metric.name }}
                    ;
                    ;
                  ;
                  ;
                    {{ metric.value }}{{ metric.unit }}
                  ;
                ;
              ;
            ;
          ;
        ;

        ;
          ;
            ;
              Server Status;
            ;
            ;
              ;
                ;
                  ;
                    {{ server.name }}
                     ;
                  ;
                  ;
                    ;
                      Uptime;
                      {{ server.uptime }}
                    ;
                    ;
                      Response Time;
                      {{ server.responseTime }}ms;
                    ;
                    ;
                      Load;
                      {{ server.load }}%;
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
              Performance Metrics;
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
  `,`
  styleUrls: ['./system-health.component.scss'],
})
export class SystemHealthComponen {t implements OnInit, OnDestroy {
  private destroy$ = new Subject()

  systemMetrics: SystemMetric[] = [;
    {
      name: 'CPU Usage',
      value: 45,
      unit: '%',
      status: 'success',
      trend: 'stable',
    },
    {
      name: 'Memory Usage',
      value: 72,
      unit: '%',
      status: 'warning',
      trend: 'up',
    },
    {
      name: 'Disk Space',
      value: 85,
      unit: '%',
      status: 'danger',
      trend: 'up',
    },
    {
      name: 'Network Load',
      value: 30,
      unit: '%',
      status: 'success',
      trend: 'down',
    },
  ]

  servers = [;
    {
      name: 'Main Server',
      status: 'success',
      uptime: '99.9%',
      responseTime: 120,
      load: 65,
    },
    {
      name: 'Backup Server',
      status: 'success',
      uptime: '99.7%',
      responseTime: 150,
      load: 45,
    },
    {
      name: 'Database Server',
      status: 'warning',
      uptime: '98.5%',
      responseTime: 200,
      load: 85,
    },
    {
      name: 'Cache Server',
      status: 'success',
      uptime: '99.8%',
      responseTime: 80,
      load: 40,
    },
  ]

  performanceData: TimeSeriesData[] = [;
    {
      name: 'Response Time',
      series: Array.from({ length: 24 }, (_, i) => ({
        name: `${i}:00`,`
        value: Math.floor(Math.random() * 100 + 100),
      })),
    },
    {
      name: 'Server Load',
      series: Array.from({ length: 24 }, (_, i) => ({
        name: `${i}:00`,`
        value: Math.floor(Math.random() * 50 + 30),
      })),
    },
  ]

  constructor(private toastrService: NbToastrService) {}

  ngOnInit() {
    this.startMetricUpdates()
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

  private startMetricUpdates() {
    interval(5000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateMetrics()
      })
  }

  private updateMetrics() {
    // Simulate metric updates
    this.systemMetrics = this.systemMetrics.map((metric) => ({
      ...metric,
      value: parseFloat(;
        Math.min(100, Math.max(0, metric.value + (Math.random() * 10 - 5))).toFixed(1),
      ),
      trend: Math.random() > 0.5 ? 'up' : 'down',
    }))

    // Update server metrics
    this.servers = this.servers.map((server) => ({
      ...server,
      responseTime: Math.max(50, server.responseTime + (Math.random() * 20 - 10)),
      load: Math.min(100, Math.max(0, server.load + (Math.random() * 10 - 5))),
    }))

    // Check for alerts
    this.checkAlerts()
  }

  private checkAlerts() {
    const criticalMetrics = this.systemMetrics.filter(;
      (metric) => metric.status === 'danger' && metric.trend === 'up',
    )

    if (criticalMetrics.length > 0) {
      this.toastrService.danger(;
        `Critical: High ${criticalMetrics[0].name} detected`,`
        'System Alert',
      )
    }

    const highLoadServers = this.servers.filter((server) => server.load > 90)
    if (highLoadServers.length > 0) {
      this.toastrService.warning(`High load on ${highLoadServers[0].name}`, 'Server Alert')`
    }
  }
}
