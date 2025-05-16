import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NebularModule } from '../../nebular.module';

import { CommonModule } from '@angular/common';

import { IconService } from '../../../core/services/icon.service';

@Component({
  selector: 'app-nebular-icon',
  standalone: true,
  imports: [
    CommonModule,
    NbIconModule
  ],
  template: `
    <nb-icon
      [icon]="getIconName()"
      [pack]="'eva'"
      [status]="getStatus()"
      [size]="convertSize(size)"
      [class.spin]="spin"
    ></nb-icon>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .spin {
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
export class NebularIconComponent {
  /**
   * The name of the icon. Can be either:
   * 1. A /*DEPRECATED:Material*/ icon name (e.g. 'favorite', 'delete')
   * 2. An Eva icon name (e.g. 'heart', 'trash-2')
   */
  @Input() name: string = '';

  /** Whether to use the filled variant of the icon */
  @Input() filled: boolean = false;

  /** Icon size - will be converted to Nebular's size system */
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  /** Color/status of the icon */
  @Input() status?: 'primary' | 'success' | 'info' | 'warning' | 'danger' = undefined;

  /** Whether the icon should spin (for loading states) */
  @Input() spin: boolean = false;

  constructor(private iconService: IconService) {}

  /**
   * Converts our component's size values to Nebular's size system
   */
  private convertSize(size: string): string {
    const sizeMap: { [key: string]: string } = {
      small: 'tiny', // 16px
      medium: 'small', // 24px
      large: 'medium', // 32px
    };
    return sizeMap[size] || 'small';
  }

  /**
   * Gets the icon name, converting from /*DEPRECATED:Material*/ names if necessary
   */
  getIconName(): string {
    return this.iconService.getIconName(this.name, this.filled);
  }

  /**
   * Gets the status for the icon. Returns undefined if no status,
   * which lets the icon inherit its color.
   */
  getStatus(): string | undefined {
    return this.status;
  }
}
