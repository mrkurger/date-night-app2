// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (app-card.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { CommonModule } from '@angular/common';
import { NbCardModule, NbBadgeModule, NbIconModule, NbButtonModule } from '@nebular/theme';

/**
 * App Card Component
 *
 * A versatile card component that can be used to display content in different layouts.
 * Supports various layouts including default, netflix, and tinder styles.
 */
@Component({
  selector: 'app-card',
  template: `
    <nb-card [ngClass]="layout" (click)="handleClick()" class="app-card">
      <nb-card-header *ngIf="title || avatarUrl">
        <div class="card-header-content">
          <div *ngIf="avatarUrl" class="avatar-container">
            <img [src]="avatarUrl" [alt]="avatarName" class="avatar" />
            <nb-badge *ngIf="isOnline" status="success" position="bottom-right"></nb-badge>
          </div>
          <div class="header-text">
            <h3 class="title">{{ title }}</h3>
            <p *ngIf="subtitle" class="subtitle">{{ subtitle }}</p>
          </div>
        </div>
      </nb-card-header>

      <nb-card-body>
        <img *ngIf="imageUrl" [src]="imageUrl" [alt]="title" class="card-image" />
        <p *ngIf="description" class="description">{{ description }}</p>

        <div *ngIf="visibleTags.length" class="tags">
          <nb-badge
            *ngFor="let tag of visibleTags"
            [text]="tag"
            status="primary"
            position="centered"
          ></nb-badge>
        </div>
      </nb-card-body>

      <nb-card-footer *ngIf="actions.length">
        <div class="actions">
          <button
            *ngFor="let action of actions"
            nbButton
            ghost
            size="small"
            [nbTooltip]="action.tooltip"
            (click)="handleActionClick($event, action.id)"
          >
            <nb-icon [icon]="action.icon"></nb-icon>
          </button>
        </div>
      </nb-card-footer>
    </nb-card>
  `,
  styleUrls: ['./app-card.component.scss'],
  standalone: true,
  imports: [CommonModule, NbCardModule, NbBadgeModule, NbIconModule, NbButtonModule],
})
export class AppCardComponent {
  /**
   * The title of the card
   */
  @Input() title = '';

  /**
   * The subtitle of the card
   */
  @Input() subtitle = '';

  /**
   * The description of the card
   */
  @Input() description = '';

  /**
   * The URL of the image to display
   */
  @Input() imageUrl = '';

  /**
   * The URL of the avatar image
   */
  @Input() avatarUrl = '';

  /**
   * The name associated with the avatar
   */
  @Input() avatarName = '';

  /**
   * Whether the avatar is online
   */
  @Input() isOnline = false;

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
  @Input() maxTags = 3;

  /**
   * The ID of the item represented by the card
   */
  @Input() itemId = '';

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
      itemId: this.itemId,
    });
  }

  /**
   * Gets the visible tags based on the maxTags limit
   */
  get visibleTags(): string[] {
    if (!this.tags) {
      return [];
    }
    return this.tags.slice(0, this.maxTags);
  }
}
