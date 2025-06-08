
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (button.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { IconComponent } from '../icon/icon.component';

/**
 * Button Component
 *
 * A customizable button component that follows the DateNight.io design system.
 * Uses PrimeNG's button system with custom styling.
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    ProgressSpinnerModule,
    IconComponent
  ],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  /**
   * The button severity determines its visual style.
   * Maps to PrimeNG's button severity system.
   */
  @Input() severity: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'help' | 'contrast' | null = null;

  /**
   * The button size.
   * Maps to PrimeNG's size system.
   */
  @Input() size: 'small' | 'normal' | 'large' = 'normal';

  /**
   * The button variant.
   * Maps to PrimeNG's button variants.
   */
  @Input() variant: 'text' | 'outlined' | 'raised' | null = null;

  /**
   * Whether the button is disabled.
   */
  @Input() disabled = false;

  /**
   * Whether the button is in a loading state.
   * When true, shows a loading indicator and disables the button.
   */
  @Input() loading = false;

  /**
   * Whether the button should take the full width of its container.
   */
  @Input() fullWidth = false;

  /**
   * The button type attribute.
   */
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  /**
   * Optional icon name to display before the button text.
   */
  @Input() iconLeft?: string;

  /**
   * Optional icon name to display after the button text.
   */
  @Input() iconRight?: string;

  /**
   * Aria label for accessibility.
   */
  @Input() ariaLabel?: string;

  /**
   * Event emitted when the button is clicked.
   */
  @Output() buttonClick = new EventEmitter<MouseEvent>();

  /**
   * Handles the button click event.
   * Prevents the event from propagating if the button is disabled or loading.
   */
  onClick(event: MouseEvent): void {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.buttonClick.emit(event);
  }

  /**
   * Gets the CSS classes for the button based on its properties.
   */
  get buttonClasses(): Record<string, boolean> {
    return {
      [`p-button-${this.size}`]: this.size !== 'normal',
      'w-full': this.fullWidth,
      'p-button-loading': this.loading,
    };
  }

  /**
   * Convert Nebular-style icon names to PrimeIcons
   */
  convertIcon(iconName?: string): string {
    if (!iconName) return '';
    
    const iconMap: Record<string, string> = {
      'plus-outline': 'pi pi-plus',
      'edit-outline': 'pi pi-pencil',
      'trash-outline': 'pi pi-trash',
      'save-outline': 'pi pi-save',
      'close-outline': 'pi pi-times',
      'checkmark-outline': 'pi pi-check',
      'arrow-right-outline': 'pi pi-arrow-right',
      'arrow-left-outline': 'pi pi-arrow-left',
      'download-outline': 'pi pi-download',
      'upload-outline': 'pi pi-upload',
      'search-outline': 'pi pi-search',
      'refresh-outline': 'pi pi-refresh',
    };

    return iconMap[iconName] || `pi pi-${iconName}`;
  }
}
