import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { _NebularModule } from '../../../shared/nebular.module';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  NbMenuService
} from '@nebular/theme';

/**
 * Avatar Component
 *
 * This component displays a user avatar with optional dropdown menu.
 * It uses Nebular UI components for consistent styling.
 */
@Component({
  selector: 'nb-user',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
  standalone: true,
  imports: [CommonModule,
    RouterModule
  ],
})
export class AvatarComponent implements OnInit {
  @Input() imageUrl = '/assets/img/default-profile.jpg';
  @Input() name = '';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() isOnline = false;
  @Input() showDropdown = false;
  @Input() dropdownItems: DropdownItem[] = [];
  @Input() useNebularContextMenu = true;

  @Output() avatarClick = new EventEmitter<void>();
  @Output() itemClick = new EventEmitter<DropdownItem>();

  isDropdownOpen = false;
  contextMenuItems: any[] = [];

  constructor(private nbMenuService: NbMenuService) {}

  ngOnInit(): void {
    // Convert dropdown items to Nebular context menu format
    this.contextMenuItems = this.convertToContextMenuItems();

    // Subscribe to menu item clicks
    this.nbMenuService.onItemClick().subscribe(({ item }) => {
      if (item.id) {
        const originalItem = this.dropdownItems.find((i) => i.id === item.id);
        if (originalItem) {
          this.itemClick.emit(originalItem);
          if (originalItem.action) {
            originalItem.action();
          }
        }
      }
    });
  }

  /**
   * Convert dropdown items to Nebular context menu format
   */
  private convertToContextMenuItems(): any[] {
    return this.dropdownItems.map((item) => {
      if (item.divider) {
        return { title: '-', divider: true };
      }

      return {
        id: item.id,
        title: item.label,
        icon: item.icon ? this.getIconName(item.icon) : undefined,
        link: item.route,
      };
    });
  }

  /**
   * Toggle the dropdown menu
   */
  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;

    if (this.isDropdownOpen && !this.useNebularContextMenu) {
      // Add a click event listener to the document to close the dropdown when clicking outside
      setTimeout(() => {
        document.addEventListener('click', this.closeDropdown);
      });
    }

    this.avatarClick.emit();
  }

  /**
   * Close the dropdown menu
   */
  closeDropdown = (): void => {
    this.isDropdownOpen = false;
    document.removeEventListener('click', this.closeDropdown);
  };

  /**
   * Handle dropdown item click
   */
  onItemClick(item: DropdownItem,_event: Event): void {
    event.stopPropagation();
    this.itemClick.emit(item);
    this.closeDropdown();

    if (item.action) {
      item.action();
    }
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

  /**
   * Handle image loading error
   */
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.style.display = 'none';
    (event.currentTarget as HTMLElement).classList.add('nb-user--no-image');
  }

  /**
   * Convert Font Awesome icon classes to Nebular icon names
   * This method maps Font Awesome icon classes to Nebular's Eva Icons
   */
  getIconName(iconClass: string): string {
    // Map common Font Awesome icons to Eva Icons
    const iconMap: Record<string, string> = {
      'fa-user': 'person-outline',
      'fa-cog': 'settings-outline',
      'fa-sign-out-alt': 'log-out-outline',
      'fa-bell': 'bell-outline',
      'fa-envelope': 'email-outline',
      'fa-key': 'lock-outline',
      'fa-heart': 'heart-outline',
      'fa-star': 'star-outline',
      'fa-bookmark': 'bookmark-outline',
      'fa-trash': 'trash-2-outline',
      'fa-edit': 'edit-outline',
      'fa-plus': 'plus-outline',
      'fa-minus': 'minus-outline',
      'fa-times': 'close-outline',
      'fa-check': 'checkmark-outline',
      'fa-info-circle': 'info-outline',
      'fa-question-circle': 'question-mark-circle-outline',
      'fa-exclamation-circle': 'alert-circle-outline',
      'fa-chevron-down': 'chevron-down-outline',
      'fa-chevron-up': 'chevron-up-outline',
      'fas fa-user': 'person-outline',
      'fas fa-cog': 'settings-outline',
      'fas fa-sign-out-alt': 'log-out-outline',
      'fas fa-bell': 'bell-outline',
      'fas fa-envelope': 'email-outline',
      'fas fa-key': 'lock-outline',
      'fas fa-heart': 'heart-outline',
      'fas fa-star': 'star-outline',
      'fas fa-bookmark': 'bookmark-outline',
      'fas fa-trash': 'trash-2-outline',
      'fas fa-edit': 'edit-outline',
      'fas fa-plus': 'plus-outline',
      'fas fa-minus': 'minus-outline',
      'fas fa-times': 'close-outline',
      'fas fa-check': 'checkmark-outline',
      'fas fa-info-circle': 'info-outline',
      'fas fa-question-circle': 'question-mark-circle-outline',
      'fas fa-exclamation-circle': 'alert-circle-outline',
      'fas fa-chevron-down': 'chevron-down-outline',
      'fas fa-chevron-up': 'chevron-up-outline',
    };

    // Extract the icon name from the class (handles both 'fa-icon' and 'fas fa-icon' formats)
    const iconName = iconClass.includes('fa-') ? iconClass.split('fa-')[1].trim() : iconClass;

    // Return the mapped icon or a default if not found
    return iconMap[iconClass] || iconMap[`fa-${iconName}`] || 'question-mark-circle-outline';
  }
}

/**
 * Dropdown Item Interface
 */
export interface DropdownItem {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  action?: () => void;
  divider?: boolean;
}
