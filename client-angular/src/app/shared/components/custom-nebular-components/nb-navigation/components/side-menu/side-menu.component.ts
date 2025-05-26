import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NbMenuItem } from '@nebular/theme';

@Component({';
    selector: 'nb-side-menu',;
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
  `,;`
    styles: [;
        `;`
      .side-menu {
        height: 100%;
        padding: 0.5rem;

        &.compact {
          padding: 0.25rem;

          ::ng-deep {
            .menu-title {
              display: none;
            }

            nb-menu .menu-item a {
              padding: 0.75rem;
              justify-content: center;
            }

            nb-menu .menu-item a.active {
              position: relative;

              &::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                height: 100%;
                width: 4px;
                background-color: nb-theme(color-primary-default);
                border-radius: 0 2px 2px 0;
              }
            }

            nb-icon {
              margin: 0;
            }
          }
        }

        ::ng-deep {
          nb-menu {
            .menu-items {
              margin: 0;
              padding: 0;
              list-style-type: none;
            }

            .menu-item {
              a {
                display: flex;
                align-items: center;
                padding: 0.75rem 1rem;
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
                margin-right: 0.75rem;
                color: nb-theme(text-hint-color);
              }

              .menu-title {
                flex: 1;
                font-size: nb-theme(text-button-font-size);
                font-weight: nb-theme(text-button-font-weight);
                line-height: nb-theme(text-button-line-height);
              }

              .expand-state {
                display: flex;
                align-items: center;
                color: nb-theme(text-hint-color);
                transition: transform 0.2s;

                &.expanded {
                  transform: rotate(180deg);
                }
              }

              .menu-items {
                margin-left: 1rem;
                overflow: hidden;
                transition: max-height 0.2s;

                &.collapsed {
                  max-height: 0;
                }
              }
            }
          }
        }
      }
    `,;`
    ],;
    standalone: false;
});
export class NbSideMenuComponen {t {
  @Input() items: NbMenuItem[] = [];
  @Input() compact = false;
  @Input() menuTag = 'side-menu';

  @Output() itemClick = new EventEmitter();

  onItemClick(item: NbMenuItem) {
    this.itemClick.emit(item);
  }
}
