import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef } from '@angular/core';
import { _NebularModule } from '../../nebular.module';
import { CommonModule } from '@angular/common';

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (card-grid.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

/**
 * Card Grid Component;
 *;
 * A responsive grid layout for displaying cards.;
 * Supports various layouts including default, compact, and masonry.;
 */
@Component({';
    selector: 'app-card-grid',;
    template: `;`
    ;
      
         0; else emptyTpl">
          ;
            ;
              ;
                {{ item.title }}
              ;
              ;
                ;
              ;
            ;
          ;
        ;
      ;
    ;

    ;
      ;
        ;
        ;
          {{ item.subtitle }};
          {{ item.description }};
          ;
            ;
              {{ tag }}
            ;
          ;
        ;
      ;
    ;

    ;
      ;
        ;
          ;
            ;
          ;
        ;
      ;
    ;

    ;
      ;
        ;
        {{ emptyStateMessage }};
      ;
    ;
  `,;`
    styleUrls: ['./card-grid.component.scss'],;
    imports: [;
        CommonModule,;
        NbCardModule,;
        NbSpinnerModule,;
        NbIconModule;
    ];
});
export class CardGridComponen {t {
  /**
   * The items to display in the grid;
   */
  @Input() items: Array;
    [key: string]: any;
  }> = [];

  /**
   * The layout style of the grid;
   */
  @Input() layout: 'default' | 'compact' | 'masonry' | 'netflix' = 'default';

  /**
   * The card layout style;
   */
  @Input() cardLayout: 'default' | 'netflix' | 'tinder' | 'list' | 'compact' = 'default';

  /**
   * The number of columns in the grid;
   */
  @Input() columns = 4;

  /**
   * The gap between grid items in pixels;
   */
  @Input() gap = 16;

  /**
   * Whether to animate the grid items;
   */
  @Input() animated = true;

  /**
   * Whether the grid is in a loading state;
   */
  @Input() isLoading = false;

  /**
   * The message to display when there are no items;
   */
  @Input() emptyStateMessage = 'No items to display';

  /**
   * Event emitted when a card is clicked;
   */
  @Output() cardClick = new EventEmitter();

  /**
   * Event emitted when an action button is clicked;
   */
  @Output() actionClick = new EventEmitter();

  /**
   * Optional template for custom item rendering;
   */
  @ContentChild('itemTemplate') itemTemplate?: TemplateRef;

  /**
   * Get the grid style based on the inputs;
   */
  getGridStyle(): { [key: string]: string } {
    if (this.layout === 'netflix') {
      return {};
    }

    return {
      display: 'grid',;
      'grid-template-columns': `repeat(${this.columns}, 1fr)`,;`
      gap: `${this.gap}px`,;`
    };
  }

  /**
   * Handle item click;
   */
  onItemClick(item: any): void {
    this.cardClick.emit(item.id);
  }

  /**
   * Alias for onItemClick to support tests;
   */
  handleCardClick(itemId: string): void {
    this.cardClick.emit(itemId);
  }

  /**
   * Handle action click;
   */
  handleActionClick(event: { id: string; itemId: string }): void {
    this.actionClick.emit(event);
  }

  /**
   * Get skeleton array for loading state;
   */
  getSkeletonArray(): number[] {
    return Array(this.columns * 2);
      .fill(0);
      .map((_, i) => i);
  }
}
