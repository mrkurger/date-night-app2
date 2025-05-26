// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (gallery.component)
//
// COMMON CUSTOMIZATIONS:
// - DEFAULT_VIEW_MODE: Default view mode (default: 'grid')
//   Related to: user-preferences.service.ts:defaultViewType
// ===================================================
import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NebularModule } from '../../../app/shared/nebular.module';
import {
  NbCardModule,
  NbButtonModule,
  NbInputModule,
  NbFormFieldModule,
  NbIconModule,
  NbSpinnerModule,
  NbAlertModule,
  NbTooltipModule,
  NbLayoutModule,
  NbBadgeModule,
  NbTagModule,
  NbSelectModule,
} from '@nebular/theme';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../app/shared/shared.module';
import { Subscription } from 'rxjs';
import { UserPreferencesService } from '../../core/services/user-preferences.service';
import { ButtonModule } from 'primeng/button';


@Component({
    selector: 'app-gallery',
    template: `
    <div class="gallery-container">
      <nb-card>
        <nb-card-header>
          <h5>Photo Gallery</h5>
          <div class="view-toggle">
            <button
              nbButton
              ghost
              [status]="viewMode === 'grid' ? 'primary' : 'basic'"
              (click)="setViewMode('grid')"
              nbTooltip="Grid view"
            >
              <nb-icon icon="grid-outline"></nb-icon>
            </button>
            <button
              nbButton
              ghost
              [status]="viewMode === 'list' ? 'primary' : 'basic'"
              (click)="setViewMode('list')"
              nbTooltip="List view"
            >
              <nb-icon icon="list-outline"></nb-icon>
            </button>
          </div>
        </nb-card-header>
        <nb-card-body>
          <div
            [ngClass]="{ 'gallery-grid': viewMode === 'grid', 'gallery-list': viewMode === 'list' }"
          >
            <!-- Gallery content will be implemented here -->
            <p>Gallery feature coming soon...</p>
          </div>
        </nb-card-body>
      </nb-card>
    </div>
  `,
    styles: [
        `
      .gallery-container {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }
      .gallery-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
        padding: 16px;
      }
      .gallery-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px;
      }
      .view-toggle {
        display: flex;
        margin-left: auto;
        gap: 8px;
      }
    `,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [NebularModule, CommonModule,
        FormsModule,
        NbButtonModule,
        NbCardModule,
        NbIconModule,
        NbTooltipModule,
        ReactiveFormsModule,
        RouterModule,
        SharedModule,
    ]
})
export class GalleryComponent implements OnInit, OnDestroy {
  viewMode: 'grid' | 'list' = 'grid';
  private subscriptions: Subscription[] = [];

  constructor(private userPreferencesService: UserPreferencesService) {}

  ngOnInit(): void {
    // Load user preferences
    const preferences = this.userPreferencesService.getPreferences();

    // Set view mode based on user preferences
    if (preferences.defaultViewType === 'list') {
      this.viewMode = 'list';
    } else {
      this.viewMode = 'grid';
    }

    // Subscribe to preference changes
    this.subscriptions.push(
      this.userPreferencesService.preferences$.subscribe((prefs) => {
        if (prefs.defaultViewType === 'list') {
          this.viewMode = 'list';
        } else {
          this.viewMode = 'grid';
        }
      }),
    );
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  /**
   * Set the view mode and save it to user preferences
   * @param mode The view mode to set
   */
  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;

    // Save view mode to user preferences
    this.userPreferencesService.setDefaultViewType(mode === 'list' ? 'list' : 'netflix');
  }
}
