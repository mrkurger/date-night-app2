import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { _NebularModule } from '../../nebular.module';
import {
  NbMenuItem,
  NbMenuService,
  ,
  ,
  ,
  ,
} from '@nebular/theme';

export interface AvatarMenuItem extends NbMenuItem {
  data?: any;
}

/**
 * Avatar Component
 *
 * A modern avatar component using Nebular UI components.
 * Features user image, name, online status, and optional context menu.
 */
@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule,
    RouterModule],
  template: `
    <div class="avatar" [class]="'avatar--' + size">
      <nb-user
        [picture]="imageUrl"
        [name]="showName ? name : ''"
        [title]="showTitle ? title : ''"
        [size]="size"
        [nbContextMenu]="menuItems"
        [nbContextMenuTag]="menuTag"
        [class.avatar--clickable]="menuItems?.length"
      >
        <nb-badge
          *ngIf="showOnlineStatus"
          [status]="isOnline ? 'success' : 'basic'"
          position="bottom right"
          [text]="isOnline ? 'Online' : 'Offline'"
        ></nb-badge>
      </nb-user>
    </div>
  `,
  styles: [
    `
      .avatar {
        display: inline-block;
        position: relative;
      }

      .avatar--clickable {
        cursor: pointer;
      }

      /* Size variations */
      .avatar--tiny ::ng-deep nb-user {
        font-size: 0.75rem;
      }

      .avatar--small ::ng-deep nb-user {
        font-size: 0.875rem;
      }

      .avatar--medium ::ng-deep nb-user {
        font-size: 1rem;
      }

      .avatar--large ::ng-deep nb-user {
        font-size: 1.25rem;
      }

      .avatar--giant ::ng-deep nb-user {
        font-size: 1.5rem;
      }

      /* Online status badge */
      .avatar ::ng-deep nb-badge {
        position: absolute;
        bottom: 0;
        right: 0;
        transform: translate(25%, 25%);
      }
    `,
  ],
})
export class AvatarComponent {
  @Input() imageUrl = '/assets/img/default-profile.jpg';
  @Input() name = '';
  @Input() title = '';
  @Input() size: 'tiny' | 'small' | 'medium' | 'large' | 'giant' = 'medium';
  @Input() isOnline?: boolean;
  @Input() showOnlineStatus = false;
  @Input() showName = true;
  @Input() showTitle = false;
  @Input() menuItems: AvatarMenuItem[] = [];

  @Output() menuItemClick = new EventEmitter<AvatarMenuItem>();

  readonly menuTag = 'avatar-menu-' + Math.random().toString(36).substring(7);

  constructor(private nbMenuService: NbMenuService) {
    // Subscribe to menu item clicks
    this.nbMenuService.onItemClick().subscribe((event) => {
      if (event.tag === this.menuTag && event.item) {
        this.menuItemClick.emit(event.item as AvatarMenuItem);
      }
    });
  }

  /**
   * Get initials from name
   */
  getInitials(): string {
    if (!this.name) return '';

    const nameParts = this.name.split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }

    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  }
}
