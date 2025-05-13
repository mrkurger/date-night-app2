import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NbButtonModule,
  NbIconModule,
  NbTooltipModule,
  NbContextMenuModule,
  NbMenuService,
  NbMenuItem,
} from '@nebular/theme';

export interface FabMenuItem extends NbMenuItem {
  data?: any;
}

/**
 * Floating Action Button Component
 *
 * A modern floating action button using Nebular UI components.
 * Features icon, tooltip, and optional context menu.
 */
@Component({
  selector: 'app-fab',
  standalone: true,
  imports: [CommonModule, NbButtonModule, NbIconModule, NbTooltipModule, NbContextMenuModule],
  template: `
    <button
      nbButton
      [status]="status"
      [size]="size"
      [disabled]="disabled"
      [nbTooltip]="tooltipText"
      [nbTooltipStatus]="status"
      [nbContextMenu]="items"
      [nbContextMenuTag]="menuTag"
      [class]="'fab fab--' + position"
      (click)="onClick($event)"
    >
      <nb-icon [icon]="icon"></nb-icon>
    </button>
  `,
  styles: [
    `
      :host {
        position: fixed;
        z-index: 1000;
      }

      .fab {
        width: 4rem;
        height: 4rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: nb-theme(shadow-lg);
        transition:
          transform 0.2s ease,
          box-shadow 0.2s ease;

        &:hover {
          transform: scale(1.05);
          box-shadow: nb-theme(shadow-xl);
        }

        &:active {
          transform: scale(0.95);
        }

        nb-icon {
          font-size: 1.5rem;
        }

        // Positions
        &--bottom-right {
          bottom: 2rem;
          right: 2rem;
        }

        &--bottom-left {
          bottom: 2rem;
          left: 2rem;
        }

        &--top-right {
          top: 2rem;
          right: 2rem;
        }

        &--top-left {
          top: 2rem;
          left: 2rem;
        }

        &--center {
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);

          &:hover {
            transform: translateX(-50%) scale(1.05);
          }

          &:active {
            transform: translateX(-50%) scale(0.95);
          }
        }
      }

      // Size variations
      :host-context([size='small']) .fab {
        width: 3rem;
        height: 3rem;

        nb-icon {
          font-size: 1.25rem;
        }
      }

      :host-context([size='large']) .fab {
        width: 5rem;
        height: 5rem;

        nb-icon {
          font-size: 2rem;
        }
      }
    `,
  ],
})
export class FloatingActionButtonComponent {
  @Input() icon = 'plus-outline';
  @Input() status: 'primary' | 'success' | 'warning' | 'danger' | 'info' = 'primary';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center' =
    'bottom-right';
  @Input() tooltipText = '';
  @Input() disabled = false;
  @Input() items: FabMenuItem[] = [];

  @Output() buttonClick = new EventEmitter<void>();
  @Output() menuItemClick = new EventEmitter<FabMenuItem>();

  readonly menuTag = 'fab-menu-' + Math.random().toString(36).substring(7);

  constructor(private nbMenuService: NbMenuService) {
    // Subscribe to menu item clicks
    this.nbMenuService.onItemClick().subscribe((event) => {
      if (event.tag === this.menuTag && event.item) {
        this.menuItemClick.emit(event.item as FabMenuItem);
      }
    });
  }

  onClick(event: Event): void {
    if (!this.items.length) {
      event.stopPropagation();
      this.buttonClick.emit();
    }
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    // Close the menu when clicking outside
    // The menu will close automatically when clicking outside
    // No need to manually close it
  }
}
