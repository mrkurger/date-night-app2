

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NebularModule } from '../../nebular.module';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component';

export interface HeaderAction {
  id: string;
  label: string;
  icon?: string;
  status?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'basic';
  primary?: boolean;
  action?: () => void;
}

/**
 * Page Header Component
 *
 * A modern page header component using Nebular UI components.
 * Features title, breadcrumbs, actions, and optional user avatar.
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbUserModule,
    NbBadgeModule,
    BreadcrumbsComponent
  ],
  template: `
    <div
      class="page-header"
      [style.backgroundImage]="backgroundImage ? 'url(' + backgroundImage + ')' : ''"
    >
      <div class="page-header__content">
        <!-- Back link -->
        <a
          *ngIf="backLink"
          [routerLink]="backLink"
          class="page-header__back-link"
          nbButton
          ghost
          size="small"
        >
          <nb-icon icon="arrow-back-outline"></nb-icon>
          Back
        </a>

        <!-- Breadcrumbs -->
        <app-breadcrumbs
          *ngIf="breadcrumbs?.length"
          [items]="breadcrumbs"
          class="page-header__breadcrumbs"
        ></app-breadcrumbs>

        <div class="page-header__main">
          <div class="page-header__title-group">
            <!-- Avatar -->
            <nb-user
              *ngIf="avatarUrl"
              [name]="avatarName"
              [picture]="avatarUrl"
              size="large"
              [showTitle]="false"
            >
              <nb-badge
                *ngIf="avatarIsOnline !== undefined"
                [status]="avatarIsOnline ? 'success' : 'basic'"
                position="bottom right"
                [text]="avatarIsOnline ? 'Online' : 'Offline'"
              ></nb-badge>
            </nb-user>

            <!-- Title and subtitle -->
            <div class="page-header__titles">
              <h1 class="page-header__title">{{ title }}</h1>
              <p *ngIf="subtitle" class="page-header__subtitle">{{ subtitle }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="page-header__actions" *ngIf="actions?.length">
            <button
              *ngFor="let action of actions"
              nbButton
              [status]="action.status || (action.primary ? 'primary' : 'basic')"
              [ghost]="!action.primary"
              (click)="onActionClick(action, $event)"
            >
              <nb-icon [icon]="action.icon" *ngIf="action.icon"></nb-icon>
              {{ action.label }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page-header {
        background-color: nb-theme(background-basic-color-1);
        background-size: cover;
        background-position: center;
        padding: nb-theme(padding-lg);
        margin-bottom: nb-theme(margin-lg);
        border-radius: nb-theme(border-radius);
        box-shadow: nb-theme(shadow);

        &__content {
          max-width: 1200px;
          margin: 0 auto;
        }

        &__back-link {
          margin-bottom: nb-theme(margin);
          display: inline-flex;
          align-items: center;
          gap: nb-theme(spacing-2);
        }

        &__breadcrumbs {
          margin-bottom: nb-theme(margin);
        }

        &__main {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: nb-theme(spacing-lg);
          flex-wrap: wrap;
        }

        &__title-group {
          display: flex;
          align-items: center;
          gap: nb-theme(spacing-lg);
        }

        &__titles {
          display: flex;
          flex-direction: column;
          gap: nb-theme(spacing-2);
        }

        &__title {
          margin: 0;
          color: nb-theme(text-basic-color);
          font-size: nb-theme(text-heading-1-font-size);
          font-weight: nb-theme(text-heading-1-font-weight);
          line-height: nb-theme(text-heading-1-line-height);
        }

        &__subtitle {
          margin: 0;
          color: nb-theme(text-hint-color);
          font-size: nb-theme(text-subtitle-font-size);
          line-height: nb-theme(text-subtitle-line-height);
        }

        &__actions {
          display: flex;
          gap: nb-theme(spacing);
          align-items: center;
        }

        // Dark theme adjustments
        :host-context([data-theme='dark']) & {
          background-color: nb-theme(background-basic-color-2);
        }

        // Responsive adjustments
        @media (max-width: 768px) {
          padding: nb-theme(padding);

          &__main {
            flex-direction: column;
            align-items: stretch;
          }

          &__actions {
            margin-top: nb-theme(margin);
          }
        }
      }
    `,
  ],
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle?: string;
  @Input() breadcrumbs: { title: string; link?: string[]; icon?: string }[] = [];
  @Input() actions: HeaderAction[] = [];
  @Input() backLink?: string;
  @Input() backgroundImage?: string;
  @Input() avatarUrl?: string;
  @Input() avatarName?: string;
  @Input() avatarIsOnline?: boolean;

  @Output() actionClick = new EventEmitter<HeaderAction>();

  /**
   * Handle action click
   * @param action The action that was clicked
   * @param event The click event
   */
  onActionClick(action: HeaderAction, event: Event): void {
    event.preventDefault();
    this.actionClick.emit(action);

    if (action.action) {
      action.action();
    }
  }
}
