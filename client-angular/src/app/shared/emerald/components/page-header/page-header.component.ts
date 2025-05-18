import { Component, EventEmitter, Input, Output } from '@angular/core';
import { _NebularModule } from '../../../shared/nebular.module';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  NbBreadcrumbModule
} from '@nebular/theme';

/**
 * Page Header Component
 *
 * This component displays a page header with title, breadcrumbs, and actions.
 * It uses Nebular UI components for consistent styling.
 */
@Component({
  selector: 'nb-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss'],
  standalone: true,
  imports: [CommonModule,
    RouterModule,
    NbBreadcrumbModule],
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle?: string;
  @Input() breadcrumbs: Breadcrumb[] = [];
  @Input() actions: HeaderAction[] = [];
  @Input() backLink?: string;
  @Input() backgroundImage?: string;
  @Input() avatarUrl?: string;
  @Input() avatarName?: string;
  @Input() avatarIsOnline?: boolean;

  @Output() actionClick = new EventEmitter<HeaderAction>();

  /**
   * Handle action click
   */
  onActionClick(action: HeaderAction,_event: Event): void {
    event.preventDefault();
    this.actionClick.emit(action);

    if (action.action) {
      action.action();
    }
  }

  /**
   * Convert Font Awesome icon classes to Nebular icon names
   * This method maps Font Awesome icon classes to Nebular's Eva Icons
   */
  getIconName(iconClass: string): string {
    // Map common Font Awesome icons to Eva Icons
    const iconMap: Record<string, string> = {
      'fa-plus': 'plus-outline',
      'fa-edit': 'edit-outline',
      'fa-trash': 'trash-2-outline',
      'fa-save': 'save-outline',
      'fa-times': 'close-outline',
      'fa-check': 'checkmark-outline',
      'fa-arrow-left': 'arrow-back-outline',
      'fa-arrow-right': 'arrow-forward-outline',
      'fa-search': 'search-outline',
      'fa-user': 'person-outline',
      'fa-cog': 'settings-outline',
      'fa-home': 'home-outline',
      'fa-bell': 'bell-outline',
      'fa-calendar': 'calendar-outline',
      'fa-envelope': 'email-outline',
      'fa-file': 'file-outline',
      'fa-download': 'download-outline',
      'fa-upload': 'upload-outline',
      'fa-link': 'link-2-outline',
      'fa-heart': 'heart-outline',
      'fa-star': 'star-outline',
      'fa-info-circle': 'info-outline',
      'fa-question-circle': 'question-mark-circle-outline',
      'fa-exclamation-circle': 'alert-circle-outline',
      'fa-chevron-right': 'chevron-right-outline',
      'fa-chevron-left': 'chevron-left-outline',
      'fa-chevron-up': 'chevron-up-outline',
      'fa-chevron-down': 'chevron-down-outline',
      'fas fa-plus': 'plus-outline',
      'fas fa-edit': 'edit-outline',
      'fas fa-trash': 'trash-2-outline',
      'fas fa-save': 'save-outline',
      'fas fa-times': 'close-outline',
      'fas fa-check': 'checkmark-outline',
      'fas fa-arrow-left': 'arrow-back-outline',
      'fas fa-arrow-right': 'arrow-forward-outline',
      'fas fa-search': 'search-outline',
      'fas fa-user': 'person-outline',
      'fas fa-cog': 'settings-outline',
      'fas fa-home': 'home-outline',
      'fas fa-bell': 'bell-outline',
      'fas fa-calendar': 'calendar-outline',
      'fas fa-envelope': 'email-outline',
      'fas fa-file': 'file-outline',
      'fas fa-download': 'download-outline',
      'fas fa-upload': 'upload-outline',
      'fas fa-link': 'link-2-outline',
      'fas fa-heart': 'heart-outline',
      'fas fa-star': 'star-outline',
      'fas fa-info-circle': 'info-outline',
      'fas fa-question-circle': 'question-mark-circle-outline',
      'fas fa-exclamation-circle': 'alert-circle-outline',
      'fas fa-chevron-right': 'chevron-right-outline',
      'fas fa-chevron-left': 'chevron-left-outline',
      'fas fa-chevron-up': 'chevron-up-outline',
      'fas fa-chevron-down': 'chevron-down-outline',
    };

    // Extract the icon name from the class (handles both 'fa-icon' and 'fas fa-icon' formats)
    const iconName = iconClass.includes('fa-') ? iconClass.split('fa-')[1].trim() : iconClass;

    // Return the mapped icon or a default if not found
    return iconMap[iconClass] || iconMap[`fa-${iconName}`] || 'question-mark-circle-outline';
  }
}

/**
 * Breadcrumb Interface
 */
export interface Breadcrumb {
  label: string;
  url?: string;
}

/**
 * Header Action Interface
 */
export interface HeaderAction {
  id: string;
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  primary?: boolean;
  action?: () => void;
}
