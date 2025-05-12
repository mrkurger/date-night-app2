import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import {
  PerformanceMonitorService,
  PerformanceMetrics,
} from '../../services/performance-monitor.service';

/**
 * Performance Monitor Component
 *
 * This component displays performance metrics for the application.
 * It can be used for debugging and monitoring performance issues.
 */
@Component({
  selector: 'app-performance-monitor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="performance-monitor" *ngIf="isVisible">
      <div class="performance-monitor__header">
        <h3 class="performance-monitor__title">Performance Monitor</h3>
        <button class="performance-monitor__close" (click)="toggleVisibility()">×</button>
      </div>
      <div class="performance-monitor__content">
        <div class="performance-monitor__metrics">
          <div class="performance-monitor__metric">
            <div class="performance-monitor__metric-label">Page Load Time</div>
            <div class="performance-monitor__metric-value">
              {{ metrics?.pageLoadTime | number: '1.0-0' }} ms
            </div>
          </div>
          <div class="performance-monitor__metric">
            <div class="performance-monitor__metric-label">FCP</div>
            <div class="performance-monitor__metric-value">
              {{ metrics?.firstContentfulPaint | number: '1.0-0' }} ms
            </div>
          </div>
          <div class="performance-monitor__metric">
            <div class="performance-monitor__metric-label">LCP</div>
            <div class="performance-monitor__metric-value">
              {{ metrics?.largestContentfulPaint | number: '1.0-0' }} ms
            </div>
          </div>
          <div class="performance-monitor__metric">
            <div class="performance-monitor__metric-label">FID</div>
            <div class="performance-monitor__metric-value">
              {{ metrics?.firstInputDelay | number: '1.0-0' }} ms
            </div>
          </div>
          <div class="performance-monitor__metric">
            <div class="performance-monitor__metric-label">CLS</div>
            <div class="performance-monitor__metric-value">
              {{ metrics?.cumulativeLayoutShift | number: '1.2-2' }}
            </div>
          </div>
          <div class="performance-monitor__metric">
            <div class="performance-monitor__metric-label">Memory</div>
            <div class="performance-monitor__metric-value">
              {{ metrics?.memoryUsage | number: '1.0-0' }} MB
            </div>
          </div>
        </div>

        <div class="performance-monitor__section">
          <h4 class="performance-monitor__section-title">
          </h4>
          <div class="performance-monitor__long-tasks" *ngIf="metrics?.longTasks?.length">
            <div
              class="performance-monitor__long-task"
              *ngFor="let task of metrics?.longTasks?.slice(0, 3)"
            >
              <div class="performance-monitor__long-task-name">{{ task.name }}</div>
              <div class="performance-monitor__long-task-duration">
                {{ task.duration | number: '1.0-0' }} ms
              </div>
            </div>
            <div class="performance-monitor__more" *ngIf="metrics?.longTasks?.length > 3">
              + {{ metrics?.longTasks?.length - 3 }} more
            </div>
          </div>
          <div class="performance-monitor__empty" *ngIf="!metrics?.longTasks?.length">
            No long tasks detected
          </div>
        </div>

        <div class="performance-monitor__actions">
          <button class="performance-monitor__action" (click)="clearMetrics()">
            Clear Metrics
          </button>
        </div>
      </div>
    </div>

    <button class="performance-monitor-toggle" (click)="toggleVisibility()" *ngIf="!isVisible">
      <span class="performance-monitor-toggle__icon">📊</span>
    </button>
  `,
  styles: [
    `
      :host {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
      }

      .performance-monitor {
        width: 300px;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        overflow: hidden;
        font-family: monospace;
        font-size: 12px;
      }

      .performance-monitor__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background-color: rgba(0, 0, 0, 0.3);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .performance-monitor__title {
        margin: 0;
        font-size: 14px;
        font-weight: normal;
      }

      .performance-monitor__close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
      }

      .performance-monitor__content {
        padding: 12px;
      }

      .performance-monitor__metrics {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        margin-bottom: 12px;
      }

      .performance-monitor__metric {
        padding: 6px;
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
      }

      .performance-monitor__metric-label {
        font-size: 10px;
        opacity: 0.7;
        margin-bottom: 2px;
      }

      .performance-monitor__metric-value {
        font-weight: bold;
      }

      .performance-monitor__section {
        margin-bottom: 12px;
      }

      .performance-monitor__section-title {
        margin: 0 0 8px 0;
        font-size: 12px;
        font-weight: normal;
        opacity: 0.7;
      }

      .performance-monitor__long-tasks {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .performance-monitor__long-task {
        display: flex;
        justify-content: space-between;
        padding: 4px 6px;
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        font-size: 10px;
      }

      .performance-monitor__long-task-name {
        max-width: 70%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .performance-monitor__long-task-duration {
        font-weight: bold;
      }

      .performance-monitor__more {
        font-size: 10px;
        opacity: 0.7;
        text-align: center;
        margin-top: 4px;
      }

      .performance-monitor__empty {
        font-size: 10px;
        opacity: 0.7;
        text-align: center;
        padding: 4px;
      }

      .performance-monitor__actions {
        display: flex;
        justify-content: flex-end;
      }

      .performance-monitor__action {
        background-color: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 10px;
        cursor: pointer;
      }

      .performance-monitor__action:hover {
        background-color: rgba(255, 255, 255, 0.3);
      }

      .performance-monitor-toggle {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      .performance-monitor-toggle__icon {
        font-size: 16px;
      }
    `,
  ],
})
export class PerformanceMonitorComponent implements OnInit, OnDestroy {
  metrics: PerformanceMetrics | null = null;
  isVisible = false;
  private subscription: Subscription | null = null;

  constructor(private performanceMonitor: PerformanceMonitorService) {}

  ngOnInit(): void {
    // Subscribe to performance metrics
    this.subscription = this.performanceMonitor.getMetrics().subscribe((metrics) => {
      this.metrics = metrics;
    });

    // Check if the component should be visible based on localStorage
    this.isVisible = localStorage.getItem('performance-monitor-visible') === 'true';
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * Toggles the visibility of the performance monitor
   */
  toggleVisibility(): void {
    this.isVisible = !this.isVisible;
    localStorage.setItem('performance-monitor-visible', this.isVisible.toString());
  }

  /**
   * Clears all performance metrics
   */
  clearMetrics(): void {
    this.performanceMonitor.clearMetrics();
  }
}
