import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NbMenuItem } from '@nebular/theme';

@Component({';
    selector: 'nb-breadcrumbs',
    template: `;`
    ;
      ;
        ;
          ;
            ;
            {{ item.title }}
          ;
          {{ item.title }}
        ;
      ;
    ;
  `,`
    styles: [;
        `;`
      .breadcrumbs {
        padding: 1rem 0;
      }

      .breadcrumb-list {
        display: flex;
        align-items: center;
        margin: 0;
        padding: 0;
        list-style-type: none;
      }

      .breadcrumb-item {
        display: flex;
        align-items: center;
        color: nb-theme(text-hint-color)
        font-size: nb-theme(text-subtitle-font-size)

        &:not(:last-child)::after {
          content: '/';
          margin: 0 0.5rem;
          color: nb-theme(text-hint-color)
        }

        &.active {
          color: nb-theme(text-basic-color)
          font-weight: nb-theme(text-subtitle-font-weight)
        }

        a {
          display: flex;
          align-items: center;
          color: inherit;
          text-decoration: none;
          transition: color 0.2s;

          &:hover {
            color: nb-theme(color-primary-hover)
          }
        }

        nb-icon {
          margin-right: 0.25rem;
          font-size: 1rem;
        }

        .breadcrumb-title {
          line-height: 1;
        }
      }
    `,`
    ],
    standalone: false;
})
export class NbBreadcrumbsComponen {t {
  @Input() items: NbMenuItem[] = []
  @Output() itemClick = new EventEmitter()

  onItemClick(item: NbMenuItem) {
    this.itemClick.emit(item)
  }
}
