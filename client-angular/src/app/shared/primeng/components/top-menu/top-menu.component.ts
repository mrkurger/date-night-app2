import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'p-top-menu',
  template: `
    <p-menubar [model]="menuItems" [style]="style" (onMenuItemClick)="onMenuItemClick($event)">
      <ng-template pTemplate="start" *ngIf="startTemplate">
        <ng-content select="[menuStart]"></ng-content>
      </ng-template>

      <ng-template pTemplate="end" *ngIf="endTemplate">
        <ng-content select="[menuEnd]"></ng-content>
      </ng-template>
    </p-menubar>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      :host ::ng-deep {
        .p-menubar {
          padding: 0.5rem;
          background: var(--surface-card);
          border: none;
          border-radius: 0;

          .p-menubar-root-list {
            gap: 0.5rem;
          }

          .p-menuitem-link {
            padding: 0.75rem 1rem;

            .p-menuitem-icon {
              color: var(--text-color-secondary);
              margin-right: 0.5rem;
            }

            .p-menuitem-text {
              color: var(--text-color);
            }

            &:hover {
              background: var(--surface-hover);
            }

            &.p-menuitem-link-active {
              background: var(--primary-color);
              color: var(--primary-color-text);

              .p-menuitem-icon,
              .p-menuitem-text {
                color: var(--primary-color-text);
              }
            }
          }

          .p-submenu-list {
            padding: 0.5rem;
            background: var(--surface-overlay);
            border: 1px solid var(--surface-border);
            box-shadow: var(--overlay-shadow);
          }
        }
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule, MenubarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopMenuComponent {
  @Input() menuItems: MenuItem[] = [];
  @Input() style: { [key: string]: string } = {};
  @Input() startTemplate = false;
  @Input() endTemplate = false;

  @Output() menuItemClick = new EventEmitter<MenuItem>();

  onMenuItemClick(event: { item: MenuItem }) {
    this.menuItemClick.emit(event.item);
  }
}
