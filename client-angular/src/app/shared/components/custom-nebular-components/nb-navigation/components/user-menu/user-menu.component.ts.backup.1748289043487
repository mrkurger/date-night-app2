import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NbMenuItem } from '@nebular/theme';
import { UserData } from '../../nb-navigation.component';

@Component({
    selector: 'nb-user-menu',
    template: `
    <div
      class="user-menu"
      [nbContextMenu]="items"
      nbContextMenuTag="user-menu"
      [nbContextMenuPlacement]="'bottom-end'"
    >
      <div class="user-info">
        <nb-user
          [name]="userData.name"
          [title]="userData.title"
          [picture]="userData.picture"
          size="medium"
        >
          <div *nbUserPipeMenu class="user-menu-content">
            <nb-icon icon="chevron-down-outline"></nb-icon>
            <nb-badge
              *ngIf="userData.notifications"
              [text]="userData.notifications.toString()"
              status="danger"
              position="top right"
            ></nb-badge>
          </div>
        </nb-user>
      </div>
    </div>
  `,
    styles: [
        `
      .user-menu {
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: nb-theme(border-radius);
        transition: background-color 0.2s;

        &:hover {
          background-color: nb-theme(background-basic-hover-color);
        }
      }

      .user-info {
        display: flex;
        align-items: center;
      }

      .user-menu-content {
        display: flex;
        align-items: center;
        margin-left: 0.5rem;
      }

      nb-icon {
        color: nb-theme(text-hint-color);
        font-size: 1rem;
      }

      nb-badge {
        margin-left: 0.5rem;
      }

      ::ng-deep {
        nb-context-menu {
          min-width: 200px;
          padding: 0.5rem;

          .menu-items {
            margin: 0;
            padding: 0;
            list-style-type: none;
          }

          .menu-item {
            a {
              display: flex;
              align-items: center;
              padding: 0.5rem;
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
            }

            .menu-title {
              flex: 1;
              font-size: nb-theme(text-button-font-size);
              font-weight: nb-theme(text-button-font-weight);
              line-height: nb-theme(text-button-line-height);
            }

            nb-badge {
              margin-left: 0.5rem;
            }
          }

          .menu-divider {
            margin: 0.5rem 0;
            border-top: 1px solid nb-theme(divider-color);
          }
        }
      }
    `,
    ],
    standalone: false
})
export class NbUserMenuComponent {
  @Input() userData!: UserData;
  @Input() items: NbMenuItem[] = [];
  @Output() itemClick = new EventEmitter<NbMenuItem>();

  onItemClick(item: NbMenuItem) {
    this.itemClick.emit(item);
  }
}
