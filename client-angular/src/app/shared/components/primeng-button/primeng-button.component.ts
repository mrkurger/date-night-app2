import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

/**
 * A wrapper component for PrimeNG Button with additional features
 * 
 * This component provides a standardized way to use PrimeNG buttons
 * throughout the application with consistent styling and behavior.
 * 
 * @example
 * <app-primeng-button 
 *   label="Click Me" 
 *   icon="pi pi-check" 
 *   severity="success"
 *   (onClick)="handleClick()">
 * </app-primeng-button>
 */
@Component({
  selector: 'app-primeng-button',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule],
  template: `
    <p-button
      [label]="label"
      [icon]="icon"
      [iconPos]="iconPosition"
      [disabled]="disabled"
      [loading]="loading"
      [severity]="severity"
      [size]="size"
      [outlined]="outlined"
      [rounded]="rounded"
      [raised]="raised"
      [text]="text"
      [pTooltip]="tooltip"
      tooltipPosition="top"
      (onClick)="handleClick($event)"
      [styleClass]="styleClass"
    >
      <ng-content></ng-content>
    </p-button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class PrimengButtonComponent {
  /** The text to display on the button */
  @Input() label: string = '';
  
  /** The icon to display (PrimeIcons, e.g., 'pi pi-check') */
  @Input() icon: string = '';
  
  /** Position of the icon ('left' or 'right') */
  @Input() iconPosition: 'left' | 'right' = 'left';
  
  /** Whether the button is disabled */
  @Input() disabled: boolean = false;
  
  /** Whether the button is in a loading state */
  @Input() loading: boolean = false;
  
  /** Button severity (primary, secondary, success, info, warning, danger) */
  @Input() severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger';
  
  /** Button size (small, normal, large) */
  @Input() size?: 'small' | 'normal' | 'large';
  
  /** Whether the button has an outlined style */
  @Input() outlined: boolean = false;
  
  /** Whether the button has rounded corners */
  @Input() rounded: boolean = false;
  
  /** Whether the button has a raised appearance */
  @Input() raised: boolean = false;
  
  /** Whether the button has a text-only appearance */
  @Input() text: boolean = false;
  
  /** Tooltip text to display on hover */
  @Input() tooltip: string = '';
  
  /** Additional CSS classes to apply to the button */
  @Input() styleClass: string = '';
  
  /** Event emitted when the button is clicked */
  @Output() onClick: EventEmitter<Event> = new EventEmitter<Event>();
  
  /**
   * Handle button click event
   * @param event - The click event
   */
  handleClick(event: Event): void {
    this.onClick.emit(event);
  }
}