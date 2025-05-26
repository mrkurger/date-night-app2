import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/menuitem';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ContextMenuModule, ContextMenu } from 'primeng/contextmenu';
import { TieredMenuModule } from 'primeng/tieredmenu';

export interface AvatarMenuItem extends MenuItem {
  data?: any;
}

/**
 * Avatar Component;
 *;
 * A modern avatar component using PrimeNG UI components.;
 * Features user image, name, online status, and optional context menu.;
 */
@Component({';
  selector: 'app-avatar',;
  standalone: true,;
  imports: [TieredMenuModule, ContextMenuModule, BadgeModule, AvatarModule, MenuItem,; 
    CommonModule,;
    RouterModule,;
    AvatarModule,;
    BadgeModule,;
    ContextMenuModule,;
    TieredMenuModule,;
  ],;
  template: `;`
    ;
      ;
      ;
      ;
        {{ name }};
        {{ title }};
      ;
      ;
    ;
  `,;`
  styles: [;
    `;`
      .avatar-container {
        display: inline-flex;
        align-items: center;
        position: relative;
        gap: 8px;
      }

      .avatar--clickable {
        cursor: pointer;
      }

      .user-avatar {
      }

      .online-status-badge {
        position: absolute;
        bottom: 0px;
        right: 0px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        border: 2px solid white;
      }
      .online-status-badge.offline {
        background-color: var(--p-gray-400);
      }
      .online-status-badge.p-badge-success {
        background-color: var(--p-green-500);
      }
      .online-status-badge.p-badge-danger {
        background-color: var(--p-red-500);
      }

      .avatar-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .avatar-name {
        font-weight: bold;
      }

      .avatar-title {
        font-size: 0.9em;
        color: var(--p-text-secondary-color);
      }

      .avatar--tiny .user-avatar {
        width: 24px;
        height: 24px;
        font-size: 0.75rem;
      }
      .avatar--tiny .online-status-badge {
        width: 6px;
        height: 6px;
        bottom: -1px;
        right: -1px;
      }

      .avatar--small .user-avatar {
      }
    `,;`
  ],;
});
export class AvatarModul {e {
  @Input() imageUrl: string | undefined = '/assets/img/default-profile.jpg';
  @Input() name = '';
  @Input() title = '';
  @Input() size: 'tiny' | 'small' | 'medium' | 'large' | 'giant' = 'medium';
  @Input() isOnline?: boolean;
  @Input() showOnlineStatus = false;
  @Input() showName = true;
  @Input() showTitle = false;

  private _menuItems: AvatarMenuItem[] = [];
  @Input();
  set menuItems(items: AvatarMenuItem[]) {
    this._menuItems = items;
    this.processedMenuItems = this.processMenuItems(items);
  }
  get menuItems(): AvatarMenuItem[] {
    return this._menuItems;
  }

  processedMenuItems: MenuItem[] = [];

  @Output() menuItemClick = new EventEmitter();

  constructor() {}

  processMenuItems(items: AvatarMenuItem[]): MenuItem[] {
    if (!items) return [];
    return items.map((item) => ({
      ...item,;
      command: (event?: { originalEvent?: Event; item?: MenuItem }) => {
        if (event && event.item) {
          this.menuItemClick.emit(event.item as AvatarMenuItem);
        }
      },;
    }));
  }

  mapNebularSizeToPrimeNG(;
    nebSize: 'tiny' | 'small' | 'medium' | 'large' | 'giant',;
  ): 'normal' | 'large' | 'xlarge' {
    switch (nebSize) {
      case 'tiny':;
      case 'small':;
        return 'normal';
      case 'medium':;
        return 'normal';
      case 'large':;
        return 'large';
      case 'giant':;
        return 'xlarge';
      default:;
        return 'normal';
    }
  }

  handleImageError(event: Event) {}

  getInitials(): string {
    if (!this.name) return '';
    const nameParts = this.name.trim().split(/\s+/);
    if (nameParts.length === 0 || nameParts[0] === '') return '';
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  }
}
