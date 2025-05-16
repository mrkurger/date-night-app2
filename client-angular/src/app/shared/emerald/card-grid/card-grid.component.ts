

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (card-grid.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef } from '@angular/core';
import { NebularModule } from '../../nebular.module';

import { CommonModule } from '@angular/common';

/**
 * Card Grid Component
 *
 * A responsive grid layout for displaying cards.
 * Supports various layouts including default, compact, and masonry.
 */
@Component({
  selector: 'app-card-grid',
  template: `
    <div class="card-grid" [ngClass]="layout" [ngStyle]="getGridStyle()">
      <ng-container *ngIf="!isLoading; else loadingTpl">
        <ng-container *ngIf="items.length > 0; else emptyTpl">
          <ng-container *ngFor="let item of items">
            <nb-card [class.clickable]="true" (click)="onItemClick(item)" [ngClass]="cardLayout">
              <nb-card-header *ngIf="item.title">
                {{ item.title }}
              </nb-card-header>
              <nb-card-body>
                <ng-container
                  *ngTemplateOutlet="
                    itemTemplate || defaultItemTemplate;
                    context: { $implicit: item }
                  "
                ></ng-container>
              </nb-card-body>
            </nb-card>
          </ng-container>
        </ng-container>
      </ng-container>
    </div>

    <ng-template #defaultItemTemplate let-item>
      <div class="card-content">
        <img *ngIf="item.imageUrl" [src]="item.imageUrl" [alt]="item.title" />
        <div class="card-details">
          <p *ngIf="item.subtitle" class="subtitle">{{ item.subtitle }}</p>
          <p *ngIf="item.description" class="description">{{ item.description }}</p>
          <div *ngIf="item.tags?.length" class="tags">
            <span *ngFor="let tag of item.tags.slice(0, maxTags)" class="tag">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </ng-template>

    <ng-template #loadingTpl>
      <div class="loading-grid">
        <nb-card *ngFor="let i of getSkeletonArray()" class="skeleton-card">
          <nb-card-body>
            <nb-spinner></nb-spinner>
          </nb-card-body>
        </nb-card>
      </div>
    </ng-template>

    <ng-template #emptyTpl>
      <div class="empty-state">
        <nb-icon icon="alert-circle-outline"></nb-icon>
        <p>{{ emptyStateMessage }}</p>
      </div>
    </ng-template>
  `,
  styleUrls: ['./card-grid.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NbCardModule,
    NbSpinnerModule,
    NbIconModule
  ],
})
export class CardGridComponent {
  /**
   * The items to display in the grid
   */
  @Input() items: Array<{
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    imageUrl?: string;
    avatarUrl?: string;
    avatarName?: string;
    isOnline?: boolean;
    tags?: string[];
    actions?: Array<{
      id: string;
      icon: string;
      tooltip: string;
    }>;
    [key: string]: any;
  }> = [];

  /**
   * The layout style of the grid
   */
  @Input() layout: 'default' | 'compact' | 'masonry' | 'netflix' = 'default';

  /**
   * The card layout style
   */
  @Input() cardLayout: 'default' | 'netflix' | 'tinder' | 'list' | 'compact' = 'default';

  /**
   * The number of columns in the grid
   */
  @Input() columns = 4;

  /**
   * The gap between grid items in pixels
   */
  @Input() gap = 16;

  /**
   * Whether to animate the grid items
   */
  @Input() animated = true;

  /**
   * Whether the grid is in a loading state
   */
  @Input() isLoading = false;

  /**
   * The message to display when there are no items
   */
  @Input() emptyStateMessage = 'No items to display';

  /**
   * Event emitted when a card is clicked
   */
  @Output() cardClick = new EventEmitter<string>();

  /**
   * Event emitted when an action button is clicked
   */
  @Output() actionClick = new EventEmitter<{
    id: string;
    itemId: string;
  }>();

  /**
   * Optional template for custom item rendering
   */
  @ContentChild('itemTemplate') itemTemplate?: TemplateRef<any>;

  /**
   * Get the grid style based on the inputs
   */
  getGridStyle(): { [key: string]: string } {
    if (this.layout === 'netflix') {
      return {};
    }

    return {
      display: 'grid',
      'grid-template-columns': `repeat(${this.columns}, 1fr)`,
      gap: `${this.gap}px`,
    };
  }

  /**
   * Handle item click
   */
  onItemClick(item: any): void {
    this.cardClick.emit(item.id);
  }

  /**
   * Alias for onItemClick to support tests
   */
  handleCardClick(itemId: string): void {
    this.cardClick.emit(itemId);
  }

  /**
   * Handle action click
   */
  handleActionClick(event: { id: string; itemId: string }): void {
    this.actionClick.emit(event);
  }

  /**
   * Get skeleton array for loading state
   */
  getSkeletonArray(): number[] {
    return Array(this.columns * 2)
      .fill(0)
      .map((_, i) => i);
  }
}
