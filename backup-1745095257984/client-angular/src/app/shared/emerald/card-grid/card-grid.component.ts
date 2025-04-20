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
import { CommonModule } from '@angular/common';
import { AppCardComponent } from '../app-card/app-card.component';
import { SkeletonLoaderComponent } from '../components/skeleton-loader/skeleton-loader.component';

/**
 * Card Grid Component
 *
 * A responsive grid layout for displaying cards.
 * Supports various layouts including default, compact, and masonry.
 */
@Component({
  selector: 'emerald-card-grid',
  templateUrl: '../components/card-grid/card-grid.component.html',
  styleUrls: ['../components/card-grid/card-grid.component.scss'],
  standalone: true,
  imports: [CommonModule, AppCardComponent, SkeletonLoaderComponent],
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
   * Alias for isLoading to match the component in components directory
   */
  @Input() set loading(value: boolean) {
    this.isLoading = value;
  }

  get loading(): boolean {
    return this.isLoading;
  }

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
   * Handles the click event on a card
   * @param itemId The ID of the clicked item
   */
  handleCardClick(itemId: string): void {
    this.cardClick.emit(itemId);
  }

  /**
   * Handles the click event on an action button
   * @param event The action click event
   */
  handleActionClick(event: { id: string; itemId: string }): void {
    this.actionClick.emit(event);
  }

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
   * Get skeleton array for loading state
   */
  getSkeletonArray(): number[] {
    return Array(this.columns * 2)
      .fill(0)
      .map((_, i) => i);
  }

  /**
   * Optional template for custom item rendering
   */
  @ContentChild('itemTemplate') itemTemplate?: TemplateRef<any>;
}
