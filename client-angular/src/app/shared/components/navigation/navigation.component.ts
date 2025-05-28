import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';

/**
 *
 */
@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule],
  template: `<div>Navigation Placeholder</div>`
})
export class NavigationComponent {
  @Output() topMenuItemClicked = new EventEmitter<any>();
  @Output() userMenuItemClicked = new EventEmitter<any>();
  @Output() breadcrumbClicked = new EventEmitter<any>();
  @Output() searchSubmitted = new EventEmitter<any>();

  /**
   *
   */
  onTopMenuItemClick(event: any): void {
    this.topMenuItemClicked.emit(event);
  }

  /**
   *
   */
  onUserMenuItemClick(event: any): void {
    this.userMenuItemClicked.emit(event);
  }

  /**
   *
   */
  onBreadcrumbClick(event: any): void {
    this.breadcrumbClicked.emit(event);
  }

  /**
   *
   */
  onSearch(event: any): void {
    this.searchSubmitted.emit(event);
  }

  /**
   *
   */
  onSearchSelect(event: any): void {
    this.searchSubmitted.emit(event);
  }
}
