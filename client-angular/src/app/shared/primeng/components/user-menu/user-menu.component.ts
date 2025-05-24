import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/menuitem';
import { BadgeModule } from 'primeng/badge';
export interface UserData {
  name: string;
  title?: string;
  picture?: string;
  notifications?: number;
}

@Component({
  selector: 'p-user-menu',
  template: `
    <div class="user-menu">
      <div 
        class="user-info" 
        (click)="menu.toggle($event)"
        [pTooltip]="userData?.title || ''"
      >
        <p-avatar 
          [image]="userData?.picture" 
          [label]="getUserInitials()"
          shape="circle"
          size="large"
          [style]="{ cursor: 'pointer' }"
        >
          <span 
            *ngIf="userData?.notifications" 
            class="user-badge"
            [pBadge]="userData.notifications.toString()"
            severity="danger"
          ></span>
        </p-avatar>
        <div class="user-details" *ngIf="!compact">
          <span class="user-name">{{ userData?.name }}</span>
          <span class="user-title" *ngIf="userData?.title">{{ userData.title }}</span>
        </div>
      </div>

      <p-menu 
        #menu 
        [model]="menuItems" 
        [popup]="true"
        (click)="onMenuClick($event)"
      ></p-menu>
    </div>
  `,
  styles: [
    \`
      .user-menu {
        display: flex;
        align-items: center;
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem;
        border-radius: var(--border-radius);
        cursor: pointer;
        transition: background-color 0.2s;

        &:hover {
          background-color: var(--surface-hover);
        }
      }

      .user-details {
        display: flex;
        flex-direction: column;
      }

      .user-name {
        font-weight: 600;
        color: var(--text-color);
      }

      .user-title {
        font-size: 0.875rem;
        color: var(--text-color-secondary);
      }

      .user-badge {
        position: absolute;
        top: -0.5rem;
        right: -0.5rem;
      }

      :host ::ng-deep {
        .p-menu {
          min-width: 200px;
        }
      }
    \`
  ],
  standalone: true,
  imports: [BadgeModule, MenuItem, MenuModule, AvatarModule, 
    CommonModule,
    AvatarModule,
    MenuModule,
    BadgeModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserMenuComponent {
  @Input() userData?: UserData;
  @Input() menuItems: MenuItem[] = [];
  @Input() compact = false;

  @Output() itemClick = new EventEmitter<MenuItem>();

  getUserInitials(): string {
    if (!this.userData?.name) return '';
    return this.userData.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  onMenuClick(event: any) {
    const menuItem = event.item as MenuItem;
    if (menuItem && !menuItem.items) {
      this.itemClick.emit(menuItem);
    }
  }
}
