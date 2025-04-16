import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelComponent } from '../components/label/label.component';

/**
 * App Card Component
 * 
 * A versatile card component that can be used to display content in different layouts.
 * Supports various layouts including default, netflix, and tinder styles.
 */
@Component({
  selector: 'emerald-app-card',
  templateUrl: '../components/app-card/app-card.component.html',
  styleUrls: ['../components/app-card/app-card.component.scss'],
  standalone: true,
  imports: [CommonModule, LabelComponent]
})
export class AppCardComponent {
  /**
   * The title of the card
   */
  @Input() title: string = '';
  
  /**
   * The subtitle of the card
   */
  @Input() subtitle: string = '';
  
  /**
   * The description of the card
   */
  @Input() description: string = '';
  
  /**
   * The URL of the image to display
   */
  @Input() imageUrl: string = '';
  
  /**
   * The URL of the avatar image
   */
  @Input() avatarUrl: string = '';
  
  /**
   * The name associated with the avatar
   */
  @Input() avatarName: string = '';
  
  /**
   * Whether the avatar is online
   */
  @Input() isOnline: boolean = false;
  
  /**
   * The layout style of the card
   */
  @Input() layout: 'default' | 'netflix' | 'tinder' = 'default';
  
  /**
   * The tags to display on the card
   */
  @Input() tags: string[] = [];
  
  /**
   * The maximum number of tags to display
   */
  @Input() maxTags: number = 3;
  
  /**
   * The ID of the item represented by the card
   */
  @Input() itemId: string = '';
  
  /**
   * The actions available on the card
   */
  @Input() actions: Array<{
    id: string;
    icon: string;
    tooltip: string;
  }> = [];
  
  /**
   * Event emitted when the card is clicked
   */
  @Output() click = new EventEmitter<string>();
  
  /**
   * Event emitted when an action button is clicked
   */
  @Output() actionClick = new EventEmitter<{
    id: string;
    itemId: string;
  }>();
  
  /**
   * Handles the click event on the card
   */
  handleClick(): void {
    this.click.emit(this.itemId);
  }
  
  /**
   * Handles the click event on an action button
   * @param event The click event
   * @param actionId The ID of the action
   */
  handleActionClick(event: Event, actionId: string): void {
    event.stopPropagation();
    this.actionClick.emit({
      id: actionId,
      itemId: this.itemId
    });
  }
  
  /**
   * Gets the visible tags based on the maxTags limit
   */
  get visibleTags(): string[] {
    return this.tags.slice(0, this.maxTags);
  }
}