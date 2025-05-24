import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IconService } from '../../../core/services/icon.service';

/**
 * Icon Component
 *
 * A component for displaying icons using PrimeIcons.
 * Supports different sizes and colors from the DateNight.io design system.
 */
@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <i
      [class]="iconClass"
      [ngStyle]="{
        'font-size.px': size,
        'color': color ? 'var(--color-' + color + ')' : undefined
      }"
    ></i>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      i {
        line-height: 1;
        cursor: inherit;
      }
    `,
  ],
})
export class IconComponent implements OnInit {
  @Input() name!: string;
  @Input() filled: boolean = true;
  @Input() size: number = 24;
  @Input() color?: string;

  iconClass: string = '';

  constructor(private iconService: IconService) {}

  ngOnInit() {
    this.iconClass = this.iconService.getIconName(this.name, this.filled);
  }
}
