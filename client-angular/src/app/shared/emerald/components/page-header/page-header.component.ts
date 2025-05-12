// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (page-header.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * Emerald PageHeader Component
 *
 * A wrapper for the Emerald.js PageHeader component.
 * This component displays a page header with title, breadcrumbs, and actions.
 *
 * Documentation: https://docs-emerald.condorlabs.io/PageHeader
 */
@Component({
  selector: 'emerald-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule],
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
  onActionClick(action: HeaderAction, event: Event): void {
    event.preventDefault();
    this.actionClick.emit(action);

    if (action.action) {
      action.action();
    }
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
