// eslint-disable
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { FormsModule } from '@angular/forms';
// PrimeNG modules reordered
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TimelineModule } from 'primeng/timeline';
import { ToolbarModule } from 'primeng/toolbar';

/**
 *
 */
@Component({
  selector: 'app-telemetry-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    CalendarModule,
    CardModule,
    ChartModule,
    TimelineModule,
    ToolbarModule,
  ],
  template: `
    <div class="dashboard-container">
      <h1>Telemetry Dashboard</h1>
      <p-toolbar>
        <div class="p-toolbar-group-left">
          <button pButton type="button" label="All"></button>
          <button pButton type="button" label="DB"></button>
          <button pButton type="button" label="CSP"></button>
          <button pButton type="button" label="File"></button>
          <button pButton type="button" label="Rate Limit"></button>
          <button pButton type="button" label="Fingerprint"></button>
          <button pButton type="button" label="Anomaly"></button>
        </div>
        <div class="p-toolbar-group-right">
          <p-calendar
            [(ngModel)]="dateRange"
            selectionMode="range"
            dateFormat="yy-mm-dd"
          ></p-calendar>
        </div>
      </p-toolbar>
      <div class="content-grid">
        <div class="metrics-cards">
          <p-card header="CPU Usage">
            <p-chart type="doughnut" [data]="cpuData"></p-chart>
            <p>34%</p>
          </p-card>
          <p-card header="Memory Usage">
            <p-chart type="doughnut" [data]="memData"></p-chart>
            <p>68%</p>
          </p-card>
          <p-card header="Active DB Connections">
            <p>5</p>
          </p-card>
          <p-card header="Rate Limit Events">
            <p>12</p>
          </p-card>
        </div>
        <div class="timeline-section">
          <p-timeline [value]="events" layout="vertical" align="left">
            <ng-template pTemplate="marker" let-event>
              <i [ngClass]="event.icon" [style.color]="event.color"></i>
            </ng-template>
            <ng-template pTemplate="content" let-event>
              <span class="timestamp">{{ event.timestamp | date: 'short' }}</span>
              <div class="details">
                <strong>{{ event.title }}</strong>
                <p>{{ event.description }}</p>
              </div>
            </ng-template>
          </p-timeline>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        padding: 2rem;
      }
      .content-grid {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 1rem;
        margin-top: 1rem;
      }
      .metrics-cards p-card {
        margin-bottom: 1rem;
      }
      .timeline-section {
        max-height: 60vh;
        overflow-y: auto;
      }
      .timestamp {
        font-size: 0.8rem;
        color: #666;
      }
      .details {
        margin-left: 0.5rem;
      }
    `,
  ],
})
export class TelemetryDashboardComponent implements OnInit {
  filterForm: FormGroup;
  dateRange: Date[] = [];
  cpuData!: { labels: string[]; datasets: Array<{ data: number[]; backgroundColor: string[] }> };
  memData!: { labels: string[]; datasets: Array<{ data: number[]; backgroundColor: string[] }> };
  events: Array<{
    timestamp: Date;
    icon: string;
    color: string;
    title: string;
    description: string;
  }> = [];

  /**
   *
   */
  constructor(private readonly fb: FormBuilder) {
    this.filterForm = this.fb.group({ dateRange: ['last7days'] });
  }

  /**
   *
   */
  ngOnInit(): void {
    // static mock data
    this.cpuData = {
      labels: ['Used', 'Free'],
      datasets: [{ data: [34, 66], backgroundColor: ['#42A5F5', '#EEEEEE'] }],
    };
    this.memData = {
      labels: ['Used', 'Free'],
      datasets: [{ data: [68, 32], backgroundColor: ['#9CCC65', '#EEEEEE'] }],
    };
    this.events = [
      {
        timestamp: new Date(),
        icon: 'pi pi-chart-line',
        color: '#2196F3',
        title: 'System Metrics',
        description: 'CPU 34% · MEM 68%',
      },
      {
        timestamp: new Date(Date.now() - 120000),
        icon: 'pi pi-hdd',
        color: '#4CAF50',
        title: 'DB Heartbeat',
        description: 'OK, latency 32 ms',
      },
      {
        timestamp: new Date(Date.now() - 300000),
        icon: 'pi pi-warning',
        color: '#FF9800',
        title: 'CSP Violation',
        description: 'script-src blocked on /login',
      },
      {
        timestamp: new Date(Date.now() - 600000),
        icon: 'pi pi-file',
        color: '#9C27B0',
        title: 'File Access',
        description: 'User downloaded /report.pdf',
      },
      {
        timestamp: new Date(Date.now() - 900000),
        icon: 'pi pi-lock',
        color: '#F44336',
        title: 'Rate Limit',
        description: 'IP 10.0.0.1 blocked on /api',
      },
    ];
  }
}
