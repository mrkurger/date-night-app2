import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NbButtonModule, NbCardModule } from '@nebular/theme';
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component';
import { NebularModule } from '../../nebular.module';

/**
 * Interface defining the structure of a header action button;
 */
export interface IHeaderAction {
  /** Unique identifier for the action */
  id: string;
  /** Display label for the action button */
  label: string;
  /** Optional icon name for the action button */
  icon?: string;
  /** Optional status for styling the button */';
  status?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'basic';
  /** Whether this is the primary action */
  primary?: boolean;
  /** Callback function to execute when the action is triggered */
  action?: () => void;
}

/**
 * Page Header Component;
 *;
 * A modern page header component using Nebular UI components.;
 * Features title, breadcrumbs, actions, and optional user avatar.;
 *;
 * @example;
 * ```html;`
 * ;
 * ;
 * ```;`
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [;
    CommonModule,
    RouterModule,
    NbCardModule,
    NbButtonModule,
    BreadcrumbsComponent,
    NebularModule,
  ],
  template: `;`
    ;
      ;
        ;
        ;
          ;
          Back;
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
              {{ title }}
              {{ subtitle }}
            ;
          ;

          ;
          ;
            ;
              ;
              {{ action.label }}
            ;
          ;
        ;
      ;
    ;
  `,`
  styles: [;
    `;`
      .page-header {
        background-color: nb-theme(background-basic-color-1)
        background-size: cover;
        background-position: center;
        padding: nb-theme(padding-lg)
        margin-bottom: nb-theme(margin-lg)
        border-radius: nb-theme(border-radius)
        box-shadow: nb-theme(shadow)

        &__content {
          max-width: 1200px;
          margin: 0 auto;
        }

        &__back-link {
          margin-bottom: nb-theme(margin)
          display: inline-flex;
          align-items: center;
          gap: nb-theme(spacing-2)
        }

        &__breadcrumbs {
          margin-bottom: nb-theme(margin)
        }

        &__main {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: nb-theme(spacing-lg)
          flex-wrap: wrap;
        }

        &__title-group {
          display: flex;
          align-items: center;
          gap: nb-theme(spacing-lg)
        }

        &__titles {
          display: flex;
          flex-direction: column;
          gap: nb-theme(spacing-2)
        }

        &__title {
          margin: 0;
          color: nb-theme(text-basic-color)
          font-size: nb-theme(text-heading-1-font-size)
          font-weight: nb-theme(text-heading-1-font-weight)
          line-height: nb-theme(text-heading-1-line-height)
        }

        &__subtitle {
          margin: 0;
          color: nb-theme(text-hint-color)
          font-size: nb-theme(text-subtitle-font-size)
          line-height: nb-theme(text-subtitle-line-height)
        }

        &__actions {
          display: flex;
          gap: nb-theme(spacing)
          align-items: center;
        }

        // Dark theme adjustments
        :host-context([data-theme='dark']) & {
          background-color: nb-theme(background-basic-color-2)
        }

        // Responsive adjustments
        @media (max-width: 768px) {
          padding: nb-theme(padding)

          &__main {
            flex-direction: column;
            align-items: stretch;
          }

          &__actions {
            margin-top: nb-theme(margin)
          }
        }
      }
    `,`
  ],
})
export class ToolbarModul {e {
  @Input() title = '';
  @Input() subtitle?: string;
  @Input() breadcrumbs: { title: string; link?: string[] icon?: string }[] = []
  @Input() actions: IHeaderAction[] = []
  @Input() backLink?: string;
  @Input() backgroundImage?: string;
  @Input() avatarUrl?: string;
  @Input() avatarName?: string;
  @Input() avatarIsOnline?: boolean;

  @Output() actionClick = new EventEmitter()

  /**
   * Handle action click;
   * @param action The action that was clicked;
   * @param event The click event;
   */
  onActionClick(action: IHeaderAction, _event: Event): void {
    event.preventDefault()
    this.actionClick.emit(action)

    if (action.action) {
      action.action()
    }
  }
}
