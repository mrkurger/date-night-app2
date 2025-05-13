import { NbBadgeModule } from '@nebular/theme';
import { NbCardModule } from '@nebular/theme';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NbCardModule,
  NbButtonModule,
  NbIconModule,
  NbProgressBarModule,
  NbSpinnerModule,
  NbBadgeModule,
  NbToastrService,
} from '@nebular/theme';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'success' | 'warning' | 'danger';
  trend: 'up' | 'down' | 'stable';
}

interface TimeSeriesData {
  name: string;
  series: {
    name: string;
    value: number;
  }[];
}

@Component({
  selector: 'app-system-health',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbProgressBarModule,
    NbSpinnerModule,
    NbBadgeModule,
    NgxChartsModule,
  ],
  template: `
    <div class="system-health">
      <div class="row">
        <div class="col-md-6">
          <nb-card>
            <nb-card-header>
              <h5>System Resources</h5>
            </nb-card-header>
            <nb-card-body>
              <div class="metric-list">
                <div class="metric-item" *ngFor="let metric of systemMetrics">
                  <div class="metric-header">
                    <span class="metric-name">{{ metric.name }}</span>
                    <nb-badge
                      [status]="metric.status"
                      [text]="metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'"
                    >
                    </nb-badge>
                  </div>
                  <nb-progress-bar
                    [value]="metric.value"
                    [status]="metric.status"
                    [displayValue]="true"
                    size="large"
                  >
                    {{ metric.value }}{{ metric.unit }}
                  </nb-progress-bar>
                </div>
              </div>
            </nb-card-body>
          </nb-card>
        </div>

        <div class="col-md-6">
          <nb-card>
            <nb-card-header>
              <h5>Server Status</h5>
            </nb-card-header>
            <nb-card-body>
              <div class="server-grid">
                <div class="server-item" *ngFor="let server of servers">
                  <div class="server-header">
                    <span class="server-name">{{ server.name }}</span>
                    <nb-badge [status]="server.status" [text]="server.status"> </nb-badge>
                  </div>
                  <div class="server-metrics">
                    <div class="server-metric">
                      <span>Uptime</span>
                      <span>{{ server.uptime }}</span>
                    </div>
                    <div class="server-metric">
                      <span>Response Time</span>
                      <span>{{ server.responseTime }}ms</span>
                    </div>
                    <div class="server-metric">
                      <span>Load</span>
                      <span>{{ server.load }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </nb-card-body>
          </nb-card>
        </div>
      </div>

      <div class="row">
        <div class="col-md-12">
          <nb-card>
            <nb-card-header>
              <h5>Performance Metrics</h5>
            </nb-card-header>
            <nb-card-body>
              <div class="chart-container">
                <ngx-charts-line-chart
                  [results]="performanceData"
                  [gradient]="true"
                  [xAxis]="true"
                  [yAxis]="true"
                  [legend]="true"
                  [showXAxisLabel]="true"
                  [showYAxisLabel]="true"
                  xAxisLabel="Time"
                  yAxisLabel="Value"
                  [autoScale]="true"
                  [timeline]="true"
                >
                </ngx-charts-line-chart>
              </div>
            </nb-card-body>
          </nb-card>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./system-health.component.scss'],
})
export class SystemHealthComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  systemMetrics: SystemMetric[] = [
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
  ];

  servers = [
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
  ];

  performanceData: TimeSeriesData[] = [
    {
      name: 'Response Time',
      series: Array.from({ length: 24 }, (_, i) => ({
        name: `${i}:00`,
        value: Math.floor(Math.random() * 100 + 100),
      })),
    },
    {
      name: 'Server Load',
      series: Array.from({ length: 24 }, (_, i) => ({
        name: `${i}:00`,
        value: Math.floor(Math.random() * 50 + 30),
      })),
    },
  ];

  constructor(private toastrService: NbToastrService) {}

  ngOnInit() {
    this.startMetricUpdates();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private startMetricUpdates() {
    interval(5000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateMetrics();
      });
  }

  private updateMetrics() {
    // Simulate metric updates
    this.systemMetrics = this.systemMetrics.map((metric) => ({
      ...metric,
      value: Math.min(100, Math.max(0, metric.value + (Math.random() * 10 - 5))),
      trend: Math.random() > 0.5 ? 'up' : 'down',
    }));

    // Update server metrics
    this.servers = this.servers.map((server) => ({
      ...server,
      responseTime: Math.max(50, server.responseTime + (Math.random() * 20 - 10)),
      load: Math.min(100, Math.max(0, server.load + (Math.random() * 10 - 5))),
    }));

    // Check for alerts
    this.checkAlerts();
  }

  private checkAlerts() {
    const criticalMetrics = this.systemMetrics.filter(
      (metric) => metric.status === 'danger' && metric.trend === 'up',
    );

    if (criticalMetrics.length > 0) {
      this.toastrService.danger(
        `Critical: High ${criticalMetrics[0].name} detected`,
        'System Alert',
      );
    }

    const highLoadServers = this.servers.filter((server) => server.load > 90);
    if (highLoadServers.length > 0) {
      this.toastrService.warning(`High load on ${highLoadServers[0].name}`, 'Server Alert');
    }
  }
}
