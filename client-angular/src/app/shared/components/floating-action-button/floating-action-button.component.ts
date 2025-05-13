import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbButtonModule, NbIconModule, NbTooltipModule } from '@nebular/theme';

@Component({
  selector: 'app-floating-action-button',
  standalone: true,
  imports: [CommonModule, NbButtonModule, NbIconModule, NbTooltipModule],
  template: `
    <button
      nbButton
      [status]="status"
      [size]="size"
      class="fab"
      [class.fab--expanded]="expanded"
      [nbTooltip]="tooltip"
      [nbTooltipPlacement]="tooltipPosition"
      (click)="onClick($event)"
    >
      <nb-icon [icon]="icon"></nb-icon>
      <span class="fab__label" *ngIf="label && expanded">{{ label }}</span>
    </button>

    <div
      class="fab-menu"
      *ngIf="menuItems && menuItems.length > 0"
      [class.fab-menu--open]="expanded"
    >
      <button
        *ngFor="let item of menuItems"
        nbButton
        [status]="item.status || 'primary'"
        size="medium"
        class="fab-menu__item"
        [nbTooltip]="item.tooltip"
        [nbTooltipPlacement]="tooltipPosition"
        (click)="onMenuItemClick($event, item)"
      >
        <nb-icon [icon]="item.icon"></nb-icon>
        <span class="fab-menu__label" *ngIf="item.label && expanded">{{ item.label }}</span>
      </button>
    </div>
  `,
  styles: [
    `
      :host {
        position: fixed;
        right: var(--margin);
        bottom: var(--margin);
        display: flex;
        flex-direction: column-reverse;
        align-items: flex-end;
        gap: var(--spacing);
        z-index: 1000;
      }

      .fab {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing);
        border-radius: 50%;
        padding: 0;
        width: 56px;
        height: 56px;
        transition: all 0.3s ease;
        box-shadow: var(--shadow);

        &--expanded {
          border-radius: 28px;
          padding: 0 var(--padding);
          width: auto;

          .fab__label {
            opacity: 1;
            width: auto;
            margin-right: var(--spacing-xs);
          }
        }

        nb-icon {
          font-size: 1.5rem;
        }
      }

      .fab__label {
        opacity: 0;
        width: 0;
        white-space: nowrap;
        overflow: hidden;
        transition: all 0.3s ease;
      }

      .fab-menu {
        display: flex;
        flex-direction: column;
        gap: var(--spacing);
        opacity: 0;
        transform: translateY(20px);
        pointer-events: none;
        transition: all 0.3s ease;

        &--open {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }
      }

      .fab-menu__item {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing);
        border-radius: 50%;
        padding: 0;
        width: 48px;
        height: 48px;
        transition: all 0.3s ease;

        &:hover {
          transform: scale(1.1);
        }

        nb-icon {
          font-size: 1.25rem;
        }
      }

      .fab-menu__label {
        opacity: 0;
        width: 0;
        white-space: nowrap;
        overflow: hidden;
        transition: all 0.3s ease;
      }

      :host-context(.fab-menu--open) {
        .fab-menu__item {
          border-radius: 24px;
          padding: 0 var(--padding);
          width: auto;

          .fab-menu__label {
            opacity: 1;
            width: auto;
            margin-right: var(--spacing-xs);
          }
        }
      }

      @media (max-width: 768px) {
        :host {
          right: var(--margin-sm);
          bottom: var(--margin-sm);
        }
      }
    `,
  ],
})
export class FloatingActionButtonComponent {
  @Input() icon = 'plus-outline';
  @Input() label?: string;
  @Input() tooltip?: string;
  @Input() tooltipPosition: 'top' | 'right' | 'bottom' | 'left' = 'left';
  @Input() status: 'primary' | 'success' | 'info' | 'warning' | 'danger' = 'primary';
  @Input() size: 'tiny' | 'small' | 'medium' | 'large' | 'giant' = 'large';
  @Input() expanded = false;
  @Input() menuItems?: Array<{
    icon: string;
    label?: string;
    tooltip?: string;
    status?: 'primary' | 'success' | 'info' | 'warning' | 'danger';
    data?: any;
  }>;

  @Output() click = new EventEmitter<MouseEvent>();
  @Output() menuItemClick = new EventEmitter<{
    event: MouseEvent;
    item: any;
  }>();

  onClick(event: MouseEvent) {
    this.click.emit(event);
  }

  onMenuItemClick(event: MouseEvent, item: any) {
    this.menuItemClick.emit({ event, item });
  }
}
