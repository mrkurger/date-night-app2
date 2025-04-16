// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (gallery.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';

@Component({
  selector: 'app-gallery',
  template: `
    <div class="gallery-container mat-elevation-z2">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Photo Gallery</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="gallery-grid">
            <!-- Gallery content will be implemented here -->
            <p>Gallery feature coming soon...</p>
          </div>
        </mat-card-content>
      </mat-card>
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
    `,
  ],
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule],
})
export class GalleryComponent implements OnInit {
  ngOnInit(): void {
    // Initialization logic will be added here
  }
}
