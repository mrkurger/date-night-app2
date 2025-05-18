import { Component, Input, OnInit } from '@angular/core';
import { _NebularModule } from '../../nebular.module';

import { CommonModule } from '@angular/common';

import { IconService } from '../../../core/services/icon.service';

/**
 * Icon Component
 *
 * A component for displaying SVG icons from the DateNight.io icon library.
 * Supports different sizes and colors.
 */
@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [
    CommonModule,
    NbIconModule
  ],
  template: `
    <nb-icon
      [icon]="iconName"
      [status]="status"
      [options]="{ animation: animation }"
      [class]="customClass"
      [style.fontSize.px]="size"
    >
    </nb-icon>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      nb-icon {
        cursor: inherit;
      }
    `,
  ],
})
export class IconComponent implements OnInit {
  @Input() name!: string;
  @Input() filled: boolean = true;
  @Input() size: number = 24;
  @Input() status: string = 'basic';
  @Input() animation?: 'zoom' | 'pulse' | 'shake' | 'flip';
  @Input() customClass: string = '';

  iconName!: string;

  constructor(private iconService: IconService) {}

  ngOnInit() {
    this.iconName = this.iconService.getIconName(this.name, this.filled);
  }
}
