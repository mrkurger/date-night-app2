// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (card-grid.component)
// 
// COMMON CUSTOMIZATIONS:
// - GRID_GAP: Gap between grid items in pixels (default: 16)
//   Related to: card-grid.component.scss
// - GRID_COLUMNS: Number of columns in the grid (default: responsive)
//   Related to: card-grid.component.scss
// ===================================================
import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ad } from '../../../../core/models/ad.interface';

/**
 * Emerald CardGrid Component
 * 
 * A responsive grid layout for displaying multiple cards.
 * This component provides a flexible grid system for displaying ads or other content.
 * 
 * Documentation: https://docs-emerald.condorlabs.io/CardGrid
 */
@Component({
  selector: 'emerald-card-grid',
  templateUrl: './card-grid.component.html',
  styleUrls: ['./card-grid.component.scss']
})
export class CardGridComponent {
  /**
   * The items to display in the grid
   */
  @Input() items: any[] = [];
  
  /**
   * The number of columns in the grid
   * If not specified, the grid will be responsive based on screen size
   */
  @Input() columns: number | null = null;
  
  /**
   * The gap between grid items in pixels
   */
  @Input() gap: number = 16;
  
  /**
   * The minimum width of each grid item in pixels
   * Used for responsive grids when columns is not specified
   */
  @Input() minItemWidth: number = 280;
  
  /**
   * Whether to show a loading skeleton when items are loading
   */
  @Input() loading: boolean = false;
  
  /**
   * The number of skeleton items to show when loading
   */
  @Input() skeletonCount: number = 6;
  
  /**
   * Whether to animate the grid items when they appear
   */
  @Input() animated: boolean = true;
  
  /**
   * The layout style for the grid
   * - 'grid': Standard grid layout
   * - 'masonry': Masonry layout with variable heights
   * - 'netflix': Netflix-style rows with horizontal scrolling
   */
  @Input() layout: 'grid' | 'masonry' | 'netflix' = 'grid';
  
  /**
   * Emitted when an item is clicked
   */
  @Output() itemClick = new EventEmitter<any>();
  
  /**
   * Custom template for rendering grid items
   */
  @ContentChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  
  /**
   * Get the grid style based on the inputs
   */
  getGridStyle(): { [key: string]: string } {
    if (this.layout === 'netflix') {
      return {};
    }
    
    if (this.columns) {
      return {
        'display': 'grid',
        'grid-template-columns': `repeat(${this.columns}, 1fr)`,
        'gap': `${this.gap}px`
      };
    }
    
    return {
      'display': 'grid',
      'grid-template-columns': `repeat(auto-fill, minmax(${this.minItemWidth}px, 1fr))`,
      'gap': `${this.gap}px`
    };
  }
  
  /**
   * Handle item click
   */
  onItemClick(item: any): void {
    this.itemClick.emit(item);
  }
  
  /**
   * Get skeleton array for loading state
   */
  getSkeletonArray(): number[] {
    return Array(this.skeletonCount).fill(0).map((_, i) => i);
  }
}