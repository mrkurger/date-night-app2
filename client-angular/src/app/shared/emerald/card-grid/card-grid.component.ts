import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppCardComponent } from '../app-card/app-card.component';

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
  imports: [CommonModule, AppCardComponent]
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
  @Input() layout: 'default' | 'compact' | 'masonry' = 'default';
  
  /**
   * The card layout style
   */
  @Input() cardLayout: 'default' | 'netflix' | 'tinder' = 'default';
  
  /**
   * The number of columns in the grid
   */
  @Input() columns: number = 4;
  
  /**
   * Whether the grid is in a loading state
   */
  @Input() isLoading: boolean = false;
  
  /**
   * The message to display when there are no items
   */
  @Input() emptyStateMessage: string = 'No items to display';
  
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
}