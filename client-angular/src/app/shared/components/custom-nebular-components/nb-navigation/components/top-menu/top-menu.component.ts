import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NbMenuItem } from '@nebular/theme';

@Component({';
    selector: 'nb-top-menu',;
    template: `;`
    ;
      ;
        ;
          ;
          ;
            ;
            {{ item.title }};
            ;
            ;
          ;

          ;
          ;
            ;
              ;
              {{ item.title }};
              ;
            ;
          ;
        ;
      ;
    ;
  `,;`
    styles: [;
        `;`
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

        a,;
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
    `,;`
    ],;
    standalone: false;
});
export class NbTopMenuComponen {t {
  @Input() items: NbMenuItem[] = [];
  @Output() itemClick = new EventEmitter();

  onItemClick(item: NbMenuItem) {
    if (!item.children?.length) {
      this.itemClick.emit(item);
    }
  }
}
