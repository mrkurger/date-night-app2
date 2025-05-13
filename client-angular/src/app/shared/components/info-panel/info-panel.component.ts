import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbCardModule, NbIconModule, NbButtonModule } from '@nebular/theme';

@Component({
  selector: 'app-info-panel',
  standalone: true,
  imports: [CommonModule, NbCardModule, NbIconModule, NbButtonModule],
  template: `
    <nb-card [status]="status" class="info-panel">
      <nb-card-header *ngIf="title || dismissible" class="info-panel__header">
        <div class="info-panel__title-group">
          <nb-icon *ngIf="icon" [icon]="icon" class="info-panel__icon"></nb-icon>
          <h3 class="info-panel__title" *ngIf="title">{{ title }}</h3>
        </div>
        <button
          *ngIf="dismissible"
          nbButton
          ghost
          size="small"
          class="info-panel__close"
          (click)="onDismiss()"
        >
          <nb-icon icon="close-outline"></nb-icon>
        </button>
      </nb-card-header>

      <nb-card-body class="info-panel__body">
        <ng-content></ng-content>
      </nb-card-body>

      <nb-card-footer *ngIf="footerTemplate" class="info-panel__footer">
        <ng-content select="[footer]"></ng-content>
      </nb-card-footer>
    </nb-card>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .info-panel {
        margin: 0;
      }

      .info-panel__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--spacing);
      }

      .info-panel__title-group {
        display: flex;
        align-items: center;
        gap: var(--spacing);
      }

      .info-panel__icon {
        font-size: 1.5rem;
        line-height: 1;
      }

      .info-panel__title {
        margin: 0;
        font-size: var(--text-heading-6-font-size);
        font-weight: var(--text-heading-6-font-weight);
        line-height: var(--text-heading-6-line-height);
      }

      .info-panel__close {
        padding: 0;
        min-width: 32px;
        height: 32px;
      }

      .info-panel__body {
        color: var(--text-basic-color);
      }

      .info-panel__footer {
        border-top: 1px solid var(--divider-color);
      }

      :host-context(.info-panel--compact) {
        .info-panel__header {
          padding: var(--padding-sm);
        }

        .info-panel__body {
          padding: var(--padding-sm);
        }

        .info-panel__footer {
          padding: var(--padding-sm);
        }
      }
    `,
  ],
})
export class InfoPanelComponent {
  @Input() title?: string;
  @Input() icon?: string;
  @Input() status: 'primary' | 'success' | 'info' | 'warning' | 'danger' | 'basic' = 'basic';
  @Input() dismissible = false;
  @Input() footerTemplate = false;

  onDismiss() {
    // Emit dismiss event or handle dismissal logic
  }
}
