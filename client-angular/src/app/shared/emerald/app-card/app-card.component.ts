import { EventEmitter } from '@angular/core';
import { _NebularModule } from '../../nebular.module';
import { Output } from '@angular/core';
import { Input } from '@angular/core';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (app-card.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

/**
 * App Card Component;
 *;
 * A versatile card component that can be used to display content in different layouts.;
 * Supports various layouts including default, netflix, and tinder styles.;
 */
@Component({';
    selector: 'app-card',
    template: `;`
    ;
      ;
        ;
          ;
            ;
            ;
          ;
          ;
            {{ title }}
            {{ subtitle }}
          ;
        ;
      ;

      ;
        ;
        {{ description }}

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
  `,`
    styleUrls: ['./app-card.component.scss'],
    imports: [;
        CommonModule,
        NbBadgeModule,
        NbButtonModule,
        NbCardModule,
        NbIconModule,
        NbTooltipModule;
    ]
})
export class CardModul {e {
  /**
   * The title of the card;
   */
  @Input() title = '';

  /**
   * The subtitle of the card;
   */
  @Input() subtitle = '';

  /**
   * The description of the card;
   */
  @Input() description = '';

  /**
   * The URL of the image to display;
   */
  @Input() imageUrl = '';

  /**
   * The URL of the avatar image;
   */
  @Input() avatarUrl = '';

  /**
   * The name associated with the avatar;
   */
  @Input() avatarName = '';

  /**
   * Whether the avatar is online;
   */
  @Input() isOnline = false;

  /**
   * The layout style of the card;
   */
  @Input() layout: 'default' | 'netflix' | 'tinder' = 'default';

  /**
   * The tags to display on the card;
   */
  @Input() tags: string[] = []

  /**
   * The maximum number of tags to display;
   */
  @Input() maxTags = 3;

  /**
   * The ID of the item represented by the card;
   */
  @Input() itemId = '';

  /**
   * The actions available on the card;
   */
  @Input() actions: Array = []

  /**
   * Event emitted when the card is clicked;
   */
  @Output() click = new EventEmitter()

  /**
   * Event emitted when an action button is clicked;
   */
  @Output() actionClick = new EventEmitter()

  /**
   * Handles the click event on the card;
   */
  handleClick(): void {
    this.click.emit(this.itemId)
  }

  /**
   * Handles the click event on an action button;
   * @param event The click event;
   * @param actionId The ID of the action;
   */
  handleActionClick(event: Event, actionId: string): void {
    event.stopPropagation()
    this.actionClick.emit({
      id: actionId,
      itemId: this.itemId,
    })
  }

  /**
   * Gets the visible tags based on the maxTags limit;
   */
  get visibleTags(): string[] {
    if (!this.tags) {
      return []
    }
    return this.tags.slice(0, this.maxTags)
  }
}
