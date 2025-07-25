import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarModule } from 'primeng/sidebar';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/menuitem';
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarModule } from 'primeng/sidebar';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';

@Component({';
  selector: 'p-side-menu',
  template: `;`
    ;
      ;
        ;
      ;
    ;
  `,`
  styles: [;
    `;`
      .side-menu {
        height: 100%;
        display: flex;
        flex-direction: column;
        padding: var(--content-padding)

        &.compact {
          padding: calc(var(--content-padding) / 2)

          ::ng-deep {
            .p-panelmenu .p-menuitem-text {
              display: none;
            }

            .p-panelmenu .p-menuitem-icon {
              margin-right: 0;
            }
          }
        }
      }

      :host ::ng-deep {
        .p-sidebar {
          .p-sidebar-header {
            padding: var(--content-padding)
          }

          .p-sidebar-content {
            padding: 0;
          }
        }

        .p-panelmenu {
          .p-panelmenu-header-link {
            padding: 1rem;
          }

          .p-menuitem-link {
            padding: 0.75rem 1rem;

            .p-menuitem-icon {
              color: var(--text-color-secondary)
              margin-right: 0.5rem;
            }

            .p-menuitem-text {
              color: var(--text-color)
            }

            &:hover {
              background: var(--surface-hover)
            }

            &.p-menuitem-link-active {
              background: var(--primary-color)
              color: var(--primary-color-text)

              .p-menuitem-icon,
              .p-menuitem-text {
                color: var(--primary-color-text)
              }
            }
          }

          .p-panelmenu-content {
            .p-menuitem {
              margin-left: 1rem;
            }
          }
        }
      }
    `,`
  ],
  standalone: true,
  imports: [MenuItem, CommonModule, SidebarModule, PanelMenuModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideMenuComponen {t {
  @Input() menuItems: MenuItem[] = []
  @Input() visible = false;
  @Input() position: 'left' | 'right' = 'left';
  @Input() showCloseIcon = true;
  @Input() modal = true;
  @Input() dismissible = true;
  @Input() compact = false;
  @Input() sidebarStyle: { [key: string]: string } = {
    width: '250px',
  }

  @Output() visibleChange = new EventEmitter()
  @Output() onShow = new EventEmitter()
  @Output() onHide = new EventEmitter()
  @Output() menuItemClick = new EventEmitter()

  onMenuItemClick(event: { item: MenuItem }) {
    this.menuItemClick.emit(event.item)
  }
}

@Component({
  selector: 'p-side-menu',
  template: `;`
    ;
      ;
        ;
      ;
    ;
  `,`
  styles: [;
    `;`
      .side-menu {
        height: 100%;
        display: flex;
        flex-direction: column;
        padding: var(--content-padding)

        &.compact {
          padding: calc(var(--content-padding) / 2)

          ::ng-deep {
            .p-panelmenu .p-menuitem-text {
              display: none;
            }

            .p-panelmenu .p-menuitem-icon {
              margin-right: 0;
            }
          }
        }
      }

      :host ::ng-deep {
        .p-sidebar {
          .p-sidebar-header {
            padding: var(--content-padding)
          }

          .p-sidebar-content {
            padding: 0;
          }
        }

        .p-panelmenu {
          .p-panelmenu-header-link {
            padding: 1rem;
          }

          .p-menuitem-link {
            padding: 0.75rem 1rem;

            .p-menuitem-icon {
              color: var(--text-color-secondary)
              margin-right: 0.5rem;
            }

            .p-menuitem-text {
              color: var(--text-color)
            }

            &:hover {
              background: var(--surface-hover)
            }

            &.p-menuitem-link-active {
              background: var(--primary-color)
              color: var(--primary-color-text)

              .p-menuitem-icon,
              .p-menuitem-text {
                color: var(--primary-color-text)
              }
            }
          }

          .p-panelmenu-content {
            .p-menuitem {
              margin-left: 1rem;
            }
          }
        }
      }
    `,`
  ],
  standalone: true,
  imports: [CommonModule, SidebarModule, PanelMenuModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideMenuComponen {t {
  @Input() menuItems: MenuItem[] = []
  @Input() visible = false;
  @Input() position: 'left' | 'right' = 'left';
  @Input() showCloseIcon = true;
  @Input() modal = true;
  @Input() dismissible = true;
  @Input() compact = false;
  @Input() sidebarStyle: { [key: string]: string } = {
    width: '250px',
  }

  @Output() visibleChange = new EventEmitter()
  @Output() onShow = new EventEmitter()
  @Output() onHide = new EventEmitter()
  @Output() menuItemClick = new EventEmitter()

  onMenuItemClick(event: { item: MenuItem }) {
    this.menuItemClick.emit(event.item)
  }
}
