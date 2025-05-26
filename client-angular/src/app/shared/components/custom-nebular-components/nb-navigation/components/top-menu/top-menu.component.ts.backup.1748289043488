import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NbMenuItem } from '@nebular/theme';

@Component({
    selector: 'nb-top-menu',
    template: `
    <nav class="top-menu">
      <ul class="menu-items">
        <li
          *ngFor="let item of items"
          class="menu-item"
          [class.has-submenu]="item.children?.length"
        >
          <!-- Menu Item with Children -->
          <div
            *ngIf="item.children?.length; else singleItem"
            [nbContextMenu]="item.children"
            [nbContextMenuTag]="item.tag || 'top-menu'"
            class="menu-trigger"
            [class.active]="item.selected"
          >
            <nb-icon *ngIf="item.icon" [icon]="item.icon" [status]="item.iconStatus"></nb-icon>
            <span class="menu-title">{{ item.title }}</span>
            <nb-icon class="expand-state" icon="chevron-down-outline"></nb-icon>
            <nb-badge
              *ngIf="item.badge"
              [text]="item.badge.text"
              [status]="item.badge.status"
            ></nb-badge>
          </div>

          <!-- Single Menu Item -->
          <ng-template #singleItem>
            <a
              [routerLink]="item.link"
              [queryParams]="item.queryParams"
              [fragment]="item.fragment"
              [class.active]="item.selected"
              (click)="onItemClick(item)"
            >
              <nb-icon *ngIf="item.icon" [icon]="item.icon" [status]="item.iconStatus"></nb-icon>
              <span class="menu-title">{{ item.title }}</span>
              <nb-badge
                *ngIf="item.badge"
                [text]="item.badge.text"
                [status]="item.badge.status"
              ></nb-badge>
            </a>
          </ng-template>
        </li>
      </ul>
    </nav>
  `,
    styles: [
        `
      .top-menu {
        display: flex;
        align-items: center;
        height: 100%;
      }

      .menu-items {
        display: flex;
        align-items: center;
        margin: 0;
        padding: 0;
        list-style-type: none;
        gap: 0.5rem;
      }

      .menu-item {
        position: relative;

        &.has-submenu {
          .menu-trigger {
            cursor: pointer;
          }
        }

        a,
        .menu-trigger {
          display: flex;
          align-items: center;
          padding: 0.5rem 1rem;
          color: nb-theme(text-basic-color);
          text-decoration: none;
          border-radius: nb-theme(border-radius);
          transition: background-color 0.2s;

          &:hover {
            background-color: nb-theme(background-basic-hover-color);
          }

          &.active {
            background-color: nb-theme(color-primary-transparent-100);
            color: nb-theme(color-primary-default);

            nb-icon {
              color: nb-theme(color-primary-default);
            }
          }
        }

        nb-icon {
          margin-right: 0.5rem;
          color: nb-theme(text-hint-color);

          &.expand-state {
            margin-right: 0;
            margin-left: 0.25rem;
            font-size: 1rem;
          }
        }

        .menu-title {
          font-size: nb-theme(text-button-font-size);
          font-weight: nb-theme(text-button-font-weight);
          line-height: nb-theme(text-button-line-height);
        }

        nb-badge {
          margin-left: 0.5rem;
        }
      }

      ::ng-deep {
        nb-context-menu {
          min-width: 200px;
          padding: 0.5rem;

          .menu-items {
            flex-direction: column;
            gap: 0.25rem;
          }

          .menu-item {
            width: 100%;

            a {
              width: 100%;
              padding: 0.5rem;
            }
          }
        }
      }
    `,
    ],
    standalone: false
})
export class NbTopMenuComponent {
  @Input() items: NbMenuItem[] = [];
  @Output() itemClick = new EventEmitter<NbMenuItem>();

  onItemClick(item: NbMenuItem) {
    if (!item.children?.length) {
      this.itemClick.emit(item);
    }
  }
}
