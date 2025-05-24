import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-primeng-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <i
      class="pi pi-{{ getIconName() }}"
      [ngClass]="{
        'pi-spin': spin,
        'p-icon-primary': status === 'primary',
        'p-icon-success': status === 'success',
        'p-icon-info': status === 'info',
        'p-icon-warning': status === 'warning',
        'p-icon-danger': status === 'danger'
      }"
      [style.fontSize]="convertSize(size)"
    ></i>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .pi-spin {
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrimeNGIconComponent {
  /**
   * The name of the icon. Can be either:
   * 1. A Material icon name (e.g. 'favorite', 'delete') (DEPRECATED)
   * 2. An Eva icon name (e.g. 'heart', 'trash-2')
   */
  @Input() name: string = '';

  /** Whether to use the filled variant of the icon */
  @Input() filled: boolean = false;

  /** Icon size - will be converted to PrimeNG's size system */
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  /** Color/status of the icon */
  @Input() status?: 'primary' | 'success' | 'info' | 'warning' | 'danger' = undefined;

  /** Whether the icon should spin (for loading states) */
  @Input() spin: boolean = false;

  /**
   * Converts our component's size values to PrimeNG's size system
   */
  private convertSize(size: string): string {
    const sizeMap: { [key: string]: string } = {
      small: '1rem',
      medium: '1.5rem',
      large: '2rem',
    };
    return sizeMap[size] || '1.5rem';
  }

  /**
   * Gets the icon name, converting from Material names if necessary (DEPRECATED)
   */
  getIconName(): string {
    // Directly return the name for simplicity
    return this.name;
  }
}
