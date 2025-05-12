// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (avatar.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * Emerald Avatar Component
 *
 * A wrapper for the Emerald.js Avatar component.
 * This component displays a user avatar with optional dropdown menu.
 *
 * Documentation: https://docs-emerald.condorlabs.io/Avatar
 */
@Component({
  selector: 'emerald-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class AvatarComponent {
  @Input() imageUrl = '/assets/img/default-profile.jpg';
  @Input() name = '';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() isOnline = false;
  @Input() showDropdown = false;
  @Input() dropdownItems: DropdownItem[] = [];

  @Output() avatarClick = new EventEmitter<void>();
  @Output() itemClick = new EventEmitter<DropdownItem>();

  isDropdownOpen = false;

  /**
   * Toggle the dropdown menu
   */
  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;

    if (this.isDropdownOpen) {
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
  onItemClick(item: DropdownItem, event: Event): void {
    event.stopPropagation();
    this.itemClick.emit(item);
    this.closeDropdown();
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
    (event.currentTarget as HTMLElement).classList.add('emerald-avatar--no-image');
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
