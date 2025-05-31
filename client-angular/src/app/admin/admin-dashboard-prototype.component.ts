/* eslint-disable */
// Prototype: static Admin Dashboard layout with mock data
import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard-prototype',
  template: `
    <div class="admin-dashboard">
      <h2>Admin Dashboard Prototype</h2>
      <!-- Filters toolbar -->
      <div class="toolbar">
        <button>All</button>
        <button>DB</button>
        <button>CSP</button>
        <button>File</button>
        <button>Rate Limit</button>
        <button>Fingerprint</button>
        <button>Anomaly</button>
        <span class="date-picker">
          <input type="date" />
          to
          <input type="date" />
        </span>
      </div>
      <!-- Metrics cards -->
      <div class="metrics">
        <div class="card">CPU Usage: 34%</div>
        <div class="card">Memory Usage: 68%</div>
        <div class="card">Active DB Connections: 5</div>
        <div class="card">Rate Limit Events: 12</div>
      </div>
      <!-- Timeline -->
      <div class="timeline">
        <div class="event">
          <span class="time">10:00 AM</span>
          <span class="marker">●</span>
          <span class="content"><strong>System Metrics:</strong> CPU 34%, MEM 68%</span>
        </div>
        <div class="event">
          <span class="time">09:58 AM</span>
          <span class="marker">●</span>
          <span class="content"><strong>DB Heartbeat:</strong> OK, latency 32 ms</span>
        </div>
        <div class="event">
          <span class="time">09:55 AM</span>
          <span class="marker">●</span>
          <span class="content"><strong>CSP Violation:</strong> script-src blocked on /login</span>
        </div>
        <div class="event">
          <span class="time">09:50 AM</span>
          <span class="marker">●</span>
          <span class="content"><strong>File Access:</strong> User downloaded /report.pdf</span>
        </div>
        <div class="event">
          <span class="time">09:45 AM</span>
          <span class="marker">●</span>
          <span class="content"><strong>Rate Limit:</strong> IP 10.0.0.1 blocked on /api</span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-dashboard {
        padding: 20px;
        font-family: sans-serif;
      }
      .toolbar {
        margin-bottom: 20px;
      }
      .toolbar button {
        margin-right: 5px;
      }
      .toolbar .date-picker {
        margin-left: 20px;
      }
      .metrics {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
      }
      .metrics .card {
        background: #f5f5f5;
        padding: 15px;
        flex: 1;
        text-align: center;
        border-radius: 4px;
      }
      .timeline .event {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
      }
      .timeline .time {
        width: 90px;
        color: #666;
      }
      .timeline .marker {
        color: #2196f3;
        margin: 0 10px;
        font-size: 12px;
      }
      .timeline .content {
      }
    `,
  ],
})
export class AdminDashboardPrototypeComponent {}
