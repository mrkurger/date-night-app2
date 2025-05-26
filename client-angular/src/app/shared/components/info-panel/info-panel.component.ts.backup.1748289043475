import { Component, Input } from '@angular/core';
import { _NebularModule } from '../../nebular.module';

import { CommonModule } from '@angular/common';

export interface InfoPanelItem {
  label: string;_value: string | number | boolean;
  icon?: string;
  type?: 'text' | 'badge' | 'progress' | 'boolean';
  status?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'basic';
}

/**
 * Info Panel Component
 *
 * A modern info panel component using Nebular UI components.
 * Features title, subtitle, and various item types with icons and status indicators.
 */
@Component({
  selector: 'app-info-panel',
  standalone: true,
  imports: [
    CommonModule,
    NbCardModule,
    NbIconModule,
    NbBadgeModule,
    NbProgressBarModule,
    NbAccordionModule,
  ],
  template: `
    <nb-card [class]="'info-panel info-panel--' + variant">
      <nb-accordion *ngIf="collapsible">
        <nb-accordion-item [expanded]="!initiallyCollapsed">
          <nb-accordion-item-header>
            <div class="info-panel__header">
              <h3 class="info-panel__title">{{ title }}</h3>
              <p *ngIf="subtitle" class="info-panel__subtitle">{{ subtitle }}</p>
            </div>
          </nb-accordion-item-header>
          <nb-accordion-item-body>
            <div class="info-panel__content">
              <div *ngFor="let item of items" class="info-panel__item">
                <div class="info-panel__item-label">
                  <nb-icon *ngIf="item.icon" [icon]="item.icon"></nb-icon>
                  {{ item.label }}
                </div>
                <div class="info-panel__item-value" [ngSwitch]="item.type">
                  <!-- Text value -->
                  <span *ngSwitchDefault>{{ item.value }}</span>

                  <!-- Badge value -->
                  <nb-badge
                    *ngSwitchCase="'badge'"
                    [text]="item.value.toString()"
                    [status]="item.status || 'basic'"
                  ></nb-badge>

                  <!-- Progress value -->
                  <nb-progress-bar
                    *ngSwitchCase="'progress'"
                    [value]="item.value as number"
                    [status]="item.status || 'primary'"
                    size="tiny"
                  ></nb-progress-bar>

                  <!-- Boolean value -->
                  <nb-icon
                    *ngSwitchCase="'boolean'"
                    [icon]="item.value ? 'checkmark-circle-2' : 'close-circle'"
                    [status]="item.value ? 'success' : 'danger'"
                  ></nb-icon>
                </div>
              </div>
            </div>
          </nb-accordion-item-body>
        </nb-accordion-item>
      </nb-accordion>

      <ng-container *ngIf="!collapsible">
        <nb-card-header>
          <div class="info-panel__header">
            <h3 class="info-panel__title">{{ title }}</h3>
            <p *ngIf="subtitle" class="info-panel__subtitle">{{ subtitle }}</p>
          </div>
        </nb-card-header>
        <nb-card-body>
          <div class="info-panel__content">
            <div *ngFor="let item of items" class="info-panel__item">
              <div class="info-panel__item-label">
                <nb-icon *ngIf="item.icon" [icon]="item.icon"></nb-icon>
                {{ item.label }}
              </div>
              <div class="info-panel__item-value" [ngSwitch]="item.type">
                <!-- Text value -->
                <span *ngSwitchDefault>{{ item.value }}</span>

                <!-- Badge value -->
                <nb-badge
                  *ngSwitchCase="'badge'"
                  [text]="item.value.toString()"
                  [status]="item.status || 'basic'"
                ></nb-badge>

                <!-- Progress value -->
                <nb-progress-bar
                  *ngSwitchCase="'progress'"
                  [value]="item.value as number"
                  [status]="item.status || 'primary'"
                  size="tiny"
                ></nb-progress-bar>

                <!-- Boolean value -->
                <nb-icon
                  *ngSwitchCase="'boolean'"
                  [icon]="item.value ? 'checkmark-circle-2' : 'close-circle'"
                  [status]="item.value ? 'success' : 'danger'"
                ></nb-icon>
              </div>
            </div>
          </div>
        </nb-card-body>
      </ng-container>
    </nb-card>
  `,
  styles: [
    `
      .info-panel {
        &--bordered {
          border: 1px solid nb-theme(border-basic-color-3);
        }

        &--shadowed {
          box-shadow: nb-theme(shadow);
        }

        &__header {
          display: flex;
          flex-direction: column;
          gap: nb-theme(spacing-2);
        }

        &__title {
          margin: 0;
          color: nb-theme(text-basic-color);
          font-size: nb-theme(text-heading-6-font-size);
          font-weight: nb-theme(text-heading-6-font-weight);
          line-height: nb-theme(text-heading-6-line-height);
        }

        &__subtitle {
          margin: 0;
          color: nb-theme(text-hint-color);
          font-size: nb-theme(text-subtitle-2-font-size);
          line-height: nb-theme(text-subtitle-2-line-height);
        }

        &__content {
          display: flex;
          flex-direction: column;
          gap: nb-theme(spacing-3);
        }

        &__item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: nb-theme(spacing-2) 0;
          border-bottom: 1px solid nb-theme(border-basic-color-3);

          &:last-child {
            border-bottom: none;
            padding-bottom: 0;
          }

          &-label {
            display: flex;
            align-items: center;
            gap: nb-theme(spacing-2);
            color: nb-theme(text-hint-color);

            nb-icon {
              font-size: 1.25rem;
            }
          }

          &-value {
            display: flex;
            align-items: center;
            gap: nb-theme(spacing-2);
            color: nb-theme(text-basic-color);

            nb-progress-bar {
              width: 100px;
            }

            nb-icon {
              font-size: 1.25rem;
            }
          }
        }

        // Dark theme adjustments
        :host-context([data-theme='dark']) & {
          &--bordered {
            border-color: nb-theme(border-basic-color-4);
          }

          &__item {
            border-color: nb-theme(border-basic-color-4);
          }
        }
      }
    `,
  ],
})
export class PanelModule {
  @Input() title = '';
  @Input() subtitle?: string;
  @Input() items: InfoPanelItem[] = [];
  @Input() variant: 'default' | 'bordered' | 'shadowed' = 'default';
  @Input() collapsible = false;
  @Input() initiallyCollapsed = false;
}
