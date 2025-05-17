import { EventEmitter } from '@angular/core';
import { Output } from '@angular/core';
import { Input } from '@angular/core';
import { Component } from '@angular/core';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (floating-action-button.component)
//
// COMMON CUSTOMIZATIONS:
// - BUTTON_SIZE: Size of the button in pixels (default: varies by size prop)
//   Related to: floating-action-button.component.scss
// - ANIMATION_DURATION: Duration of animations in milliseconds (default: 300)
//   Related to: floating-action-button.component.scss
// ===================================================
import { CommonModule } from '@angular/common';

/**
 * /*DEPRECATED:Emerald*/ FloatingActionButton Component
 *
 * A floating action button for primary actions.
 * This component provides a prominent way to promote a primary action.
 *
 * Documentation: https://docs-/*DEPRECATED:emerald*/.condorlabs.io/FloatingActionButton
 */
@Component({
  selector: 'nb-fab',
  templateUrl: './floating-action-button.component.html',
  styleUrls: ['./floating-action-button.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class FloatingActionButtonComponent {
  /**
   * The icon to display in the button
   * Uses Font Awesome icons (e.g., 'fa-plus')
   */
  @Input() icon = 'fa-plus';

  /**
   * The label for the button (for accessibility)
   */
  @Input() label = 'Action';

  /**
   * The color variant of the button
   */
  @Input() color: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' = 'primary';

  /**
   * The size of the button
   */
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  /**
   * The position of the button
   */
  @Input() position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center' =
    'bottom-right';

  /**
   * Whether to show a tooltip on hover
   */
  @Input() showTooltip = false;

  /**
   * The text to display in the tooltip
   */
  @Input() tooltipText = '';

  /**
   * Whether the button is disabled
   */
  @Input() disabled = false;

  /**
   * Whether to show a menu of actions when clicked
   */
  @Input() hasMenu = false;

  /**
   * The menu items to display
   */
  @Input() menuItems: { icon: string; label: string; action?: string }[] = [];

  /**
   * Whether the menu is currently open
   */
  @Input() menuOpen = false;

  /**
   * Emitted when the button is clicked
   */
  @Output() buttonClick = new EventEmitter<void>();

  /**
   * Emitted when a menu item is clicked
   */
  @Output() menuItemClick = new EventEmitter<{ icon: string; label: string; action?: string }>();

  /**
   * Toggle the menu open/closed
   */
  toggleMenu(event: Event): void {
    event.stopPropagation();

    if (this.hasMenu) {
      this.menuOpen = !this.menuOpen;
    } else {
      this.buttonClick.emit();
    }
  }

  /**
   * Handle menu item click
   */
  onMenuItemClick(item: { icon: string; label: string; action?: string }, event: Event): void {
    event.stopPropagation();
    this.menuItemClick.emit(item);
    this.menuOpen = false;
  }

  /**
   * Close the menu when clicking outside
   */
  closeMenu(): void {
    this.menuOpen = false;
  }
}
